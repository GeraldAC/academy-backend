import { signJwt } from '@utils/jwt.util';
import { Role } from '@prisma/client';

interface TokenPayload {
  id?: string;
  role?: Role;
}

export const generateTestToken = (overrides: TokenPayload = {}): string => {
  return signJwt({
    id: overrides.id ?? 'test-user-id-001',
    role: overrides.role ?? Role.STUDENT,
  });
};

export const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
