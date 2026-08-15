import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

type NavFilter = 'all' | 'phone' | 'accessory' | null;

const NAV_LINKS: { label: string; href: string; filter: NavFilter }[] = [
  { label: 'Accueil', href: '#accueil', filter: null },
  { label: 'Téléphones', href: '#telephones', filter: 'phone' },
  { label: 'Accessoires', href: '#accessoires', filter: 'accessory' },
  { label: 'Nouveautés', href: '#nouveautes', filter: 'all' },
];

const scrollToSection = (href: string) => {
  const id = href.replace('#', '');
  const target =
    document.getElementById(id) ||
    (id === 'telephones' || id === 'accessoires'
      ? document.getElementById('nouveautes')
      : null);
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    filter: NavFilter
  ) => {
    e.preventDefault();
    setMenuOpen(false);

    if (filter) {
      window.dispatchEvent(
        new CustomEvent('catalog-filter', { detail: { tab: filter } })
      );
      window.history.replaceState(null, '', href);
      // Wait a tick so the mobile drawer can close before scrolling
      requestAnimationFrame(() => scrollToSection(href));
      return;
    }

    window.history.replaceState(null, '', href);
    requestAnimationFrame(() => scrollToSection(href));
  };

  return (
    <motion.header
      className="header"
      initial={reduceMotion ? false : { y: -44 }}
      animate={{ y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 34 }}
    >
      <div className="header-inner">
        <a
          href="#accueil"
          className="header-logo"
          onClick={(e) => handleNavClick(e, '#accueil', null)}
        >
          Nasri<span className="header-logo-accent">Phone</span>
        </a>

        <nav className="header-nav" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="header-nav-link"
              onClick={(e) => handleNavClick(e, link.href, link.filter)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a
            href="#nouveautes"
            className="header-icon-btn"
            aria-label="Rechercher"
            onClick={(e) => handleNavClick(e, '#nouveautes', 'all')}
          >
            <Search size={16} strokeWidth={1.5} />
          </a>
          <button
            type="button"
            className="header-icon-btn header-cart-btn"
            onClick={onCartClick}
            aria-label="Panier"
          >
            <ShoppingBag size={16} strokeWidth={1.5} />
            {cartItemsCount > 0 && (
              <motion.span
                className="cart-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 28 }}
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
            {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="header-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="header-mobile-nav"
              aria-label="Menu mobile"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 430, damping: 38 }}
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="header-mobile-link"
                  onClick={(e) => handleNavClick(e, link.href, link.filter)}
                >
                  {link.label}
                </a>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
