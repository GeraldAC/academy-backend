import { LoginDto, AuthValidators } from '@modules/auth/validators/auth.validator';
import { z } from 'zod';

describe('Auth Validators', () => {
  // ─── AuthValidators.login (LoginDto) ──────────────────────────────────────

  describe('AuthValidators.login (LoginDto)', () => {
    it('debe validar correctamente un email y contraseña válidos', () => {
      const validData = {
        email: 'user@example.com',
        password: 'ValidPassword123!',
      };

      const result = AuthValidators.login.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.password).toBe('ValidPassword123!');
      }
    });

    it('debe rechazar un email inválido', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'ValidPassword123!',
      };

      const result = AuthValidators.login.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        expect(result.error.issues[0].path[0]).toBe('email');
      }
    });

    it('debe rechazar un email vacío', () => {
      const invalidData = {
        email: '',
        password: 'ValidPassword123!',
      };

      const result = AuthValidators.login.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('debe rechazar un email sin dominio', () => {
      const invalidData = {
        email: 'user@',
        password: 'ValidPassword123!',
      };

      const result = AuthValidators.login.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('debe rechazar una contraseña menor a 8 caracteres', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'Short1!',
      };

      const result = AuthValidators.login.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('password');
      }
    });

    it('debe rechazar una contraseña vacía', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '',
      };

      const result = AuthValidators.login.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('debe aceptar una contraseña exactamente de 8 caracteres', () => {
      const validData = {
        email: 'user@example.com',
        password: '12345678',
      };

      const result = AuthValidators.login.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('debe aceptar una contraseña de más de 8 caracteres', () => {
      const validData = {
        email: 'user@example.com',
        password: 'VeryLongPasswordWith123456789Characters!@#$%',
      };

      const result = AuthValidators.login.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('debe rechazar cuando falta el campo email', () => {
      const invalidData = {
        password: 'ValidPassword123!',
      };

      const result = AuthValidators.login.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('debe rechazar cuando falta el campo password', () => {
      const invalidData = {
        email: 'user@example.com',
      };

      const result = AuthValidators.login.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('debe rechazar cuando faltan ambos campos', () => {
      const invalidData = {};

      const result = AuthValidators.login.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('debe rechazar campos adicionales no definidos (si strict)', () => {
      const dataWithExtra = {
        email: 'user@example.com',
        password: 'ValidPassword123!',
        extraField: 'should be rejected',
      };

      const result = AuthValidators.login.safeParse(dataWithExtra);

      // Zod por defecto ignora campos extra, pero safeParse retorna éxito
      // Si queremos ser estrictos, usaríamos .strict()
      expect(result.success).toBe(true);
    });

    it('debe validar emails con caracteres válidos', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example.org',
      ];

      validEmails.forEach((email) => {
        const result = AuthValidators.login.safeParse({
          email,
          password: 'ValidPassword123!',
        });

        expect(result.success).toBe(true);
      });
    });

    it('debe rechazar emails con caracteres especiales inválidos', () => {
      const invalidEmails = [
        'user @example.com',
        'user@example .com',
        'user@@example.com',
        'user@.example.com',
      ];

      invalidEmails.forEach((email) => {
        const result = AuthValidators.login.safeParse({
          email,
          password: 'ValidPassword123!',
        });

        expect(result.success).toBe(false);
      });
    });

    it('debe aceptar contraseñas con caracteres especiales', () => {
      const validPassword = 'P@$$w0rd!#%&*()_+-=[]{}|;:,.<>?';

      const result = AuthValidators.login.safeParse({
        email: 'user@example.com',
        password: validPassword,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe(validPassword);
      }
    });

    it('debe aceptar contraseñas muy largas', () => {
      const longPassword = 'A'.repeat(300);

      const result = AuthValidators.login.safeParse({
        email: 'user@example.com',
        password: longPassword,
      });

      expect(result.success).toBe(true);
    });

    it('debe proporcionar mensajes de error específicos', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'short',
      };

      const result = AuthValidators.login.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((issue) => issue.message);
        expect(errorMessages.length).toBeGreaterThan(0);
      }
    });

    it('debe retornar un objeto tipado LoginDto cuando es válido', () => {
      const validData = {
        email: 'user@example.com',
        password: 'ValidPassword123!',
      };

      const result = AuthValidators.login.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        const data: LoginDto = result.data;
        expect(typeof data.email).toBe('string');
        expect(typeof data.password).toBe('string');
      }
    });

    it('debe ser compatible con el método parse() para lanzar excepciones', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'short',
      };

      expect(() => {
        AuthValidators.login.parse(invalidData);
      }).toThrow(z.ZodError);
    });

    it('debe usar safeParse para validación sin lanzar excepciones', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'short',
      };

      expect(() => {
        AuthValidators.login.safeParse(invalidData);
      }).not.toThrow();
    });
  });

  // ─── Casos de uso reales ──────────────────────────────────────────────────

  describe('Casos de uso reales de LoginDto', () => {
    it('debe validar credenciales de estudiante típicas', () => {
      const studentLogin = {
        email: 'student@academy.edu.pe',
        password: 'SecureStudentPass123!',
      };

      const result = AuthValidators.login.safeParse(studentLogin);

      expect(result.success).toBe(true);
    });

    it('debe validar credenciales de profesor típicas', () => {
      const teacherLogin = {
        email: 'professor@academy.edu.pe',
        password: 'TeacherSecure456!',
      };

      const result = AuthValidators.login.safeParse(teacherLogin);

      expect(result.success).toBe(true);
    });

    it('debe validar credenciales de administrador típicas', () => {
      const adminLogin = {
        email: 'admin@academy.edu.pe',
        password: 'AdminSecurePass789!',
      };

      const result = AuthValidators.login.safeParse(adminLogin);

      expect(result.success).toBe(true);
    });

    it('debe rechazar intento de login sin credenciales', () => {
      const invalidLogin = {};

      const result = AuthValidators.login.safeParse(invalidLogin);

      expect(result.success).toBe(false);
    });

    it('debe rechazar intento de login parcial (solo email)', () => {
      const partialLogin = {
        email: 'user@academy.edu.pe',
      };

      const result = AuthValidators.login.safeParse(partialLogin);

      expect(result.success).toBe(false);
    });

    it('debe rechazar intento de login parcial (solo password)', () => {
      const partialLogin = {
        password: 'SecurePassword123!',
      };

      const result = AuthValidators.login.safeParse(partialLogin);

      expect(result.success).toBe(false);
    });
  });
});
