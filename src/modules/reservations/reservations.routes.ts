// src/modules/reservations/routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import * as reservationController from './reservations.controller';

const router = Router();
router.use(authMiddleware);

// Student routes
router.post('/', reservationController.createReservation);

router.get('/my-reservations', reservationController.getMyReservations);

router.get('/my-enrollments', reservationController.getMyEnrollments);

router.patch('/:id/cancel', reservationController.cancelReservation);

// Teacher routes
router.get('/teacher/courses/:courseId', reservationController.getTeacherCourseReservations);

router.get('/teacher/all', reservationController.getAllTeacherReservations);

// Admin routes
router.get('/admin/all', reservationController.getAllReservations);

export const reservationRoutes = router;
