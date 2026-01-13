// src\modules\attendance\attendance.routes.ts
import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
// Asumiendo que tienes estos middlewares disponibles globalmente o los importas
import { authMiddleware } from '../../middlewares/auth.middleware';
// import { authorize } from '../../middlewares/authorize.middleware'; // Si usas roles

const router = Router();
const controller = new AttendanceController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Descargar PDF de asistencia de un estudiante
router.get('/student/:studentId/pdf', controller.downloadStudentPDF.bind(controller));

// Descargar PDF de reporte general
router.get('/report/pdf', controller.downloadReportPDF.bind(controller));

// Obtener historial de asistencia de un estudiante específico
router.get('/student/:studentId', controller.getStudentHistoryById.bind(controller));

// Obtener estadísticas de un estudiante específico
router.get('/student/:studentId/stats', controller.getStudentStatsById.bind(controller));

// Rutas para Docentes
// Agregar middleware de rol 'TEACHER' si es necesario
router.post('/', controller.registerAttendance);
router.get('/course/:courseId/date/:date', controller.getByDate);

// Rutas para Estudiantes
// Agregar middleware de rol 'STUDENT' si es necesario
router.get('/me/stats', controller.getMyStats);
router.get('/me/history', controller.getMyHistory);

// Rutas Generales (Admin/Docente)
router.get('/stats', controller.getStats.bind(controller));
router.get('/report', controller.getReport.bind(controller));

export default router;
