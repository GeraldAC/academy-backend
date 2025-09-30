// prisma/seeds/users.seed.ts
import { PrismaClient, Role } from '@prisma/client';
import {
  hashPassword,
  uniqueDniGenerator,
  uniqueEmailGenerator,
  randomFullName,
  randomPhone,
} from './utils';

/**
 * seedUsers:
 * - recibe una instancia PrismaClient (para evitar múltiples conexiones)
 * - crea admins, teachers, students
 * - usa upsert por email para idempotencia
 */
export async function seedUsers(
  prisma: PrismaClient,
  options?: { admins?: number; teachers?: number; students?: number }
) {
  const admins = options?.admins ?? 1;
  const teachers = options?.teachers ?? 5;
  const students = options?.students ?? 30;

  console.log(`Seeding users: admins=${admins} teachers=${teachers} students=${students}`);

  const total = admins + teachers + students;
  const dnis = uniqueDniGenerator(total);
  const emails = uniqueEmailGenerator(total, 'unsaac.edu.pe');

  let idx = 0;

  // Helper local para crear/upsert por rol
  async function upsertUser(
    email: string,
    firstName: string,
    lastName: string,
    dni: string,
    role: Role,
    plainPassword: string
  ) {
    const passwordHash = await hashPassword(plainPassword);
    await prisma.user.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        dni,
        passwordHash,
        role,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        email,
        passwordHash,
        firstName,
        lastName,
        dni,
        role,
        phone: randomPhone(),
        isActive: true,
      },
    });
  }

  // Admins
  for (let i = 0; i < admins; i++) {
    const { firstName, lastName } = randomFullName();
    const email = emails[idx];
    const dni = dnis[idx];
    idx++;
    await upsertUser(email, firstName, lastName, dni, Role.ADMIN, 'Admin123!');
    console.log(` -> ADMIN: ${email}`);
  }

  // Teachers
  for (let i = 0; i < teachers; i++) {
    const { firstName, lastName } = randomFullName();
    const email = emails[idx];
    const dni = dnis[idx];
    idx++;
    await upsertUser(email, firstName, lastName, dni, Role.TEACHER, 'Teacher123!');
    console.log(` -> TEACHER: ${email}`);
  }

  // Students (en batches de 25 para evitar loops demasiado largos)
  for (let i = 0; i < students; i++) {
    const { firstName, lastName } = randomFullName();
    const email = emails[idx];
    const dni = dnis[idx];
    idx++;
    await upsertUser(email, firstName, lastName, dni, Role.STUDENT, 'Student123!');
    if ((i + 1) % 10 === 0) console.log(`   > ${i + 1} students created`);
  }

  console.log('Users seed finished.');
}
