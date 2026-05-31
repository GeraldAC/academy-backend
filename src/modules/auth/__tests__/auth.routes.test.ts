import '@tests/mocks/prisma.mock';
import { prismaMock } from '@tests/mocks/prisma.mock';

import request from 'supertest';
import { app } from '@tests/helpers/app.helper';
import { userFixture } from '@tests/fixtures/user.fixture';
import { loginDto, registerDto } from '@tests/fixtures/auth.fixture';
import * as hashUtil from '@utils/hash.util';
import * as jwtUtil from '@utils/jwt.util';

jest.mock('@utils/hash.util');
jest.mock('@utils/jwt.util');

const mockHashUtil = hashUtil as jest.Mocked<typeof hashUtil>;
const mockJwtUtil = jwtUtil as jest.Mocked<typeof jwtUtil>;

describe('Auth Routes', () => {
  beforeEach(() => {
    mockJwtUtil.signJwt.mockReturnValue('mocked-jwt-token');
    mockJwtUtil.verifyJwt.mockReturnValue({ id: 'user-fixture-id-001', role: 'STUDENT' });
  });

  // ─── POST /api/auth/login ─────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    it('200 con credenciales válidas', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userFixture());
      mockHashUtil.comparePassword.mockResolvedValue(true);

      const res = await request(app).post('/api/auth/login').send(loginDto.valid);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).not.toHaveProperty('passwordHash'); // nunca exponer
    });

    it('401 con credenciales inválidas', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send(loginDto.nonExistentUser);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('400 con body inválido (validación Zod)', async () => {
      const res = await request(app).post('/api/auth/login').send(loginDto.invalidFormat);

      expect(res.status).toBe(400);
    });
  });

  // ─── POST /api/auth/register ──────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('201 con datos válidos', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      mockHashUtil.hashPassword.mockResolvedValue('hashed');
      prismaMock.user.create.mockResolvedValue(userFixture({ email: registerDto.valid.email }));

      const res = await request(app).post('/api/auth/register').send(registerDto.valid);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    it('400 si el email ya está registrado', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userFixture());

      const res = await request(app).post('/api/auth/register').send(registerDto.duplicateEmail);

      expect(res.status).toBe(400);
    });
  });

  // ─── GET /api/auth/verify ─────────────────────────────────────────────────

  describe('GET /api/auth/verify', () => {
    it('200 con token válido en header', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userFixture());

      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer mocked-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('valid', true);
    });

    it('401 sin Authorization header', async () => {
      const res = await request(app).get('/api/auth/verify');
      expect(res.status).toBe(401);
    });
  });
});
