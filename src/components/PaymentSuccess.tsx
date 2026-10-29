// ============================================================
// PERSUASIVE — Yoco return handler (redesigned visuals).
// Backend logic preserved verbatim: send-email + per-item stock decrement.
// ============================================================
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from './persuasive/ui';
import { displayOrderRef, newOrderRef } from '../lib/orderCodes';

interface OrderData {
  orderRef?: string;
  ambassadorCode?: string | null;
  cartItems: Array<{
    shirtColor: string;
    embroideryColor: string;
    size: string;
    price: number;
  }>;
  formData: {
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
  };
  total: number;
  subtotal: number;
  discount?: number;
  promoCode?: string | null;
}

interface PaymentSuccessProps {
  onBackToHome: () => void;
  onContinueShopping: () => void;
}

export function PaymentSuccess({ onBackToHome, onContinueShopping }: PaymentSuccessProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [ref, setRef] = useState('');

  useEffect(() => {
    const sendOrderEmail = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');

        if (paymentStatus === 'success') {
          setStatus('success');

          const orderDataJson = localStorage.getItem('pendingOrder');
          if (orderDataJson) {
            const orderData: OrderData = JSON.parse(orderDataJson);

            // Orders stashed before this feature shipped have no reference; mint one
            // so they still record rather than being dropped.
            const orderRef = orderData.orderRef || newOrderRef();
            setRef(displayOrderRef(orderRef));

            const emailRes = await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: orderData.formData.email,
                firstName: orderData.formData.firstName,
                surname: orderData.formData.surname,
                cellphone: orderData.formData.cellphone,
                streetAddress: orderData.formData.streetAddress,
                apartment: orderData.formData.apartment,
                suburb: orderData.formData.suburb,
                city: orderData.formData.city,
                postcode: orderData.formData.postcode,
                country: orderData.formData.country,
                cartItems: orderData.cartItems,
                total: orderData.total,
                subtotal: orderData.subtotal,
                discount: orderData.discount,
                promoCode: orderData.promoCode,
                ambassadorCode: orderData.ambassadorCode,
                orderRef,
              }),
            });

            const emailResponseData = await emailRes.json();

            if (emailRes.ok) {
              console.log('✅ Order confirmation email sent');
              toast.success('Order confirmation email sent!');
            } else {
              console.error('❌ Failed to send email:', emailResponseData);
              toast.error('Order successful, but email notification failed');
            }

            // Ledger + stock, in one idempotent call keyed on orderRef.
            // Deliberately outside the email check: the customer has paid, so
            // what they bought and what their referrer earned must be recorded
            // whether or not Resend cooperated.
            try {
              const recordRes = await fetch('/api/orders/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderRef,
                  customerName: `${orderData.formData.firstName} ${orderData.formData.surname}`.trim(),
                  customerEmail: orderData.formData.email,
                  cartItems: orderData.cartItems,
                  subtotal: orderData.subtotal,
                  discount: orderData.discount ?? 0,
                  total: orderData.total,
                  promoCode: orderData.promoCode ?? null,
                  ambassadorCode: orderData.ambassadorCode ?? null,
                }),
              });
              if (!recordRes.ok) {
                console.error('❌ Failed to record order:', await recordRes.text());
              }
            } catch (recordError) {
              // Nothing the customer can do about this, so it is not surfaced.
              // The owner notification email is the cross-check.
              console.error('❌ Failed to record order:', recordError);
            }

            localStorage.removeItem('pendingOrder');
          }

          window.history.replaceState({}, '', window.location.pathname);
        } else if (paymentStatus === 'cancelled' || paymentStatus === 'failed') {
          setStatus('failed');
          window.history.replaceState({}, '', window.location.pathname);
        } else {
          setStatus('success');
        }
      } catch (error) {
        console.error('💥 Error processing payment success:', error);
        setStatus('success');
      }
    };

    sendOrderEmail();
  }, []);

  if (status === 'loading') {
    return (
      <div className="psv section-dark" style={{ minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="center stack" style={{ alignItems: 'center', gap: 18 }}>
          <span className="mono" style={{ color: 'rgba(255,255,255,.6)' }}>Processing</span>
          <div className="display" style={{ color: 'var(--paper)', fontSize: 'clamp(34px,7vw,80px)' }}>ONE<br />MOMENT</div>
          <p style={{ color: 'rgba(255,255,255,.6)' }}>Confirming your payment…</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="psv section-dark" style={{ minHeight: '78vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap center stack" style={{ alignItems: 'center', gap: 24 }}>
          <span className="row" style={{ width: 64, height: 64, border: '1px solid var(--paper)', borderRadius: '50%', justifyContent: 'center', color: 'var(--paper)' }}><Icon.Close size={26} /></span>
          <div className="mono" style={{ color: 'rgba(255,255,255,.6)' }}>Payment failed</div>
          <h1 className="display" style={{ color: 'var(--paper)', fontSize: 'clamp(40px,9vw,120px)' }}>TRY<br />AGAIN</h1>
          <p style={{ color: 'rgba(255,255,255,.72)', maxWidth: 420 }}>Your payment was not successful. Please try again, or contact us if the problem persists.</p>
          <button className="btn btn-light" onClick={onBackToHome}>Return home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="psv section-dark" style={{ minHeight: '78vh', display: 'flex', alignItems: 'center' }}>
      <div className="wrap center stack" style={{ alignItems: 'center', gap: 26 }}>
        <span className="row" style={{ width: 64, height: 64, border: '1px solid var(--paper)', borderRadius: '50%', justifyContent: 'center', color: 'var(--paper)' }}><Icon.Check size={26} /></span>
        <div className="mono" style={{ color: 'rgba(255,255,255,.6)' }}>Order confirmed{ref ? ` · ${ref}` : ''}</div>
        <h1 className="display" style={{ color: 'var(--paper)', fontSize: 'clamp(40px,9vw,120px)' }}>THANK<br />YOU</h1>
        <p style={{ color: 'rgba(255,255,255,.72)', maxWidth: 440 }}>Your pieces are going into production. We stitch and dispatch within 3—5 business days. A confirmation is on its way to your inbox.</p>
        <div className="row" style={{ gap: 14, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-light" onClick={onContinueShopping}>Keep shopping</button>
          <button className="btn btn-ghost" style={{ color: 'var(--paper)', borderColor: 'var(--paper)' }} onClick={onBackToHome}>Home</button>
        </div>
      </div>
    </div>
  );
}
