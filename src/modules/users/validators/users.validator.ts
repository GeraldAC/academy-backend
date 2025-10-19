import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
export const UserValidators = {
  create: CreateUserDto,
  update: UpdateUserDto,
  updateProfile: UpdateProfileDto,
  updatePassword: UpdatePasswordDto,
};
