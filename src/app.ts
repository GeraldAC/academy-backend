import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api', routes);

// Error handler
app.use(errorHandler);

export default app;
