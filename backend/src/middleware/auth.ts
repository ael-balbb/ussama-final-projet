import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  adminId?: string;
  adminEmail?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token manquant ou invalide' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      res.status(500).json({ error: 'Configuration serveur manquante' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string };
    req.adminId = decoded.id;
    req.adminEmail = decoded.email;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide ou expiré' });
    return;
  }
};
