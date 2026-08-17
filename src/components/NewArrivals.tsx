import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AddToCartHandler, Product } from '../types';
import ProductCard from './ProductCard';
import './NewArrivals.css';

interface NewArrivalsProps {
  products: Product[];
  status?: 'loading' | 'ready' | 'error';
  onAddToCart: AddToCartHandler;
  variant?: 'compact' | 'catalog';
  initialTab?: TabKey;
}

type TabKey = 'all' | 'phone' | 'accessory';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'phone', label: 'Téléphones' },
  { key: 'accessory', label: 'Accessoires' },
];

const REFERENCE_PRODUCT_ORDER = [
  'iphone 13 pro',
  'iphone 13 pro max',
  'iphone 15 normal',
  'samsung s23 ultra',
  'apple magsafe original',
];

export default function NewArrivals({
  products,
  status = 'ready',
  onAddToCart,
  variant = 'compact',
  initialTab = 'all',
}: NewArrivalsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('all');
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const brandMenuRef = useRef<HTMLDivElement>(null);
  const brandMenuId = useId();
  const reduceMotion = useReducedMotion();

  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand).filter(Boolean))].sort(),
    [products]
  );

  useEffect(() => {
    if (!isBrandMenuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!brandMenuRef.current?.contains(event.target as Node)) {
        setIsBrandMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsBrandMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isBrandMenuOpen]);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = products
      .filter((product) => activeTab === 'all' || product.category === activeTab)
      .filter((product) => brand === 'all' || product.brand === brand)
      .filter((product) => `${product.name} ${product.brand}`.toLowerCase().includes(normalizedQuery))
      .slice()
      .sort((a, b) => {
        const aRank = REFERENCE_PRODUCT_ORDER.indexOf(a.name.trim().toLowerCase());
        const bRank = REFERENCE_PRODUCT_ORDER.indexOf(b.name.trim().toLowerCase());
        const normalizedARank = aRank === -1 ? REFERENCE_PRODUCT_ORDER.length : aRank;
        const normalizedBRank = bRank === -1 ? REFERENCE_PRODUCT_ORDER.length : bRank;
        if (normalizedARank !== normalizedBRank) return normalizedARank - normalizedBRank;
        return (
          Number(b.is_featured) - Number(a.is_featured) ||
          (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      });
    return variant === 'compact' ? filtered.slice(0, 5) : filtered;
  }, [products, activeTab, brand, query, variant]);

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <section className={`new-arrivals new-arrivals-${variant}`} id="nouveautes">
      <div className="new-arrivals-heading">
        <motion.h1
          className="section-title"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={transition}
        >
          Nouveautés
        </motion.h1>
        {variant === 'compact' && (
          <Link className="new-arrivals-see-all" to="/catalog" aria-label="Voir toutes les nouveautés">
            <span>Voir tout</span><ChevronRight size={24} />
          </Link>
        )}
      </div>

      {variant === 'catalog' && (
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <Search size={21} strokeWidth={1.7} aria-hidden="true" />
            <span className="sr-only">Rechercher un produit</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un produit"
            />
          </label>

          <div className="new-arrivals-tabs" role="tablist" aria-label="Filtrer les nouveautés">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`new-arrivals-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.key);
                  setBrand('all');
                  setIsBrandMenuOpen(false);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="catalog-brand-select" ref={brandMenuRef}>
            <button
              type="button"
              className={`catalog-brand-trigger ${isBrandMenuOpen ? 'open' : ''}`}
              aria-haspopup="listbox"
              aria-expanded={isBrandMenuOpen}
              aria-controls={brandMenuId}
              onClick={() => setIsBrandMenuOpen((current) => !current)}
            >
              <span>{brand === 'all' ? 'Toutes les marques' : brand}</span>
              <ChevronDown size={19} strokeWidth={2} aria-hidden="true" />
            </button>

            <AnimatePresence>
              {isBrandMenuOpen && (
                <motion.div
                  id={brandMenuId}
                  className="catalog-brand-menu"
                  role="listbox"
                  aria-label="Filtrer par marque"
                  initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: reduceMotion ? 0 : 0.16, ease: 'easeOut' }}
                >
                  {['all', ...brands].map((item) => {
                    const isSelected = brand === item;
                    const label = item === 'all' ? 'Toutes les marques' : item;
                    return (
                      <button
                        key={item}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={isSelected ? 'selected' : ''}
                        onClick={() => {
                          setBrand(item);
                          setIsBrandMenuOpen(false);
                        }}
                      >
                        <span>{label}</span>
                        {isSelected && <Check size={18} strokeWidth={2.2} aria-hidden="true" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {status === 'loading' ? (
        <div className="catalog-status" role="status">Chargement du catalogue…</div>
      ) : status === 'error' ? (
        <div className="catalog-status catalog-status-error" role="alert">
          Le catalogue est momentanément indisponible.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${brand}-${query}-${variant}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={transition}
          >
            {visibleProducts.length > 0 ? (
              <div className="new-arrivals-grid">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    variant={variant}
                  />
                ))}
              </div>
            ) : (
              <p className="new-arrivals-empty">Aucun produit ne correspond à votre recherche.</p>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
