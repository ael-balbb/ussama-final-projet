import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import './Header.css';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header 
      className="header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container header-content">
        <motion.div 
          className="logo-container"
          whileHover={{ scale: 1.05 }}
        >
          <img 
            src="/logo.jpg" 
            alt="Nasri Phone Logo" 
            className="logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.add('show-fallback');
            }}
          />
          <div className="fallback-logo">NP</div>
          <div className="logo-text">
            <h1>NASRI PHONE</h1>
          </div>
        </motion.div>

        <div className="header-actions">
          <motion.button
            className="theme-toggle-button"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>

          <motion.button
            className="cart-button"
            onClick={onCartClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && (
              <motion.span 
                className="cart-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {cartItemsCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
