import { prisma } from '../../../prisma/client';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserCreateInput } from '../types/users.types';

export class UsersRepository {
  async findAll() {
    return prisma.user.findMany();
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: UserCreateInput) {
    return prisma.user.create({ data });
  }

  async update(id: string, data: UpdateUserDto) {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
