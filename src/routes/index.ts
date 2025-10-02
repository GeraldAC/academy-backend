import { Router } from 'express';
import { usersModule } from '../modules/users';
import { authModule } from '../modules/auth';

const router = Router();

router.use('/users', usersModule.routes);
router.use('/auth', authModule.routes);

export default router;
