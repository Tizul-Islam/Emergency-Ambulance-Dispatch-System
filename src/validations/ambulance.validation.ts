import { z } from 'zod';
import { AmbulanceType, AmbulanceStatus } from '@prisma/client';
import { paginationSchema } from './common.validation';

export const createAmbulanceSchema = z.object({
  body: z.object({
    plateNumber: z.string().min(1),
    type: z.nativeEnum(AmbulanceType),
    currentLat: z.number(),
    currentLng: z.number(),
    driverId: z.string().uuid().optional(),
  }),
});

export const updateAmbulanceSchema = z.object({
  body: z.object({
    plateNumber: z.string().min(1).optional(),
    type: z.nativeEnum(AmbulanceType).optional(),
    status: z.nativeEnum(AmbulanceStatus).optional(),
    currentLat: z.number().optional(),
    currentLng: z.number().optional(),
    driverId: z.string().uuid().optional().nullable(),
  }),
});

export const getAmbulancesSchema = paginationSchema.extend({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    status: z.nativeEnum(AmbulanceStatus).optional(),
    type: z.nativeEnum(AmbulanceType).optional(),
  }),
});
