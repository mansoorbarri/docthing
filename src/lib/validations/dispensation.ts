import { z } from 'zod';

export const dispensationSchema = z.object({
  prescriptionId: z.string().cuid('Invalid Prescription ID format.'),
  inventoryItemId: z.string().cuid('Invalid Inventory Item ID format.'),
  quantity: z.number().int('Quantity must be a whole number.').min(1, 'Dispensed quantity must be at least 1.'),
});

export type DispensationInput = z.infer<typeof dispensationSchema>;