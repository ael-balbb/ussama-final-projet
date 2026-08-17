import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, Heart } from 'lucide-react';
import type { AddToCartHandler, Product } from '../types';
import ProductModal from './ProductModal';
import {
  formatPrice,
  getAvailableColors,
  getBadges,
  getOriginalPrice,
  getStorageVariants,
} from '../utils/display';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAddToCart: AddToCartHandler;
  variant?: 'compact' | 'catalog';
}

export default function ProductCard({ product, onAddToCart, variant = 'compact' }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const reduceMotion = useReducedMotion();
  const badges = getBadges(product);
  const storageVariants = getStorageVariants(product);
  const defaultStorage = storageVariants.find((storage) => storage.available !== false) || storageVariants[0];
  const displayedPrice = defaultStorage?.price ?? product.price;
  const originalPrice = getOriginalPrice(product, defaultStorage);
  const availableColors = getAvailableColors(product);
  const image = availableColors[0]?.image || product.images?.[0] || product.image || '';
  const displayedStock = defaultStorage?.stock ?? product.stock;
  const lowStock = displayedStock > 0 && displayedStock <= 3;

  return (
    <>
      <motion.article
        className={`product-card product-card-${variant}`}
        whileHover={reduceMotion ? undefined : { y: -3 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      >
        <button
          type="button"
          className="product-card-open"
          onClick={() => setIsModalOpen(true)}
          aria-label={`Voir ${product.name}`}
        >
          <div className="product-card-media">
            {badges.length > 0 && (
              <div className="product-card-badges">
                {badges.slice(0, 1).map((badge) => (
                  <span key={badge.label} className={`product-badge badge-${badge.variant}`}>
                    {badge.label}
                  </span>
                ))}
              </div>
            )}
            {image ? (
              <img src={image} alt="" className="product-card-image" loading="lazy" decoding="async" />
            ) : (
              <div className="product-card-image-placeholder" aria-hidden="true" />
            )}
          </div>

          <div className="product-card-info">
            <h2 className="product-card-name">{product.name}</h2>
            {storageVariants.length > 0 ? (
              <span className="product-card-capacities" aria-label="Capacités disponibles">
                {storageVariants.slice(0, 4).map((storage) => storage.capacity).join(' · ')}
              </span>
            ) : (
              <span className="product-card-subtitle">{product.brand}</span>
            )}
            {availableColors.length > 0 && (
              <span className="product-card-swatches" aria-label={`${availableColors.length} coloris disponibles`}>
                {availableColors.slice(0, 4).map((color, index) => (
                  <span
                    key={`${color.name}-${index}`}
                    className={index === 0 ? 'selected' : ''}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </span>
            )}
            <span className={`product-card-stock ${displayedStock <= 0 ? 'out' : lowStock ? 'low' : ''}`}>
              <i aria-hidden="true" />
              {displayedStock <= 0 ? 'Épuisé' : lowStock ? `Plus que ${displayedStock} en stock` : 'En stock'}
            </span>
            <span className="product-card-prices">
              {storageVariants.length > 1 && <small>À partir de</small>}
              <strong>{formatPrice(displayedPrice)}</strong>
              {originalPrice && <del>{formatPrice(originalPrice)}</del>}
            </span>
          </div>
        </button>

        <button
          type="button"
          className={`product-card-favorite ${favorite ? 'active' : ''}`}
          onClick={() => setFavorite((current) => !current)}
          aria-label={favorite ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
          aria-pressed={favorite}
        >
          <Heart size={19} strokeWidth={1.6} fill={favorite ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          className="product-card-quickview"
          onClick={() => setIsModalOpen(true)}
          aria-label={`Aperçu de ${product.name}`}
        >
          <Eye size={18} strokeWidth={1.6} />
        </button>
      </motion.article>

      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
}
