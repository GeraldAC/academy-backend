import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';
import userRoutes from './routes/users.routes';
import courseRoutes from './routes/courses.routes';
import scheduleRoutes from './routes/schedules.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api', routes);

// Rutas específicas
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/schedules', scheduleRoutes);

// Error handler SIEMPRE AL FINAL
app.use(errorHandler);

export default app;
