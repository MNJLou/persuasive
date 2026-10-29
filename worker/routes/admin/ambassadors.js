// Admin CRUD for ambassadors, plus the per-ambassador rollups the payout
// screens need. Same-origin only — no CORS headers, so no wildcard exposure.
import { d1Query, d1Run } from '../../lib/d1.js';
import { json, readJson, requireAdmin } from '../../lib/http.js';

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9._-]{1,23}$/;

export default async function handler(request, env) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;

  try {
    if (request.method === 'GET') {
      // Totals come from the snapshotted referral rows, never from the live rate.
      const rows = await d1Query(env.DB,
        `SELECT a.id, a.code, a.name, a.email, a.commission_rate, a.active, a.created_at,
                COUNT(r.id)                                                            AS order_count,
                COALESCE(SUM(o.total), 0)                                              AS referred_revenue,
                COALESCE(SUM(r.commission_amount), 0)                                  AS commission_total,
                COALESCE(SUM(CASE WHEN r.paid_out = 0 THEN r.commission_amount END), 0) AS commission_outstanding
         FROM ambassadors a
         LEFT JOIN referrals r ON r.ambassador_id = a.id
         LEFT JOIN orders    o ON o.order_ref = r.order_ref
         GROUP BY a.id
         ORDER BY a.active DESC, a.name COLLATE NOCASE`
      );
      return json({ ambassadors: rows });
    }

    if (request.method === 'POST') {
      const { code, name, email = null, commissionRate } = await readJson(request);
      const normalised = String(code || '').trim().toUpperCase();
      const rate = Number(commissionRate);

      if (!CODE_PATTERN.test(normalised)) {
        return json({
          error: 'Code must be 2–24 characters: letters, digits, dot, dash or underscore',
        }, 400);
      }
      if (!String(name || '').trim()) {
        return json({ error: 'Name is required' }, 400);
      }
      if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
        return json({ error: 'Commission rate must be between 0 and 1' }, 400);
      }

      const clash = await d1Query(env.DB, 'SELECT id FROM ambassadors WHERE code = ? LIMIT 1', [normalised]);
      if (clash.length > 0) {
        return json({ error: `Code ${normalised} is already in use` }, 409);
      }

      await d1Run(env.DB,
        `INSERT INTO ambassadors (code, name, email, commission_rate, active, created_at)
         VALUES (?, ?, ?, ?, 1, ?)`,
        [normalised, String(name).trim(), email || null, rate, new Date().toISOString()]
      );

      return json({ success: true, code: normalised }, 201);
    }

    if (request.method === 'PATCH') {
      const { id, name, email, commissionRate, active } = await readJson(request);
      if (!id) return json({ error: 'Missing id' }, 400);

      // The code itself is intentionally not editable: it is snapshotted onto
      // every referral, and printed on whatever the ambassador hands out.
      const sets = [];
      const params = [];

      if (name !== undefined) {
        if (!String(name).trim()) return json({ error: 'Name cannot be empty' }, 400);
        sets.push('name = ?');
        params.push(String(name).trim());
      }
      if (email !== undefined) {
        sets.push('email = ?');
        params.push(email || null);
      }
      if (commissionRate !== undefined) {
        const rate = Number(commissionRate);
        if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
          return json({ error: 'Commission rate must be between 0 and 1' }, 400);
        }
        sets.push('commission_rate = ?');
        params.push(rate);
      }
      if (active !== undefined) {
        sets.push('active = ?');
        params.push(active ? 1 : 0);
      }

      if (sets.length === 0) return json({ error: 'Nothing to update' }, 400);

      params.push(id);
      await d1Run(env.DB, `UPDATE ambassadors SET ${sets.join(', ')} WHERE id = ?`, params);
      return json({ success: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Ambassador admin request failed:', error);
    return json({ error: 'Request failed', details: error.message }, 500);
  }
}
