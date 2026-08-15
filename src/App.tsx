import { lazy, startTransition, Suspense, useEffect, useMemo, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import BrandMarquee from './components/BrandMarquee';
import BackToTop from './components/BackToTop';
import ImmersiveBanner from './components/ImmersiveBanner';
import MomentOffer from './components/MomentOffer';
import NewArrivals from './components/NewArrivals';
import CartModal from './components/CartModal';
import Footer from './components/Footer';
import CatalogPage from './pages/CatalogPage';
import type { CartItem, Pack, Product, ProductColor } from './types';
import { fetchPacks, fetchProducts } from './utils/api';
import { getCartItemKey, getVariantStock } from './utils/cart';
import './App.css';

const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const PageLoader = () => (
  <div className="page-loader" role="status" aria-label="Chargement">
    <div className="loading-spinner" />
  </div>
);

const readSavedCart = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem('cart');
    const parsed = savedCart ? JSON.parse(savedCart) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item?.product?.id && Number(item.quantity) > 0)
      .map((item) => ({ ...item, quantity: Math.max(1, Math.floor(Number(item.quantity))) }));
  } catch {
    return [];
  }
};

export interface StorefrontProps {
  products: Product[];
  packs: Pack[];
  status: 'loading' | 'ready' | 'error';
  cartItems: CartItem[];
  addToCart: (product: Product, selectedColor?: ProductColor, quantity?: number) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  removeItem: (itemKey: string) => void;
}

function HomePage({
  products,
  packs,
  status,
  cartItems,
  addToCart,
  updateQuantity,
  removeItem,
}: StorefrontProps) {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand).filter(Boolean))],
    [products]
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app storefront-home">
      <Header cartItemsCount={totalItems} onCartClick={() => setIsCartOpen(true)} />
      <main>
        <Hero />
        <BrandMarquee brands={brands} />
        <ImmersiveBanner />
        <MomentOffer pack={packs[0]} onAddToCart={addToCart} />
        <NewArrivals
          products={products}
          status={status}
          onAddToCart={addToCart}
          variant="compact"
        />
      </main>
      <Footer />
      <BackToTop />
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          setIsCartOpen(false);
          navigate('/checkout');
        }}
      />
    </div>
  );
}

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>(readSavedCart);
  const [products, setProducts] = useState<Product[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([fetchProducts(), fetchPacks()]).then(([productsResult, packsResult]) => {
      if (cancelled) return;
      startTransition(() => {
        setProducts(productsResult.status === 'fulfilled' ? productsResult.value : []);
        setPacks(packsResult.status === 'fulfilled' ? packsResult.value : []);
        setCatalogStatus(
          productsResult.status === 'rejected' && packsResult.status === 'rejected'
            ? 'error'
            : 'ready'
        );
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, selectedColor?: ProductColor, quantity = 1) => {
    setCartItems((current) => {
      const itemKey = getCartItemKey({ product, selectedColor });
      const maximum = getVariantStock(product.stock, selectedColor);
      if (maximum <= 0) return current;
      const existing = current.find((item) => getCartItemKey(item) === itemKey);
      if (existing) {
        return current.map((item) =>
          getCartItemKey(item) === itemKey
            ? { ...item, quantity: Math.min(maximum, item.quantity + quantity) }
            : item
        );
      }
      return [...current, { product, selectedColor, quantity: Math.min(maximum, quantity) }];
    });
  };

  const removeItem = (itemKey: string) => {
    setCartItems((current) => current.filter((item) => getCartItemKey(item) !== itemKey));
  };

  const updateQuantity = (itemKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemKey);
      return;
    }
    setCartItems((current) =>
      current.map((item) =>
        getCartItemKey(item) === itemKey
          ? {
              ...item,
              quantity: Math.min(getVariantStock(item.product.stock, item.selectedColor), quantity),
            }
          : item
      )
    );
  };

  const sharedProps: StorefrontProps = {
    products,
    packs,
    status: catalogStatus,
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage {...sharedProps} />} />
        <Route path="/catalog" element={<CatalogPage {...sharedProps} />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}

export default App;
