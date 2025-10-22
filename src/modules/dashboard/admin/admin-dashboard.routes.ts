// src/modules/dashboard/admin/admin-dashboard.routes.ts
import { Router } from 'express';
import { AdminDashboardController } from './admin-dashboard.controller';

const router = Router();
const controller = new AdminDashboardController();

router.get('/', (req, res) => controller.getDashboard(req, res));

export default router;