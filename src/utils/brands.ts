export const PRODUCT_BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Huawei',
  'OPPO',
  'Infinix',
  'Honor',
  'Realme',
  'OnePlus',
  'Google',
  'Motorola',
  'Nokia',
  'Sony',
  'Asus',
  'Tecno',
  'JBL',
  'Anker',
] as const;

const BRAND_ALIASES: Record<string, string> = {
  smasung: 'Samsung',
  samsug: 'Samsung',
};

const BRAND_PATTERNS: Array<[RegExp, string]> = [
  [/\b(iphone|ipad|airpods?|magsafe|apple\s*watch|macbook|apple)\b/i, 'Apple'],
  [/\b(samsung|galaxy)\b/i, 'Samsung'],
  [/\b(xiaomi|redmi|poco)\b/i, 'Xiaomi'],
  ...PRODUCT_BRANDS
    .filter((brand) => !['Apple', 'Samsung', 'Xiaomi'].includes(brand))
    .map((brand): [RegExp, string] => [new RegExp(`\\b${brand}\\b`, 'i'), brand]),
];

const inferBrandFromProductName = (name: string): string => {
  const normalizedName = name.trim().toLowerCase();
  return BRAND_PATTERNS.find(([pattern]) => pattern.test(normalizedName))?.[1] || '';
};

export const normalizeProductBrand = (brandValue: unknown, productName = ''): string => {
  const brand = typeof brandValue === 'string' ? brandValue.trim().replace(/\s+/g, ' ') : '';
  const normalizedKey = brand.toLowerCase();
  const canonicalBrand = PRODUCT_BRANDS.find((item) => item.toLowerCase() === normalizedKey);

  if (canonicalBrand) return canonicalBrand;
  if (BRAND_ALIASES[normalizedKey]) return BRAND_ALIASES[normalizedKey];
  return inferBrandFromProductName(productName);
};
