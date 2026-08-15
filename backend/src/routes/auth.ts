import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT = 5;

const loginRateLimit = (req: Request, res: Response, next: () => void): void => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const current = loginAttempts.get(key);
  const attempt = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + LOGIN_WINDOW_MS }
    : current;
  attempt.count += 1;
  loginAttempts.set(key, attempt);
  if (attempt.count > LOGIN_LIMIT) {
    res.setHeader('Retry-After', Math.ceil((attempt.resetAt - now) / 1000));
    res.status(429).json({ error: 'Trop de tentatives. Réessayez plus tard.' });
    return;
  }
  next();
};

// POST /api/auth/login
router.post('/login', loginRateLimit, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      res.status(400).json({ error: 'Email et mot de passe requis' });
      return;
    }

    // Find admin by email
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !admin) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      return;
    }

    // Compare passwords
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      return;
    }

    loginAttempts.delete(req.ip || 'unknown');

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ error: 'Configuration serveur manquante' });
      return;
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: { id: admin.id, email: admin.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/me - Verify token
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    admin: { id: req.adminId, email: req.adminEmail }
  });
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' });
      return;
    }
    if (typeof newPassword !== 'string' || newPassword.length < 12) {
      res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 12 caractères' });
      return;
    }

    // Get current admin
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', req.adminId)
      .single();

    if (error || !admin) {
      res.status(404).json({ error: 'Admin non trouvé' });
      return;
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      return;
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password_hash: newHash })
      .eq('id', req.adminId);

    if (updateError) {
      throw updateError;
    }

    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
