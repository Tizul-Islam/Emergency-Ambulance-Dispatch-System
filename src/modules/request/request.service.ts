import {
  PrismaClient,
  RequestStatus,
  RequestPriority,
  Role,
  AmbulanceStatus,
  DriverStatus,
  DispatchStatus,
  TripStatus,
  Prisma,
} from '../../generated/prisma/client';
import { AppError } from '../../utils/AppError';
import { logAudit } from '../audit/audit.service';
import { selectNearestAvailable } from '../dispatch/dispatch.logic';
import { redis } from '../../config';

import prisma from '../../utils/prisma';

export const createRequest = async (
  data: {
    description: string;
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    priority?: RequestPriority;
  },
  patientId: string,
) => {
  const request = await prisma.emergencyRequest.create({
    data: {
      description: data.description,
      pickupAddress: data.pickupAddress,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      patientId,
      status: RequestStatus.REQUESTED,
      priority: data.priority || RequestPriority.MEDIUM,
    },
  });

  await txOrPrismaLogIncident(request.id, 'Request created', patientId, 'Patient created a new emergency request');

  await logAudit(patientId, 'CREATE_REQUEST', 'EmergencyRequest', request.id, null, request);

  // Notify Dispatcher (Req 10)
  const dispatchers = await prisma.user.findMany({ where: { role: Role.DISPATCHER, isActive: true } });
  if (dispatchers.length > 0) {
    const notifications = dispatchers.map(d => ({
      userId: d.id,
      title: 'New Emergency Request',
      type: 'NEW_REQUEST',
      message: `A new ${request.priority} emergency request has been created at ${request.pickupAddress}.`,
    }));
    await prisma.notification.createMany({ data: notifications });
  }

  return request;
};

// Helper to log incident history inside or outside transaction
const txOrPrismaLogIncident = async (requestId: string, action: string, actorId: string | null, details: string, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;
  await client.incidentHistory.create({
    data: {
      emergencyRequestId: requestId,
      action,
      actorId,
      details
    }
  });
};

export const getMyRequests = async (patientId: string, page: number, limit: number) => {
  const where = { patientId, deletedAt: null };

  const [requests, total] = await Promise.all([
    prisma.emergencyRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.emergencyRequest.count({ where }),
  ]);

  return {
    data: requests,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getAllRequests = async (filters: {
  status?: RequestStatus;
  priority?: RequestPriority;
  page: number;
  limit: number;
  sortBy?: string;
}) => {
  const { status, priority, page, limit } = filters;
  const where: Prisma.EmergencyRequestWhereInput = { deletedAt: null };
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [requests, total] = await Promise.all([
    prisma.emergencyRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { patient: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.emergencyRequest.count({ where }),
  ]);

  return {
    data: requests,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getQueue = async () => {
  return prisma.emergencyRequest.findMany({
    where: {
      status: { in: [RequestStatus.REQUESTED, RequestStatus.PRIORITY_ASSIGNED] },
      deletedAt: null,
    },
    orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    include: { patient: { select: { id: true, name: true, phone: true } } },
  });
};

export const getRequestById = async (id: string, user: { id: string; role: Role }) => {
  const request = await prisma.emergencyRequest.findFirst({
    where: { id, deletedAt: null },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      dispatches: {
        include: { ambulance: true, driver: true },
        orderBy: { assignedAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!request) throw new AppError(404, 'Emergency request not found');

  if (user.role === Role.PATIENT && request.patientId !== user.id) {
    throw new AppError(403, 'You do not have permission to view this request');
  }

  return request;
};

export const cancelRequest = async (id: string, patientId: string) => {
  const existing = await prisma.emergencyRequest.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) throw new AppError(404, 'Emergency request not found');

  if (existing.patientId !== patientId) {
    throw new AppError(403, 'You do not have permission to cancel this request');
  }

  if (existing.status !== RequestStatus.REQUESTED && existing.status !== RequestStatus.PRIORITY_ASSIGNED) {
    throw new AppError(400, 'Only requested or priority-assigned requests can be cancelled');
  }

  const updated = await prisma.emergencyRequest.update({
    where: { id },
    data: { status: RequestStatus.CANCELLED },
  });

  await txOrPrismaLogIncident(id, 'Request cancelled', patientId, 'Patient cancelled the request');

  await logAudit(
    patientId,
    'CANCEL_REQUEST',
    'EmergencyRequest',
    id,
    existing.status,
    updated.status,
  );

  return updated;
};

export const updateRequest = async (id: string, patientId: string, data: any) => {
  const existing = await prisma.emergencyRequest.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) throw new AppError(404, 'Emergency request not found');
  if (existing.patientId !== patientId) throw new AppError(403, 'You do not have permission to update this request');
  if (existing.status !== RequestStatus.REQUESTED) {
    throw new AppError(400, 'Only requested emergency requests can be updated');
  }

  const updated = await prisma.emergencyRequest.update({
    where: { id },
    data,
  });

  await txOrPrismaLogIncident(id, 'Request updated', patientId, 'Patient updated request details');
  await logAudit(patientId, 'UPDATE_REQUEST', 'EmergencyRequest', id, existing, updated);

  return updated;
};

export const deleteRequest = async (id: string, actorId: string, actorRole: Role) => {
  const existing = await prisma.emergencyRequest.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) throw new AppError(404, 'Emergency request not found');

  if (actorRole === Role.PATIENT && existing.patientId !== actorId) {
    throw new AppError(403, 'You do not have permission to delete this request');
  }

  if (existing.status !== RequestStatus.REQUESTED && existing.status !== RequestStatus.CANCELLED) {
    throw new AppError(400, 'Only requested or cancelled requests can be deleted');
  }

  const deleted = await prisma.emergencyRequest.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await txOrPrismaLogIncident(id, 'Request deleted', actorId, 'Request soft deleted');
  await logAudit(actorId, 'DELETE_REQUEST', 'EmergencyRequest', id, null, null);

  return deleted;
};

export const searchRequests = async (filters: { q: string; page: number; limit: number }) => {
  const { q, page, limit } = filters;
  const where: Prisma.EmergencyRequestWhereInput = {
    deletedAt: null,
    OR: [
      { description: { contains: q, mode: 'insensitive' } },
      { pickupAddress: { contains: q, mode: 'insensitive' } },
      { patient: { name: { contains: q, mode: 'insensitive' } } },
    ],
  };

  const [requests, total] = await Promise.all([
    prisma.emergencyRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { patient: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.emergencyRequest.count({ where }),
  ]);

  return {
    data: requests,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const updatePriority = async (id: string, priority: RequestPriority, dispatcherId: string) => {
  const existing = await prisma.emergencyRequest.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) throw new AppError(404, 'Emergency request not found');

  if (existing.status !== RequestStatus.REQUESTED && existing.status !== RequestStatus.PRIORITY_ASSIGNED) {
    throw new AppError(400, 'Cannot update priority for a request that has already been dispatched');
  }

  const updated = await prisma.emergencyRequest.update({
    where: { id },
    data: { 
      priority,
      status: RequestStatus.PRIORITY_ASSIGNED
    },
  });

  await txOrPrismaLogIncident(id, 'Priority updated', dispatcherId, `Dispatcher changed priority from ${existing.priority} to ${priority}`);

  await logAudit(
    dispatcherId,
    'UPDATE_PRIORITY',
    'EmergencyRequest',
    id,
    existing.priority,
    updated.priority,
  );

  return updated;
};

export const assignRequest = async (
  requestId: string,
  dispatcherId: string,
  ambulanceId?: string,
) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.emergencyRequest.findFirst({
        where: {
          id: requestId,
          deletedAt: null,
          status: { in: [RequestStatus.REQUESTED, RequestStatus.PRIORITY_ASSIGNED] },
        },
      });

      if (!request) {
        throw new AppError(404, 'Emergency request not found or not assignable');
      }

      if (request.status === RequestStatus.REQUESTED) {
        await tx.emergencyRequest.update({
          where: { id: requestId },
          data: { status: RequestStatus.PRIORITY_ASSIGNED },
        });
        await txOrPrismaLogIncident(requestId, 'Priority assigned', dispatcherId, `Dispatcher reviewed and marked as ${request.priority}`, tx);
      }

      let targetId = ambulanceId;

      if (!targetId) {
        const candidates = await tx.ambulance.findMany({
          where: {
            status: AmbulanceStatus.AVAILABLE,
            deletedAt: null,
            isActive: true,
            driverId: { not: null },
          },
        });

        const best = selectNearestAvailable(candidates, request.pickupLat, request.pickupLng, request.priority);

        if (!best) {
          throw new AppError(404, 'No available ambulance found matching criteria');
        }
        targetId = best.id;
      }

      const claimed = await tx.ambulance.updateMany({
        where: {
          id: targetId,
          status: AmbulanceStatus.AVAILABLE,
          deletedAt: null,
          isActive: true,
        },
        data: { status: AmbulanceStatus.ASSIGNED },
      });

      if (claimed.count === 0) {
        throw new AppError(
          409,
          'Ambulance is not available (possibly assigned by another dispatcher)',
        );
      }

      const ambulance = await tx.ambulance.findUnique({ where: { id: targetId } });
      if (!ambulance?.driverId) {
        throw new AppError(400, 'Ambulance does not have an assigned driver');
      }

      await tx.driver.update({
        where: { id: ambulance.driverId },
        data: { status: DriverStatus.ON_TRIP }, // Keeping ON_TRIP for driver status as per schema, or we can assume Driver is ASSIGNED. The requirements didn't change DriverStatus.
      });

      const dispatch = await tx.dispatch.create({
        data: {
          emergencyRequestId: requestId,
          ambulanceId: targetId,
          driverId: ambulance.driverId,
          dispatcherId,
          status: DispatchStatus.DISPATCHED,
          assignedAt: new Date(),
        },
      });

      await tx.trip.create({
        data: {
          emergencyRequestId: requestId,
          ambulanceId: targetId,
          dispatchId: dispatch.id,
          status: TripStatus.ONGOING,
          startedAt: new Date(),
        },
      });

      await tx.emergencyRequest.update({
        where: { id: requestId },
        data: { status: RequestStatus.AMBULANCE_ASSIGNED },
      });

      await txOrPrismaLogIncident(requestId, 'Ambulance assigned', dispatcherId, `Ambulance ${ambulance.registrationNumber} assigned to request`, tx);

      await tx.auditLog.create({
        data: {
          userId: dispatcherId,
          action: 'ASSIGN_REQUEST',
          entity: 'EmergencyRequest',
          entityId: requestId,
          oldValue: request.status,
          newValue: RequestStatus.AMBULANCE_ASSIGNED,
        },
      });

      // Notify Driver
      await tx.notification.create({
        data: {
          userId: ambulance.driverId,
          title: 'New Assignment',
          type: 'DISPATCH',
          message: 'You have been assigned to a new emergency request.',
        }
      });

      // Notify Patient
      await tx.notification.create({
        data: {
          userId: request.patientId,
          title: 'Ambulance Assigned',
          type: 'STATUS_UPDATE',
          message: `Ambulance ${ambulance.registrationNumber} has been ASSIGNED to your request.`,
        },
      });

      await redis.del('ambulances:available');

      return tx.dispatch.findUnique({
        where: { id: dispatch.id },
        include: {
          ambulance: true,
          driver: true,
          emergencyRequest: true,
          trips: true,
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(
        409,
        'Duplicate active dispatch blocked — ambulance or request already has an active assignment',
      );
    }
    throw error;
  }
};
