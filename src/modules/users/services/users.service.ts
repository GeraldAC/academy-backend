import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { hashPassword, comparePassword } from '../../../utils/hash.util';

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
  // ==========================================
  // MÉTODOS PARA PERFIL
  // ==========================================

  // Obtener mi perfil
  async getMyProfile(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  }

  // Actualizar mi perfil (nombre, apellido, teléfono)
  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.repo.findById(userId);
    if (!user) throw { status: 404, message: 'User not found' };

    return this.repo.update(userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone || undefined,
    });
  }

  async updateMyPassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.repo.findById(userId);
    if (!user) throw { status: 404, message: 'User not found' };

    // Verificar contraseña actual
    const isValid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!isValid) throw { status: 401, message: 'Current password is incorrect' };

    // Hashear nueva contraseña
    const newPasswordHash = await hashPassword(dto.newPassword);

    // Actualizar contraseña usando el método específico
    await this.repo.updatePassword(userId, newPasswordHash);
  }
}
