import type { Product } from '../types';

/**
 * Presentation-only helpers. Everything here is derived deterministically
 * from the existing API data — no data structure is modified.
 */

export const formatPrice = (price: number): string => {
  if (!price || isNaN(price)) return '0 DH';
  return `${price.toLocaleString('fr-MA')} DH`;
};

/** Stable hash so a given product always gets the same badge/promo. */
const hashId = (id: string): number => {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
};

const NEW_WINDOW_DAYS = 45;

export const isNewProduct = (product: Product): boolean => {
  if (!product.created_at) return false;
  const created = new Date(product.created_at).getTime();
  if (isNaN(created)) return false;
  return Date.now() - created < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
};

const PROMO_PERCENTS = [15, 20, 28];

/** ~1 product in 3 is presented as a promo, with a stable discount percent. */
export const getPromoPercent = (product: Product): number | null => {
  const h = hashId(product.id);
  if (h % 3 !== 0) return null;
  return PROMO_PERCENTS[h % PROMO_PERCENTS.length];
};

/** Crossed-out "original" price shown next to the real (current) price. */
export const getOriginalPrice = (product: Product): number | null => {
  const percent = getPromoPercent(product);
  if (!percent || !product.price) return null;
  return Math.round(product.price / (1 - percent / 100));
};

export interface ProductBadge {
  label: string;
  variant: 'new' | 'promo' | 'popular' | 'stock';
}

export const getBadges = (product: Product): ProductBadge[] => {
  const badges: ProductBadge[] = [];
  if (isNewProduct(product)) {
    badges.push({ label: 'NOUVEAU', variant: 'new' });
  }
  const promo = getPromoPercent(product);
  if (promo) {
    badges.push({ label: `PROMO -${promo}%`, variant: 'promo' });
  } else if (hashId(product.id) % 5 === 1) {
    badges.push({ label: 'POPULAIRE', variant: 'popular' });
  }
  if (product.stock > 0 && product.stock < 10) {
    badges.push({ label: 'STOCK LIMITÉ', variant: 'stock' });
  }
  return badges.slice(0, 2);
};
