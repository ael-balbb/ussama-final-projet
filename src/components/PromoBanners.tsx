import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Pack, Product } from '../types';
import ProductModal from './ProductModal';
import { formatPrice } from '../utils/display';
import './PromoBanners.css';

interface PromoBannersProps {
  packs: Pack[];
  onAddToCart: (product: Product) => void;
}

const packToProduct = (pack: Pack): Product => ({
  id: pack.id,
  name: pack.name,
  price: pack.price,
  images: pack.image ? [pack.image] : [],
  image: pack.image || '',
  description: pack.description || pack.name,
  category: 'accessory',
  brand: 'Promo',
  stock: pack.stock > 0 ? pack.stock : 10,
});

const PromoBannerCard: React.FC<{
  pack: Pack;
  index: number;
  onAddToCart: (product: Product) => void;
}> = ({ pack, index, onAddToCart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const product = packToProduct(pack);

  const openModal = () => setIsModalOpen(true);

  return (
    <>
      <motion.div
        className={`promo-banner ${pack.color === 'dark' ? 'promo-banner-dark' : ''}`}
        role="button"
        tabIndex={0}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: index * 0.12 }}
        onClick={openModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
          }
        }}
      >
        <div
          className="promo-banner-bg"
          style={{ backgroundImage: `url(${pack.image})` }}
          aria-hidden="true"
        />
        <div className="promo-banner-overlay" aria-hidden="true" />
        <div className="promo-banner-content">
          <span className="promo-banner-eyebrow">L'offre du moment</span>
          <h3 className="promo-banner-title">{pack.name}</h3>
          <p className="promo-banner-price">Prix spécial : {formatPrice(pack.price)}</p>
          <button
            type="button"
            className="promo-banner-cta"
            onClick={(e) => {
              e.stopPropagation();
              openModal();
            }}
          >
            Acheter maintenant
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>

      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

const PromoBanners: React.FC<PromoBannersProps> = ({ packs, onAddToCart }) => {
  if (packs.length === 0) return null;

  return (
    <section className="promo-banners">
      <div className="promo-banners-grid">
        {packs.slice(0, 2).map((pack, index) => (
          <PromoBannerCard
            key={pack.id}
            pack={pack}
            index={index}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
};

export default PromoBanners;
