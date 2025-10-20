import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const service = new AuthService();

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      res.json({ valid: true, user });
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenHeader = req.headers.authorization?.split(' ')[1];
      const result = await service.refreshToken(tokenHeader);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}
