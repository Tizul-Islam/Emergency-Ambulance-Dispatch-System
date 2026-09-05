import { PrismaClient, RequestStatus, RequestPriority, Role } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { logAudit } from './audit.service';

const prisma = new PrismaClient();

export const createRequest = async (data: any, callerId: string) => {
  const request = await prisma.emergencyRequest.create({
    data: {
      ...data,
      callerId,
      status: RequestStatus.PENDING,
      priority: data.priority || RequestPriority.MEDIUM,
    },
  });

  await logAudit(callerId, 'CREATE_REQUEST', 'EmergencyRequest', request.id, null, request);

  return request;
};

export const getMyRequests = async (callerId: string, page: number, limit: number) => {
  const where = { callerId, deletedAt: null };

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

export const getRequestById = async (id: string, user: any) => {
  const request = await prisma.emergencyRequest.findFirst({
    where: { id, deletedAt: null },
    include: { caller: { select: { id: true, name: true, phone: true } } },
  });

  if (!request) throw new AppError(404, 'Emergency request not found');

  if (user.role === Role.CALLER && request.callerId !== user.id) {
    throw new AppError(403, 'You do not have permission to view this request');
  }

  return request;
};

export const cancelRequest = async (id: string, callerId: string) => {
  const existing = await prisma.emergencyRequest.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) throw new AppError(404, 'Emergency request not found');

  if (existing.callerId !== callerId) {
    throw new AppError(403, 'You do not have permission to cancel this request');
  }

  if (existing.status !== RequestStatus.PENDING) {
    throw new AppError(400, 'Only pending requests can be cancelled');
  }

  const updated = await prisma.emergencyRequest.update({
    where: { id },
    data: { status: RequestStatus.CANCELLED },
  });

  await logAudit(callerId, 'CANCEL_REQUEST', 'EmergencyRequest', id, existing.status, updated.status);

  return updated;
};
