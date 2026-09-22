// Records a completed order: the order row, the ambassador referral (if any),
// and the stock decrement — in that order, all keyed on a single orderRef.
//
// Called once per order by PaymentSuccess (paid) and AdminOrderPage (admin).
// It replaces the per-item DELETE loop that used to run against /api/admin/stock.
import { d1Query, d1Run, d1Batch } from '../../lib/d1.js';
import { json, readJson } from '../../lib/http.js';

const round2 = (n) => Math.round(n * 100) / 100;

export default async function handler(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const {
    orderRef,
    customerName = null,
    customerEmail = null,
    cartItems,
    subtotal = 0,
    discount = 0,
    total = 0,
    promoCode = null,
    ambassadorCode = null,
    isAdminOrder = false,
  } = await readJson(request);

  if (!orderRef || !Array.isArray(cartItems) || cartItems.length === 0) {
    return json({ error: 'Missing orderRef or cartItems' }, 400);
  }

  const code = String(ambassadorCode || '').trim().toUpperCase();
  const now = new Date().toISOString();

  try {
    // 1. Idempotency. A refresh of ?payment=success, a double submit or a retry
    //    must not decrement stock twice or pay an ambassador twice. The order
    //    reference is generated once, before payment, and is the only guard.
    const existing = await d1Query(env.DB, 'SELECT order_ref FROM orders WHERE order_ref = ? LIMIT 1', [
      orderRef,
    ]);
    if (existing.length > 0) {
      console.log(`Order ${orderRef} already recorded — skipping`);
      return json({ success: true, alreadyRecorded: true });
    }

    await d1Run(env.DB,
      `INSERT INTO orders (order_ref, customer_name, customer_email, subtotal, discount, total,
                           promo_code, ambassador_code, is_admin_order, items_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(order_ref) DO NOTHING`,
      [
        orderRef,
        customerName,
        customerEmail,
        round2(subtotal),
        round2(discount),
        round2(total),
        promoCode || null,
        code || null,
        isAdminOrder ? 1 : 0,
        JSON.stringify(cartItems),
        now,
      ]
    );

    // 2. Commission. Rate and amount are snapshotted here so that changing an
    //    ambassador's terms later never rewrites what is already owed.
    //    An unknown or deactivated code is not an error — the order stands, it
    //    just earns nobody anything.
    let referral = null;
    if (code) {
      const [ambassador] = await d1Query(env.DB,
        'SELECT id, code, name, commission_rate FROM ambassadors WHERE code = ? AND active = 1 LIMIT 1',
        [code]
      );

      if (ambassador) {
        const commissionAmount = round2(ambassador.commission_rate * total);
        await d1Run(env.DB,
          `INSERT INTO referrals (order_ref, ambassador_id, ambassador_code, commission_rate,
                                  commission_amount, created_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(order_ref) DO NOTHING`,
          [orderRef, ambassador.id, ambassador.code, ambassador.commission_rate, commissionAmount, now]
        );
        referral = { code: ambassador.code, name: ambassador.name, commissionAmount };
        console.log(`Order ${orderRef}: R${commissionAmount} commission to ${ambassador.name}`);
      } else {
        console.warn(`Order ${orderRef}: code "${code}" is unknown or inactive — no commission`);
      }
    }

    // 3. Stock. The customer has already paid at this point, so a stock failure
    //    must not fail the request — it is reported instead.
    let stockError = null;
    try {
      await d1Batch(env.DB,
        cartItems.map((item) => ({
          // Caps and crop tops have no stock rows; those updates match nothing,
          // which matches the previous behaviour of the DELETE loop.
          sql: 'UPDATE stock SET stock = MAX(0, stock - 1) WHERE color = ? AND size = ?',
          params: [`${item.shirtColor}-${item.embroideryColor}`, item.size],
        }))
      );
    } catch (error) {
      console.error(`Order ${orderRef}: stock decrement failed:`, error);
      stockError = error.message;
    }

    return json({ success: true, orderRef, referral, stockError });
  } catch (error) {
    console.error('Failed to record order:', error);
    return json({ error: 'Failed to record order', details: error.message }, 500);
  }
}
