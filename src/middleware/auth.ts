import jwt from 'jsonwebtoken';
import express from 'express';
import { UserRole } from '../models/user.model';
import { config } from '../config';

export interface AuthToken extends jwt.JwtPayload {
  sub: string;
  role: UserRole;
  profile_name: string;
}

export type Request<T = AuthToken> = express.Request & { token?: T };

export const requireRole = (role?: UserRole) => {
  return async (
    req: Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    try {
      req.token = jwt.verify(token, config.jwtSecret) as AuthToken;
      if (role && req.token.role !== role) {
        return res.status(401).json({
          errors: [`Unauthorized: ${role.toUpperCase()} access required`],
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  };
};

export const requireUser = requireRole();
