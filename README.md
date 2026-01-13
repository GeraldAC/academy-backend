# Academy Backend

Sistema moderno de gestión académica para centros preuniversitarios. Backend robusto desarrollado con Node.js, Express y TypeScript con arquitectura escalable y basada en módulos.

## Descripción

Academy Backend es una API REST completa para la administración integral de un centro preuniversitario. Incluye características avanzadas para:

- **Gestión de Usuarios**: Administradores, docentes y estudiantes con roles diferenciados
- **Control de Cursos**: Creación, edición y asignación de docentes a cursos
- **Sistema de Matrículas**: Inscripción y seguimiento de estudiantes en cursos
- **Registro de Asistencias**: Control de asistencia con reportes en PDF
- **Administración de Pagos**: Gestión completa de transacciones y reportes de ingresos
- **Reservación de Espacios**: Sistema de reservas para instalaciones
- **Sistema de Notificaciones**: Notificaciones automatizadas para usuarios
- **Paneles Personalizados**: Dashboards adaptados para cada rol (admin, docente, estudiante)
- **Horarios y Programación**: Gestión de horarios de clases con múltiples sesiones semanales

## Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Lenguaje**: TypeScript 5.x
- **Base de datos**: PostgreSQL 12+ con Prisma ORM 5.x
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Zod (type-safe validation)
- **Hashing**: bcryptjs para contraseñas
- **Generación PDF**: PDFKit para reportes de asistencia
- **Datos Falsos**: Faker.js para seed data
- **Testing**: Jest
- **Herramientas Dev**: Nodemon, ESLint, Prettier
- **Utilidades**: date-fns para manejo de fechas, CORS para políticas de origen

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
│   ├── controllers/         # Controladores de rutas legacy
│   ├── middlewares/         # Middlewares globales (autenticación, validación, errores)
│   │   ├── auth.middleware.ts       # Validación de JWT
│   │   ├── admin.middleware.ts      # Autorización de admin
│   │   ├── validate.middleware.ts   # Validación con Zod
│   │   └── error.middleware.ts      # Manejo centralizado de errores
│   ├── modules/             # Módulos organizados por funcionalidad
│   │   ├── auth/            # Autenticación y registro
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── dtos/
│   │   │   └── validators/
│   │   ├── users/           # Gestión de usuarios (CRUD)
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── dtos/
│   │   │   ├── mappers/
│   │   │   └── validators/
│   │   ├── courses/         # Gestión de cursos
│   │   ├── enrollments/     # Matrículas de estudiantes
│   │   ├── attendance/      # Registro y reporte de asistencias
│   │   ├── payments/        # Administración de pagos
│   │   ├── reservations/    # Sistema de reservas
│   │   ├── schedules/       # Horarios de cursos
│   │   ├── notifications/   # Sistema de notificaciones
│   │   └── dashboard/       # Paneles por rol
│   │       ├── admin/
│   │       ├── teacher/
│   │       └── student/
│   ├── routes/              # Definición centralizada de rutas
│   ├── types/               # Definiciones de tipos TypeScript
│   │   ├── express.d.ts     # Extensiones de Express Request
│   │   └── index.ts
│   ├── utils/               # Utilidades reutilizables
│   │   ├── hash.util.ts     # Funciones de hash
│   │   ├── jwt.util.ts      # Funciones JWT
│   │   ├── logger.util.ts   # Logging
│   │   └── errors.ts        # Manejo de errores
│   ├── jobs/                # Trabajos programados
│   ├── app.ts               # Configuración de Express
│   └── index.ts             # Punto de entrada
├── prisma/
│   ├── schema.prisma        # Esquema de base de datos (modelos)
│   ├── seed.ts              # Script de inicialización
│   ├── migrations/          # Migraciones de base de datos
│   └── seeds/               # Scripts individuales de seed
│       ├── users.seed.ts
│       ├── courses.seed.ts
│       ├── enrollments.seed.ts
│       ├── schedules.seed.ts
│       ├── attendance.seed.ts
│       ├── payments.seed.ts
│       ├── reservations.seed.ts
│       ├── notifications.seed.ts
│       ├── clean.ts
│       └── utils.ts
├── tests/
│   ├── e2e/                 # Tests end-to-end
│   └── integration/         # Tests de integración
├── .env.example             # Plantilla de variables de entorno
├── jest.config.ts           # Configuración de Jest
├── tsconfig.json            # Configuración de TypeScript
├── nodemon.json             # Configuración de Nodemon
└── package.json             # Dependencias del proyecto
```

## Módulos y Funcionalidades

### 🔐 Autenticación (auth)

- Registro de nuevos usuarios (ADMIN, TEACHER, STUDENT)
- Inicio de sesión con JWT
- Generación y validación de tokens seguros
- Recuperación de contraseña
- Renovación de tokens

**Ruta**: `/auth`

- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/refresh` - Renovar token

### 👥 Usuarios (users)

- CRUD completo de usuarios con validación
- Gestión de contraseñas con bcryptjs
- Filtrado por roles (ADMIN, TEACHER, STUDENT)
- Actualización de perfiles
- Eliminación lógica de usuarios

**Ruta**: `/users`

- `GET /users` - Listar usuarios (paginado)
- `GET /users/:id` - Obtener usuario específico
- `POST /users` - Crear nuevo usuario
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### 📚 Cursos (courses)

- Creación y gestión de cursos
- Asignación de docentes
- Control de capacidad y precio
- Listado con filtros
- Descripciones y objetivos

**Ruta**: `/courses`

- `GET /courses` - Listar cursos
- `POST /courses` - Crear curso
- `PUT /courses/:id` - Actualizar curso
- `DELETE /courses/:id` - Eliminar curso

### ✏️ Matrículas (enrollments)

- Inscripción de estudiantes en cursos
- Gestión de estados de matrícula (ACTIVE, INACTIVE, PENDING)
- Historial de cursos por estudiante
- Seguimiento de progreso

**Ruta**: `/enrollments`

- `POST /enrollments` - Inscribir estudiante
- `GET /enrollments` - Listar matrículas
- `PUT /enrollments/:id` - Actualizar matrícula

### 📋 Asistencias (attendance)

- Registro detallado de asistencias
- Generación de reportes en PDF
- Justificaciones de inasistencias
- Estadísticas por estudiante y curso
- Exportación de datos

**Ruta**: `/attendance`

- `POST /attendance` - Registrar asistencia
- `GET /attendance` - Listar registros
- `GET /attendance/:id/pdf` - Descargar reporte PDF

### 💳 Pagos (payments)

- Registro de transacciones de pago
- Seguimiento de estado de pago
- Historial de transacciones
- Reportes de ingresos
- Validación de montos

**Ruta**: `/reservations/payments`

- `POST /reservations/payments` - Registrar pago
- `GET /reservations/payments` - Listar pagos
- `GET /reservations/payments/report` - Reporte de ingresos

### 🏢 Reservaciones (reservations)

- Reserva de espacios e instalaciones
- Gestión de disponibilidad
- Cancelación de reservas
- Calendario de reservas

**Ruta**: `/reservations`

- `POST /reservations` - Crear reserva
- `GET /reservations` - Listar reservas
- `DELETE /reservations/:id` - Cancelar reserva

### ⏰ Horarios (schedules)

- Definición de horarios de clases
- Múltiples sesiones semanales por curso
- Gestión de aulas y docentes
- Detección de conflictos

**Ruta**: `/schedules` (integrado en cursos)

- Gestión a través del módulo de cursos

### 🔔 Notificaciones (notifications)

- Notificaciones del sistema
- Alertas para estudiantes y docentes
- Historial de notificaciones
- Marcado como leído/no leído

### 📊 Dashboards por Rol

#### Admin Dashboard (`/dashboard/admin`)

- Estadísticas generales del sistema
- Número de usuarios, cursos, ingresos
- Gráficos de actividad
- Gestión global

#### Teacher Dashboard (`/dashboard/teacher/:id`)

- Cursos asignados
- Lista de estudiantes
- Asistencias de sus clases
- Horarios de clases

#### Student Dashboard (`/dashboard/student/:id`)

- Cursos matriculados
- Calificaciones y asistencia
- Horarios personales
- Notificaciones personales

## Arquitectura y Patrones

### Estructura de Módulos

Cada módulo sigue una arquitectura clara de capas:

```
modules/moduleName/
├── controllers/        # Manejo de peticiones HTTP
├── services/          # Lógica de negocio
├── repositories/      # Acceso a datos (Prisma)
├── dtos/              # Validación con Zod
├── validators/        # Validadores específicos
├── types.ts           # Tipos específicos del módulo
├── routes.ts          # Definición de rutas
└── index.ts           # Exportación pública
```

### Data Flow (Flujo de Datos)

```
HTTP Request
    ↓
Routes → Validation Middleware (Zod)
    ↓
Controller (parseo de request)
    ↓
Service (lógica de negocio)
    ↓
Repository (acceso a datos con Prisma)
    ↓
Response/Error Handler
```

### Validación con Zod

Todos los DTOs utilizan Zod para validación type-safe:

```typescript
// DTOs
export const CreateUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
});

// Middleware de validación
router.post('/users', validate(CreateUserDto), controller.create);
```

### Manejo de Errores

Centralizado a través de middleware de errores:

```typescript
// En servicios/controladores
throw { status: 400, message: 'Error message' };

// Middleware atrapa y responde
{
  success: false,
  message: 'Error message',
  statusCode: 400
}
```

### Autenticación y Autorización

- **JWT**: Tokens en header `Authorization: Bearer <token>`
- **Roles**: ADMIN > TEACHER > STUDENT (gestión basada en roles)
- **Middleware**: `auth.middleware.ts` valida en cada solicitud protegida
- **Autorización**: `admin.middleware.ts` para rutas administrativas

## Base de Datos

El proyecto utiliza **Prisma** como ORM moderno y **PostgreSQL** como base de datos relacional.

### Modelos Principales

- **User** - Usuarios del sistema (ADMIN, TEACHER, STUDENT)
- **Course** - Cursos ofrecidos con docentes asignados
- **Enrollment** - Matrículas que relacionan estudiantes con cursos
- **Schedule** - Horarios semanales de clases
- **Attendance** - Registros de asistencia a clases
- **Payment** - Transacciones de pagos de estudiantes
- **Reservation** - Reservas de espacios
- **Notification** - Notificaciones del sistema

### Convenciones

- Nombres en BD: `snake_case`
- Nombres en modelo: `camelCase`
- Mapping automático con `@map()`
- Relaciones explícitas con `@relation()`
- Timestamps: `createdAt`, `updatedAt` automáticos

### Comandos útiles

```bash
# Ver la base de datos gráficamente
npm run prisma:studio

# Crear una nueva migración
npm run prisma:migrate -- --name "descripcion_cambio"

# Aplicar migraciones pendientes
npm run prisma:migrate:deploy

# Resetear base de datos completa (solo desarrollo)
npm run prisma:migrate:reset

# Regenerar cliente Prisma
npm run prisma:generate

# Hacer push del schema a la BD sin migraciones
npm run prisma:db:push

# Sincronizar esquema desde la BD
npm run prisma:db:pull
```

### Seed Data (Datos de Prueba)

El proyecto incluye scripts de seed para poblar la base de datos con datos realistas usando Faker:

```bash
# Generar datos de prueba
npm run seed:dev

# Con reset completo
npm run db:fresh

# Scripts individuales
npm run seed:prod
```

**Datos generados**:

- Usuarios (admin, docentes, estudiantes)
- Cursos con horarios
- Matrículas de estudiantes
- Registros de asistencia
- Pagos y transacciones
- Reservaciones
- Notificaciones

## Testing

El proyecto incluye Jest para testing unitario e integración:

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch (recarga automática)
npm test -- --watch

# Cobertura de tests
npm test -- --coverage

# Tests de un archivo específico
npm test -- users.test.ts

# Tests con patrón
npm test -- --testNamePattern="nombre"
```

### Estructura de Tests

```
tests/
├── unit/          # Tests unitarios (funciones aisladas)
├── integration/   # Tests de integración (módulos completos)
└── e2e/          # Tests end-to-end (flujos completos)
```

### Mejores Prácticas de Testing

- Mockear dependencias externas
- Probar casos exitosos y de error
- Usar fixtures para datos de prueba
- Mantener tests independientes
- Documentar comportamientos esperados

## Despliegue

### Build para Producción

```bash
# Compilar TypeScript a JavaScript
npm run build

# Ejecutar versión compilada
npm start

# Verificar tipos sin compilar
npm run typecheck
```

### Variables de Entorno en Producción

```env
# Servidor
NODE_ENV="production"
PORT=3000

# Base de datos
DATABASE_URL="postgresql://prod_user:prod_pass@prod_host:5432/academy_prod"
DIRECT_URL="postgresql://prod_user:prod_pass@prod_host:5432/academy_prod"

# JWT
JWT_SECRET="your-secure-production-secret-key-min-32-chars"
JWT_EXPIRATION="7d"

# Logs
LOG_LEVEL="error"
DATABASE_LOG="skip"
```

### Con Docker (Opcional)

```bash
# Construir imagen
docker build -t academy-backend:latest .

# Ejecutar contenedor
docker run -p 3000:3000 \
  --env-file .env \
  --name academy-backend \
  academy-backend:latest
```

### Checklist Pre-Despliegue

- [ ] Variables de entorno configuradas correctamente
- [ ] Base de datos inicializada y migraciones aplicadas
- [ ] Tests pasando: `npm test`
- [ ] Linting sin errores: `npm run lint`
- [ ] Build compila sin errores: `npm run build`
- [ ] Tipado correcto: `npm run typecheck`
- [ ] Documentación API actualizada

## Guía de Desarrollo

### Configuración del Entorno Local

1. **Clonar repositorio**

   ```bash
   git clone https://github.com/GeraldAC/academy-backend.git
   cd academy-backend
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   # Editar .env con tus valores locales
   ```

4. **Inicializar base de datos**

   ```bash
   npm run db:fresh
   ```

5. **Iniciar servidor en desarrollo**
   ```bash
   npm run dev
   ```

El servidor estará disponible en `http://localhost:3000`

### Flujo de Desarrollo Estándar

```bash
# 1. Crear rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y verificar
npm run lint:fix      # Arreglar linting
npm run typecheck     # Verificar tipos
npm run format        # Formatear código

# 3. Ejecutar tests
npm test

# 4. Commit y push
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request
```

### Buenas Prácticas

#### Código

- ✅ Usar TypeScript stricto (sin `any`)
- ✅ Validar con Zod en DTOs
- ✅ Mantener servicios enfocados en lógica de negocio
- ✅ Usar nombres descriptivos en variables/funciones
- ✅ Documentar funciones complejas

#### Commits

- ✅ Mensajes claros en español
- ✅ Usar convención: `feat:`, `fix:`, `refactor:`, `docs:`
- ✅ Commits pequeños y atómicos
- ✅ Referenciar issues cuando corresponda

#### Pull Requests

- ✅ Descripción clara de cambios
- ✅ Incluir tests para nuevas funcionalidades
- ✅ Pasar todos los checks (lint, tests, build)
- ✅ Documentación actualizada

### Agregar Nueva Funcionalidad

1. **Crear estructura del módulo**

   ```bash
   mkdir -p src/modules/nombreModulo/{controllers,services,dtos,validators}
   ```

2. **Definir DTO con Zod**

   ```typescript
   // src/modules/nombreModulo/dtos/crear.dto.ts
   export const CrearDto = z.object({
     campo: z.string().min(1),
     // más campos...
   });
   ```

3. **Implementar Servicio**

   ```typescript
   // src/modules/nombreModulo/services/nombreModulo.service.ts
   export class NombreModuloService {
     constructor(private repo: NombreModuloRepository) {}

     async crear(dto: CrearDto) {
       // Lógica de negocio
     }
   }
   ```

4. **Crear Controlador**

   ```typescript
   // src/modules/nombreModulo/controllers/nombreModulo.controller.ts
   export class NombreModuloController {
     constructor(private service: NombreModuloService) {}

     async crear(req: Request, res: Response) {
       const data = await this.service.crear(req.body);
       res.json({ success: true, data });
     }
   }
   ```

5. **Definir Rutas**

   ```typescript
   // src/modules/nombreModulo/routes.ts
   router.post('/', validate(CrearDto), controller.crear);
   ```

6. **Registrar en routes globales**

   ```typescript
   // src/routes/index.ts
   router.use('/ruta-base', moduloRoutes);
   ```

7. **Actualizar Prisma si necesario**
   ```bash
   npm run prisma:migrate -- --name "agrega_tabla"
   ```

## Solución de Problemas

### Error: "Cannot find module"

**Causa**: Dependencias no instaladas o rutas incorrectas

```bash
# Solución
npm install
npm run prisma:generate
```

### Error de Conexión a Base de Datos

**Causa**: PostgreSQL no está corriendo o variables de entorno incorrectas

```bash
# Verificar
echo $DATABASE_URL

# Solucionar
# 1. Asegurar que PostgreSQL está ejecutándose
# 2. Verificar credenciales en .env
# 3. Crear la base de datos si no existe
```

### Problemas con Prisma

```bash
# Regenerar cliente Prisma
npm run prisma:generate

# Resetear migraciones
npm run prisma:migrate:reset

# Ver estado de migraciones
prisma migrate status

# Sincronizar schema con BD
npm run prisma:db:push
```

### Error "Port 3000 already in use"

```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Tests Fallando

```bash
# Limpiar cache de Jest
npm test -- --clearCache

# Ejecutar con más detalle
npm test -- --verbose

# Test de archivo específico
npm test -- auth.test.ts
```

### TypeScript Errors

```bash
# Verificar tipos sin compilar
npm run typecheck

# Compilar con más detalle de errores
npm run build -- --listFiles
```

## Contribución

Agradecemos las contribuciones de la comunidad. Para contribuir al proyecto:

### Proceso de Contribución

1. **Fork** el repositorio en GitHub
2. **Clonar** tu fork: `git clone https://github.com/tu-usuario/academy-backend.git`
3. **Crear** rama: `git checkout -b feature/AmazingFeature`
4. **Hacer cambios** y commitear: `git commit -m 'feat: add AmazingFeature'`
5. **Push** a rama: `git push origin feature/AmazingFeature`
6. **Crear Pull Request** con descripción clara

### Estándares de Contribución

- Seguir guía de estilos del proyecto
- Pasar todos los linters: `npm run lint`
- Escribir/actualizar tests para nuevas funcionalidades
- Documentar cambios en el README si es necesario
- Usar inglés en código pero español en comentarios/docs

### Reportar Bugs

Por favor abrir un issue describiendo:

- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Información del sistema (OS, Node version, etc.)

### Sugerencias de Mejora

Abiertos a sugerencias para mejorar el proyecto. Abrir un issue con etiqueta `enhancement`.

## Licencia

Este proyecto está bajo la licencia **ISC**. Ver archivo [LICENSE](LICENSE) para más detalles.

## Contacto

**Equipo de Desarrollo**

- GitHub: [GeraldAC](https://github.com/GeraldAC)
- Email: gerald.ac.dev@gmail.com

Para preguntas, sugerencias o reportar problemas, por favor abrir un **issue** en el repositorio.

---

## Roadmap Futuro

- [ ] Autenticación con OAuth 2.0 (Google, Microsoft)
- [ ] Sistema de calificaciones
- [ ] Chat en tiempo real entre usuarios
- [ ] Integración de pagos (Stripe, PayPal)
- [ ] Mobile app (React Native)
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Sistema de permisos más granular
- [ ] Backup y disaster recovery
- [ ] Analytics y reportes avanzados
- [ ] Internacionalización (i18n)

---

**Última actualización**: Enero 2026
**Versión**: 1.0.0
**Estado**: En desarrollo activo
