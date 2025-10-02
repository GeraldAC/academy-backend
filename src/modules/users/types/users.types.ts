import { CreateUserDto } from '../dtos/create-user.dto';

export type UserCreateInput = Omit<CreateUserDto, 'password'> & { passwordHash: string };
