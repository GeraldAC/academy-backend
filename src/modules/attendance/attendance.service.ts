// src\modules\attendance\attendance.service.ts
import { PrismaClient } from '@prisma/client';
import { RegisterAttendanceDto, AttendanceStatsDto } from './attendance.types';

const prisma = new PrismaClient();

export class AttendanceService {
  /**
   * Registra o actualiza la asistencia de múltiples estudiantes para un curso y fecha.
   */
  async registerBatch(data: RegisterAttendanceDto) {
    const { courseId, classDate, records, recordedBy } = data;
    const dateObj = new Date(classDate);

    // Usamos una transacción para asegurar que todos los registros se guarden o ninguno
    return await prisma.$transaction(async (tx) => {
      const results = [];

      for (const record of records) {
        // Upsert: Crea si no existe, actualiza si existe
        const attendance = await tx.attendance.upsert({
          where: {
            studentId_courseId_classDate: {
              studentId: record.studentId,
              courseId: courseId,
              classDate: dateObj,
            },
          },
          update: {
            present: record.present,
            notes: record.notes,
            recordedBy: recordedBy,
          },
          create: {
            studentId: record.studentId,
            courseId: courseId,
            classDate: dateObj,
            present: record.present,
            notes: record.notes,
            recordedBy: recordedBy,
          },
        });
        results.push(attendance);
      }

      return results;
    });
  }

  /**
   * Obtiene la asistencia registrada para un curso y fecha específica.
   * Útil para que el docente vea lo que ya registró.
   */
  async getByCourseAndDate(courseId: string, date: string) {
    const dateObj = new Date(date);
    return await prisma.attendance.findMany({
      where: {
        courseId,
        classDate: dateObj,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene estadísticas de asistencia de un estudiante.
   * MEJORADO: Ahora soporta filtro opcional por courseId
   */
  async getStudentStats(studentId: string, courseId?: string): Promise<AttendanceStatsDto> {
    const where: any = { studentId };

    // Agregar filtro de curso si se proporciona
    if (courseId && courseId !== 'undefined') {
      where.courseId = courseId;
    }

    const totalClasses = await prisma.attendance.count({
      where,
    });

    const attendedClasses = await prisma.attendance.count({
      where: {
        ...where,
        present: true,
      },
    });

    const attendancePercentage =
      totalClasses > 0 ? Number(((attendedClasses / totalClasses) * 100).toFixed(2)) : 0;

    return {
      totalClasses,
      attendedClasses,
      attendancePercentage,
      absences: totalClasses - attendedClasses,
    };
  }

  /**
   * Obtiene el historial detallado de asistencia de un estudiante.
   * MEJORADO: Ahora soporta filtro opcional por courseId
   */
  async getStudentHistory(studentId: string, courseId?: string) {
    const where: any = { studentId };

    // Agregar filtro de curso si se proporciona
    if (courseId && courseId !== 'undefined') {
      where.courseId = courseId;
    }

    return await prisma.attendance.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
            email: true,
          },
        },
        recorder: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { classDate: 'desc' },
    });
  }

  /**
   * Obtiene estadísticas generales o filtradas para admin/docente
   */
  async getStats(query: { courseId?: string; startDate?: string; endDate?: string }) {
    const where: any = {};
    if (query.courseId) where.courseId = query.courseId;
    if (query.startDate || query.endDate) {
      where.classDate = {};
      if (query.startDate) where.classDate.gte = new Date(query.startDate);
      if (query.endDate) where.classDate.lte = new Date(query.endDate);
    }

    const totalClasses = await prisma.attendance.count({ where });
    const attendedClasses = await prisma.attendance.count({
      where: { ...where, present: true },
    });

    const attendancePercentage =
      totalClasses > 0 ? Number(((attendedClasses / totalClasses) * 100).toFixed(2)) : 0;

    return {
      totalClasses,
      attendedClasses,
      attendanceRate: attendancePercentage,
      absences: totalClasses - attendedClasses,
    };
  }

  /**
   * Genera un reporte detallado de asistencia
   */
  async getReport(query: {
    courseId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};
    if (query.courseId) where.courseId = query.courseId;
    if (query.studentId) {
      // Si parece UUID, buscar por ID. Si no, buscar por DNI.
      const isUuid = /^[0-9a-fA-F-]{36}$/.test(query.studentId);
      if (isUuid) {
        where.studentId = query.studentId;
      } else {
        where.student = { dni: { contains: query.studentId } };
      }
    }
    if (query.startDate || query.endDate) {
      where.classDate = {};
      if (query.startDate) where.classDate.gte = new Date(query.startDate);
      if (query.endDate) where.classDate.lte = new Date(query.endDate);
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
      },
      orderBy: { classDate: 'desc' },
    });

    // Calcular resumen para el reporte
    const total = attendances.length;
    const present = attendances.filter((a) => a.present).length;
    const rate = total > 0 ? (present / total) * 100 : 0;

    return {
      attendances,
      stats: {
        totalClasses: total,
        presentClasses: present,
        absentClasses: total - present,
        attendanceRate: Number(rate.toFixed(2)),
      },
    };
  }
}
