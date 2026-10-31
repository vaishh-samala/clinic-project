import { z } from 'zod';

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timeSlot: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time slot must be in HH:mm format (e.g. 09:30)'),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(500),
  notes: z.string().max(1000).optional(),
  patientId: z.string().optional(), // Allowed for DOCTOR/ADMIN booking on behalf of patient
});

export const updateAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  timeSlot: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time slot must be in HH:mm format').optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'REASSIGNED', 'CANCELLED', 'COMPLETED']).optional(),
  reason: z.string().min(3).max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const acceptAppointmentSchema = z.object({
  doctorNotes: z.string().max(1000).optional(),
  appointmentTime: z.string().optional(),
});

export const rejectAppointmentSchema = z.object({
  reason: z.string().min(2, 'Rejection reason is required').max(500),
  preferredDoctorId: z.string().optional(),
});

export const appointmentIdParamSchema = z.object({
  id: z.string().min(1, 'Appointment ID is required'),
});

export const listAppointmentsQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'REASSIGNED', 'CANCELLED', 'COMPLETED']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AcceptAppointmentInput = z.infer<typeof acceptAppointmentSchema>;
export type RejectAppointmentInput = z.infer<typeof rejectAppointmentSchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
