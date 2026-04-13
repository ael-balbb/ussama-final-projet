import type { Product, Pack, CartItem, Order } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============ AUTH ============

export const loginAdmin = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
  return data;
};

export const verifyToken = async (token: string) => {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Token invalide');
  return res.json();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// ============ PRODUCTS ============

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_URL}/api/products`);
    const data = await res.json();
    if (data.success && data.products) {
      return data.products.map((p: Product) => ({
        ...p,
        price: Number(p.price) || 0,
        stock: p.stock || 0,
        brand: p.brand || '',
        images: p.images || [],
        image: p.images?.[0] || ''
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(product)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur');
  return data.product;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(product)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur');
  return data.product;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Erreur');
  }
};

// ============ PACKS ============

export const fetchPacks = async (): Promise<Pack[]> => {
  try {
    const res = await fetch(`${API_URL}/api/packs`);
    const data = await res.json();
    if (data.success && data.packs) {
      return data.packs.map((p: Pack) => ({
        ...p,
        price: Number(p.price) || 0,
        color: p.color || 'dark'
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching packs:', error);
    return [];
  }
};

export const createPack = async (pack: Partial<Pack>): Promise<Pack> => {
  const res = await fetch(`${API_URL}/api/packs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(pack)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur');
  return data.pack;
};

export const updatePack = async (id: string, pack: Partial<Pack>): Promise<Pack> => {
  const res = await fetch(`${API_URL}/api/packs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(pack)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur');
  return data.pack;
};

export const deletePack = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/api/packs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Erreur');
  }
};

// ============ ORDERS ============

export const submitOrder = async (orderForm: {
  firstName: string;
  lastName: string;
  city: string;
  address: string;
  phoneNumber: string;
}, cartItems: CartItem[]): Promise<void> => {
  const payload = {
    firstName: orderForm.firstName,
    lastName: orderForm.lastName,
    city: orderForm.city,
    address: orderForm.address,
    phoneNumber: orderForm.phoneNumber,
    cartItems: cartItems.map(item => ({
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images?.[0] || item.product.image || ''
    })),
    totalAmount: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  };

  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Erreur');
  }
};

export const fetchOrders = async (status?: string): Promise<Order[]> => {
  const query = status && status !== 'all' ? `?status=${status}` : '';
  const res = await fetch(`${API_URL}/api/orders${query}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur');
  return data.orders || [];
};

export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur');
  return data.order;
};

export const deleteOrder = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/api/orders/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Erreur');
  }
};

// ============ UPLOAD ============

export const uploadImages = async (files: File[]): Promise<string[]> => {
  const token = localStorage.getItem('admin_token');
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));

  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur upload');
  return data.urls;
};
