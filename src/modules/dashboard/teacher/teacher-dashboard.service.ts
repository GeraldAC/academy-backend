// src/modules/dashboard/teacher/teacher-dashboard.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TeacherDashboardService {

  // Estadísticas del docente
  async getTeacherStats(teacherId: string) {
    const [courses, totalStudents, pendingReservations] = await Promise.all([
      prisma.course.findMany({
        where: { teacherId, isActive: true },
        include: {
          _count: {
            select: { enrollments: true }
          }
        }
      }),
      prisma.enrollment.count({
        where: {
          course: { teacherId },
          status: 'ACTIVE'
        }
      }),
      prisma.reservation.count({
        where: {
          course: { teacherId },
          isCancelled: false,
          classDate: { gte: new Date() }
        }
      })
    ]);

    return {
      totalStudents,
      activeCourses: courses.length,
      pendingSubmissions: pendingReservations, // Adaptar según necesites
      avgRating: 4.8 // Implementar sistema de rating
    };
  }

  // Mis cursos
  async getMyCourses(teacherId: string) {
    const courses = await prisma.course.findMany({
      where: { teacherId, isActive: true },
      include: {
        _count: {
          select: { enrollments: true }
        },
        enrollments: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    return await Promise.all(courses.map(async (course) => {
      const totalSchedules = await prisma.schedule.count({
        where: { courseId: course.id, isActive: true }
      });

      const completedClasses = await prisma.attendance.count({
        where: {
          courseId: course.id,
          present: true
        }
      });

      const progress = totalSchedules > 0 
        ? Math.round((completedClasses / totalSchedules) * 100) 
        : 0;

      return {
        id: course.id,
        name: course.name,
        students: course._count.enrollments,
        progress,
        status: course.isActive ? 'active' : 'inactive',
        rating: 4.7 // Implementar
      };
    }));
  }

  // Engagement de estudiantes
  async getStudentEngagement(teacherId: string) {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const attendances = await prisma.attendance.findMany({
      where: {
        course: { teacherId },
        classDate: { gte: fourWeeksAgo }
      }
    });

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

      const totalClasses = weekAttendances.length;
      const presentCount = weekAttendances.filter(a => a.present).length;
      const participacion = totalClasses > 0 
        ? Math.round((presentCount / totalClasses) * 100) 
        : 0;

      return {
        week,
        participacion,
        tareas: Math.floor(Math.random() * 20) + 75, // Implementar con assignments
        asistencia: participacion
      };
    });

    return weekData;
  }

  // Entregas recientes (usando reservaciones como proxy)
  async getRecentSubmissions(teacherId: string) {
    const reservations = await prisma.reservation.findMany({
      where: {
        course: { teacherId },
        isCancelled: false
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
        course: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 4
    });

    return reservations.map(res => ({
      id: res.id,
      student: `${res.student.firstName} ${res.student.lastName}`,
      assignment: `Reserva para ${res.course.name}`,
      time: this.getTimeAgo(res.createdAt),
      status: res.isCancelled ? 'cancelled' : 'pending'
    }));
  }

  // Próximas clases
  async getUpcomingClasses(teacherId: string) {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const schedules = await prisma.schedule.findMany({
      where: {
        course: {
          teacherId,
          isActive: true
        },
        isActive: true
      },
      include: {
        course: {
          include: {
            _count: {
              select: { enrollments: true }
            }
          }
        }
      },
      orderBy: { startTime: 'asc' },
      take: 3
    });

    const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    return schedules.map((schedule, index) => {
      const dayIndex = weekDays.indexOf(schedule.weekDay);
      const isToday = dayIndex === today.getDay() - 1;
      const isTomorrow = dayIndex === today.getDay();

      return {
        id: schedule.id,
        course: schedule.course.name,
        topic: schedule.classType === 'REGULAR' ? 'Clase Regular' : 'Reforzamiento',
        date: isToday ? 'Hoy' : isTomorrow ? 'Mañana' : dayNames[dayIndex],
        time: new Date(schedule.startTime).toLocaleTimeString('es-PE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        students: schedule.course._count.enrollments
      };
    });
  }

  // Mensajes (usando notificaciones)
  async getMessages(teacherId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId: teacherId },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    return notifications.map(notif => ({
      id: notif.id,
      from: 'Sistema', // Adaptar según tu lógica
      message: notif.message,
      time: this.getTimeAgo(notif.createdAt),
      unread: !notif.isRead
    }));
  }

  private getTimeAgo(date: Date): string {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return `${Math.floor(hours / 24)} día(s)`;
  }
}