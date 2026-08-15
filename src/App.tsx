import { useState, useMemo, useEffect, lazy, Suspense, startTransition } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import BrandMarquee from './components/BrandMarquee';
import BackToTop from './components/BackToTop';
import PromoBanners from './components/PromoBanners';
import ImmersiveBanner from './components/ImmersiveBanner';
import MomentOffer from './components/MomentOffer';
import NewArrivals from './components/NewArrivals';
import CartModal from './components/CartModal';
import Footer from './components/Footer';
import type { Product, ProductColor, CartItem, Pack } from './types';
import { fetchProducts, fetchPacks } from './utils/api';
import { getCartItemKey, getVariantStock } from './utils/cart';
import './App.css';

// Lazy load pages that aren't needed on first render
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// Loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div className="loading-spinner"></div>
  </div>
);

function HomePage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
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
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Load catalog in parallel without blocking first paint
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [productsResult, packsResult] = await Promise.allSettled([
        fetchProducts(),
        fetchPacks(),
      ]);

      if (cancelled) return;

      startTransition(() => {
        if (productsResult.status === 'fulfilled') {
          setProducts(productsResult.value);
        } else {
          console.error('Error loading products:', productsResult.reason);
          setProducts([]);
        }

        if (packsResult.status === 'fulfilled') {
          setPacks(packsResult.value);
        } else {
          console.error('Error loading packs:', packsResult.reason);
          setPacks([]);
        }
        setCatalogStatus(
          productsResult.status === 'rejected' && packsResult.status === 'rejected'
            ? 'error'
            : 'ready'
        );
      });
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Unique brands from the live catalog for the marquee
  const brands = useMemo(() => {
    return [...new Set(products.map((p) => p.brand).filter(Boolean))];
  }, [products]);

  const addToCart = (product: Product, selectedColor?: ProductColor, quantity = 1) => {
    setCartItems((prevItems) => {
      const nextItem = { product, selectedColor };
      const itemKey = getCartItemKey(nextItem);
      const existingItem = prevItems.find((item) => getCartItemKey(item) === itemKey);
      const maxStock = getVariantStock(product.stock, selectedColor);
      if (maxStock <= 0) return prevItems;

      if (existingItem) {
        return prevItems.map((item) =>
          getCartItemKey(item) === itemKey
            ? { ...item, quantity: Math.min(maxStock, item.quantity + quantity) }
            : item
        );
      }

      return [...prevItems, { product, selectedColor, quantity: Math.min(maxStock, quantity) }];
    });
  };

  const updateQuantity = (itemKey: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemKey);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        getCartItemKey(item) === itemKey
          ? {
              ...item,
              quantity: Math.min(
                getVariantStock(item.product.stock, item.selectedColor),
                newQuantity
              ),
            }
          : item
      )
    );
  };

  const removeItem = (itemKey: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => getCartItemKey(item) !== itemKey));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    navigate('/checkout');
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app">
      <Header cartItemsCount={totalItems} onCartClick={() => setIsCartOpen(true)} />

      <main>
        <Hero />

        <BrandMarquee brands={brands} />

        <ImmersiveBanner />

        <MomentOffer pack={packs[0]} onAddToCart={addToCart} />

        <NewArrivals
          products={products}
          status={catalogStatus}
          onAddToCart={addToCart}
        />

        <PromoBanners packs={packs.slice(1)} onAddToCart={addToCart} />
      </main>

      <Footer />

      <BackToTop />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}

export default App;
