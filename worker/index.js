// Worker entry point. Only /api/* reaches this (assets.run_worker_first in
// wrangler.jsonc); the React build is served straight from the asset store.
//
// Each route is a plain `(request, env) => Response` function. The paths are
// the same ones the Vercel functions answered, so nothing in src/ changed.
import sendEmail from './routes/send-email.js';
import yocoCheckout from './routes/yoco/checkout.js';
import adminAuth from './routes/admin/auth.js';
import adminStock from './routes/admin/stock.js';
import adminAmbassadors from './routes/admin/ambassadors.js';
import adminReferrals from './routes/admin/referrals.js';
import ambassadorValidate from './routes/ambassador/validate.js';
import ordersRecord from './routes/orders/record.js';
import { json } from './lib/http.js';

const routes = {
  '/api/send-email': sendEmail,
  '/api/yoco/checkout': yocoCheckout,
  '/api/admin/auth': adminAuth,
  '/api/admin/stock': adminStock,
  '/api/admin/ambassadors': adminAmbassadors,
  '/api/admin/referrals': adminReferrals,
  '/api/ambassador/validate': ambassadorValidate,
  '/api/orders/record': ordersRecord,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const handler = routes[url.pathname.replace(/\/+$/, '')];

    if (!handler) {
      // A real 404 for unknown API paths; anything else that somehow lands
      // here goes to the asset store like a normal page request.
      if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404);
      return env.ASSETS.fetch(request);
    }

    try {
      return await handler(request, env, ctx);
    } catch (error) {
      // Handlers catch their own expected failures; this is the last line so a
      // thrown exception never becomes an opaque 1101 from the platform.
      console.error(`Unhandled error in ${url.pathname}:`, error);
      return json({ error: 'Internal server error' }, 500);
    }
  },
};
