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
   * Obtiene la asistencia registrada para un curso y fecha específica via.
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
   * Obtiene estadísticas de asistencia de un estudiante. */
  async getStudentStats(studentId: string): Promise<AttendanceStatsDto> {
    const totalClasses = await prisma.attendance.count({
      where: { studentId },
    });

    const attendedClasses = await prisma.attendance.count({
      where: {
        studentId,
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
   * Obtiene el historial detallado de asistencia de un estudiante. */
  async getStudentHistory(studentId: string) {
    return await prisma.attendance.findMany({
      where: { studentId },
      include: {
        course: {
          select: { name: true, subject: true },
        },
        recorder: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { classDate: 'desc' },
    });
  }
}
