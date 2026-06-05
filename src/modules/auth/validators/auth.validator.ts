import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

export const AuthValidators = {
  login: LoginDto,
  register: RegisterDto,
};

// Re-export types for convenience
export type { LoginDto };
export type { RegisterDto } from '../dtos/register.dto';
