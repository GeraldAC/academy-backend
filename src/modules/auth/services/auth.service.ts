import { UsersRepository } from '../../users/repositories/users.repository';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { hashPassword, comparePassword } from '../../../utils/hash.util';
import { signJwt, verifyJwt } from '../../../utils/jwt.util';
import { UserMapper } from '../../users/mappers/users.mapper';

export class AuthService {
  private usersRepo = new UsersRepository();

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findByEmail(dto.email);
    if (!user) throw { status: 401, message: 'Invalid credentials' };

    const isValid = await comparePassword(dto.password, user.passwordHash);
    if (!isValid) throw { status: 401, message: 'Invalid credentials' };

    const token = signJwt({ id: user.id, role: user.role });
    return {
      user: UserMapper.toResponse(user),
      token,
    };
  }

  async refreshToken(oldToken?: string) {
    if (!oldToken) throw { status: 401, message: 'Missing token' };

    const decoded = verifyJwt<{ id: string; role: string }>(oldToken);
    if (!decoded) throw { status: 403, message: 'Invalid or expired token' };

    const user = await this.usersRepo.findById(decoded.id);
    if (!user) throw { status: 404, message: 'User not found' };

    const newToken = signJwt({ id: user.id, role: user.role });
    return { newToken, user: UserMapper.toResponse(user) };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findByEmail(dto.email);
    if (existing) throw { status: 400, message: 'Email already registered' };

    const { password, ...rest } = dto;
    const passwordHash = await hashPassword(password);
    const user = await this.usersRepo.create({ ...rest, passwordHash });

    const token = signJwt({ id: user.id, role: user.role });
    return {
      user: UserMapper.toResponse(user),
      token,
    };
  }
}
