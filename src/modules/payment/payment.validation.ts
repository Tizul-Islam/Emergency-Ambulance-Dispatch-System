import { z } from 'zod';

import { PaymentProvider } from '../../generated/prisma/client';

export const initiatePaymentSchema = z.object({
  body: z.object({
    tripId: z.string().uuid('Invalid trip ID'),
    provider: z.nativeEnum(PaymentProvider).optional(),
  }),
});

export const getPaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment ID'),
  }),
});
