import { z } from 'zod';

export const CreateUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dni: z.string().length(8),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
  phone: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserDto>;
