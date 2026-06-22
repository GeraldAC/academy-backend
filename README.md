# Academy Backend

RESTful API for managing pre-university education centers. Robust backend architecture built with TypeScript, Node.js, and Express, featuring modular design patterns and comprehensive data persistence through Prisma ORM.

## Overview

Academy Backend is a production-ready API for managing educational institutions with multi-role access control, course management, enrollment tracking, attendance recording, payment processing, and resource reservation capabilities. The system provides role-based dashboards and automated notification workflows.

### Core Features

- **Multi-role User Management**: Role-based access control for administrators, instructors, and students
- **Course Management**: Full lifecycle management including instructor assignment and capacity planning
- **Enrollment System**: Student registration tracking with enrollment status management
- **Attendance Tracking**: Automated attendance recording with PDF report generation
- **Payment Processing**: Transaction management with revenue reporting and reconciliation
- **Resource Reservation**: Facility booking and space allocation system
- **Notification Engine**: Automated notifications with user preference tracking
- **Role-based Dashboards**: Customized data visualizations for each user role
- **Schedule Management**: Multi-session weekly class scheduling

## Technology Stack

| Layer                | Technology                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Runtime**          | ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)          |
| **Framework**        | ![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)          |
| **Language**         | ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white) |
| **Database**         | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791?style=flat&logo=postgresql&logoColor=white) |
| **ORM**              | ![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=flat&logo=prisma&logoColor=white)             |
| **Validation**       | ![Zod](https://img.shields.io/badge/Zod-3.x-3E67B1?style=flat)                                               |
| **Authentication**   | JWT (JSON Web Tokens)                                                                                        |
| **Password Hashing** | bcryptjs                                                                                                     |
| **PDF Generation**   | PDFKit                                                                                                       |
| **Testing**          | Jest                                                                                                         |
| **Code Quality**     | ESLint, Prettier                                                                                             |

## Prerequisites

- Node.js 18 or higher
- Package manager: npm, yarn, or pnpm
- PostgreSQL 12 or higher
- Git

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/GeraldAC/academy-backend.git
cd academy-backend
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/academy_db"
DIRECT_URL="postgresql://user:password@localhost:5432/academy_db"

# Server Configuration
PORT=3000
NODE_ENV="development"

# Authentication
JWT_SECRET="your-secret-key-minimum-5-characters"
JWT_EXPIRATION="7d"

# Logging and Diagnostics
DATABASE_LOG="skip"
LOG_LEVEL="info"
```

### 4. Database Setup

Execute migrations and seed initial data:

```bash
npm run db:fresh
```

This command performs the following operations:

- Drops and recreates the database schema
- Applies all pending migrations
- Populates the database with test fixtures using Faker.js

## Development Workflow

### Available Commands

```bash
# Start development server with hot reload
npm run dev

# Type check without compilation
npm run typecheck

# Compile TypeScript to JavaScript
npm run build

# Run compiled distribution
npm start

# Execute test suite
npm test
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Code quality
npm run lint            # Lint analysis
npm run lint:fix        # Automatic fixes
npm run format          # Format code with Prettier

# Database Operations
npm run db:seed         # Run seed script
npm run db:reset        # Reset database
npm run db:fresh        # Reset and reseed
npm run prisma:studio   # Open Prisma Studio UI
npm run prisma:migrate  # Create migration
```

## Project Architecture

### Directory Structure

```
src/
├── config/              # Application configuration
│   ├── app.ts          # Express app setup
│   ├── env.ts          # Environment variable schema
│   ├── logger.ts       # Logging configuration
│   └── prisma.ts       # Prisma client setup
├── modules/            # Feature modules
│   ├── auth/           # Authentication module
│   ├── users/          # User management
│   ├── courses/        # Course management
│   ├── enrollments/    # Enrollment handling
│   ├── attendance/     # Attendance tracking
│   ├── payments/       # Payment processing
│   ├── reservations/   # Resource reservation
│   ├── notifications/  # Notification system
│   └── dashboard/      # Role-specific dashboards
├── middlewares/        # Express middleware
│   ├── auth.ts        # JWT verification
│   ├── admin.ts       # Admin authorization
│   ├── validate.ts    # Request validation
│   └── error.ts       # Error handling
├── routes/             # Route definitions
├── types/              # TypeScript definitions
├── utils/              # Utility functions
├── tests/              # Test fixtures and helpers
└── jobs/               # Background jobs
prisma/
├── schema.prisma       # Database schema definition
├── seed.ts            # Seed script entry point
├── seeds/             # Individual seed files
└── migrations/        # Database migrations
```

### Module Pattern

Each feature module follows a standardized structure:

```
src/modules/{feature}/
├── {feature}.routes.ts      # Route definitions
├── {feature}.service.ts     # Business logic
├── {feature}.controller.ts  # HTTP handlers
├── dtos/                    # Data transfer objects (Zod schemas)
├── validators/              # Additional validation logic
└── index.ts                # Module exports
```

### Data Flow

```mermaid
flowchart TD
    A["HTTP Request"] --> B["Route Handler"]
    B --> C["Controller <br>(HTTP parsing)"]
    C --> D["Middleware <br>(Validation, Authorization)"]
    D --> E["Service <br>(Business Logic)"]
    E --> F["Repository <br>(Database Query via Prisma)"]
    F --> G[("Database")]
```

## API Usage

### Authentication

The API uses JWT-based authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Response Format

Standard API responses follow the pattern:

```json
{
  "data": {},
  "status": 200,
  "message": "Success"
}
```

Error responses include appropriate HTTP status codes with error details.

### Role-based Access Control

Three user roles with distinct permissions:

- **ADMIN**: System administration, user management, reporting
- **TEACHER**: Course creation and management, attendance recording, student tracking
- **STUDENT**: Course enrollment, attendance view, payment tracking

## Database Schema

Key entities managed by the system:

| Entity           | Purpose                                                             |
| ---------------- | ------------------------------------------------------------------- |
| **User**         | Central identity model supporting ADMIN, TEACHER, and STUDENT roles |
| **Course**       | Manages course metadata, instructor assignment, and capacity limits |
| **Enrollment**   | Tracks student-course relationships with enrollment status          |
| **Schedule**     | Defines weekly class sessions per course                            |
| **Attendance**   | Records class attendance with timestamp metadata                    |
| **Payment**      | Manages financial transactions and revenue tracking                 |
| **Notification** | Stores user notifications and delivery status                       |
| **Reservation**  | Manages facility/resource bookings                                  |

All timestamps use UTC with timezone support. Foreign key relationships enforce referential integrity at the database level.

## Configuration

### Environment Variables

Configuration is validated at startup using Zod schemas defined in [src/config/env.ts](src/config/env.ts). Missing or invalid environment variables will prevent the application from starting.

### Logging

Application logs are configured in [src/config/logger.ts](src/config/logger.ts). Adjust `LOG_LEVEL` in `.env` to control verbosity.

## Testing

Test suite is configured with Jest. Execute tests with:

```bash
npm test
```

Test files are colocated with source code using the `.test.ts` or `.spec.ts` naming convention.

## Code Quality Standards

### Linting

ESLint configuration enforces consistent code style. Auto-fix violations:

```bash
npm run lint:fix
```

### Formatting

Prettier automatically formats code:

```bash
npm run format
```

### Type Safety

Full TypeScript coverage with strict mode enabled. Verify types without compilation:

```bash
npm run typecheck
```

## Database Migrations

### Creating Migrations

Modify `prisma/schema.prisma`, then create a migration:

```bash
npm run prisma:migrate -- --name descriptive_name
```

### Deployment Migrations

Apply pending migrations in production:

```bash
npm run prisma:migrate:deploy
```

## Performance Considerations

- Database indexes are defined on frequently queried fields (role, email, DNI)
- JWT tokens use configurable expiration to balance security and UX
- PDF generation is handled asynchronously to prevent request blocking
- Prisma client connection pooling optimizes database resource usage

## Error Handling

The error middleware standardizes error responses. Services throw error objects with `status` and `message` properties, which are caught and formatted consistently.

## Contributing

When adding new features:

1. Create a new module directory following the established pattern
2. Define Zod DTO schemas for request validation
3. Implement service layer with business logic
4. Create controller methods for HTTP handling
5. Define routes with appropriate middleware
6. Export module and register in route aggregator
7. Update database schema if required and run migrations
8. Write corresponding tests

## License

ISC

## Support

For issues, questions, or contributions, please refer to the project repository.
