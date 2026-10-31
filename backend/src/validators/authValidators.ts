import { z } from 'zod';

export const registerPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
  phoneNumber: z.string().min(7, 'Phone number must be at least 7 digits').max(25),
  emergencyContact: z.string().max(120).optional(),
  medicalHistory: z.string().max(1000).optional(),
  allergies: z.string().max(500).optional(),
  currentMedications: z.string().max(500).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
