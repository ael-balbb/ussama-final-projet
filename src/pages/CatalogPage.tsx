import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import NewArrivals from '../components/NewArrivals';
import CartModal from '../components/CartModal';
import Footer from '../components/Footer';
import type { StorefrontProps } from '../App';
import './CatalogPage.css';

const categoryFromSearch = (search: string): 'all' | 'phone' | 'accessory' => {
  const category = new URLSearchParams(search).get('category');
  return category === 'phone' || category === 'accessory' ? category : 'all';
};

export default function CatalogPage({
  products,
  status,
  cartItems,
  addToCart,
  updateQuantity,
  removeItem,
}: StorefrontProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app catalog-route">
      <Header cartItemsCount={totalItems} onCartClick={() => setIsCartOpen(true)} />
      <main className="catalog-page-main">
        <NewArrivals
          key={location.search}
          products={products}
          status={status}
          onAddToCart={addToCart}
          variant="catalog"
          initialTab={categoryFromSearch(location.search)}
        />
      </main>
      <Footer compact />
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
