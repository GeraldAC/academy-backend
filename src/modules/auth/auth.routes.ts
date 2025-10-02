import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { AuthValidators } from './validators/auth.validator';

const router = Router();

router.post('/register', validate(AuthValidators.register), AuthController.register);
router.post('/login', validate(AuthValidators.login), AuthController.login);

export default router;
