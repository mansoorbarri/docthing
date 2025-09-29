import { z } from 'zod';

export const doctorSchema = z.object({
  clerkId: z.string().min(1, 'Doctor ID is required.').max(100, 'ID cannot exceed 100 characters.').describe('Clerk/Auth user ID.'),
  email: z.string().email('Invalid email format.').min(1, 'Email is required.'),
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  specialty: z.string().optional().or(z.literal('')),
});

export const updateDoctorSchema = doctorSchema.partial();

export type DoctorInput = z.infer<typeof doctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;