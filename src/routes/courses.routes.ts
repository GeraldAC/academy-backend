// backend/src/routes/courses.routes.ts
import { Router } from 'express';
import { getCourses } from '../controllers/courses.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getCourses);

export default router;