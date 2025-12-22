import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';
import userRoutes from './routes/users.routes';
import courseRoutes from './routes/courses.routes';
import scheduleRoutes from './routes/schedules.routes';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Probar conexión a BD
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Base de datos conectada exitosamente');
    const userCount = await prisma.user.count();
    console.log(`📊 Usuarios en BD: ${userCount}`);
  } catch (error) {
    console.error('❌ Error conectando a BD:', error);
  }
}

testConnection();

// Rutas principales
app.use('/api', routes);

// Rutas específicas
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/schedules', scheduleRoutes);

// Error handler SIEMPRE AL FINAL
app.use(errorHandler);

export default app;