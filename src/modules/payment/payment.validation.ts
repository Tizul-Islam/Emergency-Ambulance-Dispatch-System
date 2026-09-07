import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  body: z.object({
    tripId: z.string().uuid('Invalid trip ID'),
  }),
});

export const getPaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment ID'),
  }),
});
