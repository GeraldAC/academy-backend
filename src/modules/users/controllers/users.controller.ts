import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';

const service = new UsersService();

export class UsersController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await service.getUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await service.getUserById(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const newUser = await service.createUser(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await service.updateUser(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await service.deleteUser(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
  // ==========================================
  // CONTROLADORES PARA PERFIL
  // ==========================================

  // GET /api/users/me - Obtener mi perfil
  static async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id; // Del authMiddleware
      const profile = await service.getMyProfile(userId);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/users/me - Actualizar mi perfil
  static async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id; // Del authMiddleware
      const updated = await service.updateMyProfile(userId, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/users/me/password - Cambiar mi contraseña
  static async updateMyPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id; // Del authMiddleware
      await service.updateMyPassword(userId, req.body);
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      next(err);
    }
  }
}
