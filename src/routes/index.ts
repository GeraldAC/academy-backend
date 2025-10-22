import { Router } from 'express';
import { usersModule } from '../modules/users';
import { authModule } from '../modules/auth';

import { AdminDashboardController } from '../modules/dashboard/admin/admin-dashboard.controller';
import { TeacherDashboardController } from '../modules/dashboard/teacher/teacher-dashboard.controller';
import { StudentDashboardController } from '../modules/dashboard/student/student-dashboard.controller';

const router = Router();

const adminController = new AdminDashboardController();
const teacherController = new TeacherDashboardController();
const studentController = new StudentDashboardController();

router.use('/users', usersModule.routes);
router.use('/auth', authModule.routes);

// Admin routes
router.get('/dashboard/admin', (req, res) => adminController.getDashboard(req, res));

// Teacher routes
router.get('/dashboard/teacher/:id', (req, res) => teacherController.getDashboard(req, res));

// Student routes
router.get('/dashboard/student/:id', (req, res) => studentController.getDashboard(req, res));


export default router;
