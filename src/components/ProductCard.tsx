import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../types';
import ProductModal from './ProductModal';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '0 DH';
    return `${price.toLocaleString('fr-MA')} DH`;
  };

  return (
    <>
    <motion.div
      className="product-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      onClick={() => setIsModalOpen(true)}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-image-wrapper">
        <img src={product.images?.[0] || product.image || ''} alt={product.name} className="product-image" loading="lazy" />
        {product.stock && product.stock < 10 && (
          <motion.div 
            className="stock-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            Stock limité!
          </motion.div>
        )}
      </div>

      <div className="product-info">
        {product.brand && <div className="product-category">{product.brand}</div>}
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} fill="var(--yellow)" color="var(--yellow)" />
          ))}
          <span className="rating-text">4.8</span>
        </div>

        <div className="product-footer">
          <div className="product-price">{formatPrice(product.price)}</div>
          <motion.button
            className="add-to-cart-btn"
            onClick={(e) => {
              e.stopPropagation(); // Prevent opening modal when clicking 'Add' directly
              onAddToCart(product);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart size={20} />
            Ajouter
          </motion.button>
        </div>
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

export default ProductCard;
