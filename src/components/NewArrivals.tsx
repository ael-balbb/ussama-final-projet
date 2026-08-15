import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search } from 'lucide-react';
import type { AddToCartHandler, Product } from '../types';
import ProductCard from './ProductCard';
import './NewArrivals.css';

interface NewArrivalsProps {
  products: Product[];
  status?: 'loading' | 'ready' | 'error';
  onAddToCart: AddToCartHandler;
}

type TabKey = 'all' | 'phone' | 'accessory';
type PhoneBrand = 'samsung' | 'iphone';

const TABS: { key: TabKey; label: string; shortLabel: string }[] = [
  { key: 'all', label: 'Tous les produits', shortLabel: 'Tous' },
  { key: 'phone', label: 'Téléphones', shortLabel: 'Téléphones' },
  { key: 'accessory', label: 'Accessoires', shortLabel: 'Accessoires' },
];

const PHONE_BRANDS: {
  key: PhoneBrand;
  label: string;
  image: string;
}[] = [
  { key: 'samsung', label: 'Samsung', image: '/brand-samsung.png?v=2' },
  { key: 'iphone', label: 'iPhone', image: '/brand-iphone.png?v=2' },
];

const matchesPhoneBrand = (product: Product, brand: PhoneBrand): boolean => {
  const hay = `${product.brand} ${product.name}`.toLowerCase();
  if (brand === 'samsung') {
    return hay.includes('samsung') || hay.includes('galaxy');
  }
  return hay.includes('apple') || hay.includes('iphone');
};

const tabFromHash = (hash: string): TabKey | null => {
  const value = hash.replace('#', '').toLowerCase();
  if (value === 'telephones') return 'phone';
  if (value === 'accessoires') return 'accessory';
  if (value === 'nouveautes') return 'all';
  return null;
};

const NewArrivals: React.FC<NewArrivalsProps> = ({ products, status = 'ready', onAddToCart }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [phoneBrand, setPhoneBrand] = useState<PhoneBrand | 'all'>('all');
  const [query, setQuery] = useState('');
  const reduceMotion = useReducedMotion();
  const springTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 280, damping: 28 };

  const handleTabClick = (key: TabKey) => {
    setActiveTab(key);
    setPhoneBrand('all');
  };

  // Header nav → open the matching category
  useEffect(() => {
    const applyTab = (tab: TabKey) => {
      setActiveTab(tab);
      setPhoneBrand('all');
    };

    const onCatalogFilter = (event: Event) => {
      const detail = (event as CustomEvent<{ tab: TabKey }>).detail;
      if (detail?.tab) applyTab(detail.tab);
    };

    const onHashChange = () => {
      const tab = tabFromHash(window.location.hash);
      if (tab) applyTab(tab);
    };

    const initial = tabFromHash(window.location.hash);
    if (initial) applyTab(initial);

    window.addEventListener('catalog-filter', onCatalogFilter);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('catalog-filter', onCatalogFilter);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const visibleProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'accessory') return p.category === 'accessory';
        if (p.category !== 'phone') return false;
        return phoneBrand === 'all' || matchesPhoneBrand(p, phoneBrand);
      })
      .filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(query.trim().toLowerCase()))
      .slice()
      .sort(
        (a, b) => (Number(b.is_featured) - Number(a.is_featured)) ||
          ((a.sort_order ?? 0) - (b.sort_order ?? 0)) ||
          (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      );
  }, [products, activeTab, phoneBrand, query]);

  const brandCounts = useMemo(() => {
    const phones = products.filter((p) => p.category === 'phone');
    return {
      samsung: phones.filter((p) => matchesPhoneBrand(p, 'samsung')).length,
      iphone: phones.filter((p) => matchesPhoneBrand(p, 'iphone')).length,
    };
  }, [products]);

  return (
    <section className="new-arrivals" id="nouveautes">
      <span id="telephones" className="nav-anchor" aria-hidden="true" />
      <span id="accessoires" className="nav-anchor" aria-hidden="true" />

      <motion.h2
        className="section-title centered"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={springTransition}
      >
        Nos produits
      </motion.h2>

      <p className="new-arrivals-intro">
        Des appareils et accessoires sélectionnés avec soin, avec des prix et disponibilités
        synchronisés depuis notre catalogue.
      </p>

      <label className="catalog-search">
        <Search size={18} strokeWidth={1.5} aria-hidden="true" />
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
            onClick={() => handleTabClick(tab.key)}
          >
            <span className="tab-label-full">{tab.label}</span>
            <span className="tab-label-short">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {activeTab === 'phone' && (
        <div className="phone-brand-bar" aria-label="Filtrer par marque">
          <div className="phone-brand-pills">
            <button
              type="button"
              className={`phone-brand-pill ${phoneBrand === 'all' ? 'active' : ''}`}
              onClick={() => setPhoneBrand('all')}
            >
              Toutes
            </button>
            {PHONE_BRANDS.map((brand) => (
              <button
                key={brand.key}
                type="button"
                className={`phone-brand-pill ${phoneBrand === brand.key ? 'active' : ''}`}
                onClick={() => setPhoneBrand(brand.key)}
              >
                {brand.label} · {brandCounts[brand.key]}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === 'loading' ? (
        <div className="catalog-status" role="status">Chargement du catalogue…</div>
      ) : status === 'error' ? (
        <div className="catalog-status catalog-status-error" role="alert">
          Le catalogue est momentanément indisponible. Réessayez dans quelques instants.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`grid-${activeTab}-${phoneBrand || 'all'}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={springTransition}
          >
            {visibleProducts.length > 0 ? (
              <div className="new-arrivals-grid">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                ))}
              </div>
            ) : (
              <p className="new-arrivals-empty">Aucun produit dans cette catégorie pour le moment.</p>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
};

export default NewArrivals;
