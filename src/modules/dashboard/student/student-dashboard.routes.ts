// src/modules/dashboard/student/student-dashboard.routes.ts
import { Router } from 'express';
import { StudentDashboardController } from './student-dashboard.controller';

const router = Router();
const controller = new StudentDashboardController();

router.get('/:id', (req, res) => controller.getDashboard(req, res));

export default router;