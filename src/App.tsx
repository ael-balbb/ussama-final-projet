import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import SearchFilter from './components/SearchFilter';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import Footer from './components/Footer';
import type { Product, CartItem, Pack } from './types';
import { fetchProducts, fetchPacks } from './utils/api';
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingPacks, setIsLoadingPacks] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const data = await fetchProducts();
        setProducts(data);
        setProductsError(null);
      } catch (error) {
        console.error('Error loading products:', error);
        setProductsError('Erreur de chargement des produits');
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // Load packs from API
  useEffect(() => {
    const loadPacks = async () => {
      try {
        setIsLoadingPacks(true);
        const data = await fetchPacks();
        setPacks(data);
      } catch (error) {
        console.error('Error loading packs:', error);
        setPacks([]);
      } finally {
        setIsLoadingPacks(false);
      }
    };

    loadPacks();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, products]);

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevItems, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    navigate('/checkout');
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePackOrder = (packName: string, packPrice: number) => {
    const packProduct: Product = {
      id: `pack-${Date.now()}`,
      name: packName,
      price: packPrice,
      images: [],
      description: packName,
      category: 'accessory' as const,
      brand: '',
      stock: 1
    };
    
    const packItem = { product: packProduct, quantity: 1 };
    localStorage.setItem('cart', JSON.stringify([packItem]));
    navigate('/checkout');
  };

  return (
    <div className="app">
      <Header cartItemsCount={totalItems} onCartClick={() => setIsCartOpen(true)} />

      <main className="main-content">
        <motion.div 
          className="hero-banner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="hero-overlay"></div>
          <div className="container hero-container">
            <motion.div 
              className="hero-content"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="hero-main-title">
                𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒖𝒆 𝒄𝒉𝒆𝒛 𝑵𝒂𝒔𝒓𝒊 𝑷𝒉𝒐𝒏𝒆 𝑺𝒕𝒐𝒓𝒆
              </h1>
              <div className="hero-main-subtitle">
                <span>𝐕𝐞𝐧𝐭𝐞 & 𝐫é𝐩𝐚𝐫𝐚𝐭𝐢𝐨𝐧 𝟏𝟎𝟎% 𝐨𝐫𝐢𝐠𝐢𝐧𝐚𝐮𝐱 𝐚𝐮𝐱 𝐦𝐞𝐢𝐥𝐥𝐞𝐮𝐫𝐬 𝐩𝐫𝐢𝐱 ! 🔥
                <br />
                🚀 𝐋𝐢𝐯𝐫𝐚𝐢𝐬𝐨𝐧 𝐞𝐱𝐩𝐫𝐞𝐬𝐬 𝐩𝐚𝐫𝐭𝐨𝐮𝐭 🇲🇦💯 𝐆𝐚𝐫𝐚𝐧𝐭𝐢𝐞 𝐪𝐮𝐚𝐥𝐢𝐭é</span>
              </div>
              <button className="hero-cta-btn" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
                Acheter maintenant
              </button>
            </motion.div>
            <motion.div 
              className="hero-images"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
            </motion.div>
          </div>
        </motion.div>

        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="packs-showcase">
          <div className="container">
            <motion.h2 
              className="packs-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Promo
            </motion.h2>
            
            {isLoadingPacks ? (
              <div className="loading-products" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div className="loading-spinner"></div>
                <p>Chargement des packs...</p>
              </div>
            ) : packs.length > 0 ? (
              <div className="category-grid">
                {packs.map((pack, index) => (
                  <motion.div 
                    key={pack.id}
                    className={`category-card pack-card category-${pack.color}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="category-image">
                      <img src={pack.image} alt={pack.name} />
                    </div>
                    <div className="category-content">
                      <span className="category-label">PACK {index + 1}</span>
                      <h3>{pack.description}</h3>
                      <p className="pack-price">Prix spécial: {pack.price} DH</p>
                      <button className="pack-btn" onClick={() => handlePackOrder(pack.name, pack.price)}>
                        Commander maintenant
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-gray)' }}>
                <p>Aucun pack promo disponible pour le moment</p>
              </div>
            )}
          </div>
        </div>

        <div className="container">
          <>
            {isLoadingProducts ? (
              <motion.div
                className="loading-products"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '4rem 0' }}
              >
                <div className="loading-spinner"></div>
                <p>Chargement des produits...</p>
              </motion.div>
            ) : (
              <>
                {productsError && (
                  <motion.div
                    className="error-products"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="error-message">⚠️ {productsError}</p>
                  </motion.div>
                )}
                
                <div className="products-grid">
                  {filteredProducts.length === 0 ? (
                    <motion.div
                      className="no-products"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h3>Aucun produit trouvé</h3>
                      <p>Essayez de modifier vos filtres de recherche</p>
                    </motion.div>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
                      >
                        <ProductCard product={product} onAddToCart={addToCart} />
                      </motion.div>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        </div>
      </main>

      <Footer />

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
