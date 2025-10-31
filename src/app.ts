import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';
import usersRoutes from './modules/users/users.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api', routes);
// Rutas
app.use('/api/users', usersRoutes);
// Error handler
app.use(errorHandler);

export default app;
