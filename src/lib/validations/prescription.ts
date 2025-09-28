import { z } from 'zod';

export const prescriptionSchema = z.object({
  // Foreign Key (Required)
  patientId: z.string().min(1, 'Patient ID is required.'),
  
  // Medication Details (Required)
  medicationName: z.string().min(1, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage instructions are required.'),
  instructions: z.string().min(1, 'Dispensing instructions are required.'),
  
  // Optional link to a report
  reportId: z.string().optional().or(z.literal('')),
});

export const updatePrescriptionSchema = prescriptionSchema.partial();

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>;