import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '../types';
import ProductModal from './ProductModal';
import { formatPrice, getBadges, getOriginalPrice } from '../utils/display';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const CATEGORY_LABELS: Record<Product['category'], string> = {
  phone: 'Téléphone',
  accessory: 'Accessoire',
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const badges = getBadges(product);
  const originalPrice = getOriginalPrice(product);
  const image = product.images?.[0] || product.image || '';

  return (
    <>
      <article
        className="product-card"
        onClick={() => setIsModalOpen(true)}
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
          </div>

          <button
            type="button"
            className="product-card-quickadd"
            aria-label={`Ajouter ${product.name} au panier`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            <ShoppingBag size={17} strokeWidth={1.5} />
          </button>
        </div>
      </article>

      {isModalOpen && (
        <ProductModal
          product={product}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToCart={onAddToCart}
        />
      )}
    </>
  );
};

export default ProductCard;
