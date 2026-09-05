import { z } from 'zod';
import { RequestPriority } from '@prisma/client';
import { paginationSchema } from './common.validation';

export const createRequestSchema = z.object({
  body: z.object({
    patientName: z.string().min(2),
    contactPhone: z.string().min(10),
    pickupLat: z.number(),
    pickupLng: z.number(),
    priority: z.nativeEnum(RequestPriority).optional().default(RequestPriority.MEDIUM),
    description: z.string().optional(),
  }),
});

export const getMyRequestsSchema = paginationSchema;
