import { z } from 'zod';
import { TripStatus } from '../../generated/prisma/client';
import { paginationSchema } from '../../shared/common.validation';

export const getTripsSchema = paginationSchema.extend({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
    status: z.nativeEnum(TripStatus).optional(),
    sortBy: z.string().optional(),
  }),
});
