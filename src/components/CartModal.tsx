import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import type { CartItem } from '../types';
import { getCartItemKey, getCartItemPrice, getVariantStock } from '../utils/cart';
import { formatPrice } from '../utils/display';
import './CartModal.css';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemKey: string, newQuantity: number) => void;
  onRemoveItem: (itemKey: string) => void;
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
    (sum, item) => sum + getCartItemPrice(item) * item.quantity,
    0
  );

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
                type="button"
                className="close-btn"
                onClick={onClose}
                aria-label="Fermer le panier"
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
                    key={getCartItemKey(item)}
                    className="cart-item"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <img
                      src={item.selectedColor?.image || item.product.images?.[0] || item.product.image || ''}
                      alt={item.product.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-info">
                      <h4>{item.product.name}</h4>
                      {item.selectedColor && (
                        <p className="cart-item-color">Coloris : {item.selectedColor.name}</p>
                      )}
                      {item.selectedStorage && (
                        <p className="cart-item-color">Capacité : {item.selectedStorage.capacity}</p>
                      )}
                      <p className="cart-item-price">
                        {formatPrice(getCartItemPrice(item))}
                      </p>
                      <div className="quantity-controls">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Diminuer la quantité de ${item.product.name}`}
                          onClick={() =>
                            onUpdateQuantity(getCartItemKey(item), item.quantity - 1)
                          }
                        >
                          <Minus size={16} />
                        </motion.button>
                        <span className="quantity">{item.quantity}</span>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Augmenter la quantité de ${item.product.name}`}
                          onClick={() =>
                            onUpdateQuantity(getCartItemKey(item), item.quantity + 1)
                          }
                          disabled={item.quantity >= getVariantStock(item.product.stock, item.selectedColor, item.selectedStorage)}
                        >
                          <Plus size={16} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <div className="cart-item-total">
                        {formatPrice(getCartItemPrice(item) * item.quantity)}
                      </div>
                      <motion.button
                        type="button"
                        className="remove-btn"
                        onClick={() => onRemoveItem(getCartItemKey(item))}
                        aria-label={`Retirer ${item.product.name} du panier`}
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
                  type="button"
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
