import type { Product, ProductColor } from '../types';

/**
 * Presentation-only helpers. Everything here is derived deterministically
 * from the existing API data — no data structure is modified.
 */

export const formatPrice = (price: number): string => {
  if (!price || isNaN(price)) return '0 DH';
  return `${Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DH`;
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

type ReferenceColor = { name: string; hex: string; imageIndex?: number };

const REFERENCE_COLOR_FALLBACKS: Record<string, ReferenceColor[]> = {
  'iphone 13 pro': [
    // The legacy gallery was uploaded as Or, Vert, Bleu, Argent, Graphite.
    { name: 'Bleu alpin', hex: '#a8c6e0', imageIndex: 2 },
    { name: 'Graphite', hex: '#4a4a4a', imageIndex: 4 },
    { name: 'Argent', hex: '#ededed', imageIndex: 3 },
    { name: 'Vert alpin', hex: '#6d786b', imageIndex: 1 },
  ],
  'iphone 13 pro max': [
    { name: 'Graphite', hex: '#4a4a4a' },
    { name: 'Bleu alpin', hex: '#a8c6e0' },
    { name: 'Or', hex: '#d4b483' },
    { name: 'Argent', hex: '#ededed' },
  ],
  'iphone 15 normal': [
    { name: 'Rose', hex: '#efb3ba' },
    { name: 'Vert', hex: '#c6e98b' },
    { name: 'Bleu', hex: '#a8cbe1' },
    { name: 'Noir', hex: '#292c32' },
  ],
  'samsung s23 ultra': [
    { name: 'Noir', hex: '#303332' },
    { name: 'Vert', hex: '#6c776c' },
    { name: 'Crème', hex: '#f0e5d2' },
  ],
};

const getProductGallery = (product: Product) => {
  const candidates = [...(product.images || []), product.image || '']
    .filter((image): image is string => Boolean(image?.trim()));
  return [...new Set(candidates)];
};

export const getAvailableColors = (product: Product): ProductColor[] => {
  const gallery = getProductGallery(product);
  const configuredColors = (product.colors || [])
    .filter((color) => color.available !== false && (color.stock ?? product.stock) > 0)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((color, index) => ({
      ...color,
      // Older admin entries can have a color name but no linked photo.
      // Pair them with the gallery in display order so the swatch still works.
      image: color.image?.trim() || gallery[index] || gallery[0] || '',
    }));

  if (configuredColors.length > 0) return configuredColors;

  const referenceColors = REFERENCE_COLOR_FALLBACKS[product.name.trim().toLowerCase()] || [];
  return referenceColors.map((color, index) => ({
    name: color.name,
    hex: color.hex,
    // Legacy products stored color photos only in `images`. Assign a distinct
    // gallery photo to each fallback swatch instead of reusing image zero.
    image: gallery[color.imageIndex ?? index] || gallery[index] || gallery[0] || '',
    stock: product.stock,
    available: product.stock > 0,
    sort_order: index,
  }));
};
