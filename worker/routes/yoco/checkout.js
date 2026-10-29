// Creates a Yoco hosted-checkout session. Same-origin only now — the old
// wildcard CORS headers are gone; the frontend is served from this Worker.
import { json, readJson } from '../../lib/http.js';

export default async function handler(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const { amount } = await readJson(request);
  console.log('➡️ Amount received:', amount);

  if (typeof amount !== 'number' || amount <= 0) {
    return json({ error: 'Invalid amount' }, 400);
  }

  try {
    // Yoco sends the customer back here after payment; App.tsx reads ?payment=.
    const baseUrl = new URL(request.url).origin;

    console.log('🔐 Using Yoco Secret Key:', env.YOCO_SECRET_KEY ? '✅ Found' : '❌ Missing');

    const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'ZAR',
        successUrl: `${baseUrl}?payment=success`,
        cancelUrl: `${baseUrl}?payment=cancelled`,
        failureUrl: `${baseUrl}?payment=failed`,
      }),
    });

    const data = await yocoResponse.json();
    console.log('YOCO RAW RESPONSE:', JSON.stringify(data, null, 2));

    if (!yocoResponse.ok) {
      console.error('❌ Yoco API Error:', data);
      return json(data, yocoResponse.status);
    }

    console.log('✅ Checkout created successfully:', data.id);
    return json(data);
  } catch (err) {
    console.error('💥 CHECKOUT FAILED:', err);
    return json({ error: 'Checkout failed', details: err.message }, 500);
  }
}
