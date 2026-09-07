import { z } from 'zod';
import { DriverStatus } from '@prisma/client';
import { paginationSchema } from '../../shared/common.validation';

export const createDriverSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    licenseNumber: z.string().min(5, 'License number is required'),
    userId: z.string().uuid().optional(),
  }),
});

export const updateDriverStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(DriverStatus),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updateDriverSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    licenseNumber: z.string().min(5).optional(),
    userId: z.string().uuid().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getDriversSchema = paginationSchema.extend({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
    status: z.nativeEnum(DriverStatus).optional(),
  }),
});
