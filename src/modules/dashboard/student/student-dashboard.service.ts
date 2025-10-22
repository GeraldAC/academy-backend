// src/modules/dashboard/student/student-dashboard.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StudentDashboardService {

  // Estadísticas del estudiante
  async getStudentStats(studentId: string) {
    const [enrollments, totalHours, certificates, payments] = await Promise.all([
      prisma.enrollment.findMany({
        where: { 
          studentId,
          status: 'ACTIVE'
        },
        include: { course: true }
      }),
      prisma.attendance.count({
        where: { 
          studentId,
          present: true
        }
      }),
      prisma.enrollment.count({
        where: { 
          studentId,
          status: 'COMPLETED'
        }
      }),
      prisma.payment.findMany({
        where: {
          studentId,
          status: 'PAID'
        }
      })
    ]);

    // Calcular promedio de asistencia como "calificación"
    const totalClasses = await prisma.attendance.count({
      where: { studentId }
    });

    const avgGrade = totalClasses > 0 
      ? Math.round((totalHours / totalClasses) * 100) 
      : 0;

    return {
      activeCourses: enrollments.length,
      totalHours: Math.round(totalHours * 1.5), // Estimación de horas basado en asistencias
      certificates,
      avgGrade
    };
  }

  // Cursos inscritos
  async getEnrolledCourses(studentId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { 
        studentId,
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
            teacher: { 
              select: { 
                firstName: true, 
                lastName: true 
              } 
            },
            schedules: {
              where: { isActive: true },
              select: { id: true }
            }
          }
        }
      }
    });

    return await Promise.all(enrollments.map(async (enrollment) => {
      // Calcular progreso basado en asistencias
      const totalScheduledClasses = await prisma.schedule.count({
        where: { 
          courseId: enrollment.courseId,
          isActive: true
        }
      });

      const attendedClasses = await prisma.attendance.count({
        where: {
          studentId,
          courseId: enrollment.courseId,
          present: true
        }
      });

      const progress = totalScheduledClasses > 0 
        ? Math.round((attendedClasses / totalScheduledClasses) * 100) 
        : 0;

      // Obtener próxima clase
      const today = new Date();
      const nextSchedule = await prisma.schedule.findFirst({
        where: {
          courseId: enrollment.courseId,
          isActive: true
        },
        orderBy: { startTime: 'asc' }
      });

      const weekDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const nextClassDay = nextSchedule ? weekDays.indexOf(nextSchedule.weekDay) : -1;
      const daysUntilNext = nextClassDay >= 0 
        ? (nextClassDay - today.getDay() + 7) % 7 
        : 0;

      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + daysUntilNext);

      return {
        id: enrollment.courseId,
        name: enrollment.course.name,
        instructor: `Prof. ${enrollment.course.teacher.firstName} ${enrollment.course.teacher.lastName}`,
        progress,
        nextLesson: nextSchedule 
          ? `${nextSchedule.classType === 'REGULAR' ? 'Clase Regular' : 'Reforzamiento'}`
          : 'Sin clases programadas',
        lessonsCompleted: attendedClasses,
        totalLessons: totalScheduledClasses,
        dueDate: dueDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
      };
    }));
  }

  // Actividad del estudiante (últimas 4 semanas)
  async getProgressData(studentId: string) {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const attendances = await prisma.attendance.findMany({
      where: {
        studentId,
        classDate: { gte: fourWeeksAgo },
        present: true
      },
      orderBy: { classDate: 'asc' }
    });

    // Agrupar por semana
    const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    const weekData = weeks.map((week, index) => {
      const weekStart = new Date(fourWeeksAgo);
      weekStart.setDate(weekStart.getDate() + (index * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekAttendances = attendances.filter(a => {
        const date = new Date(a.classDate);
        return date >= weekStart && date < weekEnd;
      });

      return {
        week,
        horas: weekAttendances.length * 2, // Estimación: 2 horas por clase
        lecciones: weekAttendances.length
      };
    });

    return weekData;
  }

  // Tareas pendientes (usando reservaciones próximas)
  async getUpcomingAssignments(studentId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { 
        studentId,
        status: 'ACTIVE'
      },
      select: { courseId: true }
    });

    const courseIds = enrollments.map(e => e.courseId);

    // Obtener próximas clases programadas
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const schedules = await prisma.schedule.findMany({
      where: {
        courseId: { in: courseIds },
        isActive: true
      },
      include: {
        course: { 
          select: { 
            name: true,
            subject: true
          } 
        }
      },
      orderBy: { startTime: 'asc' },
      take: 5
    });

    const weekDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const priorities = ['low', 'medium', 'high'];

    return schedules.map((schedule, index) => {
      const dayIndex = weekDays.indexOf(schedule.weekDay);
      const daysUntilClass = (dayIndex - today.getDay() + 7) % 7;
      const classDate = new Date(today);
      classDate.setDate(classDate.getDate() + daysUntilClass);

      // Determinar prioridad según cercanía
      let priority: 'low' | 'medium' | 'high' = 'low';
      if (daysUntilClass <= 1) priority = 'high';
      else if (daysUntilClass <= 3) priority = 'medium';

      return {
        id: schedule.id,
        course: schedule.course.name,
        title: `${schedule.classType === 'REGULAR' ? 'Clase Regular' : 'Clase de Reforzamiento'} - ${schedule.course.subject}`,
        dueDate: classDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
        priority,
        points: schedule.classType === 'REGULAR' ? 100 : 50
      };
    });
  }

  // Calificaciones (basado en asistencia)
  async getGradesData(studentId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { 
        studentId,
        status: 'ACTIVE'
      },
      include: {
        course: { 
          select: { 
            name: true,
            id: true
          } 
        }
      }
    });

    return await Promise.all(enrollments.map(async (enrollment) => {
      const totalClasses = await prisma.attendance.count({
        where: {
          studentId,
          courseId: enrollment.courseId
        }
      });

      const presentClasses = await prisma.attendance.count({
        where: {
          studentId,
          courseId: enrollment.courseId,
          present: true
        }
      });

      const grade = totalClasses > 0 
        ? Math.round((presentClasses / totalClasses) * 100) 
        : 0;

      return {
        subject: enrollment.course.name,
        grade
      };
    }));
  }

  // Logros
  async getAchievements(studentId: string) {
    const [
      totalAttendances,
      perfectAttendanceCourses,
      completedCourses,
      consecutiveDays
    ] = await Promise.all([
      prisma.attendance.count({
        where: { 
          studentId,
          present: true
        }
      }),
      prisma.enrollment.count({
        where: {
          studentId,
          status: 'ACTIVE'
          // Aquí podrías añadir lógica para verificar asistencia perfecta
        }
      }),
      prisma.enrollment.count({
        where: {
          studentId,
          status: 'COMPLETED'
        }
      }),
      this.getConsecutiveAttendanceDays(studentId)
    ]);

    const achievements = [
      {
        id: 1,
        title: 'Primera Semana',
        description: 'Completaste tu primera semana',
        icon: 'Star',
        earned: totalAttendances >= 3
      },
      {
        id: 2,
        title: 'Racha de 7 días',
        description: 'Estudiaste 7 días seguidos',
        icon: 'Trophy',
        earned: consecutiveDays >= 7
      },
      {
        id: 3,
        title: 'Curso Completado',
        description: 'Terminaste tu primer curso',
        icon: 'Award',
        earned: completedCourses >= 1
      },
      {
        id: 4,
        title: 'Asistencia Perfecta',
        description: 'No faltaste a ninguna clase',
        icon: 'Target',
        earned: perfectAttendanceCourses >= 1
      }
    ];

    return achievements;
  }

  // Actividad reciente
  async getRecentActivity(studentId: string) {
    const [recentAttendances, recentPayments, recentEnrollments] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          studentId,
          present: true
        },
        include: {
          course: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 2
      }),
      prisma.payment.findMany({
        where: {
          studentId,
          status: 'PAID'
        },
        orderBy: { paymentDate: 'desc' },
        take: 1
      }),
      prisma.enrollment.findMany({
        where: { studentId },
        include: {
          course: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 2
      })
    ]);

    const activities = [
      ...recentAttendances.map(att => ({
        id: att.id,
        action: 'Asististe a',
        detail: `Clase de ${att.course.name}`,
        course: att.course.name,
        time: this.getTimeAgo(att.createdAt)
      })),
      ...recentPayments.map(pay => ({
        id: pay.id,
        action: 'Realizaste',
        detail: `Pago de $${pay.amount} - ${pay.concept}`,
        course: pay.concept,
        time: this.getTimeAgo(pay.paymentDate)
      })),
      ...recentEnrollments.map(enr => ({
        id: enr.id,
        action: 'Te inscribiste en',
        detail: enr.course.name,
        course: enr.course.name,
        time: this.getTimeAgo(enr.createdAt)
      }))
    ];

    return activities
      .sort((a, b) => {
        // Ordenar por tiempo más reciente
        const timeA = this.parseTimeAgo(a.time);
        const timeB = this.parseTimeAgo(b.time);
        return timeA - timeB;
      })
      .slice(0, 3);
  }

  // Estado de aprendizaje (distribución de progreso)
  async getSkillsData(studentId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            schedules: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    let completed = 0;
    let inProgress = 0;
    let pending = 0;

    for (const enrollment of enrollments) {
      const totalClasses = enrollment.course.schedules.length;
      const attendedClasses = await prisma.attendance.count({
        where: {
          studentId,
          courseId: enrollment.courseId,
          present: true
        }
      });

      const progress = totalClasses > 0 
        ? (attendedClasses / totalClasses) * 100 
        : 0;

      if (progress >= 100 || enrollment.status === 'COMPLETED') {
        completed++;
      } else if (progress > 0) {
        inProgress++;
      } else {
        pending++;
      }
    }

    const total = completed + inProgress + pending || 1;

    return [
      { 
        name: 'Completado', 
        value: Math.round((completed / total) * 100), 
        color: '#10b981' 
      },
      { 
        name: 'En Progreso', 
        value: Math.round((inProgress / total) * 100), 
        color: '#3b82f6' 
      },
      { 
        name: 'Pendiente', 
        value: Math.round((pending / total) * 100), 
        color: '#e5e7eb' 
      }
    ];
  }

  // Métodos auxiliares
  private async getConsecutiveAttendanceDays(studentId: string): Promise<number> {
    const attendances = await prisma.attendance.findMany({
      where: {
        studentId,
        present: true
      },
      orderBy: { classDate: 'desc' },
      select: { classDate: true }
    });

    if (attendances.length === 0) return 0;

    let consecutive = 1;
    let currentDate = new Date(attendances[0].classDate);

    for (let i = 1; i < attendances.length; i++) {
      const prevDate = new Date(attendances[i].classDate);
      const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        consecutive++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return consecutive;
  }

  private getTimeAgo(date: Date): string {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `${days} día${days > 1 ? 's' : ''}`;
  }

  private parseTimeAgo(timeStr: string): number {
    const match = timeStr.match(/(\d+)\s+(min|hora|día)/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    if (unit === 'min') return value;
    if (unit === 'hora') return value * 60;
    if (unit === 'día') return value * 60 * 24;

    return 0;
  }
}