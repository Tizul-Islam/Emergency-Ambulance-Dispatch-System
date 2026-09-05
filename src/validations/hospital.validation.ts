import { z } from 'zod';
import { paginationSchema } from './common.validation';

export const createHospitalSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    lat: z.number(),
    lng: z.number(),
    totalBeds: z.number().int().nonnegative(),
    availableBeds: z.number().int().nonnegative(),
  }).refine(data => data.availableBeds <= data.totalBeds, {
    message: 'Available beds cannot exceed total beds',
  }),
});

export const updateHospitalBedsSchema = z.object({
  body: z.object({
    totalBeds: z.number().int().nonnegative().optional(),
    availableBeds: z.number().int().nonnegative().optional(),
  }),
});

export const updateHospitalSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
});

export const getHospitalsSchema = paginationSchema;
