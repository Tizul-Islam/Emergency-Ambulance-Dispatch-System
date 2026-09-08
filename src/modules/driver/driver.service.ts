import { PrismaClient, DriverStatus } from '../../generated/prisma/client';
import { AppError } from '../../utils/AppError';
import { logAudit } from '../audit/audit.service';

import prisma from '../../utils/prisma';

export const createDriver = async (data: any) => {
  if (data.userId) {
    const existing = await prisma.driver.findUnique({ where: { userId: data.userId } });
    if (existing) return existing;
  }
  
  if (data.licenseNumber) {
    const existing = await prisma.driver.findUnique({ where: { licenseNumber: data.licenseNumber } });
    if (existing) return existing;
  }

  return await prisma.driver.create({ data });
};

export const getDrivers = async (filters: {
  status?: DriverStatus;
  page: number;
  limit: number;
}) => {
  const { status, page, limit } = filters;
  const where: any = { deletedAt: null };

  if (status) where.status = status;

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.driver.count({ where }),
  ]);

  return {
    data: drivers,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const updateDriverStatus = async (id: string, status: DriverStatus, actorId: string) => {
  const existing = await prisma.driver.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Driver not found');

  const updated = await prisma.driver.update({
    where: { id },
    data: { status },
  });

  if (status !== existing.status) {
    await logAudit(actorId, 'UPDATE_STATUS', 'Driver', id, existing.status, updated.status);
  }

  return updated;
};

export const updateDriver = async (id: string, data: any, actorId: string) => {
  const existing = await prisma.driver.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Driver not found');

  const updated = await prisma.driver.update({
    where: { id },
    data,
  });

  return updated;
};

export const deleteDriver = async (id: string, actorId: string) => {
  const existing = await prisma.driver.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Driver not found');

  const deleted = await prisma.driver.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logAudit(actorId, 'SOFT_DELETE', 'Driver', id, null, null);

  return deleted;
};
