import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { AddToCartHandler, Product } from '../types';
import ProductModal from './ProductModal';
import { formatPrice, getAvailableColors, getBadges, getOriginalPrice } from '../utils/display';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAddToCart: AddToCartHandler;
}

const CATEGORY_LABELS: Record<Product['category'], string> = {
  phone: 'Téléphone',
  accessory: 'Accessoire',
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const badges = getBadges(product);
  const originalPrice = getOriginalPrice(product);
  const image = product.images?.[0] || product.image || '';
  const availableColors = getAvailableColors(product);
  const openProduct = () => setIsModalOpen(true);

  return (
    <>
      <motion.article
        className="product-card"
        onClick={openProduct}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openProduct();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Voir ${product.name}`}
        whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      >
        <div className="product-card-media">
          {badges.length > 0 && (
            <div className="product-card-badges">
              {badges.map((badge) => (
                <span key={badge.label} className={`product-badge badge-${badge.variant}`}>
                  {badge.label}
                </span>
              ))}
            </div>
          )}
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="product-card-image"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="product-card-image-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="product-card-info">
          <div className="product-card-text">
            <span className="product-card-category">
              {product.brand || CATEGORY_LABELS[product.category]}
            </span>
            <h3 className="product-card-name">{product.name}</h3>
            <div className="product-card-prices">
              <span className="product-card-price">{formatPrice(product.price)}</span>
              {originalPrice && (
                <span className="product-card-price-original">{formatPrice(originalPrice)}</span>
              )}
            </div>
            <div className="product-card-meta">
              {availableColors.length > 0 && (
                <span className="product-card-swatches" aria-label={`${availableColors.length} coloris disponibles`}>
                  {availableColors.slice(0, 4).map((color) => (
                    <span key={color.name} style={{ backgroundColor: color.hex }} title={color.name} />
                  ))}
                  {availableColors.length > 4 && <small>+{availableColors.length - 4}</small>}
                </span>
              )}
              <span className={`product-card-stock ${product.stock > 0 ? '' : 'out'}`}>
                {product.stock > 0 ? 'En stock' : 'Épuisé'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="product-card-quickadd"
            aria-label={`Ajouter ${product.name} au panier`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, availableColors[0]);
            }}
            disabled={product.stock <= 0 || (product.colors?.length ? availableColors.length === 0 : false)}
          >
            <ShoppingBag size={17} strokeWidth={1.5} />
          </button>
        </div>
      </motion.article>

      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

export default ProductCard;
