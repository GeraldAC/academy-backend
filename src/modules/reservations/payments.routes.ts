// src/modules/payments/routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import * as paymentController from './payments.controller';

const router = Router();
router.use(authMiddleware);

// Admin routes
router.post('/', paymentController.createPayment);

router.get('/', paymentController.getAllPayments);

router.get('/:id', paymentController.getPaymentById);

router.patch('/:id', paymentController.updatePayment);

router.delete('/:id', paymentController.deletePayment);

// Student routes
router.get('/student/my-payments', paymentController.getMyPayments);

export const paymentRoutes = router;
