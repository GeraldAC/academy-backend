import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { AuthValidators } from './validators/auth.validator';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/login', validate(AuthValidators.login), AuthController.login);
router.get('/verify', authMiddleware, AuthController.verify);
router.post('/refresh', AuthController.refresh);
router.post('/register', validate(AuthValidators.register), AuthController.register);

export default router;
