# Academy Backend - AI Agent Instructions

## Project Overview

Academy Backend is a Node.js/Express REST API for managing a pre-university education center. Architecture follows modular service patterns with clear separation of concerns: controllers handle HTTP, services contain business logic, and repositories manage data persistence via Prisma ORM.

## Core Architecture Patterns

### Module Structure

Each feature module lives in `src/modules/{feature}` and exports routes via a standard pattern:

```typescript
// src/modules/auth/index.ts
export const authModule = { routes: authRoutes };

// src/routes/index.ts
router.use('/auth', authModule.routes);
```

Modules contain: `routes.ts`, `controllers/`, `services/`, `dtos/`, and `validators/` subdirectories. When adding features, replicate this structure.

### Data Flow: Request → Controller → Service → Repository

1. **Controller**: Parse request, call service, return response
2. **Service**: Business logic, validation, orchestration (see [AuthService](src/modules/auth/services/auth.service.ts#L1))
3. **Repository**: Database queries via Prisma (instantiate in service constructor)

### Validation Layer

Use **Zod schemas** for both runtime validation and type inference:

```typescript
// src/modules/auth/dtos/login.dto.ts
export const LoginDto = z.object({ email: z.string().email(), password: z.string().min(8) });
export type LoginDto = z.infer<typeof LoginDto>;
```

Apply via middleware: `router.post('/login', validate(LoginDto), controller.login)` (see [validate.middleware.ts](src/middlewares/validate.middleware.ts)).

## Critical Conventions

### Error Handling

Throw objects with `status` and `message` properties; the error handler catches them:

```typescript
throw { status: 401, message: 'Invalid credentials' };
```

Error middleware ([error.middleware.ts](src/middlewares/error.middleware.ts)) must remain **the last middleware** in `app.ts`.

### Authentication

JWT stored in Authorization header as Bearer token. Middleware extracts and decodes, attaching decoded payload to `req.user`:

```typescript
// src/middlewares/auth.middleware.ts
const token = req.headers.authorization?.split(' ')[1];
const decoded = verifyJwt(token);
(req as any).user = decoded;
```

### Database Schema

Prisma schema in `prisma/schema.prisma` uses snake_case in DB, camelCase in models via `@map()`. Key entities:

- **User** (role: ADMIN | TEACHER | STUDENT): Base for all participants
- **Course** (teacher_id FK): Links to teacher, capacity, monthly_price
- **Enrollment** (student_id, course_id): Tracks student registration status
- **Schedule** (course_id FK): Weekly class times per course
- **Attendance, Payment, Reservation**: Dependent on User/Course

### Environment Variables

Validated via Zod in [src/config/env.ts](src/config/env.ts):

```typescript
const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(5),
});
```

All env variables must be in this schema or they'll fail at startup.

## Development Workflows

### Build & Run

```bash
npm run dev           # Nodemon with watch (development)
npm run build         # Compile TypeScript → dist/
npm start             # Run compiled dist/src/index.js
npm run typecheck     # Check types without emitting
```

### Database Migrations

```bash
npm run db:fresh      # Reset DB + seed data (dev only!)
npm run db:seed       # Run prisma/seed.ts
prisma studio        # Visual DB explorer
```

Seed data in [prisma/seeds/](prisma/seeds/) — modify for test fixtures.

### Code Quality

```bash
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix issues
npm run format        # Prettier on src/
```

## Key File References

- **Entry point**: [src/index.ts](src/index.ts) + [src/app.ts](src/app.ts)
- **Routes registration**: [src/routes/index.ts](src/routes/index.ts)
- **Auth service**: [src/modules/auth/services/auth.service.ts](src/modules/auth/services/auth.service.ts)
- **Middleware chain**: [src/middlewares/](src/middlewares/) (validate, auth, error)
- **Type definitions**: [src/types/express.d.ts](src/types/express.d.ts) (extend Request type if needed)
- **Utilities**: [src/utils/](src/utils/) (hash, JWT, logger helpers)

## When Adding Features

1. **Create module structure**: `src/modules/{feature}/{dtos,services,controllers,routes.ts}`
2. **Define Zod DTO** in `dtos/` with both schema and inferred type
3. **Implement Service** with business logic; instantiate repositories inside
4. **Create Controller** to handle HTTP layer
5. **Define Routes** with validation middleware and controller methods
6. **Export via index.ts** and register in `src/routes/index.ts`
7. **Update Prisma schema** if new data model needed, then run `npm run db:fresh`

## Testing Notes

Jest configured but [jest.config.ts](jest.config.ts) is empty — add config if setting up tests. Test files in `src/tests/`.

## Important Gotchas

- **Prisma relations**: Always check `@relation()` foreign keys match model references
- **Type safety**: Use `(req as any).user` carefully — consider extending Express Request type in [express.d.ts](src/types/express.d.ts)
- **Async errors**: Services throw objects; middleware catches and responds. Don't return from middleware without calling `next()` on success
- **Seed data**: Uses Faker for realistic test data; modify [prisma/seed.ts](prisma/seed.ts) to change default fixtures
