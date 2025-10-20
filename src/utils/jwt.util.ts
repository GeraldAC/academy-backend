import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Genera un JWT con expiración (por defecto: 1 día).
 */
export function signJwt(payload: object, expiresIn: string | number = '1d') {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

/**
 * Verifica un JWT y devuelve el payload decodificado si es válido.
 * Retorna null si el token es inválido o expiró.
 */
export function verifyJwt<T extends object = JwtPayload>(token: string): T | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as T;
  } catch {
    return null;
  }
}

/**
 * Decodifica un JWT sin verificar la firma (solo lectura).
 */
export function decodeJwt<T extends object = JwtPayload>(token: string): T | null {
  try {
    return jwt.decode(token) as T;
  } catch {
    return null;
  }
}
