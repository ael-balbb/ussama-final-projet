import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { AddToCartHandler, Pack, Product } from '../types';
import ProductModal from './ProductModal';
import { formatPrice } from '../utils/display';
import './MomentOffer.css';

interface MomentOfferProps {
  pack?: Pack;
  onAddToCart: AddToCartHandler;
}

const packToProduct = (pack: Pack): Product => ({
  id: pack.id,
  source: 'pack',
  name: pack.name,
  price: pack.price,
  compare_at_price: pack.compare_at_price,
  promo_label: pack.promo_label,
  images: pack.image ? [pack.image] : [],
  image: pack.image || '',
  description: pack.description || pack.name,
  category: 'accessory',
  brand: 'Promo',
  stock: pack.stock,
});

const MomentOffer: React.FC<MomentOfferProps> = ({ pack, onAddToCart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const product = useMemo(() => (pack ? packToProduct(pack) : null), [pack]);

  const openModal = () => setIsModalOpen(true);

  if (!product) return null;

  return (
    <section className="moment-offer" id="offres" aria-label="Offre du moment">
      <motion.article
        className="moment-offer-banner"
        role="button"
        tabIndex={0}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        onClick={openModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
          }
        }}
      >
        {product.image ? (
          <div
            className="moment-offer-bg"
            style={{ backgroundImage: `url(${product.image})` }}
            aria-hidden="true"
          />
        ) : (
          <div className="moment-offer-bg moment-offer-bg-fallback" aria-hidden="true" />
        )}
        <div className="moment-offer-overlay" aria-hidden="true" />
        <div className="moment-offer-content">
          <span className="moment-offer-eyebrow">L'offre du moment</span>
          <h2 className="moment-offer-title">{product.name}</h2>
          <p className="moment-offer-price">Prix spécial : {formatPrice(product.price)}</p>
          <button
            type="button"
            className="moment-offer-cta"
            onClick={(e) => {
              e.stopPropagation();
              openModal();
            }}
          >
            Acheter maintenant
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </motion.article>

      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={onAddToCart}
      />
    </section>
  );
};

export default MomentOffer;
