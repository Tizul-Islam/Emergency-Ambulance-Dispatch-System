import { z } from 'zod';
import { paginationSchema } from '../../shared/common.validation';

export const createHospitalSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    emergencyAvailable: z.boolean().optional().default(true),
  }),
});

export const updateHospitalAvailabilitySchema = z.object({
  body: z.object({
    emergencyAvailable: z.boolean(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updateHospitalSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    phone: z.string().min(10).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    emergencyAvailable: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getHospitalsSchema = paginationSchema;

export const searchHospitalsSchema = paginationSchema.extend({
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
