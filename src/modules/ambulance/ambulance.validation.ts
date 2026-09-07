import { z } from 'zod';
import { AmbulanceType, AmbulanceStatus } from '@prisma/client';
import { paginationSchema } from '../../shared/common.validation';

export const createAmbulanceSchema = z.object({
  body: z.object({
    registrationNumber: z.string().min(1, 'Registration number is required'),
    type: z.nativeEnum(AmbulanceType),
    capacity: z.number().int().positive('Capacity must be a positive integer'),
    locationLat: z.number().min(-90).max(90),
    locationLng: z.number().min(-180).max(180),
    driverId: z.string().uuid().optional(),
  }),
});

export const updateAmbulanceSchema = z.object({
  body: z.object({
    registrationNumber: z.string().min(1).optional(),
    type: z.nativeEnum(AmbulanceType).optional(),
    status: z.nativeEnum(AmbulanceStatus).optional(),
    capacity: z.number().int().positive().optional(),
    locationLat: z.number().min(-90).max(90).optional(),
    locationLng: z.number().min(-180).max(180).optional(),
    driverId: z.string().uuid().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getAmbulancesSchema = paginationSchema.extend({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
    status: z.nativeEnum(AmbulanceStatus).optional(),
    type: z.nativeEnum(AmbulanceType).optional(),
  }),
});

export const nearestAmbulanceSchema = z.object({
  query: z.object({
    lat: z
      .string()
      .transform((v) => parseFloat(v))
      .refine((n) => !Number.isNaN(n), 'Invalid lat'),
    lng: z
      .string()
      .transform((v) => parseFloat(v))
      .refine((n) => !Number.isNaN(n), 'Invalid lng'),
  }),
});

export const searchAmbulancesSchema = paginationSchema.extend({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
    q: z.string().min(1, 'Search keyword is required'),
  }),
});
