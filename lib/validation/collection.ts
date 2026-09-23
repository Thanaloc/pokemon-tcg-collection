import { z } from 'zod';

export const cardIdSchema = z.string().trim().min(1).max(100);

export const addToCollectionSchema = z.object({ cardId: cardIdSchema });

export const updateQuantitySchema = z.object({
  cardId: cardIdSchema,
  quantity: z.number().int('Quantité invalide').min(1, 'La quantité doit être au moins 1').max(9999, 'Quantité trop grande'),
});
