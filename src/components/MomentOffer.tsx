import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { AddToCartHandler, Pack, Product } from '../types';
import ProductModal from './ProductModal';
import { formatPrice, getOriginalPrice } from '../utils/display';
import './MomentOffer.css';

interface MomentOfferProps {
  pack?: Pack;
  onAddToCart: AddToCartHandler;
}

const packToProduct = (pack: Pack): Product => {
  const presentationImage = pack.name.trim().toLowerCase() === 'pack apple gold'
    ? '/pack-apple-gold.png'
    : pack.image;

  return {
    id: pack.id,
    source: 'pack',
    name: pack.name,
    price: pack.price,
    compare_at_price: pack.compare_at_price,
    promo_label: pack.promo_label,
    images: presentationImage ? [presentationImage] : [],
    image: presentationImage || '',
    description: pack.description || pack.name,
    category: 'accessory',
    brand: 'Promo',
    stock: pack.stock,
  };
};

const MomentOffer: React.FC<MomentOfferProps> = ({ pack, onAddToCart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const product = useMemo(() => (pack ? packToProduct(pack) : null), [pack]);

  const openModal = () => setIsModalOpen(true);

  if (!product) return null;
  const originalPrice = getOriginalPrice(product);

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
        <div className="moment-offer-visual">
          {product.image ? <img src={product.image} alt="" /> : null}
        </div>
        <div className="moment-offer-content">
          <span className="moment-offer-eyebrow">L'offre du moment</span>
          <h2 className="moment-offer-title">{product.name}</h2>
          <p className="moment-offer-description">{product.description}</p>
          <p className="moment-offer-price">
            <strong>{formatPrice(product.price)}</strong>
            {originalPrice && <del>{formatPrice(originalPrice)}</del>}
          </p>
        </div>
        <div className="moment-offer-action-wrap">
          <button
            type="button"
            className="moment-offer-cta"
            onClick={(e) => {
              e.stopPropagation();
              openModal();
            }}
          >
            Découvrir le pack
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
