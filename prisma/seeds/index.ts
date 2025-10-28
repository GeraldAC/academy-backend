import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users.seed';
import { seedCourses } from './courses.seed';

const prisma = new PrismaClient();

export async function runAllSeeds() {
  console.log('🌱 Starting seeds...');
  try {
    // 1. Primero crear usuarios (admins, teachers, students)
    await seedUsers(prisma, { admins: 1, teachers: 8, students: 80 });

    // 2. Crear cursos (requiere teachers)
    await seedCourses(prisma);

    // Añade aquí los seeds que necesiten users:
    // await seedSchedules(prisma);
    // await seedEnrollments(prisma);
    // await seedPayments(prisma);

    console.log('[>] All seeds finished');
  } catch (err) {
    console.error('[>] Error running seeds:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}
