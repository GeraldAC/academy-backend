import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
// Asumiendo que tienes estos middlewares disponibles globalmente o los importas
import { authMiddleware } from '../../middlewares/auth.middleware';
// import { authorize } from '../../middlewares/authorize.middleware'; // Si usas roles

const router = Router();
const controller = new AttendanceController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para Docentes
// Agregar middleware de rol 'TEACHER' si es necesario
router.post('/', controller.registerAttendance);
router.get('/course/:courseId/date/:date', controller.getByDate);

// Rutas para Estudiantes
// Agregar middleware de rol 'STUDENT' si es necesario
router.get('/me/stats', controller.getMyStats);
router.get('/me/history', controller.getMyHistory);

export default router;
