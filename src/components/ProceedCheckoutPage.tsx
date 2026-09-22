// ============================================================
// PERSUASIVE — Order details + payment (redesigned).
// Backend preserved: stashes pendingOrder, POST /api/yoco/checkout, redirect.
// Charge model preserved: total = subtotal (shipping handled offline).
// ============================================================
import { useState } from 'react';
import { toast } from 'sonner';
import { CartItem } from '../App';
import { Icon } from './persuasive/ui';
import { itemTitle } from './CheckoutPage';
import { PROMO_CODES, newOrderRef, useAmbassadorCode } from '../lib/orderCodes';

interface ProceedCheckoutPageProps {
  cartItems: CartItem[];
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

export function ProceedCheckoutPage({ cartItems, onBack }: ProceedCheckoutPageProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '', surname: '', email: '', cellphone: '', country: '',
    streetAddress: '', apartment: '', suburb: '', city: '', postcode: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; rate: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const ambassador = useAmbassadorCode();

  const subtotal = cartItems.reduce((t, i) => t + i.price, 0);
  const discount = appliedPromo ? subtotal * appliedPromo.rate : 0;
  const total = subtotal - discount;
  const freeShip = cartItems.length >= 2;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handlePay = async () => {
    if (!formData.firstName || !formData.surname || !formData.email || !formData.cellphone) {
      toast.error('Please fill in all required billing details');
      return;
    }
    if (!formData.streetAddress || !formData.suburb || !formData.city || !formData.postcode) {
      toast.error('Please fill in all required delivery address fields');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        // Generated here so the reference survives the redirect to Yoco and back;
        // /api/orders/record uses it to make stock and commission idempotent.
        orderRef: newOrderRef(),
        cartItems,
        formData,
        total,
        subtotal,
        discount,
        promoCode: appliedPromo?.code || null,
        ambassadorCode: ambassador.applied?.code || null,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));

      const res = await fetch('/api/yoco/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100) }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ API Error:', errorData);
        toast.error(errorData.error || 'Failed to create checkout');
        setIsProcessing(false);
        localStorage.removeItem('pendingOrder');
        return;
      }

      const data = await res.json();
      if (!data.id || !data.redirectUrl) {
        console.error('❌ INVALID CHECKOUT RESPONSE:', data);
        toast.error('Invalid checkout session');
        setIsProcessing(false);
        localStorage.removeItem('pendingOrder');
        return;
      }

      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error('💥 Checkout error:', err);
      toast.error('Could not start payment: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsProcessing(false);
      localStorage.removeItem('pendingOrder');
    }
  };

  type Field = { name: keyof FormData; label: string; type: string; full?: boolean; optional?: boolean };
  const billing: Field[] = [
    { name: 'firstName', label: 'First name', type: 'text' },
    { name: 'surname', label: 'Surname', type: 'text' },
    { name: 'email', label: 'Email', type: 'email', full: true },
    { name: 'cellphone', label: 'Cell phone', type: 'tel', full: true },
  ];
  const delivery: Field[] = [
    { name: 'streetAddress', label: 'Street address', type: 'text', full: true },
    { name: 'apartment', label: 'Apartment, suite (optional)', type: 'text', full: true, optional: true },
    { name: 'suburb', label: 'Suburb', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'postcode', label: 'Postal code', type: 'text' },
    { name: 'country', label: 'Country (optional)', type: 'text', optional: true },
  ];

  return (
    <div className="psv wrap section" style={{ paddingTop: 48 }}>
      <h1 className="display" style={{ fontSize: 'clamp(34px,6vw,72px)', marginBottom: 34 }}>Order<br />Details</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,0.9fr)', gap: 'clamp(28px,4vw,60px)', alignItems: 'start' }} className="cart-grid">
        <div>
          <div className="eyebrow-row mono dim" style={{ marginBottom: 24 }}><span className="ln"></span> Billing details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
            {billing.map((f) => (
              <div key={f.name} style={f.full ? { gridColumn: '1 / -1' } : undefined}>
                <label className="field-label">{f.label}</label>
                <input className="input" type={f.type} name={f.name} value={formData[f.name]} onChange={handleInputChange} placeholder={f.label} />
              </div>
            ))}
          </div>

          <div className="eyebrow-row mono dim" style={{ margin: '40px 0 18px' }}><span className="ln"></span> Delivery address</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
            {delivery.map((f) => (
              <div key={f.name} style={f.full ? { gridColumn: '1 / -1' } : undefined}>
                <label className="field-label">{f.label}</label>
                <input className="input" type={f.type} name={f.name} value={formData[f.name]} onChange={handleInputChange} placeholder={f.label} />
              </div>
            ))}
          </div>

          <div className="eyebrow-row mono dim" style={{ margin: '40px 0 18px' }}><span className="ln"></span> Payment</div>
          <div style={{ border: '1px solid var(--ink)', padding: '18px 20px' }} className="spread">
            <span className="mono">Yoco — Card / Instant EFT</span>
            <span className="mono-sm dim">Secured</span>
          </div>
          <p className="mono-sm dim" style={{ marginTop: 14 }}>Shipping is calculated after your order is confirmed and emailed to you.</p>
        </div>

        <div style={{ border: '1px solid var(--ink)', position: 'sticky', top: 90 }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ink)', background: 'var(--ink)' }}><span className="mono" style={{ color: 'var(--paper)' }}>Your order</span></div>
          <div style={{ padding: 22 }}>
            {cartItems.map((it) => (
              <div key={it.id} className="spread" style={{ padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontSize: 13 }}>{itemTitle(it)} <span className="dim">· {it.size}</span></span>
                <span style={{ fontSize: 13 }}>R{it.price.toFixed(0)}</span>
              </div>
            ))}
            <div className="spread" style={{ marginTop: 16 }}><span className="dim" style={{ fontSize: 14 }}>Subtotal</span><span style={{ fontSize: 14 }}>R{subtotal.toFixed(2)}</span></div>
            {appliedPromo && (
              <div className="spread" style={{ marginTop: 10 }}>
                <span className="dim" style={{ fontSize: 14 }}>Discount ({appliedPromo.code} · {Math.round(appliedPromo.rate * 100)}%)</span>
                <span style={{ fontSize: 14, color: 'var(--accent)' }}>−R{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="spread" style={{ marginTop: 10 }}><span className="dim" style={{ fontSize: 14 }}>Shipping</span><span style={{ fontSize: 12 }}>{freeShip ? <span style={{ color: 'var(--accent)' }}>FREE</span> : <span className="dim">After order</span>}</span></div>

            <div style={{ marginTop: 16 }}>
              <label className="field-label">Promo code</label>
              {appliedPromo ? (
                <div className="spread" style={{ border: '1px solid var(--ink)', padding: '10px 14px' }}>
                  <span className="mono">{appliedPromo.code}</span>
                  <button type="button" className="navlink" onClick={handleRemovePromo}>Remove</button>
                </div>
              ) : (
                <div className="row" style={{ gap: 8 }}>
                  <input
                    className="input"
                    type="text"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromo(); } }}
                    placeholder="Enter code"
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn" onClick={handleApplyPromo}>Apply</button>
                </div>
              )}
              {promoError && <p className="mono-sm" style={{ marginTop: 8, color: 'var(--accent)' }}>{promoError}</p>}
            </div>


            <div style={{ marginTop: 16 }}>
              <label className="field-label">Ambassador code</label>
              {ambassador.applied ? (
                <div className="spread" style={{ border: '1px solid var(--ink)', padding: '10px 14px' }}>
                  <span className="mono">{ambassador.applied.code}</span>
                  <button type="button" className="navlink" onClick={ambassador.clear}>Remove</button>
                </div>
              ) : (
                <div className="row" style={{ gap: 8 }}>
                  <input
                    className="input"
                    type="text"
                    value={ambassador.input}
                    onChange={(e) => ambassador.setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ambassador.apply(); } }}
                    placeholder="Enter code"
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn" onClick={ambassador.apply} disabled={ambassador.checking || !ambassador.input.trim()}>
                    {ambassador.checking ? 'Checking' : 'Apply'}
                  </button>
                </div>
              )}
              <p className="mono-sm dim" style={{ marginTop: 8 }}>
                {ambassador.applied
                  ? `Referred by ${ambassador.applied.name}. Credited to them — your total is unchanged.`
                  : 'Optional. Credits your referrer — it does not change your total.'}
              </p>
              {ambassador.error && <p className="mono-sm" style={{ marginTop: 8, color: 'var(--accent)' }}>{ambassador.error}</p>}
            </div>

            <hr className="rule rule-ink" style={{ margin: '16px 0' }} />
            <div className="spread" style={{ marginBottom: 6 }}><span className="display" style={{ fontSize: 20 }}>Total</span><span className="display" style={{ fontSize: 24 }}>R{total.toFixed(2)}</span></div>
            <p className="mono-sm dim" style={{ marginBottom: 18 }}>Excludes shipping</p>
            <button className="btn btn-block btn-lg" disabled={isProcessing} onClick={handlePay}>{isProcessing ? 'Processing…' : <>Pay R{total.toFixed(0)} <Icon.Arrow className="arrow" /></>}</button>
            <button className="navlink" style={{ marginTop: 16, display: 'block' }} onClick={onBack} disabled={isProcessing}>Back to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
