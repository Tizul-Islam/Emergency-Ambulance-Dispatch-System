import { z } from 'zod';
import { RequestStatus } from '../../generated/prisma/client';

export const updateDispatchStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(RequestStatus, {
      errorMap: () => ({ message: 'Invalid emergency status' }),
    }),
  }),
  params: z.object({
    id: z.string().uuid('Invalid dispatch ID'),
  }),
});

export const selectHospitalSchema = z.object({
  body: z.object({
    hospitalId: z.string().uuid('Invalid hospital ID'),
  }),
  params: z.object({
    id: z.string().uuid('Invalid dispatch ID'),
  }),
});

export const searchDispatchesSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query (q) is required'),
  }),
});
