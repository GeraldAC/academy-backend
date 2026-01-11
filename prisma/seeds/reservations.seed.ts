import { PrismaClient } from '@prisma/client';

interface ReservationOptions {
  reservationFutureDays: number;
}

export async function seedReservations(
  prisma: PrismaClient,
  options: ReservationOptions = { reservationFutureDays: 30 }
) {
  console.log('[ ] Seeding reservations...');

  const enrollments = await prisma.enrollment.findMany({
    where: { status: 'ACTIVE' },
    include: {
      course: { include: { schedules: true } },
    },
  });

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + options.reservationFutureDays);

  for (const enrollment of enrollments) {
    const { course, studentId } = enrollment;

    if (!course.schedules.length) continue;

    // 30% de estudiantes hacen reservas
    if (Math.random() > 0.3) continue;

    // Crear 1-3 reservas futuras
    const numReservations = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numReservations; i++) {
      const randomDays = Math.floor(Math.random() * options.reservationFutureDays);
      const classDate = new Date(today);
      classDate.setDate(today.getDate() + randomDays);

      const dayOfWeek = classDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

      // Verificar si hay clase ese día
      const hasClass = course.schedules.some((s) => s.weekDay === dayOfWeek);
      if (!hasClass) continue;

      const isCancelled = Math.random() < 0.1; // 10% canceladas

      await prisma.reservation.create({
        data: {
          studentId,
          courseId: course.id,
          classDate,
          isCancelled,
          cancelledAt: isCancelled ? new Date() : null,
          notes: isCancelled ? 'Cancelado por el estudiante' : null,
        },
      });
    }
  }

  const count = await prisma.reservation.count();
  console.log(`[ ] Created ${count} reservations`);
}
