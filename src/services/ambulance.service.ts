import { PrismaClient, AmbulanceType, AmbulanceStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { logAudit } from './audit.service';

const prisma = new PrismaClient();

export const createAmbulance = async (data: any) => {
  return await prisma.ambulance.create({ data });
};

export const getAmbulances = async (filters: { status?: AmbulanceStatus; type?: AmbulanceType; page: number; limit: number }) => {
  const { status, type, page, limit } = filters;
  const where: any = { deletedAt: null };

  if (status) where.status = status;
  if (type) where.type = type;

  const [ambulances, total] = await Promise.all([
    prisma.ambulance.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { driver: true },
    }),
    prisma.ambulance.count({ where }),
  ]);

  return {
    data: ambulances,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const updateAmbulance = async (id: string, data: any, actorId: string) => {
  const existing = await prisma.ambulance.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Ambulance not found');

  const updated = await prisma.ambulance.update({
    where: { id },
    data,
  });

  if (data.status && data.status !== existing.status) {
    await logAudit(actorId, 'UPDATE_STATUS', 'Ambulance', id, existing.status, updated.status);
  }

  return updated;
};

export const deleteAmbulance = async (id: string, actorId: string) => {
  const existing = await prisma.ambulance.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Ambulance not found');

  const deleted = await prisma.ambulance.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logAudit(actorId, 'SOFT_DELETE', 'Ambulance', id, null, null);

  return deleted;
};
