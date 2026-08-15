import type { CartItem, ProductColor } from '../types';

export const getCartItemKey = (item: Pick<CartItem, 'product' | 'selectedColor'>) =>
  `${item.product.source || (item.product.brand === 'Promo' ? 'pack' : 'product')}:${item.product.id}:${item.selectedColor?.name || 'default'}`;

export const getVariantStock = (stock: number, color?: ProductColor) =>
  Math.max(0, color?.stock == null ? stock : color.stock);
