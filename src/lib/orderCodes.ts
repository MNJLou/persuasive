// Shared logic for the two codes a customer can type at checkout, plus the
// order reference that ties an order to its ledger row.
//
// Both ProceedCheckoutPage (public, `psv` styles) and AdminOrderPage (shadcn)
// use this. Only the logic is shared — each page keeps its own markup, because
// the two use different design systems and unifying them here would break the
// checkout page's look.
import { useState } from 'react';

// Promo codes → fractional discount on subtotal.
export const PROMO_CODES: Record<string, number> = {
  PER20: 0.20,
};

export interface AppliedAmbassador {
  code: string;
  name: string;
}

/**
 * Order reference, generated before payment so it survives the round trip to
 * Yoco. It is the idempotency key for /api/orders/record: without a stable
 * reference, a refresh of ?payment=success would decrement stock and pay
 * commission a second time.
 */
export function newOrderRef(): string {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : Date.now().toString(16) + Math.random().toString(16).slice(2).padEnd(16, '0');
  return `PSV-${random.slice(0, 32)}`;
}

/** Short, human-quotable form of an order reference, for screens and emails. */
export function displayOrderRef(orderRef: string): string {
  return `#${orderRef.slice(0, 14).toUpperCase()}`;
}

/**
 * Ambassador code entry. Attribution only — this never changes the price, so
 * it deliberately returns no rate or discount, and the endpoint it calls does
 * not expose one.
 */
export function useAmbassadorCode() {
  const [input, setInputState] = useState('');
  const [applied, setApplied] = useState<AppliedAmbassador | null>(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const setInput = (value: string) => {
    setInputState(value);
    setError('');
  };

  const apply = async () => {
    const code = input.trim().toUpperCase();
    if (!code) return;

    setChecking(true);
    setError('');
    try {
      const res = await fetch(`/api/ambassador/validate?code=${encodeURIComponent(code)}`);
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.valid) {
        setApplied({ code: data.code || code, name: data.name });
      } else {
        setApplied(null);
        setError(res.ok ? "We don't recognise that ambassador code" : 'Could not check that code — try again');
      }
    } catch {
      setApplied(null);
      setError('Could not check that code — try again');
    } finally {
      setChecking(false);
    }
  };

  const clear = () => {
    setApplied(null);
    setInputState('');
    setError('');
  };

  return { input, setInput, applied, error, checking, apply, clear };
}
