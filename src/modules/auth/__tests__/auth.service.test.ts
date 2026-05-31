import '@tests/mocks/prisma.mock';
import { prismaMock } from '@tests/mocks/prisma.mock';

import { AuthService } from '@modules/auth/services/auth.service';
import { userFixture } from '@tests/fixtures/user.fixture';
import { loginDto, registerDto } from '@tests/fixtures/auth.fixture';
import * as hashUtil from '@utils/hash.util';
import * as jwtUtil from '@utils/jwt.util';

jest.mock('@utils/hash.util');
jest.mock('@utils/jwt.util');

const mockHashUtil = hashUtil as jest.Mocked<typeof hashUtil>;
const mockJwtUtil = jwtUtil as jest.Mocked<typeof jwtUtil>;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    mockJwtUtil.signJwt.mockReturnValue('mocked-jwt-token');
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('retorna token y usuario con credenciales válidas', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userFixture());
      mockHashUtil.comparePassword.mockResolvedValue(true);

      const result = await service.login(loginDto.valid);

      expect(result.token).toBe('mocked-jwt-token');
      expect(result.user).toBeDefined();
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.valid.email },
      });
    });

    it('lanza 401 si el usuario no existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto.nonExistentUser)).rejects.toMatchObject({
        status: 401,
        message: 'Invalid credentials',
      });
    });

    it('lanza 401 si la contraseña es incorrecta', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userFixture());
      mockHashUtil.comparePassword.mockResolvedValue(false);

      await expect(service.login(loginDto.wrongPassword)).rejects.toMatchObject({
        status: 401,
        message: 'Invalid credentials',
      });
    });
  });

  // ─── register ─────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('crea usuario y retorna token cuando el email no existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      mockHashUtil.hashPassword.mockResolvedValue('hashed-password');
      prismaMock.user.create.mockResolvedValue(userFixture({ email: registerDto.valid.email }));

      const result = await service.register(registerDto.valid);

      expect(result.token).toBe('mocked-jwt-token');
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });

    it('lanza 400 si el email ya está registrado', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userFixture());

      await expect(service.register(registerDto.duplicateEmail)).rejects.toMatchObject({
        status: 400,
        message: 'Email already registered',
      });

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  // ─── refreshToken ─────────────────────────────────────────────────────────

  describe('refreshToken()', () => {
    it('retorna nuevo token si el token actual es válido', async () => {
      mockJwtUtil.verifyJwt.mockReturnValue({ id: 'user-fixture-id-001', role: 'STUDENT' });
      prismaMock.user.findUnique.mockResolvedValue(userFixture());

      const result = await service.refreshToken('valid-old-token');

      expect(result.newToken).toBe('mocked-jwt-token');
    });

    it('lanza 401 si no se pasa token', async () => {
      await expect(service.refreshToken(undefined)).rejects.toMatchObject({
        status: 401,
        message: 'Missing token',
      });
    });

    it('lanza 403 si el token es inválido o expirado', async () => {
      mockJwtUtil.verifyJwt.mockReturnValue(null);

      await expect(service.refreshToken('expired-token')).rejects.toMatchObject({ status: 403 });
    });
  });
});
