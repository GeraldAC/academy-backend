import { Router } from 'express';
import { UsersController } from './controllers/users.controller';
import { validate } from '../../middlewares/validate.middleware';
import { UserValidators } from './validators/users.validator';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminMiddleware } from '../../middlewares/admin.middleware';

const router = Router();
const controller = new UsersController();

// Todas las rutas requieren autenticación y rol de ADMIN
router.use(authMiddleware);
router.use(adminMiddleware);

// IMPORTANTE: /stats debe ir ANTES de /:id para evitar conflictos
router.get('/stats', controller.getUserStats.bind(controller));
// ==========================================
// RUTAS DE PERFIL (usuario autenticado)
// ==========================================
router.get('/me', controller.getMyProfile.bind(controller));
router.put('/me', validate(UserValidators.updateProfile), controller.updateMyProfile.bind(controller));
router.put('/me/password', validate(UserValidators.updatePassword), controller.updateMyPassword.bind(controller));

// ==========================================
// RUTAS DE ADMINISTRACIÓN (gestión de usuarios)
// ==========================================
router.get('/', controller.getUsers);
router.get('/:id', controller.getUserById);
router.post('/', validate(UserValidators.create), controller.createUser);
router.put('/:id', validate(UserValidators.update), controller.updateUser);
router.delete('/:id', controller.deleteUser);

export default router;
