import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users.seed';
import { seedCourses } from './courses.seed';
import { seedSchedules } from './schedules.seed';
import { seedEnrollments } from './enrollments.seed';
import { seedAttendance } from './attendance.seed';
import { seedPayments } from './payments.seed';
import { seedReservations } from './reservations.seed';
import { seedNotifications } from './notifications.seed';
import { cleanDatabase } from './clean';
import { SeedConfig, defaultConfig } from './config';

const prisma = new PrismaClient();

export async function runAllSeeds(config: SeedConfig = defaultConfig) {
  console.log('[ ] Starting seeds...');
  console.log('[ ] Configuration:', {
    clean: config.cleanDatabase,
    quantities: config.quantities,
    enabledSeeds: Object.entries(config.seeds)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name),
  });

  try {
    // Limpieza de base de datos
    if (config.cleanDatabase) {
      await cleanDatabase(prisma);
    }

    // 1. Crear usuarios (admins, teachers, students)
    if (config.seeds.users) {
      await seedUsers(prisma, config.quantities);
    }

    // 2. Crear cursos (requiere teachers)
    if (config.seeds.courses) {
      await seedCourses(prisma);
    }

    // 3. Crear horarios (requiere courses)
    if (config.seeds.schedules) {
      await seedSchedules(prisma);
    }

    // 4. Crear matrículas (requiere students y courses)
    if (config.seeds.enrollments) {
      await seedEnrollments(prisma, config.options);
    }

    // 5. Crear asistencias (requiere enrollments)
    if (config.seeds.attendance) {
      await seedAttendance(prisma, config.options);
    }

    // 6. Crear pagos (requiere enrollments)
    if (config.seeds.payments) {
      await seedPayments(prisma, config.options);
    }

    // 7. Crear reservas (requiere enrollments)
    if (config.seeds.reservations) {
      await seedReservations(prisma, config.options);
    }

    // 8. Crear notificaciones (requiere users)
    if (config.seeds.notifications) {
      await seedNotifications(prisma);
    }

    console.log('[ ] All seeds finished successfully!');
  } catch (err) {
    console.error('[ ] Error running seeds:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}
