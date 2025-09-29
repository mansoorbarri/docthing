import { z } from 'zod';

export const patientReportSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required.'),
  patientId: z.string().min(1, 'Patient ID is required.'),
  appointmentId: z.string().optional().or(z.literal('')),
  chiefComplaint: z.string().optional().or(z.literal('')),
  diagnosis: z.string().min(1, 'Diagnosis is required.'),
  treatmentPlan: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  reportDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Invalid report date format.',
  }).optional(),
});

export const ClientReportPayloadSchema = patientReportSchema.omit({
    doctorId: true,
    patientId: true,
});

export const ReportParamsSchema = z.object({
  patientID: z.string().min(1, 'Patient ID is required in URL parameters.'),
});

export const updatePatientReportSchema = patientReportSchema.partial();

export type PatientReportInput = z.infer<typeof patientReportSchema>;
export type ClientReportPayload = z.infer<typeof ClientReportPayloadSchema>; 
export type UpdatePatientReportInput = z.infer<typeof updatePatientReportSchema>;