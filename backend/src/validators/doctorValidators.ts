import { z } from 'zod';

export const listDoctorsQuerySchema = z.object({
  specialization: z.string().optional(),
  search: z.string().optional(),
  activeOnly: z
    .union([z.boolean(), z.string().transform((val) => val === 'true')])
    .optional(),
});

export const doctorAvailabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const doctorIdParamSchema = z.object({
  id: z.string().min(1, 'Doctor ID is required'),
});

export type ListDoctorsQuery = z.infer<typeof listDoctorsQuerySchema>;
export type DoctorAvailabilityQuery = z.infer<typeof doctorAvailabilityQuerySchema>;
