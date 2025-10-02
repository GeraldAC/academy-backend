import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { hashPassword } from '../../../utils/hash.util';

export class UsersService {
  constructor(private repo = new UsersRepository()) {}

  async getUsers() {
    return this.repo.findAll();
  }

  async getUserById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  }

  async createUser(dto: CreateUserDto) {
    const { password, ...rest } = dto;
    const passwordHash = await hashPassword(password);
    return this.repo.create({ ...rest, passwordHash });
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    return this.repo.update(id, dto);
  }

  async deleteUser(id: string) {
    return this.repo.delete(id);
  }
}
