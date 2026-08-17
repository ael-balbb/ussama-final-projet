import type { CartItem, ProductColor, ProductStorageVariant } from '../types';

export const getCartItemKey = (item: Pick<CartItem, 'product' | 'selectedColor' | 'selectedStorage'>) =>
  `${item.product.source || (item.product.brand === 'Promo' ? 'pack' : 'product')}:${item.product.id}:${item.selectedColor?.name || 'default'}:${item.selectedStorage?.capacity || 'default'}`;

export const getVariantStock = (
  stock: number,
  color?: ProductColor,
  storage?: ProductStorageVariant,
) => Math.max(0, Math.min(
  stock,
  color?.stock == null ? stock : color.stock,
  storage?.stock == null ? stock : storage.stock,
));

export const getCartItemPrice = (item: Pick<CartItem, 'product' | 'selectedStorage'>) =>
  Number(item.selectedStorage?.price ?? item.product.price) || 0;
