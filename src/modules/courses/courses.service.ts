import { PrismaClient, Role } from '@prisma/client';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseFilters,
  CourseWithDetails,
} from './courses.types';

const prisma = new PrismaClient();

export class CoursesService {
  async getAvailableSubjects() {
    const subjects = await prisma.course.findMany({
      where: { isActive: true },
      distinct: ['subject'], // devuelve solo materias únicas
      select: { subject: true },
      orderBy: { subject: 'asc' },
    });

    // Prisma devuelve objetos como { subject: 'Matemática' }, así que extraemos los nombres
    return subjects.map((s) => s.subject);
  }

  async getAvailableUsers(params: { role?: string; isActive?: boolean }) {
    const { role, isActive } = params;

    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role: role as Role } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return users;
  }

  // ---------------------------------------------------------------------------

  async createCourse(data: CreateCourseDto): Promise<CourseWithDetails> {
    // Validar que el teacher existe y está activo
    const teacher = await prisma.user.findUnique({
      where: { id: data.teacherId },
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    if (teacher.role !== 'TEACHER') {
      throw new Error('User is not a teacher');
    }

    if (!teacher.isActive) {
      throw new Error('Teacher is not active');
    }

    const course = await prisma.course.create({
      data: {
        name: data.name,
        description: data.description,
        subject: data.subject,
        teacherId: data.teacherId,
        capacity: data.capacity,
        monthlyPrice: data.monthlyPrice,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return {
      ...course,
      monthlyPrice: Number(course.monthlyPrice),
      availableCapacity: course.capacity - course._count.enrollments,
    };
  }

  async getAllCourses(filters: CourseFilters): Promise<CourseWithDetails[]> {
    const where: any = {};

    if (filters.subject) {
      where.subject = filters.subject;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true';
    }

    if (filters.teacherId) {
      where.teacherId = filters.teacherId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses.map((course) => ({
      ...course,
      monthlyPrice: Number(course.monthlyPrice),
      availableCapacity: course.capacity - course._count.enrollments,
    }));
  }

  async getCourseById(id: string): Promise<CourseWithDetails | null> {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return null;
    }

    return {
      ...course,
      monthlyPrice: Number(course.monthlyPrice),
      availableCapacity: course.capacity - course._count.enrollments,
    };
  }

  async updateCourse(id: string, data: UpdateCourseDto): Promise<CourseWithDetails> {
    // Si se está actualizando el teacher, validar
    if (data.teacherId) {
      const teacher = await prisma.user.findUnique({
        where: { id: data.teacherId },
      });

      if (!teacher) {
        throw new Error('Teacher not found');
      }

      if (teacher.role !== 'TEACHER') {
        throw new Error('User is not a teacher');
      }

      if (!teacher.isActive) {
        throw new Error('Teacher is not active');
      }
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        subject: data.subject,
        teacherId: data.teacherId,
        capacity: data.capacity,
        monthlyPrice: data.monthlyPrice,
        isActive: data.isActive,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return {
      ...course,
      monthlyPrice: Number(course.monthlyPrice),
      availableCapacity: course.capacity - course._count.enrollments,
    };
  }
}
