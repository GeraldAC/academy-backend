import { User } from '@prisma/client';

export function userToResponse(user: User) {
  // Ocultar passwordHash antes de devolver
  const { passwordHash, ...rest } = user;
  void passwordHash;
  return rest;
}
