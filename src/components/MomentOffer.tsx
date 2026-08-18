import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AddToCartHandler, Pack, Product } from '../types';
import ProductModal from './ProductModal';
import { formatPrice, getOriginalPrice } from '../utils/display';
import './MomentOffer.css';

interface MomentOfferProps {
  packs: Pack[];
  onAddToCart: AddToCartHandler;
}

type PackTier = 'gold' | 'silver' | 'bronze';

const getPackTier = (pack: Pack): PackTier => {
  const searchableText = `${pack.name} ${pack.promo_label || ''}`.toLocaleLowerCase('fr');
  if (/silver|argent/.test(searchableText)) return 'silver';
  if (/bronze/.test(searchableText)) return 'bronze';
  if (/gold|or\b/.test(searchableText)) return 'gold';

  if (pack.color === 'dark') return 'silver';
  if (pack.color === 'red') return 'bronze';
  return 'gold';
};

const tierLabels: Record<PackTier, string> = {
  gold: 'Pack Gold',
  silver: 'Pack Silver',
  bronze: 'Pack Bronze',
};

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

const MomentOffer: React.FC<MomentOfferProps> = ({ packs, onAddToCart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const activePacks = useMemo(
    () => packs.filter((pack) => pack.is_active !== false),
    [packs],
  );
  const safeActiveIndex = activeIndex < activePacks.length ? activeIndex : 0;
  const pack = activePacks[safeActiveIndex];
  const product = useMemo(() => (pack ? packToProduct(pack) : null), [pack]);
  const tier = pack ? getPackTier(pack) : 'gold';
  const hasMultiplePacks = activePacks.length > 1;

  useEffect(() => {
    if (!hasMultiplePacks || isPaused || isModalOpen || reduceMotion) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((current) => (current + 1) % activePacks.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [activePacks.length, hasMultiplePacks, isModalOpen, isPaused, reduceMotion]);

  if (!pack || !product) return null;

  const originalPrice = getOriginalPrice(product);
  const openModal = () => setIsModalOpen(true);
  const selectPack = (nextIndex: number, nextDirection: number) => {
    setDirection(nextDirection);
    setActiveIndex((nextIndex + activePacks.length) % activePacks.length);
  };

  return (
    <section
      className={`moment-offer moment-offer--${tier}`}
      id="offres"
      aria-roledescription="carrousel"
      aria-label="Offres du moment"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
      <div className="moment-offer-stage">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.article
            key={pack.id}
            className="moment-offer-banner"
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${safeActiveIndex + 1} sur ${activePacks.length} : ${pack.name}`}
            custom={direction}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * 42 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * -42 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="moment-offer-hit-area"
              onClick={openModal}
              aria-label={`Découvrir ${pack.name}`}
            />
            <div className="moment-offer-visual">
              {product.image ? <img src={product.image} alt={pack.name} /> : null}
            </div>
            <div className="moment-offer-content">
              <div className="moment-offer-heading-row">
                <span className="moment-offer-eyebrow">L'offre du moment</span>
                <span className="moment-offer-tier">{tierLabels[tier]}</span>
              </div>
              <h2 className="moment-offer-title">{product.name}</h2>
              <p className="moment-offer-description">{product.description}</p>
              <p className="moment-offer-price">
                <strong>{formatPrice(product.price)}</strong>
                {originalPrice && <del>{formatPrice(originalPrice)}</del>}
              </p>
            </div>
            <div className="moment-offer-action-wrap">
              <button type="button" className="moment-offer-cta" onClick={openModal}>
                Découvrir le pack
                <ArrowRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          </motion.article>
        </AnimatePresence>

        {hasMultiplePacks && (
          <>
            <button
              type="button"
              className="moment-offer-arrow moment-offer-arrow--previous"
              onClick={() => selectPack(safeActiveIndex - 1, -1)}
              aria-label="Voir le pack précédent"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className="moment-offer-arrow moment-offer-arrow--next"
              onClick={() => selectPack(safeActiveIndex + 1, 1)}
              aria-label="Voir le pack suivant"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {hasMultiplePacks && (
        <div className="moment-offer-pagination" aria-label="Choisir une offre">
          {activePacks.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === safeActiveIndex ? 'is-active' : ''}
              onClick={() => selectPack(index, index > safeActiveIndex ? 1 : -1)}
              aria-label={`Afficher ${item.name}`}
              aria-current={index === safeActiveIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {pack.name}, {tierLabels[tier]}
      </span>

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
