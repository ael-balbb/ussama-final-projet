import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import { loginAdmin } from '../utils/api';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await loginAdmin(email, password);
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_email', data.admin.email);
      navigate('/admin');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="admin-login-header">
          <motion.div
            className="admin-shield-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Shield size={40} />
          </motion.div>
          <h1>Admin Panel</h1>
          <p>Nasri Phone Store</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <motion.div
              className="admin-login-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div className="admin-input-group">
            <Mail size={18} className="admin-input-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
            />
          </div>

          <div className="admin-input-group">
            <Lock size={18} className="admin-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="admin-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <motion.button
            type="submit"
            className="admin-login-btn"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="admin-login-spinner"></div>
            ) : (
              'Se Connecter'
            )}
          </motion.button>
        </form>

        <div className="admin-login-footer">
          <button onClick={() => navigate('/')} className="admin-back-link">
            ← Retour à la boutique
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
