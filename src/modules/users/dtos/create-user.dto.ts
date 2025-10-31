// backend/src/modules/users/dtos/user.dto.ts
import { z } from 'zod';

// Roles válidos según tu sistema
export const UserRoleEnum = z.enum(['STUDENT', 'TEACHER', 'ADMIN']);

// DTO para creación de usuario
export const CreateUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dni: z.string().length(8, "El DNI debe tener 8 caracteres"),
  role: UserRoleEnum,
  phone: z.string().optional()
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;

// DTO para actualización de perfil
export const UpdateUserDto = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: UserRoleEnum.optional(),
  isActive: z.boolean().optional()
});
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

// DTO para filtros de usuarios
export const UserFiltersDto = z.object({
  role: UserRoleEnum.optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).optional()
});
export type UserFiltersDto = z.infer<typeof UserFiltersDto>;
