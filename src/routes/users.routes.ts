// backend/src/routes/users.routes.ts
import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getMyProfile,
  updateProfile,
  updatePassword,
} from '../controllers/users.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Perfil del usuario autenticado
router.get('/me', getMyProfile);
router.put('/me', updateProfile);
router.put('/me/password', updatePassword);

// CRUD de usuarios (admin)
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/toggle-status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;