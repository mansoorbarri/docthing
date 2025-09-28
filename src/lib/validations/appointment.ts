import { z } from 'zod';

export const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required.'),
  patientId: z.string().min(1, 'Patient ID is required.'),
  
  startTime: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Invalid start time format.',
  }),
  endTime: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Invalid end time format.',
  }),

  reason: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')), 

  reportId: z.string().optional().or(z.literal('')),
});

export const updateAppointmentSchema = appointmentSchema.partial();

export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;