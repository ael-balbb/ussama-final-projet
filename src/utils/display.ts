import type { Product } from '../types';

/**
 * Presentation-only helpers. Everything here is derived deterministically
 * from the existing API data — no data structure is modified.
 */

export const formatPrice = (price: number): string => {
  if (!price || isNaN(price)) return '0 DH';
  return `${price.toLocaleString('fr-MA')} DH`;
};

export const isNewProduct = (product: Product): boolean => {
  return product.is_new === true;
};

export const getPromoPercent = (product: Product): number | null => {
  const originalPrice = getOriginalPrice(product);
  if (!originalPrice || !product.price) return null;
  return Math.round(((originalPrice - product.price) / originalPrice) * 100);
};

export const getOriginalPrice = (product: Product): number | null => {
  const compareAtPrice = Number(product.compare_at_price);
  return Number.isFinite(compareAtPrice) && compareAtPrice > product.price
    ? compareAtPrice
    : null;
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
    badges.push({ label: product.promo_label?.trim() || `PROMO -${promo}%`, variant: 'promo' });
  } else if (product.promo_label?.trim()) {
    badges.push({ label: product.promo_label.trim(), variant: 'promo' });
  } else if (product.is_featured) {
    badges.push({ label: 'EN VEDETTE', variant: 'popular' });
  }
  if (product.stock > 0 && product.stock < 10) {
    badges.push({ label: 'STOCK LIMITÉ', variant: 'stock' });
  }
  return badges.slice(0, 2);
};

export const getAvailableColors = (product: Product) =>
  (product.colors || [])
    .filter((color) => color.available !== false && (color.stock ?? product.stock) > 0)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
