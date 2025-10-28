import { Role } from '@prisma/client';
import { z } from 'zod';

// Validation Schemas
export const createCourseSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  subject: z.string().min(2).max(50),
  teacherId: z.string().uuid(),
  capacity: z.number().int().min(5).max(40),
  monthlyPrice: z.number().positive(),
});

export const updateCourseSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional().nullable(),
  subject: z.string().min(2).max(50).optional(),
  teacherId: z.string().uuid().optional(),
  capacity: z.number().int().min(5).max(40).optional(),
  monthlyPrice: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export const courseFiltersSchema = z.object({
  subject: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  teacherId: z.string().uuid().optional(),
  search: z.string().optional(),
});

// Types
export type CreateCourseDto = z.infer<typeof createCourseSchema>;
export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;
export type CourseFilters = z.infer<typeof courseFiltersSchema>;

export interface CourseWithDetails {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  teacherId: string;
  capacity: number;
  monthlyPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
  };
  _count?: {
    enrollments: number;
  };
  availableCapacity?: number;
}

// ---------------------------------------------------------------------------

export const availableUserSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});
