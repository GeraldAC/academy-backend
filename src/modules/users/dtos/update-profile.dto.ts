import { z } from 'zod';

export const UpdateProfileDto = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z
    .string()
    .regex(/^[0-9]{9}$/)
    .optional()
    .or(z.literal(''))
    .or(z.null()),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileDto>;
