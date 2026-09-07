import {
  PrismaClient,
  RequestStatus,
  DispatchStatus,
  AmbulanceStatus,
  DriverStatus,
  TripStatus,
  RequestPriority,
  Prisma,
} from '@prisma/client';
import { AppError } from '../../utils/AppError';
import { isValidTransition, haversineDistance } from './dispatch.logic';
import { redis } from '../../config';

const prisma = new PrismaClient();

const mapToDispatchStatus = (reqStatus: RequestStatus): DispatchStatus | undefined => {
  switch (reqStatus) {
    case RequestStatus.EN_ROUTE:
      return DispatchStatus.ARRIVED_AT_SCENE;
    case RequestStatus.PATIENT_PICKED_UP:
      return DispatchStatus.EN_ROUTE_TO_HOSPITAL;
    case RequestStatus.ARRIVED:
      return DispatchStatus.ARRIVED_AT_HOSPITAL;
    case RequestStatus.COMPLETED:
      return DispatchStatus.COMPLETED;
    case RequestStatus.CANCELLED:
      return DispatchStatus.CANCELLED;
    default:
      return undefined;
  }
};

export const updateStatus = async (
  dispatchId: string,
  newStatus: RequestStatus,
  actorId: string,
) => {
  return prisma.$transaction(async (tx) => {
    const dispatch = await tx.dispatch.findUnique({
      where: { id: dispatchId },
      include: {
        emergencyRequest: true,
        trips: { take: 1, orderBy: { createdAt: 'desc' } },
        ambulance: true
      },
    });

    if (!dispatch) throw new AppError(404, 'Dispatch not found');

    const currentStatus = dispatch.emergencyRequest.status;

    if (!isValidTransition(currentStatus, newStatus)) {
      throw new AppError(400, `Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    if (newStatus === RequestStatus.TO_HOSPITAL) {
      throw new AppError(400, 'Use POST /dispatches/:id/select-hospital to set TO_HOSPITAL');
    }

    await tx.emergencyRequest.update({
      where: { id: dispatch.emergencyRequestId },
      data: {
        status: newStatus,
        ...(newStatus === RequestStatus.COMPLETED ? { completedAt: new Date() } : {}),
      },
    });

    const dispatchStatusUpdate = mapToDispatchStatus(newStatus);
    const dispatchUpdateData: Prisma.DispatchUpdateInput = {};
    if (dispatchStatusUpdate) dispatchUpdateData.status = dispatchStatusUpdate;
    if (newStatus === RequestStatus.COMPLETED) {
      dispatchUpdateData.completedAt = new Date();
    }

    const updatedDispatch = await tx.dispatch.update({
      where: { id: dispatchId },
      data: dispatchUpdateData,
      include: { emergencyRequest: true, ambulance: true, driver: true },
    });

    // Sync ambulance lifecycle
    if (newStatus === RequestStatus.EN_ROUTE) {
      await tx.ambulance.update({
        where: { id: dispatch.ambulanceId },
        data: { status: AmbulanceStatus.EN_ROUTE },
      });
    }
    if (newStatus === RequestStatus.PATIENT_PICKED_UP) {
      await tx.ambulance.update({
        where: { id: dispatch.ambulanceId },
        data: { status: AmbulanceStatus.PICKING_UP },
      });
      const trip = dispatch.trips[0];
      if (trip) {
        await tx.trip.update({
          where: { id: trip.id },
          data: { pickedUpAt: new Date() },
        });
      }
    }

    // Incident History & Audit
    let actionDesc = `Status updated to ${newStatus}`;
    if (newStatus === RequestStatus.DRIVER_ACCEPTED) actionDesc = 'Driver accepted';
    if (newStatus === RequestStatus.EN_ROUTE) actionDesc = 'Ambulance departed';
    if (newStatus === RequestStatus.PATIENT_PICKED_UP) actionDesc = 'Patient picked up';
    if (newStatus === RequestStatus.ARRIVED) actionDesc = 'Hospital arrival';
    if (newStatus === RequestStatus.COMPLETED) actionDesc = 'Trip completed';
    if (newStatus === RequestStatus.CANCELLED) actionDesc = 'Trip cancelled';

    await tx.incidentHistory.create({
      data: {
        emergencyRequestId: dispatch.emergencyRequestId,
        action: actionDesc,
        actorId: actorId,
        details: `Status changed from ${currentStatus} to ${newStatus}`
      }
    });

    await tx.auditLog.create({
      data: {
        userId: actorId,
        action: 'UPDATE_TRIP_STATUS',
        entity: 'EmergencyRequest',
        entityId: dispatch.emergencyRequestId,
        oldValue: currentStatus,
        newValue: newStatus,
      },
    });

    if (newStatus === RequestStatus.COMPLETED) {
      await completeTrip(tx, dispatch);
    }

    // Notifications (Req 10)
    await tx.notification.create({
      data: {
        userId: dispatch.emergencyRequest.patientId,
        title: 'Status Update',
        type: 'STATUS_UPDATE',
        message: `Your emergency request status has been updated to ${newStatus}.`,
      },
    });

    if (newStatus === RequestStatus.COMPLETED) {
      await redis.del('ambulances:available');
    }

    return updatedDispatch;
  });
};

async function completeTrip(
  tx: Prisma.TransactionClient,
  dispatch: {
    id: string;
    ambulanceId: string;
    driverId: string | null;
    assignedAt: Date;
    emergencyRequest: {
      pickupLat: number;
      pickupLng: number;
      priority: RequestPriority;
    };
    trips: { id: string; hospitalId: string | null }[];
  },
) {
  await tx.ambulance.update({
    where: { id: dispatch.ambulanceId },
    data: { status: AmbulanceStatus.AVAILABLE },
  });

  if (dispatch.driverId) {
    await tx.driver.update({
      where: { id: dispatch.driverId },
      data: { status: DriverStatus.AVAILABLE },
    });
  }

  const trip = dispatch.trips[0];
  if (!trip) return;

  let distanceKm = 0;
  if (trip.hospitalId) {
    const hospital = await tx.hospital.findUnique({ where: { id: trip.hospitalId } });
    if (hospital) {
      distanceKm = haversineDistance(
        dispatch.emergencyRequest.pickupLat,
        dispatch.emergencyRequest.pickupLng,
        hospital.latitude,
        hospital.longitude,
      );
    }
  }

  const baseRate = 50; 
  let fare = baseRate * Math.max(distanceKm, 1);
  if (dispatch.emergencyRequest.priority === RequestPriority.CRITICAL) {
    fare *= 1.2;
  }

  await tx.trip.update({
    where: { id: trip.id },
    data: {
      status: TripStatus.COMPLETED,
      completedAt: new Date(),
      arrivedAt: new Date(),
      distance: distanceKm,
      fare: Math.round(fare * 100) / 100,
    },
  });
}

export const getDispatchById = async (id: string) => {
  const dispatch = await prisma.dispatch.findUnique({
    where: { id },
    include: {
      emergencyRequest: true,
      ambulance: true,
      driver: true,
      trips: { include: { hospital: true, payment: true } },
    },
  });
  if (!dispatch) throw new AppError(404, 'Dispatch not found');
  return dispatch;
};

export const getMyAssignedDispatches = async (driverUserId: string) => {
  const driver = await prisma.driver.findUnique({ where: { userId: driverUserId } });
  if (!driver) throw new AppError(404, 'Driver profile not found for user');

  return prisma.dispatch.findMany({
    where: {
      driverId: driver.id,
      status: { notIn: [DispatchStatus.COMPLETED, DispatchStatus.CANCELLED] },
    },
    include: { emergencyRequest: true, ambulance: true, trips: true },
    orderBy: { assignedAt: 'desc' },
  });
};

export const selectHospital = async (dispatchId: string, hospitalId: string, actorId: string) => {
  return prisma.$transaction(async (tx) => {
    const dispatch = await tx.dispatch.findUnique({
      where: { id: dispatchId },
      include: {
        emergencyRequest: true,
        trips: { take: 1, orderBy: { createdAt: 'desc' } },
        ambulance: true,
      },
    });

    if (!dispatch) throw new AppError(404, 'Dispatch not found');

    const currentStatus = dispatch.emergencyRequest.status;
    if (!isValidTransition(currentStatus, RequestStatus.TO_HOSPITAL)) {
      throw new AppError(
        400,
        `Invalid status transition from ${currentStatus} to TO_HOSPITAL`,
      );
    }

    const trip = dispatch.trips[0];
    if (!trip) throw new AppError(400, 'No trip found for this dispatch');
    if (trip.hospitalId) {
      throw new AppError(400, 'Hospital already selected for this dispatch');
    }

    const hospital = await tx.hospital.findFirst({
      where: {
        id: hospitalId,
        deletedAt: null,
        isActive: true,
        emergencyAvailable: true,
      },
    });

    if (!hospital) {
      throw new AppError(400, 'Hospital not available for emergency intake');
    }

    await tx.trip.update({
      where: { id: trip.id },
      data: { hospitalId },
    });

    await tx.emergencyRequest.update({
      where: { id: dispatch.emergencyRequestId },
      data: { status: RequestStatus.TO_HOSPITAL },
    });

    await tx.ambulance.update({
      where: { id: dispatch.ambulanceId },
      data: { status: AmbulanceStatus.TO_HOSPITAL }
    });

    // Notify Hospital (Req 10)
    // Assuming hospital user/admin would receive this. We create a generic log/event for hospital or if hospital has an admin, we could notify them. 
    // For now, logging to audit
    
    await tx.incidentHistory.create({
      data: {
        emergencyRequestId: dispatch.emergencyRequestId,
        action: 'Hospital selected',
        actorId: actorId,
        details: `Selected hospital: ${hospital.name}`
      }
    });

    await tx.auditLog.create({
      data: {
        userId: actorId,
        action: 'SELECT_HOSPITAL',
        entity: 'Dispatch',
        entityId: dispatchId,
        newValue: hospitalId,
      },
    });

    return tx.dispatch.findUnique({
      where: { id: dispatchId },
      include: {
        emergencyRequest: true,
        trips: { include: { hospital: true } },
      },
    });
  });
};

export const searchDispatches = async (query: string) => {
  return prisma.dispatch.findMany({
    where: {
      OR: [
        {
          ambulance: {
            registrationNumber: { contains: query, mode: 'insensitive' },
          },
        },
        {
          emergencyRequest: {
            patient: { name: { contains: query, mode: 'insensitive' } },
          },
        },
        {
          emergencyRequest: {
            pickupAddress: { contains: query, mode: 'insensitive' },
          },
        },
      ],
    },
    include: { emergencyRequest: true, ambulance: true },
    orderBy: { assignedAt: 'desc' },
    take: 20,
  });
};
