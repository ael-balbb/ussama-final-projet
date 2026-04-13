import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../types';
import './ProductModal.css';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = (product.images && product.images.length > 0) 
    ? product.images 
    : (product.image ? [product.image] : []);

  if (!isOpen) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '0 DH';
    return `${price.toLocaleString('fr-MA')} DH`;
  };

  return (
    <AnimatePresence>
      <motion.div
        className="product-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="product-modal-content"
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="product-modal-close" onClick={onClose}>
            <X size={24} />
          </button>

          <div className="product-modal-grid">
            <div className="product-modal-gallery">
              <div className="main-image-container">
                <button className="slider-btn left" onClick={prevImage}>
                  <ChevronLeft size={24} />
                </button>
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={`${product.name} - ${currentImageIndex + 1}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="main-image"
                />
                <button className="slider-btn right" onClick={nextImage}>
                  <ChevronRight size={24} />
                </button>
              </div>
              
              <div className="thumbnail-container">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>

            <div className="product-modal-info">
              {product.brand && <div className="product-category">{product.brand}</div>}
              <h2 className="product-modal-title">{product.name}</h2>
              
              <div className="product-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--yellow)" color="var(--yellow)" />
                ))}
                <span className="rating-text">4.8</span>
              </div>
              
              <div className="product-modal-price">{formatPrice(product.price)}</div>
              
              <div className="product-modal-description">
                <h3>Description</h3>
                <p>{product.description}</p>
                <br/>
                <p>Découvrez ce magnifique produit de notre catalogue. Idéal pour vos besoins quotidiens avec un excellent rapport qualité-prix. Profitez de notre garantie sur chaque achat.</p>
              </div>

              <div className="product-modal-features">
                 <ul>
                    <li>✅ Stock disponible : {product.stock}</li>
                    <li>✅ Livraison partout au Maroc</li>
                    <li>✅ Paiement à la livraison</li>
                 </ul>
              </div>

              <motion.button
                className="add-to-cart-btn modal-add-btn"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart size={20} />
                Ajouter au Panier
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductModal;