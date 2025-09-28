import { z } from 'zod';

export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  // Dates are often sent as ISO strings, so we validate as a string and refine to ensure it's a valid date
  dateOfBirth: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Invalid date of birth format.',
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN'], { 
    errorMap: () => ({ message: 'Invalid gender value.' }) 
  }),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email format.').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  // Max length often needed for clinic system IDs
  medicalRecordId: z.string().max(20, 'ID cannot exceed 20 characters.').optional().or(z.literal('')),
});

// Schema for updating a patient (makes all fields optional)
export const updatePatientSchema = patientSchema.partial();

// Type extraction for TypeScript use
export type PatientInput = z.infer<typeof patientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;