import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

const NAV_LINKS = [
  { label: 'Accueil', to: '/' },
  { label: 'Téléphones', to: '/catalog?category=phone' },
  { label: 'Accessoires', to: '/catalog?category=accessory' },
  { label: 'Nouveautés', to: '/catalog' },
];

export default function Header({ cartItemsCount, onCartClick }: HeaderProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    if (to === '/catalog') return location.pathname === '/catalog' && !location.search;
    return `${location.pathname}${location.search}` === to;
  };

  return (
    <motion.header
      className="header"
      initial={reduceMotion ? false : { y: -24 }}
      animate={{ y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 36 }}
    >
      <div className="header-inner">
        <Link to="/" className="header-logo" aria-label="NasriPhone — accueil">
          <strong>Nasri</strong><span>Phone</span>
        </Link>

        <nav className="header-nav" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`header-nav-link ${isActive(link.to) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link to="/catalog" className="header-icon-btn header-search-btn" aria-label="Rechercher">
            <Search size={21} strokeWidth={1.7} />
          </Link>
          <button
            type="button"
            className="header-icon-btn header-cart-btn"
            onClick={onCartClick}
            aria-label={`Panier, ${cartItemsCount} article${cartItemsCount > 1 ? 's' : ''}`}
          >
            <ShoppingBag size={22} strokeWidth={1.7} />
            {cartItemsCount > 0 && (
              <motion.span
                className="cart-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 28 }}
              >
                {cartItemsCount}
              </motion.span>
            )}
          </button>
          <button
            type="button"
            className="header-icon-btn header-menu-btn"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={27} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              className="header-menu-backdrop"
              aria-label="Fermer le menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="header-mobile-nav"
              aria-label="Menu mobile"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 430, damping: 38 }}
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`header-mobile-link ${isActive(link.to) ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
