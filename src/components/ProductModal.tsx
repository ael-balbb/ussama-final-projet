import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Banknote,
  CheckCircle2,
  Heart,
  ImageOff,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react';
import type { AddToCartHandler, Product } from '../types';
import { formatPrice, getAvailableColors, getBadges, getOriginalPrice } from '../utils/display';
import { getVariantStock } from '../utils/cart';
import './ProductModal.css';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: AddToCartHandler;
}

const productSubtitle = (product: Product) => {
  const capacity = product.description?.match(/\b\d+\s?(?:Go|GB|To|TB)\b/i)?.[0];
  return capacity || product.brand;
};

export default function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const colors = getAvailableColors(product).filter((color) => color?.name);
  const images = useMemo(() => {
    const candidates = [
      ...colors.map((color) => color.image),
      ...(product.images || []),
      product.image || '',
    ].filter((image): image is string => Boolean(image?.trim()));
    return [...new Set(candidates)];
  }, [colors, product.image, product.images]);
  const badges = getBadges(product);
  const originalPrice = getOriginalPrice(product);
  const selectedStock = getVariantStock(product.stock, colors[selectedColor]);
  const savings = originalPrice ? originalPrice - product.price : 0;
  const savingsPercent = originalPrice ? Math.round((savings / originalPrice) * 100) : 0;

  const close = useCallback(() => {
    setCurrentImageIndex(0);
    setSelectedColor(0);
    setQuantity(1);
    setBrokenImages({});
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.scrollTo({ top: scrollY, behavior: 'auto' });
      previousFocus?.focus();
    };
  }, [close, isOpen]);

  if (typeof document === 'undefined') return null;

  const selectColor = (index: number) => {
    setSelectedColor(index);
    setQuantity(1);
    const imageIndex = images.indexOf(colors[index]?.image || '');
    if (imageIndex >= 0) setCurrentImageIndex(imageIndex);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="quickview-backdrop"
          onClick={close}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
        >
          <motion.div
            ref={panelRef}
            className={`quickview-panel quickview-product-${product.category}`}
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            onClick={(event) => event.stopPropagation()}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.985 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 34 }}
          >
            <button ref={closeButtonRef} type="button" className="quickview-close" onClick={close} aria-label="Fermer">
              <X size={25} strokeWidth={1.5} />
            </button>

            <div className="quickview-gallery">
              {images.length > 1 && (
                <div className="quickview-thumbnails" aria-label="Galerie d'images">
                  {images.slice(0, 5).map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`quickview-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Afficher l'image ${index + 1}`}
                    >
                      <img src={image} alt="" />
                    </button>
                  ))}
                </div>
              )}

              <div className="quickview-main-image">
                {images[currentImageIndex] && !brokenImages[currentImageIndex] ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={product.name}
                    onError={() => setBrokenImages((current) => ({ ...current, [currentImageIndex]: true }))}
                  />
                ) : (
                  <span className="quickview-image-fallback"><ImageOff /><small>Image indisponible</small></span>
                )}
              </div>
            </div>

            <div className="quickview-details">
              {badges.length > 0 && (
                <div className="quickview-badges">
                  {badges.map((badge) => (
                    <span key={badge.label} className={`product-badge badge-${badge.variant}`}>{badge.label}</span>
                  ))}
                </div>
              )}
              <h2 className="quickview-title">{product.name}</h2>
              <p className="quickview-subtitle">{productSubtitle(product)}</p>
              <div className="quickview-prices">
                <strong>{formatPrice(product.price)}</strong>
                {originalPrice && <del>{formatPrice(originalPrice)}</del>}
              </div>
              {savings > 0 && <p className="quickview-savings">Économisez {formatPrice(savings)} ({savingsPercent}%)</p>}
              <p className={`quickview-stock ${selectedStock <= 0 ? 'out' : ''}`}>
                <i aria-hidden="true" />{selectedStock > 0 ? 'En stock' : 'Épuisé'}
              </p>

              {colors.length > 0 && (
                <div className="quickview-colors">
                  <span className="quickview-label">Couleur : <strong>{colors[selectedColor]?.name}</strong></span>
                  <div className="quickview-swatches">
                    {colors.map((color, index) => (
                      <button
                        key={`${color.name}-${index}`}
                        type="button"
                        className={`quickview-swatch ${selectedColor === index ? 'selected' : ''}`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => selectColor(index)}
                        aria-label={`Coloris ${color.name}`}
                        aria-pressed={selectedColor === index}
                      />
                    ))}
                  </div>
                </div>
              )}

              <span className="quickview-label">Quantité :</span>
              <div className="quickview-quantity">
                <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Diminuer la quantité"><Minus size={17} /></button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((current) => Math.min(Math.max(selectedStock, 1), current + 1))} aria-label="Augmenter la quantité"><Plus size={17} /></button>
              </div>

              <div className="quickview-actions">
                <button
                  type="button"
                  className="quickview-add-btn"
                  disabled={selectedStock <= 0}
                  onClick={() => {
                    onAddToCart(product, colors[selectedColor], quantity);
                    close();
                  }}
                >
                  <ShoppingBag size={19} />
                  {selectedStock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                </button>
                <button
                  type="button"
                  className={`quickview-favorite ${favorite ? 'active' : ''}`}
                  onClick={() => setFavorite((current) => !current)}
                  aria-pressed={favorite}
                >
                  <Heart size={19} fill={favorite ? 'currentColor' : 'none'} />
                  <span>Ajouter aux favoris</span>
                </button>
              </div>
            </div>

            <aside className="quickview-benefits" aria-label="Services NasriPhone">
              <span><Truck /><span><strong>Livraison partout au Maroc</strong><small>Rapide et sécurisée</small></span></span>
              <span><CheckCircle2 /><span><strong>Produits 100% originaux</strong><small>Garantie constructeur</small></span></span>
              <span><Banknote /><span><strong>Paiement à la livraison</strong><small>Payez en toute confiance</small></span></span>
              <span><MessageCircle /><span><strong>Retour facile 7 jours</strong><small>Satisfait ou remboursé</small></span></span>
            </aside>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
