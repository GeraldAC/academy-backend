// src/modules/dashboard/admin/admin-dashboard.service.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminDashboardService {
  
  // Obtener estadísticas generales
  async getStats() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      activeEnrollments,
      lastMonthStudents,
      monthlyRevenue,
      lastMonthRevenue
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.STUDENT, isActive: true } }),
      prisma.user.count({ where: { role: Role.TEACHER, isActive: true } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ 
        where: { 
          role: Role.STUDENT, 
          createdAt: { lt: currentMonth } 
        } 
      }),
      prisma.payment.aggregate({
        where: {
          status: 'PAID',
          paymentDate: { gte: currentMonth }
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: {
          status: 'PAID',
          paymentDate: { gte: lastMonth, lt: currentMonth }
        },
        _sum: { amount: true }
      })
    ]);

    // Calcular cambios porcentuales
    const studentChange = lastMonthStudents > 0 
      ? ((totalStudents - lastMonthStudents) / lastMonthStudents * 100).toFixed(1)
      : 0;

    const revenueChange = lastMonthRevenue._sum.amount 
      ? (((Number(monthlyRevenue._sum.amount || 0) - Number(lastMonthRevenue._sum.amount)) / Number(lastMonthRevenue._sum.amount)) * 100).toFixed(1)
      : 0;

    return {
      totalStudents,
      totalTeachers,
      totalCourses,
      monthlyRevenue: Number(monthlyRevenue._sum.amount || 0).toFixed(2),
      changes: {
        students: Number(studentChange),
        teachers: 8.3, // Calcular similar
        courses: 15.2, // Calcular similar
        revenue: Number(revenueChange)
      }
    };
  }

  // Tendencia de inscripciones (últimos 6 meses)
  async getEnrollmentTrend() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [enrollments, teachers] = await Promise.all([
      prisma.enrollment.groupBy({
        by: ['enrollmentDate'],
        where: {
          enrollmentDate: { gte: sixMonthsAgo }
        },
        _count: true
      }),
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          role: Role.TEACHER,
          createdAt: { gte: sixMonthsAgo }
        },
        _count: true
      })
    ]);

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        month: months[date.getMonth()],
        monthIndex: date.getMonth(),
        year: date.getFullYear()
      };
    });

    return last6Months.map(({ month, monthIndex, year }) => {
      const studentsCount = enrollments.filter(e => {
        const date = new Date(e.enrollmentDate);
        return date.getMonth() === monthIndex && date.getFullYear() === year;
      }).reduce((sum, e) => sum + e._count, 0);

      const teachersCount = teachers.filter(t => {
        const date = new Date(t.createdAt);
        return date.getMonth() === monthIndex && date.getFullYear() === year;
      }).reduce((sum, t) => sum + t._count, 0);

      return {
        month,
        estudiantes: studentsCount,
        docentes: teachersCount
      };
    });
  }

  // Estado de cursos
  async getCoursesDistribution() {
    const [active, enrollments] = await Promise.all([
      prisma.course.count({ where: { isActive: true } }),
      prisma.enrollment.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    const completed = enrollments.find(e => e.status === 'COMPLETED')?._count || 0;
    const development = enrollments.find(e => e.status === 'ACTIVE')?._count || 0;

    return [
      { name: 'Activos', value: active, color: '#3b82f6' },
      { name: 'En desarrollo', value: development, color: '#f59e0b' },
      { name: 'Finalizados', value: completed, color: '#10b981' }
    ];
  }

  // Cursos más populares
  async getTopCourses() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { enrollments: true }, // cuenta cuántas inscripciones tiene el curso
      },
      teacher: true, // opcional, si quieres mostrar el docente
    },
    orderBy: {
      enrollments: {
        _count: 'desc', // ✅ ordena por cantidad de inscripciones
      },
    },
    take: 4, // top 4 cursos
  });

    return await Promise.all(courses.map(async (course) => {
      // Calcular progreso basado en asistencias
      const totalClasses = await prisma.schedule.count({
        where: { courseId: course.id, isActive: true }
      });

      const attendances = await prisma.attendance.count({
        where: {
          courseId: course.id,
          present: true
        }
      });

      const progress = totalClasses > 0 ? Math.round((attendances / totalClasses) * 100) : 0;

      return {
        name: course.name,
        students: course._count.enrollments,
        rating: 4.5, // Implementar sistema de rating
        progress
      };
    }));
  }

  // Actividad reciente
  async getRecentActivities() {
    const [recentEnrollments, recentPayments, recentCourses] = await Promise.all([
      prisma.enrollment.findMany({
        include: {
          student: { select: { firstName: true, lastName: true } },
          course: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      }),
      prisma.payment.findMany({
        where: { status: 'PAID' },
        include: {
          student: { select: { firstName: true, lastName: true } }
        },
        orderBy: { paymentDate: 'desc' },
        take: 2
      }),
      prisma.course.findMany({
        where: { isActive: true },
        include: {
          teacher: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 2
      })
    ]);

    const activities = [
      ...recentEnrollments.map(e => ({
        id: e.id,
        user: `${e.student.firstName} ${e.student.lastName}`,
        action: `se inscribió en ${e.course.name}`,
        time: this.getTimeAgo(e.createdAt),
        type: 'enrollment'
      })),
      ...recentPayments.map(p => ({
        id: p.id,
        user: `${p.student.firstName} ${p.student.lastName}`,
        action: `realizó un pago de $${p.amount}`,
        time: this.getTimeAgo(p.paymentDate),
        type: 'certificate'
      })),
      ...recentCourses.map(c => ({
        id: c.id,
        user: `Prof. ${c.teacher.firstName} ${c.teacher.lastName}`,
        action: `creó el curso ${c.name}`,
        time: this.getTimeAgo(c.createdAt),
        type: 'course'
      }))
    ];

    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }

  // Ingresos mensuales (últimos 6 meses)
  async getRevenueData() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const payments = await prisma.payment.groupBy({
      by: ['paymentDate'],
      where: {
        status: 'PAID',
        paymentDate: { gte: sixMonthsAgo }
      },
      _sum: {
        amount: true
      }
    });

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        month: months[date.getMonth()],
        monthIndex: date.getMonth(),
        year: date.getFullYear()
      };
    });

    return last6Months.map(({ month, monthIndex, year }) => {
      const monthlyTotal = payments
        .filter(p => {
          const date = new Date(p.paymentDate);
          return date.getMonth() === monthIndex && date.getFullYear() === year;
        })
        .reduce((sum, p) => sum + Number(p._sum.amount || 0), 0);

      return {
        month,
        ingresos: Math.round(monthlyTotal)
      };
    });
  }

  private getTimeAgo(date: Date): string {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `${days} día${days > 1 ? 's' : ''}`;
  }
}