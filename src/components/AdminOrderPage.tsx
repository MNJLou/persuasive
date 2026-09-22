import { useEffect, useState } from 'react';
import { ProductCustomizer } from './ProductCustomizer';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CartItem } from '../App';
import { CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { itemTitle, itemVariant } from './CheckoutPage';
import { PROMO_CODES, newOrderRef, useAmbassadorCode } from '../lib/orderCodes';

interface AdminOrderPageProps {
  onBack: () => void;
}

interface FormData {
  firstName: string;
  surname: string;
  email: string;
  cellphone: string;
  country: string;
  streetAddress: string;
  apartment: string;
  suburb: string;
  city: string;
  postcode: string;
}

const emptyForm: FormData = {
  firstName: '',
  surname: '',
  email: '',
  cellphone: '',
  country: '',
  streetAddress: '',
  apartment: '',
  suburb: '',
  city: '',
  postcode: '',
};

export function AdminOrderPage({ onBack }: AdminOrderPageProps) {
  const [authorized, setAuthorized] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; rate: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const ambassador = useAmbassadorCode();

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') === 'true') {
      setAuthorized(true);
    } else {
      toast.error('Admin authentication required');
      onBack();
    }
  }, [onBack]);

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => [...prev, { ...item, id: Date.now().toString() }]);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const discount = appliedPromo ? subtotal * appliedPromo.rate : 0;
  const total = subtotal - discount;

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const rate = PROMO_CODES[code];
    if (rate === undefined) {
      setAppliedPromo(null);
      setPromoError('Invalid promo code');
      return;
    }
    setAppliedPromo({ code, rate });
    setPromoError('');
    toast.success(`Promo ${code} applied — ${Math.round(rate * 100)}% off`);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Add at least one item to the cart');
      return;
    }

    if (!formData.firstName || !formData.surname || !formData.email || !formData.cellphone) {
      toast.error('Please fill in all required billing details');
      return;
    }

    if (!formData.streetAddress || !formData.suburb || !formData.city || !formData.postcode) {
      toast.error('Please fill in all required delivery address fields');
      return;
    }

    setIsProcessing(true);
    const orderRef = newOrderRef();

    try {
      const emailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          surname: formData.surname,
          cellphone: formData.cellphone,
          streetAddress: formData.streetAddress,
          apartment: formData.apartment,
          suburb: formData.suburb,
          city: formData.city,
          postcode: formData.postcode,
          country: formData.country,
          cartItems,
          total,
          subtotal,
          discount,
          promoCode: appliedPromo?.code || null,
          ambassadorCode: ambassador.applied?.code || null,
          orderRef,
          isAdminOrder: true,
        }),
      });

      if (!emailRes.ok) {
        const errData = await emailRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send order email');
      }

      // Ledger + stock in one idempotent call, same path the paid flow uses.
      const recordRes = await fetch('/api/orders/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderRef,
          customerName: `${formData.firstName} ${formData.surname}`.trim(),
          customerEmail: formData.email,
          cartItems,
          subtotal,
          discount,
          total,
          promoCode: appliedPromo?.code || null,
          ambassadorCode: ambassador.applied?.code || null,
          isAdminOrder: true,
        }),
      });

      if (!recordRes.ok) {
        // The emails have already gone out, so the order still stands — but an
        // admin needs to know stock and commission were not written.
        console.error('Failed to record admin order:', await recordRes.text());
        toast.error('Order emailed, but recording it failed — check stock and commission');
      }

      toast.success('Admin order placed successfully');
      setOrderPlaced(true);
    } catch (err) {
      console.error('Admin order error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceAnother = () => {
    setCartItems([]);
    setFormData(emptyForm);
    setOrderPlaced(false);
    handleRemovePromo();
    ambassador.clear();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!authorized) {
    return null;
  }

  if (orderPlaced) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Admin Order Placed</h1>
          <p className="text-gray-600 mb-2 text-center max-w-md">
            Confirmation emails have been sent and stock has been updated.
          </p>
          <div className="flex gap-4 mt-6">
            <Button onClick={onBack} size="lg" variant="outline">
              Back to Home
            </Button>
            <Button onClick={handlePlaceAnother} size="lg">
              Place Another Order
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg">
        <p className="text-sm text-amber-900">
          <strong>Admin order mode:</strong> orders placed here skip payment. Stock will be decremented and confirmation emails will be sent as if the order had been paid for.
        </p>
      </div>

      <ProductCustomizer onAddToCart={handleAddToCart} />

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Cart</h2>
        {cartItems.length === 0 ? (
          <p className="text-gray-500">No items added yet.</p>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 bg-white space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span>
                  {itemTitle(item)} — {itemVariant(item)} ({item.size})
                </span>
                <div className="flex items-center gap-4">
                  <span>R{item.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount ({appliedPromo.code} · {Math.round(appliedPromo.rate * 100)}%)</span>
                  <span>−R{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Promo code</label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <span className="font-mono">{appliedPromo.code}</span>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromo(); } }}
                      placeholder="Enter code"
                    />
                    <Button type="button" variant="outline" onClick={handleApplyPromo}>
                      Apply
                    </Button>
                  </div>
                )}
                {promoError && <p className="text-sm text-red-600 mt-1">{promoError}</p>}
              </div>


              <div className="pt-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ambassador code</label>
                {ambassador.applied ? (
                  <div className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <span className="font-mono">{ambassador.applied.code}</span>
                    <button
                      type="button"
                      onClick={ambassador.clear}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={ambassador.input}
                      onChange={(e) => ambassador.setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ambassador.apply(); } }}
                      placeholder="Enter code"
                    />
                    <Button type="button" variant="outline" onClick={ambassador.apply} disabled={ambassador.checking || !ambassador.input.trim()}>
                      {ambassador.checking ? 'Checking' : 'Apply'}
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {ambassador.applied
                    ? `Referred by ${ambassador.applied.name}. Commission is tracked separately — the total is unchanged.`
                    : 'Optional. Attribution only — it does not discount the order.'}
                </p>
                {ambassador.error && <p className="text-sm text-red-600 mt-1">{ambassador.error}</p>}
              </div>

              <div className="flex justify-between font-semibold text-blue-600 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Details</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Billing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <Input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                <Input type="text" name="surname" value={formData.surname} onChange={handleInputChange} placeholder="Doe" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cell Phone Number</label>
                <Input type="tel" name="cellphone" value={formData.cellphone} onChange={handleInputChange} placeholder="+27 12 345 6789" required />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Delivery Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <Input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} placeholder="123 Main Street" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apartment, Suite, Etc. (Optional)</label>
                <Input type="text" name="apartment" value={formData.apartment} onChange={handleInputChange} placeholder="Apt. 4B" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                <Input type="text" name="suburb" value={formData.suburb} onChange={handleInputChange} placeholder="Suburb name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Town / City</label>
                <Input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Johannesburg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Post Code</label>
                <Input type="text" name="postcode" value={formData.postcode} onChange={handleInputChange} placeholder="2000" required />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-8">
          <Button
            type="button"
            size="lg"
            className="flex-1"
            disabled={isProcessing || cartItems.length === 0}
            onClick={handlePlaceOrder}
          >
            {isProcessing ? 'Placing Order...' : `Place Order (Admin) — R${total.toFixed(2)}`}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </section>
    </main>
  );
}
