import { UsersRepository } from '../../users/repositories/users.repository';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { hashPassword, comparePassword } from '../../../utils/hash.util';
import { signJwt } from '../../../utils/jwt.util';

export class AuthService {
  private usersRepo = new UsersRepository();

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findByEmail(dto.email);
    if (existing) throw { status: 400, message: 'Email already registered' };

    const { password, ...rest } = dto;
    const passwordHash = await hashPassword(password);
    const user = await this.usersRepo.create({ ...rest, passwordHash });

    const token = signJwt({ id: user.id, role: user.role });
    return { user: { ...user, passwordHash: undefined }, token };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findByEmail(dto.email);
    if (!user) throw { status: 401, message: 'Invalid credentials' };

    const isValid = await comparePassword(dto.password, user.passwordHash);
    if (!isValid) throw { status: 401, message: 'Invalid credentials' };

    const token = signJwt({ id: user.id, role: user.role });
    return { user: { ...user, passwordHash: undefined }, token };
  }
}
