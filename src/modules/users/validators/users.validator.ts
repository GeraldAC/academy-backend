import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

export const UserValidators = {
  create: CreateUserDto,
  update: UpdateUserDto,
};
