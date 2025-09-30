// prisma/seeds/index.ts
import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users.seed';

const prisma = new PrismaClient();

export async function runAllSeeds() {
  console.log('🌱 Starting seeds...');
  try {
    // Conexión ya creada por PrismaClient instanciado arriba.
    await seedUsers(prisma, { admins: 1, teachers: 8, students: 120 });

    // Añade aquí los seeds que necesiten users:
    // await seedCourses(prisma);
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
