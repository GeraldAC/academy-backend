import { User, Role } from '@prisma/client';

export const userFixture = (overrides: Partial<User> = {}): User => ({
  id: 'user-fixture-id-001',
  email: 'student@academy.test',
  passwordHash: 'MyPasswordHash',
  role: Role.STUDENT,
  dni: '12345678',
  phone: null,
  firstName: 'Test',
  lastName: 'Student',
  isActive: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

export const adminFixture = (overrides: Partial<User> = {}): User =>
  userFixture({
    id: 'admin-fixture-id-001',
    email: 'admin@academy.test',
    role: Role.ADMIN,
    ...overrides,
  });

export const teacherFixture = (overrides: Partial<User> = {}): User =>
  userFixture({
    id: 'teacher-fixture-id-001',
    email: 'teacher@academy.test',
    role: Role.TEACHER,
    ...overrides,
  });
