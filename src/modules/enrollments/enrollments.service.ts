import { PrismaClient, EnrollmentStatus } from '@prisma/client';
import { CreateEnrollmentDto, UpdateEnrollmentStatusDto } from './enrollments.types';
const prisma = new PrismaClient();

export class EnrollmentsService {
  async enrollStudent(data: CreateEnrollmentDto) {
    const { studentId, courseId } = data;

    // 1. Verificar que el estudiante exista y esté activo
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student || !student.isActive) {
      throw new Error('Student not found or inactive');
    }

    if (student.role !== 'STUDENT') {
      throw new Error('User is not a student');
    }

    // 2. Verificar que el curso exista y esté activo
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: { select: { enrollments: true } },
      },
    });

    if (!course || !course.isActive) {
      throw new Error('Course not found or inactive');
    }

    // 3. Verificar capacidad
    if (course._count.enrollments >= course.capacity) {
      throw new Error('Course is already full');
    }

    // 4. Verificar que no esté ya matriculado
    const exists = await prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
      },
    });

    if (exists) {
      throw new Error('Student already enrolled in this course');
    }

    // 5. Crear matrícula
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
      },
      include: {
        student: true,
        course: true,
      },
    });

    return enrollment;
  }

  // Listar estudiantes matriculados por curso
  async getEnrolledStudents(courseId: string) {
    return prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            dni: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  //  Obtener estudiantes disponibles para matricular
  async getAvailableStudents(courseId: string) {
    // Obtener IDs de estudiantes ya matriculados en este curso (matrículas activas)
    const enrolledStudents = await prisma.enrollment.findMany({
      where: {
        courseId,
        status: 'ACTIVE', // Solo contar matrículas activas
      },
      select: { studentId: true },
    });

    const enrolledIds = enrolledStudents.map((e) => e.studentId);

    // Obtener todos los estudiantes activos que NO estén matriculados
    return prisma.user.findMany({
      where: {
        role: 'STUDENT',
        isActive: true,
        id: {
          notIn: enrolledIds.length > 0 ? enrolledIds : undefined,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        dni: true,
        phone: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });
  }
  // NUEVO: Actualizar estado de matrícula
  async updateEnrollmentStatus(id: string, data: UpdateEnrollmentStatusDto) {
    const { status } = data;

    // Verificar que la matrícula existe
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Validar transiciones de estado
    const currentStatus = enrollment.status;

    // No permitir cambios desde COMPLETED
    if (currentStatus === 'COMPLETED' && status !== 'COMPLETED') {
      throw new Error('Cannot change status of a completed enrollment');
    }

    // Actualizar estado
    const updated = await prisma.enrollment.update({
      where: { id },
      data: { status: status as EnrollmentStatus },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            dni: true,
            phone: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }
  // Eliminar matrícula (cancelar)
  async deleteEnrollment(id: string) {
    // Cambiar el estado a CANCELLED en lugar de eliminar
    return prisma.enrollment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
