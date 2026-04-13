import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import type { CartItem } from '../types';
import './CartModal.css';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-MA')} DH`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="cart-modal"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="cart-header">
              <div className="cart-header-content">
                <ShoppingBag size={28} />
                <h2>Votre Panier</h2>
              </div>
              <motion.button
                className="close-btn"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={28} />
              </motion.button>
            </div>

            <div className="cart-items">
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingBag size={64} />
                  <p>Votre panier est vide</p>
                  <p className="empty-cart-subtitle">Ajoutez des produits pour commencer!</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    key={item.product.id}
                    className="cart-item"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <img
                      src={item.product.images?.[0] || item.product.image || ''}
                      alt={item.product.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-info">
                      <h4>{item.product.name}</h4>
                      <p className="cart-item-price">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="quantity-controls">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            onUpdateQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          <Minus size={16} />
                        </motion.button>
                        <span className="quantity">{item.quantity}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            onUpdateQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          <Plus size={16} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <div className="cart-item-total">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                      <motion.button
                        className="remove-btn"
                        onClick={() => onRemoveItem(item.product.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span className="total-amount">{formatPrice(total)}</span>
                </div>
                <motion.button
                  className="checkout-btn"
                  onClick={onCheckout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Commander Maintenant
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
