import type { Request } from 'express';
import type { Role } from '../../generated/prisma/client';

export interface AuthenticatedRequest extends Request {
  cookies: Partial<Record<string, string>>;
  user?: JwtPayload;
}

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  role: Role;
}
