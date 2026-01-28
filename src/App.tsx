import { useState, useEffect } from 'react';
import { ProductCustomizer } from './components/ProductCustomizer';
import { HomePage } from './components/HomePage';
import { CheckoutPage } from './components/CheckoutPage';
import { ProceedCheckoutPage } from './components/ProceedCheckoutPage';
import { PaymentSuccess } from './components/PaymentSuccess';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export interface CartItem {
  id: string;
  shirtColor: string;
  embroideryColor: string;
  size: string;
  price: number;
  image: string;
}

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState<'home' | 'shop' | 'checkout' | 'proceed-checkout' | 'checkout-success'>('home');

  // Check for payment redirect on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    
    if (paymentStatus === 'success') {
      setCurrentPage('checkout-success');
      setCartItems([]); // Clear cart after successful payment
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'cancelled' || paymentStatus === 'failed') {
      // Optionally handle cancelled/failed payments
      // For now, just clean up the URL and stay on current page
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleAddToCart = (item: CartItem) => {
    setCartItems([...cartItems, { ...item, id: Date.now().toString() }]);
  };

  const handleShopNow = () => {
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedCheckout = () => {
    setCurrentPage('proceed-checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show header only on shop page */}
      {currentPage === 'shop' && (
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
            <h1 className="text-2xl">Persuasive</h1>
            <button 
              onClick={handleCheckout}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </header>
      )}

      {/* Show header on checkout page with back button to shop */}
      {currentPage === 'checkout' && (
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage('shop')}
              className="flex items-center gap-2 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
            <h1 className="text-2xl">Checkout</h1>
            <div className="w-10" />
          </div>
        </header>
      )}

      {/* Show header on proceed checkout page */}
      {currentPage === 'proceed-checkout' && (
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage('checkout')}
              className="flex items-center gap-2 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
            <h1 className="text-2xl">Order Details</h1>
            <div className="w-10" />
          </div>
        </header>
      )}

      {/* Main Content */}
      {currentPage === 'home' ? (
        <HomePage onShopNow={handleShopNow} />
      ) : currentPage === 'checkout' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <CheckoutPage cartItems={cartItems} onRemoveFromCart={handleRemoveFromCart} onProceedCheckout={handleProceedCheckout} />
        </main>
      ) : currentPage === 'proceed-checkout' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <ProceedCheckoutPage cartItems={cartItems} onBack={() => setCurrentPage('checkout')} />
        </main>
      ) : currentPage === 'checkout-success' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <PaymentSuccess onBackToHome={handleBackToHome} onContinueShopping={handleShopNow} />
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <ProductCustomizer onAddToCart={handleAddToCart} />
        </main>
      )}
    </div>
  );
}