import { PrismaClient, AmbulanceType, AmbulanceStatus } from '@prisma/client';
import { AppError } from '../../utils/AppError';
import { logAudit } from '../audit/audit.service';
import { haversineDistance, selectNearestAvailable } from '../dispatch/dispatch.logic';
import { redis } from '../../config';

const prisma = new PrismaClient();

export const createAmbulance = async (data: {
  registrationNumber: string;
  type: AmbulanceType;
  capacity: number;
  locationLat: number;
  locationLng: number;
  driverId?: string;
}) => {
  const ambulance = await prisma.ambulance.create({ data });
  await redis.del('ambulances:available');
  return ambulance;
};

export const getAmbulances = async (filters: {
  status?: AmbulanceStatus;
  type?: AmbulanceType;
  page: number;
  limit: number;
}) => {
  const { status, type, page, limit } = filters;
  const where: Record<string, unknown> = { deletedAt: null };

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

export const updateAmbulance = async (
  id: string,
  data: Record<string, unknown>,
  actorId: string,
) => {
  const existing = await prisma.ambulance.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Ambulance not found');

  const updated = await prisma.ambulance.update({
    where: { id },
    data,
  });

  if (data.status && data.status !== existing.status) {
    await logAudit(actorId, 'UPDATE_STATUS', 'Ambulance', id, existing.status, updated.status);
    await redis.del('ambulances:available');
  }

  return updated;
};

/** Soft delete — sets deletedAt; row is never hard-deleted. */
export const deleteAmbulance = async (id: string, actorId: string) => {
  const existing = await prisma.ambulance.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Ambulance not found');

  const deleted = await prisma.ambulance.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await logAudit(actorId, 'SOFT_DELETE', 'Ambulance', id, null, { deletedAt: deleted.deletedAt });
  await redis.del('ambulances:available');

  return deleted;
};

export const getAmbulanceById = async (id: string) => {
  const ambulance = await prisma.ambulance.findFirst({
    where: { id, deletedAt: null },
    include: { driver: true, dispatches: { take: 5, orderBy: { assignedAt: 'desc' } } },
  });
  if (!ambulance) throw new AppError(404, 'Ambulance not found');
  return ambulance;
};

export const getAvailableAmbulances = async () => {
  // Try checking cache first
  const cached = await redis.get('ambulances:available');
  if (cached) return JSON.parse(cached);

  const available = await prisma.ambulance.findMany({
    where: {
      status: AmbulanceStatus.AVAILABLE,
      deletedAt: null,
      isActive: true,
      driverId: { not: null },
    },
    include: { driver: { select: { id: true, name: true, phone: true } } },
  });

  await redis.set('ambulances:available', JSON.stringify(available), 'EX', 60);
  return available;
};

export const getNearestAmbulance = async (lat: number, lng: number) => {
  const availableAmbulances = await getAvailableAmbulances();

  const nearest = selectNearestAvailable(availableAmbulances as any, lat, lng, 'MEDIUM');
  return nearest;
};

export const searchAmbulances = async (filters: { q: string; page: number; limit: number }) => {
  const { q, page, limit } = filters;
  const where = {
    deletedAt: null,
    registrationNumber: { contains: q, mode: 'insensitive' as any },
  };

  const [ambulances, total] = await Promise.all([
    prisma.ambulance.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { driver: true },
    }),
    prisma.ambulance.count({ where }),
  ]);

  return {
    data: ambulances,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export { haversineDistance };
