// backend/src/modules/users/controllers/users.controller.ts
import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { Role } from '@prisma/client';

const service = new UsersService();

export class UsersController {

  // ==================== CRUD DE USUARIOS (ADMIN) ====================

  // POST /api/users - Crear usuario
  async createUser(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, dni, role, phone } = req.body;

      // Validaciones
      if (!email || !password || !firstName || !lastName || !dni || !role) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos obligatorios deben ser completados'
        });
      }

      // Validar DNI (8 dígitos)
      if (!/^\d{8}$/.test(dni)) {
        return res.status(400).json({
          success: false,
          message: 'El DNI debe tener 8 dígitos'
        });
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      // Validar rol
      if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido. Debe ser STUDENT, TEACHER o ADMIN'
        });
      }

      // Validar contraseña
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      const user = await service.createUser({
        email,
        password,
        firstName,
        lastName,
        dni,
        role: role as Role,
        phone
      });

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: user
      });

    } catch (error: any) {
      console.error('Error en createUser:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear usuario'
      });
    }
  }

  // GET /api/users - Obtener todos los usuarios con filtros
  async getUsers(req: Request, res: Response) {
    try {
      const { role, isActive, search, page, limit } = req.query;
      
      const filters: any = {};

      if (role) filters.role = role as Role;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (search) filters.search = search as string;
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await service.getUsers(filters);

      res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error('Error en getUsers:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener usuarios'
      });
    }
  }

  // GET /api/users/stats - Estadísticas de usuarios
  async getUserStats(req: Request, res: Response) {
    try {
      const stats = await service.getUserStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error: any) {
      console.error('Error en getUserStats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener estadísticas'
      });
    }
  }

  // GET /api/users/:id - Obtener usuario por ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await service.getUserById(id);

      res.json({
        success: true,
        data: user
      });

    } catch (error: any) {
      console.error('Error en getUserById:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Usuario no encontrado'
      });
    }
  }

  // PUT /api/users/:id - Actualizar usuario
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await service.updateUser(id, updateData);

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: user
      });

    } catch (error: any) {
      console.error('Error en updateUser:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar usuario'
      });
    }
  }

  // PATCH /api/users/:id/toggle-status - Activar/Desactivar usuario
  async toggleUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await service.toggleUserStatus(id);

      res.json({
        success: true,
        message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`,
        data: user
      });

    } catch (error: any) {
      console.error('Error en toggleUserStatus:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al cambiar estado del usuario'
      });
    }
  }

  // DELETE /api/users/:id - Eliminar usuario (soft delete)
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await service.deleteUser(id);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error: any) {
      console.error('Error en deleteUser:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar usuario'
      });
    }
  }

  // POST /api/users/:id/reset-password - Resetear contraseña (ADMIN)
  async resetPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      const result = await service.resetPassword(id, newPassword);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error: any) {
      console.error('Error en resetPassword:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al resetear contraseña'
      });
    }
  }

  // ==================== PERFIL DE USUARIO AUTENTICADO ====================

  // GET /api/users/me - Obtener mi perfil
  async getMyProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await service.getUserById(userId);

      res.json({
        success: true,
        data: user
      });

    } catch (error: any) {
      console.error('Error en getMyProfile:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener perfil'
      });
    }
  }

  // PUT /api/users/me - Actualizar mi perfil
  async updateMyProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const updateData = req.body;

      // Prevenir que el usuario cambie su propio rol
      delete updateData.role;
      delete updateData.isActive;

      const user = await service.updateUser(userId, updateData);

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: user
      });

    } catch (error: any) {
      console.error('Error en updateMyProfile:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar perfil'
      });
    }
  }

  // PUT /api/users/me/password - Actualizar mi contraseña
  async updateMyPassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere la contraseña actual y la nueva contraseña'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
      }

      // Verificar contraseña actual (implementar en service)
      const result = await service.updatePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error: any) {
      console.error('Error en updateMyPassword:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar contraseña'
      });
    }
  }
}