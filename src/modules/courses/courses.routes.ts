import { Router } from 'express';
import { CoursesController } from './courses.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  createCourseSchema,
  updateCourseSchema,
  courseFiltersSchema,
  availableUserSchema,
} from './courses.types';

const router = Router();
const controller = new CoursesController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);
// ========================================
// RUTAS PARA TEACHER (Ver mis cursos)
router.get('/my-courses', controller.getMyCourses.bind(controller));
// RUTAS PARA STUDENT (Ver cursos matriculados)
router.get('/student-courses', controller.getStudentCourses.bind(controller));
// ---------------------------------------------------------------------------

router.get(
  '/users/available',
  validate(availableUserSchema, 'query'),
  controller.getAvailableUsers.bind(controller)
);

router.get('/subjects/available', controller.getAvailableSubjects.bind(controller));

// ---------------------------------------------------------------------------

// POST /api/courses - Crear curso (solo ADMIN)
router.post('/', validate(createCourseSchema, 'body'), controller.createCourse.bind(controller));

// GET /api/courses - Listar cursos con filtros
router.get('/', validate(courseFiltersSchema, 'query'), controller.getAllCourses.bind(controller));

// GET /api/courses/:id - Obtener curso por ID
router.get('/:id([0-9a-fA-F-]{36})', controller.getCourseById.bind(controller));

// PATCH /api/courses/:id - Actualizar curso (solo ADMIN)
router.patch(
  '/:id',
  validate(updateCourseSchema, 'body'),
  controller.updateCourse.bind(controller)
);

export default router;
