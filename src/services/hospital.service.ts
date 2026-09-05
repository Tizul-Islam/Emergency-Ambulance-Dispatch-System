import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { logAudit } from './audit.service';

const prisma = new PrismaClient();

export const createHospital = async (data: any) => {
  return await prisma.hospital.create({ data });
};

export const getHospitals = async (filters: { page: number; limit: number }) => {
  const { page, limit } = filters;
  const where: any = { deletedAt: null };

  const [hospitals, total] = await Promise.all([
    prisma.hospital.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.hospital.count({ where }),
  ]);

  return {
    data: hospitals,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const updateHospitalBeds = async (id: string, data: { totalBeds?: number; availableBeds?: number }, actorId: string) => {
  const existing = await prisma.hospital.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Hospital not found');

  if (data.availableBeds !== undefined && data.totalBeds !== undefined) {
    if (data.availableBeds > data.totalBeds) {
      throw new AppError(400, 'Available beds cannot exceed total beds');
    }
  } else if (data.availableBeds !== undefined) {
    if (data.availableBeds > existing.totalBeds) {
      throw new AppError(400, 'Available beds cannot exceed total beds');
    }
  }

  const updated = await prisma.hospital.update({
    where: { id },
    data,
  });

  await logAudit(actorId, 'UPDATE_BEDS', 'Hospital', id, 
    { totalBeds: existing.totalBeds, availableBeds: existing.availableBeds }, 
    { totalBeds: updated.totalBeds, availableBeds: updated.availableBeds }
  );

  return updated;
};

export const updateHospital = async (id: string, data: any, actorId: string) => {
  const existing = await prisma.hospital.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Hospital not found');

  const updated = await prisma.hospital.update({
    where: { id },
    data,
  });

  return updated;
};

export const deleteHospital = async (id: string, actorId: string) => {
  const existing = await prisma.hospital.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Hospital not found');

  const deleted = await prisma.hospital.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logAudit(actorId, 'SOFT_DELETE', 'Hospital', id, null, null);

  return deleted;
};

