import { PrismaClient } from '@prisma/client';

interface AttendanceOptions {
  attendanceHistoryMonths: number;
  attendanceRate: number;
}

export async function seedAttendance(
  prisma: PrismaClient,
  options: AttendanceOptions = { attendanceHistoryMonths: 2, attendanceRate: 0.8 }
) {
  console.log('[ ] Seeding attendance...');

  const enrollments = await prisma.enrollment.findMany({
    where: { status: 'ACTIVE' },
    include: {
      course: {
        include: { schedules: true, teacher: true },
      },
    },
  });

  // Generar asistencias para los últimos X meses según config
  const today = new Date();
  const monthsAgo = new Date();
  monthsAgo.setMonth(today.getMonth() - options.attendanceHistoryMonths);

  for (const enrollment of enrollments) {
    const { course, studentId } = enrollment;

    if (!course.schedules.length) continue;

    // Iterar por cada día desde hace X meses
    const currentDate = new Date(monthsAgo);
    while (currentDate <= today) {
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

      // Verificar si hay clase ese día
      const hasClass = course.schedules.some((s) => s.weekDay === dayOfWeek && s.isActive);

      if (hasClass) {
        // Porcentaje de asistencia según config
        const present = Math.random() < options.attendanceRate;

        await prisma.attendance.create({
          data: {
            studentId,
            courseId: course.id,
            classDate: new Date(currentDate),
            present,
            recordedBy: course.teacherId,
          },
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  const count = await prisma.attendance.count();
  console.log(`[ ] Created ${count} attendance records`);
}
