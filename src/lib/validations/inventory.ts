import { z } from 'zod';

// --- Zod Schemas for InventoryItem ---

/**
 * Schema for creating a new InventoryItem.
 * All core fields are required for initial creation.
 */
export const inventorySchema = z.object({
  // Required fields
  name: z.string().min(1, 'Medication name is required.'),
  unit: z.string().min(1, 'Unit (e.g., "tablet," "mL") is required.'),
  pricePerUnit: z.number().positive('Price must be a positive number.'),

  // Optional fields with defaults or validation
  description: z.string().optional(),
  currentStock: z.number().int().min(0, 'Stock cannot be negative.').default(0),
  reorderPoint: z.number().int().min(0, 'Reorder point cannot be negative.').default(10),
  supplier: z.string().optional(),
});

export type InventoryInput = z.infer<typeof inventorySchema>;


/**
 * Schema for updating an existing InventoryItem.
 * All fields are optional to allow for partial updates (PATCH requests).
 */
export const updateInventorySchema = z.object({
  name: z.string().min(1, 'Medication name is required.').optional(),
  description: z.string().optional(),
  unit: z.string().min(1, 'Unit is required.').optional(),
  currentStock: z.number().int().min(0, 'Stock cannot be negative.').optional(),
  reorderPoint: z.number().int().min(0, 'Reorder point cannot be negative.').optional(),
  pricePerUnit: z.number().positive('Price must be a positive number.').optional(),
  supplier: z.string().optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update." }
);

export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;