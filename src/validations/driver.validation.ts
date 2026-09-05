import { z } from 'zod';
import { DriverStatus } from '@prisma/client';
import { paginationSchema } from './common.validation';

export const createDriverSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    licenseNo: z.string().min(5),
    userId: z.string().uuid().optional(),
  }),
});

export const updateDriverStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(DriverStatus),
  }),
});

export const updateDriverSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    licenseNo: z.string().min(5).optional(),
    userId: z.string().uuid().optional().nullable(),
  }),
});

export const getDriversSchema = paginationSchema.extend({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    status: z.nativeEnum(DriverStatus).optional(),
  }),
});
