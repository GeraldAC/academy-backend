import bcrypt from 'bcrypt';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto, UpdateUserDto, UserFiltersDto } from '../dtos/create-user.dto';
import { UserMapper } from '../mappers/users.mapper';

export class UsersService {
  private repository: UsersRepository;

  constructor() {
    this.repository = new UsersRepository();
  }

  async createUser(data: CreateUserDto) {
    const existingEmail = await this.repository.findByEmail(data.email);
    if (existingEmail) throw new Error('El email ya está registrado');

    const existingDni = await this.repository.findByDni(data.dni);
    if (existingDni) throw new Error('El DNI ya está registrado');

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.repository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni,
      role: data.role,
      phone: data.phone,
      isActive: true,
    });

    return UserMapper.toResponse(user);
  }

  async getUsers(filters: UserFiltersDto = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { dni: { contains: filters.search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.repository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.repository.count(where),
    ]);

    return {
      users: UserMapper.toResponseList(users),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new Error('Usuario no encontrado');
    return UserMapper.toResponse(user);
  }

  async updateUser(id: string, data: UpdateUserDto) {
    const user = await this.repository.findById(id);
    if (!user) throw new Error('Usuario no encontrado');

    if (data.email && data.email !== user.email) {
      const existingEmail = await this.repository.findByEmail(data.email);
      if (existingEmail) throw new Error('El email ya está en uso');
    }

    const updatedUser = await this.repository.update(id, data);
    return UserMapper.toResponse(updatedUser);
  }

  async toggleUserStatus(id: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new Error('Usuario no encontrado');

    const updatedUser = await this.repository.update(id, {
      isActive: !user.isActive,
    });

    return UserMapper.toResponse(updatedUser);
  }

  async deleteUser(id: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new Error('Usuario no encontrado');

    await this.repository.update(id, { isActive: false });

    return { message: 'Usuario desactivado correctamente' };
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Hash de nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await this.repository.update(userId, {
      passwordHash: newPasswordHash,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async resetPassword(id: string, newPassword: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new Error('Usuario no encontrado');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.repository.update(id, { passwordHash });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async getUserStats() {
    const [totalUsers, activeUsers, students, teachers, admins] = await Promise.all([
      this.repository.count(),
      this.repository.countActive(),
      this.repository.countByRole('STUDENT'),
      this.repository.countByRole('TEACHER'),
      this.repository.countByRole('ADMIN'),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      byRole: { students, teachers, admins },
    };
  }
}
