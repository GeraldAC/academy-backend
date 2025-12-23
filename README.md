# Academy Backend

Sistema de gestión académica para centros preuniversitarios. Backend desarrollado con Node.js, Express y TypeScript.

## Descripción

Academy Backend es una API REST para gestionar la administración completa de un centro preuniversitario, incluyendo:

- Gestión de usuarios (administradores, docentes, estudiantes)
- Control de cursos y matrículas
- Registro de asistencias
- Administración de pagos
- Reservación de espacios
- Sistema de notificaciones
- Panel de control para diferentes roles

## Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT
- **Validación**: Zod
- **Hashing**: bcryptjs
- **Testing**: Jest
- **Desarrollo**: Nodemon, ESLint, Prettier

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- PostgreSQL 12 o superior
- Git

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/GeraldAC/academy-backend.git
cd academy-backend
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

Crear un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/academy_db"
DIRECT_URL="postgresql://user:password@localhost:5432/academy_db"

# Servidor
PORT=3000
NODE_ENV="development"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRATION="7d"

# Base de datos y logs (opcional)
DATABASE_LOG="skip"
LOG_LEVEL="info"
```

4. Ejecutar migraciones de base de datos:

```bash
npm run db:fresh
```

Este comando ejecutará las migraciones e insertará datos de prueba.

## Scripts Disponibles

```bash
# Desarrollo con recarga automática
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar versión compilada
npm start

# Linting
npm run lint
npm run lint:fix

# Formateo de código
npm run format

# Verificación de tipos
npm run typecheck

# Base de datos
npm run db:seed          # Insertar datos de prueba
npm run db:reset         # Reiniciar base de datos
npm run db:fresh         # Reiniciar e insertar datos
npm run prisma:studio    # Abrir interfaz gráfica de Prisma
npm run prisma:migrate   # Crear nueva migración

# Testing
npm test
npm test -- --watch
npm test -- --coverage
```

## Estructura del Proyecto

```
academy-backend/
├── src/
│   ├── config/              # Configuraciones (app, env, logger, prisma)
│   ├── controllers/         # Controladores principales
│   ├── middlewares/         # Middlewares (autenticación, validación, errores)
│   ├── modules/            # Módulos organizados por funcionalidad
│   │   ├── auth/           # Autenticación y registro
│   │   ├── courses/        # Gestión de cursos
│   │   ├── enrollments/    # Matrículas
│   │   ├── users/          # Gestión de usuarios
│   │   ├── dashboard/      # Paneles por rol (admin, teacher, student)
│   │   └── ...
│   ├── routes/             # Definición de rutas
│   ├── types/              # Tipos de TypeScript
│   ├── utils/              # Utilidades (hash, JWT, logger)
│   ├── jobs/               # Trabajos programados
│   ├── app.ts              # Configuración de Express
│   └── index.ts            # Punto de entrada
├── prisma/
│   ├── schema.prisma       # Esquema de base de datos
│   ├── seed.ts             # Script para datos iniciales
│   └── migrations/         # Migraciones de base de datos
├── tests/
│   ├── e2e/               # Tests end-to-end
│   └── integration/       # Tests de integración
├── .env.example           # Plantilla de variables de entorno
├── jest.config.ts         # Configuración de Jest
├── tsconfig.json          # Configuración de TypeScript
├── nodemon.json           # Configuración de Nodemon
└── package.json           # Dependencias del proyecto
```

## Módulos y Funcionalidades

### Autenticación (auth)

- Registro de nuevos usuarios
- Login con JWT
- Validación de tokens
- Recuperación de contraseña

### Cursos (courses)

- Crear y editar cursos
- Listar cursos disponibles
- Asignar docentes

### Matrículas (enrollments)

- Inscripción de estudiantes
- Gestión de estado de matrícula
- Historial de cursos

### Usuarios (users)

- Crear usuarios con roles
- Actualizar perfiles
- Gestionar contraseñas
- Listar usuarios

### Asistencias (attendances)

- Registrar asistencias
- Reportes de asistencia
- Justificaciones

### Pagos (payments)

- Registrar pagos
- Historial de transacciones
- Reportes de ingresos

### Paneles (dashboard)

- Panel administrativo
- Panel de docentes
- Panel de estudiantes

## Autenticación

La API utiliza autenticación basada en JWT (JSON Web Tokens):

1. El usuario inicia sesión con credenciales válidas
2. El servidor devuelve un token JWT
3. El cliente incluye el token en el header `Authorization: Bearer <token>`
4. El middleware valida el token en cada solicitud

Roles disponibles:

- `ADMIN` - Acceso total al sistema
- `TEACHER` - Gestión de cursos y asistencias
- `STUDENT` - Acceso a cursos e información académica

## Base de Datos

El proyecto utiliza Prisma como ORM y PostgreSQL como base de datos.

### Modelos principales:

- **User**: Usuarios del sistema con roles
- **Course**: Cursos ofrecidos
- **Enrollment**: Matrículas de estudiantes
- **Attendance**: Registros de asistencia
- **Payment**: Transacciones de pagos
- **Notification**: Notificaciones del sistema

### Comandos útiles:

```bash
# Visualizar base de datos gráficamente
npm run prisma:studio

# Crear migración
npm run prisma:migrate -- --name "descripcion_cambio"

# Aplicar migraciones pendientes
npm run prisma:migrate:deploy

# Resetear base de datos (desarrollo)
npm run prisma:migrate:reset

# Generar cliente Prisma
npm run prisma:generate
```

## Testing

El proyecto incluye tests unitarios e integración con Jest:

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm test -- --watch

# Cobertura de tests
npm test -- --coverage

# Tests específicos
npm test -- users.test.ts
```

Los tests están organizados en:

- `tests/unit/` - Tests unitarios
- `tests/integration/` - Tests de integración
- `tests/e2e/` - Tests end-to-end

## Despliegue

### Compilar para producción:

```bash
npm run build
npm start
```

### Variables de entorno en producción:

```env
NODE_ENV="production"
DATABASE_URL="postgresql://prod_user:prod_password@prod_host:5432/academy_prod"
JWT_SECRET="secure-production-secret-key"
PORT=3000
```

### Con Docker (opcional):

```bash
docker build -t academy-backend .
docker run -p 3000:3000 --env-file .env academy-backend
```

## Desarrollo

### Buenas prácticas:

1. **Commits significativos**: Mensajes claros en español
2. **Ramas**: Crear una rama para cada funcionalidad (`feature/nueva-funcionalidad`)
3. **Linting**: Ejecutar `npm run lint:fix` antes de hacer commit
4. **Tests**: Asegurar que los tests pasen antes de hacer push
5. **Tipos**: Utilizar tipos TypeScript completos, evitar `any`

### Flujo de desarrollo:

```bash
# Crear rama
git checkout -b feature/nueva-funcionalidad

# Realizar cambios
git add .
git commit -m "feat: descripción del cambio"

# Verificar linting y tipos
npm run lint:fix
npm run typecheck

# Ejecutar tests
npm test

# Push a repositorio
git push origin feature/nueva-funcionalidad
```

## Solución de Problemas

### Error: "Cannot find module"

- Ejecutar: `npm install`
- Verificar que las dependencias están instaladas

### Error de base de datos

- Verificar que PostgreSQL está corriendo
- Revisar las variables de entorno en `.env`
- Ejecutar: `npm run db:fresh`

### Problemas con Prisma

- Regenerar cliente: `npm run prisma:generate`
- Resetear base de datos: `npm run db:reset`

## Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el repositorio
2. Crear una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la licencia ISC. Ver archivo `LICENSE` para más detalles.

## Contacto

Para preguntas o sugerencias, contactar al equipo de desarrollo.

---

**Última actualización**: Diciembre 2025
