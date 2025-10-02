import { Router } from 'express';
import { UsersController } from './controllers/users.controller';
import { validate } from '../../middlewares/validate.middleware';
import { UserValidators } from './validators/users.validator';

const router = Router();

router.get('/', UsersController.getUsers);
router.get('/:id', UsersController.getUserById);
router.post('/', validate(UserValidators.create), UsersController.createUser);
router.put('/:id', validate(UserValidators.update), UsersController.updateUser);
router.delete('/:id', UsersController.deleteUser);

export default router;
