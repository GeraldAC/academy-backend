import { z } from 'zod';
import dotenv from 'dotenv';

// Carga .env.test si NODE_ENV=test, si no carga .env normal
dotenv.config({
  path: process.env['NODE_ENV'] === 'test' ? '.env.test' : '.env',
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  JWT_SECRET: z.string().min(5, 'JWT_SECRET debe tener al menos 5 caracteres'),
});

export const env = envSchema.parse(process.env);
