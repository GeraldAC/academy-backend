import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  courseId: z.string().uuid('Invalid course ID'),
  notes: z.string().optional(),
});

export const updateEnrollmentStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'CANCELLED', 'COMPLETED'], {
    errorMap: () => ({ message: 'Status must be ACTIVE, CANCELLED, or COMPLETED' }),
  }),
});

export type CreateEnrollmentDto = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentStatusDto = z.infer<typeof updateEnrollmentStatusSchema>;
