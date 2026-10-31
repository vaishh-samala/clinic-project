import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from './errors.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  patientId?: string;
  doctorId?: string;
}

export function signToken(payload: TokenPayload, expiresIn?: string | number): string {
  const options: SignOptions = {
    expiresIn: (expiresIn ?? env.JWT_EXPIRES_IN) as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired');
    }
    throw new UnauthorizedError('Invalid authorization token');
  }
}
