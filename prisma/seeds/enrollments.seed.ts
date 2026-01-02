import { PrismaClient, EnrollmentStatus } from '@prisma/client';

interface EnrollmentOptions {
  coursesPerStudent: [number, number];
}

export async function seedEnrollments(
  prisma: PrismaClient,
  options: EnrollmentOptions = { coursesPerStudent: [1, 3] }
) {
  console.log('[ ] Seeding enrollments...');

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', isActive: true },
  });

  const courses = await prisma.course.findMany({
    where: { isActive: true },
  });

  for (const student of students) {
    // Cada estudiante se matricula en X-Y cursos según config
    const [min, max] = options.coursesPerStudent;
    const numCourses = Math.floor(Math.random() * (max - min + 1)) + min;
    const selectedCourses = courses.sort(() => Math.random() - 0.5).slice(0, numCourses);

    for (const course of selectedCourses) {
      // 90% ACTIVE, 10% CANCELLED
      const status: EnrollmentStatus = Math.random() > 0.1 ? 'ACTIVE' : 'CANCELLED';

      // Fechas entre 1-6 meses atrás
      const monthsAgo = Math.floor(Math.random() * 6) + 1;
      const enrollmentDate = new Date();
      enrollmentDate.setMonth(enrollmentDate.getMonth() - monthsAgo);

      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          enrollmentDate,
          status,
          notes: status === 'CANCELLED' ? 'Cancelado por el estudiante' : null,
        },
      });
    }
  }

  const count = await prisma.enrollment.count();
  console.log(`[ ] Created ${count} enrollments`);
}
