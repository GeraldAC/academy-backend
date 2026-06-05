import { signJwt, verifyJwt, decodeJwt } from '@utils/jwt.util';
import { env } from '@config/env';
import jwt from 'jsonwebtoken';

describe('JWT Utility Functions', () => {
  interface TestPayload {
    id: string;
    role: string;
    email?: string;
  }

  // ─── signJwt ──────────────────────────────────────────────────────────────

  describe('signJwt()', () => {
    it('debe generar un JWT válido con payload personalizado', () => {
      const payload: TestPayload = { id: 'user-123', role: 'ADMIN' };

      const token = signJwt(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT tiene 3 partes
    });

    it('debe incluir el payload correcto en el token', () => {
      const payload: TestPayload = { id: 'user-456', role: 'TEACHER' };

      const token = signJwt(payload);
      const decoded = jwt.decode(token) as TestPayload;

      expect(decoded.id).toBe('user-456');
      expect(decoded.role).toBe('TEACHER');
    });

    it('debe generar tokens diferentes para payloads diferentes', () => {
      const payload1: TestPayload = { id: 'user-1', role: 'STUDENT' };
      const payload2: TestPayload = { id: 'user-2', role: 'STUDENT' };

      const token1 = signJwt(payload1);
      const token2 = signJwt(payload2);

      expect(token1).not.toBe(token2);
    });

    it('debe generar tokens diferentes para el mismo payload (iat diferente)', async () => {
      const payload: TestPayload = { id: 'user-123', role: 'ADMIN' };

      const token1 = signJwt(payload);

      // Esperar 1 segundo para que iat sea diferente
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const token2 = signJwt(payload);

      // Los tokens son diferentes porque tienen iat (issued at) diferente
      expect(token1).not.toBe(token2);

      // Pero el payload decodificado es el mismo (excepto iat)
      const decoded1 = jwt.decode(token1) as TestPayload;
      const decoded2 = jwt.decode(token2) as TestPayload;
      expect(decoded1.id).toBe(decoded2.id);
      expect(decoded1.role).toBe(decoded2.role);
    });

    it('debe incluir información estándar de JWT (iat, exp)', () => {
      const payload: TestPayload = { id: 'user-789', role: 'STUDENT' };

      const token = signJwt(payload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.iat).toBeDefined(); // issued at
      expect(decoded.exp).toBeDefined(); // expiration
      expect(typeof decoded.iat).toBe('number');
      expect(typeof decoded.exp).toBe('number');
    });

    it('debe respetar la expiración por defecto (1 día)', () => {
      const payload: TestPayload = { id: 'user-123', role: 'ADMIN' };

      const token = signJwt(payload);
      const decoded = jwt.decode(token) as any;

      const nowInSeconds = Math.floor(Date.now() / 1000);
      const expiresInSeconds = decoded.exp - nowInSeconds;

      // Debe expirar en aproximadamente 1 día (86400 segundos)
      // Permitimos ±5 segundos de tolerancia
      expect(expiresInSeconds).toBeGreaterThan(86395);
      expect(expiresInSeconds).toBeLessThan(86405);
    });

    it('debe soportar expiración personalizada (string)', () => {
      const payload: TestPayload = { id: 'user-123', role: 'ADMIN' };

      const token = signJwt(payload, '2h');
      const decoded = jwt.decode(token) as any;

      const nowInSeconds = Math.floor(Date.now() / 1000);
      const expiresInSeconds = decoded.exp - nowInSeconds;

      // Debe expirar en aproximadamente 2 horas (7200 segundos)
      expect(expiresInSeconds).toBeGreaterThan(7195);
      expect(expiresInSeconds).toBeLessThan(7205);
    });

    it('debe soportar expiración personalizada (número de segundos)', () => {
      const payload: TestPayload = { id: 'user-123', role: 'ADMIN' };
      const expiresInSeconds = 3600; // 1 hora

      const token = signJwt(payload, expiresInSeconds);
      const decoded = jwt.decode(token) as any;

      const nowInSeconds = Math.floor(Date.now() / 1000);
      const tokenExpiresIn = decoded.exp - nowInSeconds;

      expect(tokenExpiresIn).toBeGreaterThan(3595);
      expect(tokenExpiresIn).toBeLessThan(3605);
    });

    it('debe incluir múltiples propiedades en el payload', () => {
      const payload: TestPayload = {
        id: 'user-123',
        role: 'TEACHER',
        email: 'teacher@example.com',
      };

      const token = signJwt(payload);
      const decoded = jwt.decode(token) as TestPayload;

      expect(decoded.id).toBe('user-123');
      expect(decoded.role).toBe('TEACHER');
      expect(decoded.email).toBe('teacher@example.com');
    });
  });

  // ─── verifyJwt ────────────────────────────────────────────────────────────

  describe('verifyJwt()', () => {
    it('debe retornar el payload cuando el token es válido', () => {
      const payload: TestPayload = { id: 'user-123', role: 'ADMIN' };

      const token = signJwt(payload);
      const verified = verifyJwt<TestPayload>(token);

      expect(verified).not.toBeNull();
      expect(verified?.id).toBe('user-123');
      expect(verified?.role).toBe('ADMIN');
    });

    it('debe retornar null si el token es inválido', () => {
      const invalidToken = 'invalid.jwt.token';

      const result = verifyJwt(invalidToken);

      expect(result).toBeNull();
    });

    it('debe retornar null si el token está vacío', () => {
      const result = verifyJwt('');

      expect(result).toBeNull();
    });

    it('debe retornar null si el token está corrupto', () => {
      const corruptedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.corrupt';

      const result = verifyJwt(corruptedToken);

      expect(result).toBeNull();
    });

    it('debe retornar null si el token fue firmado con una clave diferente', () => {
      const payload = { id: 'user-123', role: 'STUDENT' };
      const wrongSecretToken = jwt.sign(payload, 'wrong-secret-key', {
        algorithm: 'HS256',
        expiresIn: '1d',
      });

      const result = verifyJwt(wrongSecretToken);

      expect(result).toBeNull();
    });

    it('debe mantener el tipado genérico del payload', () => {
      const payload: TestPayload = {
        id: 'user-789',
        role: 'TEACHER',
        email: 'teacher@test.com',
      };

      const token = signJwt(payload);
      const verified = verifyJwt<TestPayload>(token);

      // TypeScript debe permitir acceso a las propiedades tipadas
      expect(verified?.id).toBeDefined();
      expect(verified?.role).toBeDefined();
      expect(verified?.email).toBeDefined();
    });

    it('debe rechazar tokens expirados', async () => {
      const payload: TestPayload = { id: 'user-123', role: 'STUDENT' };

      // Crear un token que expire en 0 segundos
      const token = signJwt(payload, 0);

      // Esperar un poco para asegurar que expira
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = verifyJwt(token);

      expect(result).toBeNull();
    });

    it('debe verificar correctamente múltiples tokens válidos', () => {
      const payloads: TestPayload[] = [
        { id: 'user-1', role: 'ADMIN' },
        { id: 'user-2', role: 'TEACHER' },
        { id: 'user-3', role: 'STUDENT' },
      ];

      const tokens = payloads.map((p) => signJwt(p));
      const verified = tokens.map((t) => verifyJwt<TestPayload>(t));

      for (let i = 0; i < verified.length; i++) {
        expect(verified[i]).not.toBeNull();
        expect(verified[i]?.id).toBe(payloads[i].id);
        expect(verified[i]?.role).toBe(payloads[i].role);
      }
    });
  });

  // ─── decodeJwt ────────────────────────────────────────────────────────────

  describe('decodeJwt()', () => {
    it('debe decodificar un token válido sin verificar', () => {
      const payload: TestPayload = { id: 'user-123', role: 'ADMIN' };

      const token = signJwt(payload);
      const decoded = decodeJwt<TestPayload>(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.id).toBe('user-123');
      expect(decoded?.role).toBe('ADMIN');
    });

    it('debe decodificar un token incluso si fue firmado con otra clave', () => {
      const payload = { id: 'user-456', role: 'STUDENT' };
      const wrongSecretToken = jwt.sign(payload, 'different-secret', {
        algorithm: 'HS256',
        expiresIn: '1d',
      });

      const decoded = decodeJwt(wrongSecretToken);

      // decodeJwt no verifica la firma, solo decodifica
      expect(decoded).not.toBeNull();
      expect((decoded as any)?.id).toBe('user-456');
    });

    it('debe retornar null si el token es inválido', () => {
      const result = decodeJwt('invalid-token');

      expect(result).toBeNull();
    });
  });

  // ─── Integración: signJwt + verifyJwt ─────────────────────────────────────

  describe('Integración: signJwt + verifyJwt', () => {
    it('debe crear y verificar un token correctamente', () => {
      const payload: TestPayload = {
        id: 'user-integration',
        role: 'ADMIN',
        email: 'admin@test.com',
      };

      const token = signJwt(payload);
      const verified = verifyJwt<TestPayload>(token);

      expect(verified).not.toBeNull();
      expect(verified?.id).toBe(payload.id);
      expect(verified?.role).toBe(payload.role);
      expect(verified?.email).toBe(payload.email);
    });

    it('debe mantener la integridad del payload en el flujo completo', () => {
      const originalPayload: TestPayload = {
        id: 'test-user-999',
        role: 'TEACHER',
        email: 'teacher@institution.com',
      };

      const token = signJwt(originalPayload);
      const verified = verifyJwt<TestPayload>(token);

      expect(verified).not.toBeNull();
      expect(verified?.id).toBe(originalPayload.id);
      expect(verified?.role).toBe(originalPayload.role);
      expect(verified?.email).toBe(originalPayload.email);
    });
  });
});
