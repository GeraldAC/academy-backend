import { Router } from 'express';
import { UsersController } from './controllers/users.controller';
import { validate } from '../../middlewares/validate.middleware';
import { UserValidators } from './validators/users.validator';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();


// ==========================================
// RUTAS DE PERFIL (usuario autenticado)
// ==========================================
router.get('/me', authMiddleware, UsersController.getMyProfile);        
router.put('/me', authMiddleware, validate(UserValidators.updateProfile), UsersController.updateMyProfile);
router.put('/me/password', authMiddleware, validate(UserValidators.updatePassword), UsersController.updateMyPassword);
// ==========================================
// RUTAS DE ADMINISTRACIÓN (gestión de usuarios)
// ==========================================
router.get('/', UsersController.getUsers);
router.get('/:id', UsersController.getUserById);
router.post('/', validate(UserValidators.create), UsersController.createUser);
router.put('/:id', validate(UserValidators.update), UsersController.updateUser);
router.delete('/:id', UsersController.deleteUser);

export default router;
