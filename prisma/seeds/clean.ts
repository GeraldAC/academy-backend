import { PrismaClient } from '@prisma/client';

export async function cleanDatabase(prisma: PrismaClient) {
  console.log('[ ] Cleaning database...');

  try {
    // Orden importante: eliminar primero las tablas dependientes
    await prisma.notification.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    console.log('[ ] Database cleaned successfully');
  } catch (error) {
    console.error('[ ] Error cleaning database:', error);
    throw error;
  }
}
