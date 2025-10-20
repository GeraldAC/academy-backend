import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt.util';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const decoded = verifyJwt(token);
  if (!decoded) return res.status(403).json({ message: 'Invalid or expired token' });

  (req as any).user = decoded;
  next();
}
