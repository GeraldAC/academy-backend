import { Router } from 'express';
import { EnrollmentsController } from './enrollments.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { createEnrollmentSchema } from './enrollments.types';

const router = Router();
const controller = new EnrollmentsController();

router.use(authMiddleware);

// Crear matrícula (ADMIN)
router.post(
  '/',
  validate(createEnrollmentSchema, 'body'),
  controller.enrollStudent.bind(controller)
);

// 🆕 NUEVO: Obtener estudiantes disponibles para matricular en un curso
router.get('/available/:courseId', controller.getAvailableStudents.bind(controller));

// Listar estudiantes matriculados por curso
router.get('/course/:courseId', controller.getEnrolledStudents.bind(controller));

// Cancelar matrícula
router.delete('/:id', controller.deleteEnrollment.bind(controller));

export default router;
