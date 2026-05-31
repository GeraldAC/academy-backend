import { Role } from '@prisma/client';

export const loginDto = {
  valid: {
    email: 'student@academy.test',
    password: 'Password123!',
  },
  wrongPassword: {
    email: 'student@academy.test',
    password: 'wrong-password',
  },
  nonExistentUser: {
    email: 'ghost@academy.test',
    password: 'Password123!',
  },
  invalidFormat: {
    email: 'not-an-email',
    password: '',
  },
};

export const registerDto = {
  valid: {
    email: 'new@academy.test',
    password: 'Password123!',
    firstName: 'New',
    lastName: 'User',
    dni: '87654321',
    role: Role.STUDENT,
  },
  duplicateEmail: {
    email: 'student@academy.test', // ya existe en fixture
    password: 'Password123!',
    firstName: 'Dup',
    lastName: 'User',
    dni: '11111111',
    role: Role.STUDENT,
  },
};
