import { z } from 'zod';
import { RequestPriority, RequestStatus } from '@prisma/client';
import { paginationSchema } from '../../shared/common.validation';

export const createRequestSchema = z.object({
  body: z.object({
    description: z.string().min(5, 'Description must be at least 5 characters'),
    pickupAddress: z.string().min(3, 'Pickup address is required'),
    pickupLat: z.number().min(-90).max(90),
    pickupLng: z.number().min(-180).max(180),
    priority: z.nativeEnum(RequestPriority).optional().default(RequestPriority.MEDIUM),
  }),
});

export const updateRequestSchema = z.object({
  body: z.object({
    description: z.string().min(5, 'Description must be at least 5 characters').optional(),
    pickupAddress: z.string().min(3, 'Pickup address is required').optional(),
    pickupLat: z.number().min(-90).max(90).optional(),
    pickupLng: z.number().min(-180).max(180).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid request ID'),
  }),
});

export const assignRequestSchema = z.object({
  body: z.object({
    ambulanceId: z.string().uuid('Invalid ambulance ID').optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid request ID'),
  }),
});

export const getMyRequestsSchema = paginationSchema;

export const updatePrioritySchema = z.object({
  body: z.object({
    priority: z.nativeEnum(RequestPriority),
  }),
  params: z.object({
    id: z.string().uuid('Invalid request ID'),
  }),
});

export const getAllRequestsSchema = paginationSchema.extend({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
    status: z.nativeEnum(RequestStatus).optional(),
    priority: z.nativeEnum(RequestPriority).optional(),
    sortBy: z.string().optional(),
  }),
});

export const searchRequestsSchema = paginationSchema.extend({
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
