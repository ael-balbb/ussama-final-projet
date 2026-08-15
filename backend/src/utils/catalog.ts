export interface CatalogColor {
  name: string;
  hex: string;
  image: string;
  stock: number;
  available: boolean;
  sort_order: number;
}

export const cleanText = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export const nonNegativeNumber = (value: unknown, field: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${field} doit être un nombre positif`);
  }
  return parsed;
};

export const nonNegativeInteger = (value: unknown, field: string) =>
  Math.floor(nonNegativeNumber(value, field));

export const optionalComparePrice = (value: unknown, price: number) => {
  if (value === undefined || value === null || value === '') return null;
  const compareAt = nonNegativeNumber(value, 'Le prix avant promotion');
  if (compareAt <= price) {
    throw new Error('Le prix avant promotion doit être supérieur au prix actuel');
  }
  return compareAt;
};

export const cleanImageUrl = (value: unknown) => {
  const url = cleanText(value, 2048);
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) ? url : '';
  } catch {
    return '';
  }
};

export const cleanImages = (value: unknown) =>
  Array.isArray(value)
    ? value.map(cleanImageUrl).filter(Boolean).slice(0, 8)
    : [];

export const cleanColors = (value: unknown, fallbackStock: number): CatalogColor[] => {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object') return [];
    const color = entry as Record<string, unknown>;
    const name = cleanText(color.name, 40);
    const hex = cleanText(color.hex, 9);
    if (!name || !/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) return [];
    return [{
      name,
      hex,
      image: cleanImageUrl(color.image),
      stock: color.stock == null ? fallbackStock : nonNegativeInteger(color.stock, `Stock ${name}`),
      available: color.available !== false,
      sort_order: color.sort_order == null ? index : nonNegativeInteger(color.sort_order, `Ordre ${name}`),
    }];
  });
};

export const publicCatalogOrder = [
  { column: 'is_featured', ascending: false },
  { column: 'sort_order', ascending: true },
  { column: 'created_at', ascending: false },
] as const;
