// src/modules/reservations/services/reservationService.ts
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/errors';

const prisma = new PrismaClient();

interface CreateReservationDto {
  studentId: string;
  courseId: string;
  classDate: Date;
  notes?: string;
}

export const createReservation = async (data: CreateReservationDto) => {
  const { studentId, courseId, classDate, notes } = data;

  // Validar que la fecha sea futura (desde mañana)
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const reservationDate = new Date(classDate);
  reservationDate.setHours(0, 0, 0, 0);

  if (reservationDate < tomorrow) {
    throw new AppError('Solo se pueden reservar clases para fechas futuras', 400);
  }

  // Validar que el estudiante esté matriculado en el curso
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
  });

  if (!enrollment || enrollment.status !== 'ACTIVE') {
    throw new AppError('No estás matriculado en este curso', 403);
  }

  // Validar que el curso tenga horarios de reforzamiento
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      schedules: {
        where: {
          classType: 'REINFORCEMENT',
          isActive: true,
        },
      },
    },
  });

  if (!course) {
    throw new AppError('Curso no encontrado', 404);
  }

  if (course.schedules.length === 0) {
    throw new AppError('Este curso no tiene clases de reforzamiento disponibles', 400);
  }

  // Validar que no exceda la capacidad
  const existingReservations = await prisma.reservation.count({
    where: {
      courseId,
      classDate: reservationDate,
      isCancelled: false,
    },
  });

  if (existingReservations >= course.capacity) {
    throw new AppError('La clase ha alcanzado su capacidad máxima', 400);
  }

  // Crear la reserva
  const reservation = await prisma.reservation.create({
    data: {
      studentId,
      courseId,
      classDate: reservationDate,
      notes,
    },
    include: {
      course: {
        select: {
          name: true,
          subject: true,
        },
      },
    },
  });

  return reservation;
};

export const getStudentReservations = async (studentId: string) => {
  const reservations = await prisma.reservation.findMany({
    where: { studentId },
    include: {
      course: {
        select: {
          name: true,
          subject: true,
          teacher: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      classDate: 'desc',
    },
  });

  return reservations;
};

export const cancelReservation = async (reservationId: string, studentId: string) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    throw new AppError('Reserva no encontrada', 404);
  }

  if (reservation.studentId !== studentId) {
    throw new AppError('No tienes permiso para cancelar esta reserva', 403);
  }

  if (reservation.isCancelled) {
    throw new AppError('Esta reserva ya ha sido cancelada', 400);
  }

  // Validar que falten más de 24 horas
  const now = new Date();
  const classDate = new Date(reservation.classDate);
  const hoursUntilClass = (classDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilClass < 24) {
    throw new AppError('No se puede cancelar con menos de 24 horas de anticipación', 400);
  }

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      isCancelled: true,
      cancelledAt: new Date(),
    },
    include: {
      course: {
        select: {
          name: true,
        },
      },
    },
  });

  return updated;
};

export const getTeacherCourseReservations = async (teacherId: string, courseId: string) => {
  // Validar que el curso pertenezca al docente
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      teacherId,
    },
  });

  if (!course) {
    throw new AppError('Curso no encontrado o no tienes permiso', 403);
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      courseId,
      isCancelled: false,
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      classDate: 'asc',
    },
  });

  return reservations;
};

export const getAllTeacherReservations = async (teacherId: string) => {
  const reservations = await prisma.reservation.findMany({
    where: {
      course: {
        teacherId,
      },
      isCancelled: false,
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      course: {
        select: {
          name: true,
          subject: true,
        },
      },
    },
    orderBy: {
      classDate: 'asc',
    },
  });

  return reservations;
};

export const getAllReservations = async () => {
  const reservations = await prisma.reservation.findMany({
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      course: {
        select: {
          name: true,
          subject: true,
          teacher: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      classDate: 'desc',
    },
  });

  return reservations;
};

// -- Enrollments

export const getStudentEnrollments = async (studentId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: 'ACTIVE',
    },
    select: {
      status: true,
      course: {
        select: {
          id: true,
          name: true,
          subject: true,
          schedules: {
            where: {
              isActive: true,
            },
            select: {
              id: true,
              weekDay: true,
              startTime: true,
              endTime: true,
              classroom: true,
              classType: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  return enrollments;
};
