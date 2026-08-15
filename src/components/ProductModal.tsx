import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  Banknote,
  ImageOff,
} from 'lucide-react';
import type { AddToCartHandler, Product } from '../types';
import { formatPrice, getAvailableColors, getOriginalPrice } from '../utils/display';
import { getVariantStock } from '../utils/cart';
import './ProductModal.css';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: AddToCartHandler;
}

const CATEGORY_LABELS: Record<Product['category'], string> = {
  phone: 'Téléphone',
  accessory: 'Accessoire',
};

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const resetTimerRef = useRef<number | null>(null);

  const colors = getAvailableColors(product).filter((color) => color?.name);

  const galleryImages = (
    product.images?.length
      ? product.images
      : product.image
        ? [product.image]
        : []
  ).filter((url): url is string => Boolean(url && String(url).trim()));

  const images = colors.length > 0
    ? colors.map((color) => color.image || galleryImages[0] || '')
    : galleryImages;
  const originalPrice = getOriginalPrice(product);

  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const { body, documentElement } = document;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
      scrollBehavior: documentElement.style.scrollBehavior,
    };
    const scrollbar = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      documentElement.style.scrollBehavior = 'auto';
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.paddingRight = previous.paddingRight;
      window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' });
      requestAnimationFrame(() => {
        documentElement.style.scrollBehavior = previous.scrollBehavior;
      });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      window.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  const handleClose = () => {
    onClose();
    resetTimerRef.current = window.setTimeout(() => {
      setCurrentImageIndex(0);
      setSelectedColor(0);
      setQuantity(1);
      setOpenAccordion(null);
      setBrokenImages({});
      resetTimerRef.current = null;
    }, reduceMotion ? 0 : 240);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    if (colors.length > 0) setSelectedColor(index);
  };

  const nextImage = () =>
    goToImage(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1);
  const prevImage = () =>
    goToImage(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1);

  const selectColor = (index: number) => {
    setSelectedColor(index);
    setCurrentImageIndex(index);
  };

  const markBroken = (index: number) => {
    setBrokenImages((prev) => ({ ...prev, [index]: true }));
  };

  const currentBroken = brokenImages[currentImageIndex];

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  const handleAddToCart = () => {
    onAddToCart(product, colors[selectedColor], quantity);
    handleClose();
  };

  const selectedStock = getVariantStock(product.stock, colors[selectedColor]);

  const accordions = [
    {
      key: 'details',
      title: 'Détails',
      content: (
        <ul className="modal-details-list">
          {product.brand && <li>Marque : {product.brand}</li>}
          <li>Catégorie : {CATEGORY_LABELS[product.category]}</li>
          <li>Stock disponible : {product.stock}</li>
          <li>Paiement à la livraison</li>
        </ul>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      content: <p>{product.description || 'Aucune description disponible pour ce produit.'}</p>,
    },
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
      <motion.div
        ref={panelRef}
        className="quickview-backdrop"
        onClick={handleClose}
        role="presentation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
      >
      <motion.div
        className="quickview-panel"
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        onClick={(e) => e.stopPropagation()}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 48 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 48 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 38 }}
      >
        <motion.button
          ref={closeButtonRef}
          type="button"
          className="quickview-close"
          onClick={handleClose}
          aria-label="Fermer"
          whileTap={reduceMotion ? undefined : { scale: 0.9 }}
        >
          <X size={17} strokeWidth={1.5} />
        </motion.button>

        <div className="quickview-gallery">
          <div className="quickview-main-image">
            {images.length > 1 && (
              <button
                type="button"
                className="quickview-slider-btn left"
                onClick={prevImage}
                aria-label="Image précédente"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
            )}
            {images[currentImageIndex] && !currentBroken ? (
              <img
                key={`${product.id}-${currentImageIndex}`}
                src={images[currentImageIndex]}
                alt={`${product.name} — vue ${currentImageIndex + 1}`}
                onError={() => markBroken(currentImageIndex)}
                draggable={false}
              />
            ) : (
              <div className="quickview-image-fallback">
                <ImageOff size={28} strokeWidth={1.5} />
                <span>Image indisponible</span>
              </div>
            )}
            {images.length > 1 && (
              <button
                type="button"
                className="quickview-slider-btn right"
                onClick={nextImage}
                aria-label="Image suivante"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="quickview-thumbnails">
              {images.map((img, index) => (
                <button
                  key={index}
                  className={`quickview-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => goToImage(index)}
                  aria-label={`Voir l'image ${index + 1}`}
                  type="button"
                >
                  {img && !brokenImages[index] ? (
                    <img src={img} alt="" onError={() => markBroken(index)} draggable={false} />
                  ) : (
                    <span className="quickview-thumb-fallback" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="quickview-details">
          <h2 className="quickview-title">{product.name}</h2>

          <div className="quickview-prices">
            <span className="quickview-price">{formatPrice(product.price)}</span>
            {originalPrice && (
              <span className="quickview-price-original">{formatPrice(originalPrice)}</span>
            )}
          </div>

          <p className="quickview-summary">
            {product.description || 'Contactez la boutique pour obtenir les détails de ce produit.'}
          </p>

          {colors.length > 0 && (
            <div className="quickview-colors">
              <span className="quickview-label">
                Coloris : <strong>{colors[selectedColor]?.name}</strong>
              </span>
              <div className="quickview-swatches">
                {colors.map((color, index) => (
                  <button
                    key={`${color.name}-${index}`}
                    type="button"
                    className={`quickview-swatch ${index === selectedColor ? 'selected' : ''}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => selectColor(index)}
                    aria-label={`Coloris ${color.name}, ${color.stock ?? product.stock} en stock`}
                    aria-pressed={index === selectedColor}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="quickview-actions">
            <div className="quickview-quantity" aria-label="Quantité">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Diminuer la quantité"
              >
                <Minus size={14} strokeWidth={1.5} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(Math.max(selectedStock, 1), q + 1))}
                aria-label="Augmenter la quantité"
              >
                <Plus size={14} strokeWidth={1.5} />
              </button>
            </div>

            <motion.button
              type="button"
              className="quickview-add-btn"
              onClick={handleAddToCart}
              disabled={selectedStock <= 0}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              {selectedStock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
              <ShoppingBag size={17} strokeWidth={1.5} />
            </motion.button>
          </div>

          <div className="quickview-reassurance">
            <span>
              <Truck size={15} strokeWidth={1.5} />
              Livraison rapide partout au Maroc
            </span>
            <span>
              <Banknote size={15} strokeWidth={1.5} />
              Paiement à la livraison
            </span>
          </div>

          <div className="quickview-accordions">
            {accordions.map((item) => {
              const open = openAccordion === item.key;
              return (
                <div key={item.key} className="quickview-accordion">
                  <button
                    type="button"
                    className="quickview-accordion-header"
                    onClick={() => toggleAccordion(item.key)}
                    aria-expanded={open}
                  >
                    {item.title}
                    <Plus
                      size={16}
                      strokeWidth={1.5}
                      className={`accordion-icon ${open ? 'open' : ''}`}
                    />
                  </button>
                  {open && (
                    <div className="quickview-accordion-body">
                      <div className="quickview-accordion-content">{item.content}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ProductModal;
