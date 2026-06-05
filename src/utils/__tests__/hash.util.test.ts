import { hashPassword, comparePassword } from '@utils/hash.util';

describe('Hash Utility Functions', () => {
  // ─── hashPassword ─────────────────────────────────────────────────────────

  describe('hashPassword()', () => {
    it('debe retornar un hash válido para una contraseña', async () => {
      const password = 'MySecurePassword123!';

      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(20); // Las contraseñas hasheadas son largas
      expect(hash).not.toBe(password); // No debe ser la contraseña en texto plano
    });

    it('debe generar hashes diferentes para la misma contraseña (salt aleatorio)', async () => {
      const password = 'MySecurePassword123!';

      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Cada hash debe ser diferente
    });

    it('debe hashear contraseñas vacías', async () => {
      const password = '';

      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(20);
    });

    it('debe hashear contraseñas con caracteres especiales', async () => {
      const password = 'P@$$w0rd!#%&*()_+-=[]{}|;:,.<>?';

      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
    });

    it('debe hashear contraseñas largas', async () => {
      const password = 'A'.repeat(200);

      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  // ─── comparePassword ──────────────────────────────────────────────────────

  describe('comparePassword()', () => {
    it('debe retornar true si la contraseña coincide con el hash', async () => {
      const password = 'CorrectPassword123!';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('debe retornar false si la contraseña es incorrecta', async () => {
      const correctPassword = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await hashPassword(correctPassword);

      const result = await comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('debe ser sensible a mayúsculas y minúsculas', async () => {
      const password = 'MyPassword123!';
      const wrongCase = 'mypassword123!';
      const hash = await hashPassword(password);

      const result = await comparePassword(wrongCase, hash);

      expect(result).toBe(false);
    });

    it('debe retornar false con una contraseña vacía contra un hash válido', async () => {
      const password = 'CorrectPassword123!';
      const hash = await hashPassword(password);

      const result = await comparePassword('', hash);

      expect(result).toBe(false);
    });

    it('debe retornar false con un hash inválido', async () => {
      const password = 'MyPassword123!';
      const invalidHash = 'not-a-valid-bcrypt-hash';

      const result = await comparePassword(password, invalidHash);

      expect(result).toBe(false);
    });

    it('debe comparar correctamente contraseñas con caracteres especiales', async () => {
      const password = 'Secure!@#$%^&*()Password123';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('debe ser independiente del orden de los parámetros', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      // Parámetros en orden correcto
      const result1 = await comparePassword(password, hash);
      expect(result1).toBe(true);

      // Intentar invertir los parámetros debería fallar (o lanzar un error)
      const result2 = await comparePassword(hash, password);
      expect(result2).toBe(false);
    });
  });

  // ─── Integración de hashPassword y comparePassword ───────────────────────

  describe('Integración: hashPassword + comparePassword', () => {
    it('debe validar correctamente una contraseña después de hashearla', async () => {
      const password = 'IntegrationTestPassword123!';

      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('debe rechazar múltiples contraseñas incorrectas después de hashear', async () => {
      const correctPassword = 'CorrectPassword123!';
      const wrongPasswords = [
        'WrongPassword1',
        'wrongpassword123!',
        'CorrectPassword124!',
        '',
        'CorrectPassword123',
      ];

      const hash = await hashPassword(correctPassword);

      for (const wrongPassword of wrongPasswords) {
        const result = await comparePassword(wrongPassword, hash);
        expect(result).toBe(false);
      }
    });
  });
});
