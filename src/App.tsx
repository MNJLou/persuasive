import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { ProductCustomizer } from './components/ProductCustomizer';
import { HomePage } from './components/HomePage';
import { CheckoutPage } from './components/CheckoutPage';
import { ProceedCheckoutPage } from './components/ProceedCheckoutPage';
import { PaymentSuccess } from './components/PaymentSuccess';
import { AdminPanel } from './components/AdminPanel';
import { AdminOrderPage } from './components/AdminOrderPage';
import { AdminApp } from './components/admin/AdminApp';
import { Header, CrumbBar, Footer, Icon } from './components/persuasive/ui';
import { storeAdminCredentials } from './lib/adminApi';

export interface CartItem {
  id: string;
  shirtColor: string;
  embroideryColor: string;
  size: string;
  price: number;
  image: string;
  // Display extras (optional — backend ignores these; shirtColor/embroideryColor/size remain the contract)
  productType?: 'tee' | 'cap' | 'croptop';
  productName?: string;
  swatch?: string;
  embSwatch?: string;
}

type Page = 'home' | 'shop' | 'checkout' | 'proceed-checkout' | 'checkout-success' | 'admin' | 'admin-order';

// admin.persuasive.online is the same deployment as the shop, told apart by
// hostname. Evaluated once at module load — the host cannot change without a
// full page load.
const IS_ADMIN_HOST = window.location.hostname.startsWith('admin.');

export default function App() {
  if (IS_ADMIN_HOST) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Toaster />
        <AdminApp />
      </div>
    );
  }

  return <ShopApp />;
}

function ShopApp() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (window.location.pathname === '/admin') return 'admin';
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') return 'checkout-success';
    return 'home';
  });

  // Admin auth modal
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Payment redirect handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    if (paymentStatus === 'success') {
      setCurrentPage('checkout-success');
      setCartItems([]);
    } else if (paymentStatus === 'cancelled' || paymentStatus === 'failed') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin') setCurrentPage('admin');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Lock scroll + Escape close for the admin modal
  useEffect(() => {
    if (!adminOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAdmin(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [adminOpen]);

  const go = (p: Page) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleAddToCart = (item: CartItem) => {
    setCartItems((c) => [...c, { ...item, id: Date.now().toString() + Math.random().toString(36).slice(2) }]);
  };
  const handleRemoveFromCart = (itemId: string) => setCartItems((c) => c.filter((i) => i.id !== itemId));

  const closeAdmin = () => { setAdminOpen(false); setAdminPassword(''); setAdminError(''); };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      if (res.ok) {
        storeAdminCredentials(adminPassword);
        closeAdmin();
        toast.success('Admin access granted');
        go('admin-order');
      } else {
        setAdminError('Invalid password');
      }
    } catch {
      setAdminError('Login failed. Please try again.');
    } finally {
      setAdminLoading(false);
    }
  };

  const showChrome = ['home', 'shop', 'checkout', 'proceed-checkout'].includes(currentPage);

  return (
    <div className="psv" style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <Toaster />

      {showChrome && (
        <Header
          cartCount={cartItems.length}
          onHome={() => go('home')}
          onShop={() => go('shop')}
          onCart={() => go('checkout')}
        />
      )}

      {currentPage === 'shop' && <CrumbBar onBack={() => go('home')} label="Customizer" right={<span className="mono-sm dim">Build</span>} />}
      {currentPage === 'checkout' && <CrumbBar onBack={() => go('shop')} label="Cart" />}
      {currentPage === 'proceed-checkout' && <CrumbBar onBack={() => go('checkout')} label="Order details" />}

      {currentPage === 'home' && <HomePage onShopNow={() => go('shop')} />}
      {currentPage === 'shop' && <ProductCustomizer onAddToCart={handleAddToCart} />}
      {currentPage === 'checkout' && (
        <CheckoutPage
          cartItems={cartItems}
          onRemoveFromCart={handleRemoveFromCart}
          onProceedCheckout={() => go('proceed-checkout')}
          onShop={() => go('shop')}
        />
      )}
      {currentPage === 'proceed-checkout' && <ProceedCheckoutPage cartItems={cartItems} onBack={() => go('checkout')} />}
      {currentPage === 'checkout-success' && <PaymentSuccess onBackToHome={() => go('home')} onContinueShopping={() => go('shop')} />}
      {currentPage === 'admin' && <AdminPanel onBack={() => go('home')} />}
      {currentPage === 'admin-order' && <AdminOrderPage onBack={() => go('home')} />}

      {showChrome && <Footer onShop={() => go('shop')} onAdmin={() => setAdminOpen(true)} />}

      {/* Admin auth modal */}
      {adminOpen && (
        <div className="modal-back" onClick={closeAdmin}>
          <form className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()} onSubmit={handleAdminSubmit}>
            <button type="button" className="modal-x" onClick={closeAdmin} aria-label="Close"><Icon.Close size={15} /></button>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--ink)' }}>
              <div className="mono dim" style={{ marginBottom: 8 }}>Staff access</div>
              <div className="display" style={{ fontSize: 26 }}>Sign in</div>
            </div>
            <div style={{ padding: 24 }}>
              <label className="field-label">Password</label>
              <input
                className="input"
                type="password"
                value={adminPassword}
                autoFocus
                onChange={(e) => { setAdminPassword(e.target.value); setAdminError(''); }}
                placeholder="••••••••"
              />
              {adminError && <p className="mono-sm" style={{ color: '#c0392b', marginTop: 10 }}>{adminError}</p>}
              <button className="btn btn-block" style={{ marginTop: 18 }} type="submit" disabled={adminLoading || !adminPassword}>
                {adminLoading ? 'Verifying…' : 'Enter dashboard'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
