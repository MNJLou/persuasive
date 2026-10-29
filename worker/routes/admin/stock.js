// Stock, backed by Cloudflare D1.
//
// This used to be a module-level array, which meant every cold start and every
// redeploy silently reset availability to the hardcoded seed values. The rows
// now live in the `stock` table (seeded by migrations/0002_seed_stock.sql).
//
// The GET/POST/PUT/DELETE contract is unchanged so ProductCustomizer and
// AdminPanel need no rewrite. GET stays public — the customiser calls it to
// show availability. Writes are admin-only.
import { d1Query, d1Run } from '../../lib/d1.js';
import { json, readJson, requireAdmin } from '../../lib/http.js';

export default async function handler(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    if (request.method === 'GET') {
      const stock = await d1Query(env.DB,
        'SELECT color, size, stock FROM stock ORDER BY color COLLATE NOCASE, size'
      );
      return json({ stock });
    }

    const denied = requireAdmin(request, env);
    if (denied) return denied;

    if (request.method === 'POST') {
      // Set an absolute amount.
      const { color, size, stock } = await readJson(request);
      if (!color || !size || !Number.isFinite(Number(stock))) {
        return json({ error: 'Missing color, size or stock' }, 400);
      }
      await d1Run(env.DB,
        `INSERT INTO stock (color, size, stock) VALUES (?, ?, ?)
         ON CONFLICT(color, size) DO UPDATE SET stock = excluded.stock`,
        [color, size, Math.max(0, Math.trunc(Number(stock)))]
      );
      return json({ success: true });
    }

    if (request.method === 'PUT') {
      // Relative adjustment (the +/- buttons in the admin table).
      const { color, size, change } = await readJson(request);
      if (!color || !size || !Number.isFinite(Number(change))) {
        return json({ error: 'Missing color, size or change' }, 400);
      }
      const meta = await d1Run(env.DB,
        'UPDATE stock SET stock = MAX(0, stock + ?) WHERE color = ? AND size = ?',
        [Math.trunc(Number(change)), color, size]
      );
      if (meta.changes === 0) {
        return json({ error: 'Stock item not found' }, 404);
      }
      return json({ success: true });
    }

    if (request.method === 'DELETE') {
      // Reduce by quantity. Order flows no longer use this — they go through
      // /api/orders/record, which decrements idempotently against an orderRef.
      const { color, size, quantity } = await readJson(request);
      if (!color || !size || !Number.isFinite(Number(quantity))) {
        return json({ error: 'Missing color, size or quantity' }, 400);
      }
      const meta = await d1Run(env.DB,
        'UPDATE stock SET stock = MAX(0, stock - ?) WHERE color = ? AND size = ?',
        [Math.max(0, Math.trunc(Number(quantity))), color, size]
      );
      if (meta.changes === 0) {
        return json({ error: 'Stock item not found' }, 404);
      }
      return json({ success: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Stock request failed:', error);
    return json({ error: 'Stock request failed', details: error.message }, 500);
  }
}
