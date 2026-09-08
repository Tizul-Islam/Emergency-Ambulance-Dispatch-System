import { AppError } from '../../utils/AppError';
import { logAudit } from '../audit/audit.service';

import prisma from '../../utils/prisma';

export const createHospital = async (data: {
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  emergencyAvailable?: boolean;
}) => {
  return prisma.hospital.create({ data });
};

export const getHospitals = async (filters: { page: number; limit: number }) => {
  const { page, limit } = filters;
  const where = { deletedAt: null };

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

export const getHospitalById = async (id: string) => {
  const hospital = await prisma.hospital.findFirst({ where: { id, deletedAt: null } });
  if (!hospital) throw new AppError(404, 'Hospital not found');
  return hospital;
};

export const updateHospitalAvailability = async (
  id: string,
  emergencyAvailable: boolean,
  actorId: string,
) => {
  const existing = await prisma.hospital.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Hospital not found');

  const updated = await prisma.hospital.update({
    where: { id },
    data: { emergencyAvailable },
  });

  await logAudit(
    actorId,
    'UPDATE_EMERGENCY_AVAILABILITY',
    'Hospital',
    id,
    { emergencyAvailable: existing.emergencyAvailable },
    { emergencyAvailable: updated.emergencyAvailable },
  );

  return updated;
};

export const updateHospital = async (
  id: string,
  data: Record<string, unknown>,
  actorId: string,
) => {
  const existing = await prisma.hospital.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Hospital not found');

  const updated = await prisma.hospital.update({
    where: { id },
    data,
  });

  await logAudit(actorId, 'UPDATE_HOSPITAL', 'Hospital', id, existing, updated);

  return updated;
};

export const searchHospitals = async (filters: { q: string; page: number; limit: number }) => {
  const { q, page, limit } = filters;
  const where = {
    deletedAt: null,
    OR: [
      { name: { contains: q, mode: 'insensitive' as any } },
      { address: { contains: q, mode: 'insensitive' as any } },
      { phone: { contains: q, mode: 'insensitive' as any } },
    ],
  };

  const [hospitals, total] = await Promise.all([
    prisma.hospital.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.hospital.count({ where }),
  ]);

  return {
    data: hospitals,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

/** Soft delete — sets deletedAt. */
export const deleteHospital = async (id: string, actorId: string) => {
  const existing = await prisma.hospital.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, 'Hospital not found');

  const deleted = await prisma.hospital.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await logAudit(actorId, 'SOFT_DELETE', 'Hospital', id, null, { deletedAt: deleted.deletedAt });

  return deleted;
};
