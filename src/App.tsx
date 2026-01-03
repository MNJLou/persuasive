import { useState } from 'react';
import { ProductCustomizer } from './components/ProductCustomizer';
import { HomePage } from './components/HomePage';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<'home' | 'shop'>('home');

  const handleAddToCart = () => {
    setCartCount(cartCount + 1);
  };

  const handleShopNow = () => {
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-2xl">Persuasive</h1>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      {currentPage === 'home' ? (
        <HomePage onShopNow={handleShopNow} />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <ProductCustomizer onAddToCart={handleAddToCart} />
        </main>
      )}
    </div>
  );
}