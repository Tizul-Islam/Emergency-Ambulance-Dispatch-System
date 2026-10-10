import { PrismaClient, TripStatus, Role } from '../../generated/prisma/client';
import { AppError } from '../../utils/AppError';

import prisma from '../../utils/prisma';

export const getTrips = async (filters: {
  status?: TripStatus;
  page: number;
  limit: number;
  sortBy?: string;
  user: { id: string; role: Role };
}) => {
  const { status, page, limit, user } = filters;
  const where: Record<string, any> = {};

  if (status) where.status = status;
  if (user.role === Role.PATIENT) {
    where.emergencyRequest = { patientId: user.id };
  }

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        emergencyRequest: {
          select: {
            id: true,
            patientId: true,
            pickupAddress: true,
            priority: true,
            description: true,
          },
        },
        ambulance: { select: { id: true, registrationNumber: true } },
        hospital: { select: { id: true, name: true } },
        payment: true,
      },
    }),
    prisma.trip.count({ where }),
  ]);

  return {
    data: trips,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getTripById = async (id: string, user: { id: string; role: Role }) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      emergencyRequest: true,
      ambulance: true,
      hospital: true,
      dispatch: true,
      payment: true,
    },
  });

  if (!trip) throw new AppError(404, 'Trip not found');

  // Role checks
  if (user.role === Role.PATIENT && trip.emergencyRequest.patientId !== user.id) {
    throw new AppError(403, 'You do not have permission to view this trip');
  }

  return trip;
};
