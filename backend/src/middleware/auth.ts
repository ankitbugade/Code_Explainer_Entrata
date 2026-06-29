// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/auth';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const payload: any = verifyJwt(token);
    // payload should contain userId
    (req as AuthenticatedRequest).userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
