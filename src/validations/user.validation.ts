import { z } from 'zod';

export const updateMeSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().min(10, 'Phone must be at least 10 characters').optional(),
  }).refine((data) => data.name !== undefined || data.phone !== undefined, {
    message: 'At least one of name or phone must be provided to update',
  }),
});
