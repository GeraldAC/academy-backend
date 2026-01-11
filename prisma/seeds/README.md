# Seeds Configuration

Sistema de seeds configurable para Academy-Project.

## Uso Básico

```bash
# Configuración por defecto (1 admin, 8 teachers, 80 students)
npm run prisma:seed

# Configuración de desarrollo (menos datos)
SEED_ENV=dev npm run prisma:seed

# Configuración de testing (datos mínimos)
SEED_ENV=test npm run prisma:seed
```

## Configuraciones Disponibles

### Default (Producción)

- 1 admin, 8 teachers, 80 students
- 2 meses de historial de asistencias
- 30 días de reservas futuras
- 1-3 cursos por estudiante
- 80% tasa de asistencia
- 85% tasa de pagos completados

### Dev (Desarrollo)

- 1 admin, 3 teachers, 20 students
- 1 mes de historial
- 15 días de reservas futuras
- Resto igual que default

### Test (Testing)

- 1 admin, 2 teachers, 10 students
- 1 mes de historial
- 7 días de reservas futuras
- 1-2 cursos por estudiante

## Personalización

Edita `seeds/config.ts` para ajustar:

```typescript
export const customConfig: SeedConfig = {
  cleanDatabase: true, // Limpiar antes de seed

  seeds: {
    users: true,
    courses: true,
    schedules: true,
    enrollments: true,
    attendance: true,
    payments: true,
    reservations: true,
    notifications: true,
  },

  quantities: {
    admins: 2,
    teachers: 10,
    students: 100,
  },

  options: {
    attendanceHistoryMonths: 3,
    reservationFutureDays: 60,
    coursesPerStudent: [2, 4],
    attendanceRate: 0.75,
    paymentCompletionRate: 0.9,
  },
};
```

## Estructura

```
seeds/
├── config.ts          # Configuraciones
├── clean.ts           # Limpieza de BD
├── index.ts           # Orquestador principal
├── users.seed.ts      # Seed de usuarios
├── courses.seed.ts    # Seed de cursos
├── schedules.seed.ts  # Seed de horarios
├── enrollments.seed.ts # Seed de matrículas
├── attendance.seed.ts  # Seed de asistencias
├── payments.seed.ts    # Seed de pagos
├── reservations.seed.ts # Seed de reservas
├── notifications.seed.ts # Seed de notificaciones
└── utils.ts           # Utilidades
```

## Características

✅ Limpieza automática de BD (configurable)  
✅ Selección de seeds a ejecutar  
✅ Múltiples configuraciones predefinidas  
✅ Cantidades personalizables  
✅ Opciones de generación ajustables  
✅ Datos coherentes y relacionados correctamente
