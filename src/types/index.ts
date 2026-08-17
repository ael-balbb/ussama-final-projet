export interface ProductColor {
  name: string;
  hex: string;
  image: string;
  stock?: number;
  available?: boolean;
  sort_order?: number;
}

export interface ProductStorageVariant {
  capacity: string;
  price: number;
  compare_at_price?: number | null;
  stock?: number;
  available?: boolean;
  sort_order?: number;
}

export interface Product {
  id: string;
  source?: 'product' | 'pack';
  name: string;
  category: 'phone' | 'accessory';
  brand: string;
  price: number;
  compare_at_price?: number | null;
  promo_label?: string;
  image?: string;
  images: string[];
  /** Optional color variants — each with its own product photo */
  colors?: ProductColor[];
  /** Storage capacities — each can carry its own price and stock */
  storage_variants?: ProductStorageVariant[];
  description: string;
  stock: number;
  is_featured?: boolean;
  is_new?: boolean;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Pack {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  promo_label?: string;
  stock: number;
  image: string;
  description: string;
  color: 'dark' | 'yellow' | 'red';
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: ProductColor;
  selectedStorage?: ProductStorageVariant;
}

export type AddToCartHandler = (
  product: Product,
  selectedColor?: ProductColor,
  quantity?: number,
  selectedStorage?: ProductStorageVariant,
) => void;

export interface OrderForm {
  firstName: string;
  lastName: string;
  city: string;
  address: string;
  phoneNumber: string;
}

export interface Order {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  address: string;
  phone_number: string;
  products_json: CartItemJSON[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CartItemJSON {
  id?: string;
  source?: 'product' | 'pack';
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  storage?: string;
}

export interface CartOrderItem {
  id: string;
  source: 'product' | 'pack';
  quantity: number;
  color?: string;
  storage?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface AdminAuth {
  token: string;
  admin: {
    id: string;
    email: string;
  };
}
