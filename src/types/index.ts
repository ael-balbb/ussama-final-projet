export interface Product {
  id: string;
  name: string;
  category: 'phone' | 'accessory';
  brand: string;
  price: number;
  image?: string;
  images: string[];
  description: string;
  stock: number;
  created_at?: string;
  updated_at?: string;
}

export interface Pack {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  description: string;
  color: 'dark' | 'yellow' | 'red';
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderForm {
  firstName: string;
  lastName: string;
  city: string;
  address: string;
  phoneNumber: string;
  quantity: number;
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
  name: string;
  price: number;
  quantity: number;
  image?: string;
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
