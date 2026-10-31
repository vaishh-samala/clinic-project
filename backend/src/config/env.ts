import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const defaultPort =
  process.env.BACKEND_PORT ||
  (process.env.PORT && process.env.PORT !== '8080' && process.env.PORT !== '3000'
    ? process.env.PORT
    : '5000');

const envSchema = z.object({
  PORT: z.string().default(defaultPort).transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://clinic_user:clinic_pass@localhost:5432/clinic_db?schema=public'),
  JWT_SECRET: z.string().default('clinic-agent-super-secret-jwt-key-2025-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: z.string().default('200').transform((val) => parseInt(val, 10)),
  N8N_WEBHOOK_URL: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
