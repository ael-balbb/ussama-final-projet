import type { AdminAuth, CartItem, Order, Pack, Product } from '../types';

// Vite proxies /api to Railway in development. Production uses the explicit URL.
const API_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');

const readResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data.error === 'string' ? data.error : 'Une erreur est survenue';
    throw new Error(message);
  }
  return data as T;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const normalizeProduct = (product: Product): Product => ({
  ...product,
  source: 'product',
  price: Number(product.price) || 0,
  compare_at_price: product.compare_at_price == null ? null : Number(product.compare_at_price),
  stock: Number(product.stock) || 0,
  brand: product.brand || '',
  images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
  colors: Array.isArray(product.colors)
    ? product.colors.map((color, index) => ({
        ...color,
        stock: color.stock == null ? Number(product.stock) || 0 : Number(color.stock) || 0,
        available: color.available !== false,
        sort_order: color.sort_order ?? index,
      }))
    : [],
  storage_variants: Array.isArray(product.storage_variants)
    ? product.storage_variants.map((variant, index) => ({
        ...variant,
        price: Number(variant.price) || Number(product.price) || 0,
        compare_at_price: variant.compare_at_price == null ? null : Number(variant.compare_at_price),
        stock: variant.stock == null ? Number(product.stock) || 0 : Number(variant.stock) || 0,
        available: variant.available !== false,
        sort_order: variant.sort_order ?? index,
      }))
    : [],
  image: product.images?.[0] || product.colors?.[0]?.image || product.image || '',
  is_active: product.is_active !== false,
  is_featured: product.is_featured === true,
  is_new: product.is_new === true,
  sort_order: Number(product.sort_order) || 0,
});

const normalizePack = (pack: Pack): Pack => ({
  ...pack,
  price: Number(pack.price) || 0,
  compare_at_price: pack.compare_at_price == null ? null : Number(pack.compare_at_price),
  stock: Number(pack.stock) || 0,
  color: pack.color || 'dark',
  is_active: pack.is_active !== false,
  sort_order: Number(pack.sort_order) || 0,
});

// ============ AUTH ============

export const loginAdmin = async (email: string, password: string): Promise<AdminAuth> => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return readResponse<AdminAuth>(response);
};

export const verifyToken = async (token: string) => {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readResponse<{ admin: AdminAuth['admin'] }>(response);
};

// ============ PRODUCTS ============

export const fetchProducts = async (options: { admin?: boolean } = {}): Promise<Product[]> => {
  let response = await fetch(`${API_URL}/api/products${options.admin ? '/admin' : ''}`, {
    headers: options.admin ? getAuthHeaders() : undefined,
  });
  // Keeps a Vercel preview usable while the matching Railway release is pending.
  if (options.admin && [404, 500].includes(response.status)) {
    response = await fetch(`${API_URL}/api/products`);
  }
  const data = await readResponse<{ success: boolean; products: Product[] }>(response);
  return (data.products || []).map(normalizeProduct);
};

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  const response = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });
  const data = await readResponse<{ product: Product }>(response);
  return normalizeProduct(data.product);
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });
  const data = await readResponse<{ product: Product }>(response);
  return normalizeProduct(data.product);
};

export const deleteProduct = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await readResponse<{ success: boolean }>(response);
};

// ============ PACKS ============

export const fetchPacks = async (options: { admin?: boolean } = {}): Promise<Pack[]> => {
  let response = await fetch(`${API_URL}/api/packs${options.admin ? '/admin' : ''}`, {
    headers: options.admin ? getAuthHeaders() : undefined,
  });
  if (options.admin && [404, 500].includes(response.status)) {
    response = await fetch(`${API_URL}/api/packs`);
  }
  const data = await readResponse<{ success: boolean; packs: Pack[] }>(response);
  return (data.packs || []).map(normalizePack);
};

export const createPack = async (pack: Partial<Pack>): Promise<Pack> => {
  const response = await fetch(`${API_URL}/api/packs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(pack),
  });
  const data = await readResponse<{ pack: Pack }>(response);
  return normalizePack(data.pack);
};

export const updatePack = async (id: string, pack: Partial<Pack>): Promise<Pack> => {
  const response = await fetch(`${API_URL}/api/packs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(pack),
  });
  const data = await readResponse<{ pack: Pack }>(response);
  return normalizePack(data.pack);
};

export const deletePack = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/packs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await readResponse<{ success: boolean }>(response);
};

// ============ ORDERS ============

export const submitOrder = async (
  orderForm: {
    firstName: string;
    lastName: string;
    city: string;
    address: string;
    phoneNumber: string;
  },
  cartItems: CartItem[],
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...orderForm,
      cartItems: cartItems.map((item) => ({
        id: item.product.id,
        source: item.product.source || (item.product.brand === 'Promo' ? 'pack' : 'product'),
        quantity: item.quantity,
        color: item.selectedColor?.name,
        storage: item.selectedStorage?.capacity,
      })),
    }),
  });
  await readResponse<{ success: boolean }>(response);
};

export const fetchOrders = async (status?: string): Promise<Order[]> => {
  const query = status && status !== 'all' ? `?status=${status}` : '';
  const response = await fetch(`${API_URL}/api/orders${query}`, { headers: getAuthHeaders() });
  const data = await readResponse<{ orders: Order[] }>(response);
  return data.orders || [];
};

export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  const response = await fetch(`${API_URL}/api/orders/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await readResponse<{ order: Order }>(response);
  return data.order;
};

export const deleteOrder = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/orders/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await readResponse<{ success: boolean }>(response);
};

// ============ UPLOAD ============

export const uploadImages = async (files: File[]): Promise<string[]> => {
  const token = localStorage.getItem('admin_token');
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await readResponse<{ urls: string[] }>(response);
  return data.urls;
};
