export interface SeedConfig {
  // Limpieza de datos
  cleanDatabase: boolean;

  // Seeds a ejecutar
  seeds: {
    users: boolean;
    courses: boolean;
    schedules: boolean;
    enrollments: boolean;
    attendance: boolean;
    payments: boolean;
    reservations: boolean;
    notifications: boolean;
  };

  // Cantidades de datos
  quantities: {
    admins: number;
    teachers: number;
    students: number;
  };

  // Configuración de datos generados
  options: {
    // Meses de historial para asistencias
    attendanceHistoryMonths: number;
    // Días futuros para reservas
    reservationFutureDays: number;
    // Rango de cursos por estudiante [min, max]
    coursesPerStudent: [number, number];
    // Porcentaje de asistencia promedio
    attendanceRate: number;
    // Porcentaje de pagos completados
    paymentCompletionRate: number;
  };
}

// Configuración por defecto
export const defaultConfig: SeedConfig = {
  cleanDatabase: true,

  seeds: {
    users: false,
    courses: false,
    schedules: false,
    enrollments: false,
    attendance: false,
    payments: false,
    reservations: false,
    notifications: false,
  },

  quantities: {
    admins: 1,
    teachers: 2,
    students: 10,
  },

  options: {
    attendanceHistoryMonths: 1,
    reservationFutureDays: 7,
    coursesPerStudent: [1, 2],
    attendanceRate: 0.7,
    paymentCompletionRate: 0.7,
  },
};

// Configuración para desarrollo rápido (menos datos)
export const devConfig: SeedConfig = {
  ...defaultConfig,
  cleanDatabase: true,
  quantities: {
    admins: 1,
    teachers: 3,
    students: 20,
  },
  options: {
    ...defaultConfig.options,
    attendanceHistoryMonths: 1,
    reservationFutureDays: 15,
  },
};

// Configuración para testing (datos mínimos)
export const testConfig: SeedConfig = {
  ...defaultConfig,
  cleanDatabase: true,
  quantities: {
    admins: 1,
    teachers: 2,
    students: 10,
  },
  options: {
    ...defaultConfig.options,
    attendanceHistoryMonths: 1,
    reservationFutureDays: 7,
    coursesPerStudent: [1, 2],
  },
};
