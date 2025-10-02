import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function signJwt(payload: object, expiresIn: string | number = '1d') {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyJwt<T>(token: string): T | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as T;
  } catch {
    return null;
  }
}
