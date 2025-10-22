// src/modules/dashboard/teacher/teacher-dashboard.routes.ts
import { Router } from 'express';
import { TeacherDashboardController } from './teacher-dashboard.controller';

const router = Router();
const controller = new TeacherDashboardController();

router.get('/:id', (req, res) => controller.getDashboard(req, res));

export default router;