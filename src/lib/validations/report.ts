import { z } from 'zod';

export const patientReportSchema = z.object({
  // Foreign Keys (Required to link the report)
  doctorId: z.string().min(1, 'Doctor ID is required.'),
  patientId: z.string().min(1, 'Patient ID is required.'),
  
  // Optional link to an appointment
  appointmentId: z.string().optional().or(z.literal('')),

  // Documentation Fields
  chiefComplaint: z.string().optional().or(z.literal('')),
  diagnosis: z.string().min(1, 'Diagnosis is required.'),
  treatmentPlan: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  
  // Report date defaults to now, but can be set manually
  reportDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Invalid report date format.',
  }).optional(),
});

export const updatePatientReportSchema = patientReportSchema.partial();

export type PatientReportInput = z.infer<typeof patientReportSchema>;
export type UpdatePatientReportInput = z.infer<typeof updatePatientReportSchema>;