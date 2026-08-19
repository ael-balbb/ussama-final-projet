export interface CatalogColor {
  name: string;
  hex: string;
  image: string;
  stock: number;
  available: boolean;
  sort_order: number;
}

export interface CatalogStorageVariant {
  capacity: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  available: boolean;
  sort_order: number;
}

export const PRODUCT_BRANDS = [
  'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'OPPO', 'Infinix', 'Honor', 'Realme',
  'OnePlus', 'Google', 'Motorola', 'Nokia', 'Sony', 'Asus', 'Tecno', 'JBL', 'Anker',
] as const;

const BRAND_ALIASES: Record<string, string> = {
  smasung: 'Samsung',
  samsug: 'Samsung',
};

export const cleanText = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export const cleanProductBrand = (value: unknown) => {
  const brand = cleanText(value, 80).replace(/\s+/g, ' ');
  if (!brand) return '';

  const normalizedKey = brand.toLowerCase();
  const canonicalBrand = PRODUCT_BRANDS.find((item) => item.toLowerCase() === normalizedKey);
  if (canonicalBrand) return canonicalBrand;
  if (BRAND_ALIASES[normalizedKey]) return BRAND_ALIASES[normalizedKey];

  throw new Error('Marque invalide. Choisissez une marque dans la liste');
};

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

export const cleanStorageVariants = (
  value: unknown,
  fallbackStock: number,
): CatalogStorageVariant[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 8).flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object') return [];
    const variant = entry as Record<string, unknown>;
    const rawCapacity = cleanText(variant.capacity, 20);
    const capacityMatch = rawCapacity.match(/^(\d{1,4})\s*(go|gb|to|tb)$/i);
    if (!capacityMatch) throw new Error(`La capacité "${rawCapacity}" est invalide`);
    const unit = /^(to|tb)$/i.test(capacityMatch[2]) ? 'To' : 'Go';
    const capacity = `${capacityMatch[1]} ${unit}`;
    const capacityKey = capacity.toLowerCase();
    if (seen.has(capacityKey)) throw new Error(`La capacité "${capacity}" existe déjà`);
    seen.add(capacityKey);

    const price = nonNegativeNumber(variant.price, `Le prix ${capacity}`);
    if (price <= 0) throw new Error(`Le prix ${capacity} doit être supérieur à zéro`);
    return [{
      capacity,
      price,
      compare_at_price: optionalComparePrice(variant.compare_at_price, price),
      stock: variant.stock == null
        ? fallbackStock
        : nonNegativeInteger(variant.stock, `Stock ${capacity}`),
      available: variant.available !== false,
      sort_order: variant.sort_order == null
        ? index
        : nonNegativeInteger(variant.sort_order, `Ordre ${capacity}`),
    }];
  }).sort((a, b) => a.sort_order - b.sort_order);
};

export const publicCatalogOrder = [
  { column: 'is_featured', ascending: false },
  { column: 'sort_order', ascending: true },
  { column: 'created_at', ascending: false },
] as const;
