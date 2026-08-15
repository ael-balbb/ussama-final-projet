import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import type { Product } from '../types';
import ProductCard from './ProductCard';
import './NewArrivals.css';

interface NewArrivalsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
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

const NewArrivals: React.FC<NewArrivalsProps> = ({ products, onAddToCart }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [phoneBrand, setPhoneBrand] = useState<PhoneBrand | null>(null);

  const handleTabClick = (key: TabKey) => {
    setActiveTab(key);
    setPhoneBrand(null);
  };

  // Header nav → open the matching category
  useEffect(() => {
    const applyTab = (tab: TabKey) => {
      setActiveTab(tab);
      setPhoneBrand(null);
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
        if (!phoneBrand) return false;
        return matchesPhoneBrand(p, phoneBrand);
      })
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
  }, [products, activeTab, phoneBrand]);

  const brandCounts = useMemo(() => {
    const phones = products.filter((p) => p.category === 'phone');
    return {
      samsung: phones.filter((p) => matchesPhoneBrand(p, 'samsung')).length,
      iphone: phones.filter((p) => matchesPhoneBrand(p, 'iphone')).length,
    };
  }, [products]);

  if (products.length === 0) return null;

  const showBrandPicker = activeTab === 'phone' && !phoneBrand;

  return (
    <section className="new-arrivals" id="nouveautes">
      <span id="telephones" className="nav-anchor" aria-hidden="true" />
      <span id="accessoires" className="nav-anchor" aria-hidden="true" />

      <motion.h2
        className="section-title centered"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        Nouveautés
      </motion.h2>

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

      <AnimatePresence mode="wait">
        {showBrandPicker ? (
          <motion.div
            key="brand-picker"
            className="phone-brand-picker"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <p className="phone-brand-hint">Choisissez une marque</p>
            <div className="phone-brand-choices">
              {PHONE_BRANDS.map((brand) => (
                <button
                  key={brand.key}
                  type="button"
                  className="phone-brand-choice"
                  onClick={() => setPhoneBrand(brand.key)}
                >
                  <img
                    className="phone-brand-image"
                    src={brand.image}
                    alt={brand.label}
                  />
                  <span className="phone-brand-meta">
                    <span className="phone-brand-name">{brand.label}</span>
                    <span className="phone-brand-count">
                      {brandCounts[brand.key]} modèle{brandCounts[brand.key] > 1 ? 's' : ''}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${activeTab}-${phoneBrand || 'all'}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'phone' && phoneBrand && (
              <div className="phone-brand-bar">
                <button
                  type="button"
                  className="phone-brand-back"
                  onClick={() => setPhoneBrand(null)}
                >
                  <ChevronLeft size={16} strokeWidth={1.75} />
                  Marques
                </button>
                <div className="phone-brand-pills">
                  {PHONE_BRANDS.map((brand) => (
                    <button
                      key={brand.key}
                      type="button"
                      className={`phone-brand-pill ${phoneBrand === brand.key ? 'active' : ''}`}
                      onClick={() => setPhoneBrand(brand.key)}
                    >
                      {brand.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
        )}
      </AnimatePresence>
    </section>
  );
};

export default NewArrivals;
