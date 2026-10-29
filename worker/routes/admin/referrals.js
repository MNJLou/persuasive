// The commission ledger: which orders each ambassador referred, what they
// earned, and what has actually been paid out.
import { d1Query, d1Run } from '../../lib/d1.js';
import { json, readJson, requireAdmin } from '../../lib/http.js';

export default async function handler(request, env) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;

  try {
    if (request.method === 'GET') {
      const qs = new URL(request.url).searchParams;
      const ambassadorId = qs.get('ambassadorId');
      const paid = qs.get('paid');

      const where = [];
      const params = [];
      if (ambassadorId) {
        where.push('r.ambassador_id = ?');
        params.push(Number(ambassadorId));
      }
      if (paid === '0' || paid === '1') {
        where.push('r.paid_out = ?');
        params.push(Number(paid));
      }

      const rows = await d1Query(env.DB,
        `SELECT r.id, r.order_ref, r.ambassador_id, r.ambassador_code,
                r.commission_rate, r.commission_amount, r.paid_out, r.paid_out_at, r.created_at,
                a.name  AS ambassador_name,
                o.customer_name, o.customer_email, o.total AS order_total,
                o.promo_code, o.is_admin_order
         FROM referrals r
         JOIN ambassadors a ON a.id = r.ambassador_id
         LEFT JOIN orders o ON o.order_ref = r.order_ref
         ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
         ORDER BY r.created_at DESC
         LIMIT 500`,
        params
      );

      const [totals] = await d1Query(env.DB,
        `SELECT COALESCE(SUM(commission_amount), 0)                                   AS total_earned,
                COALESCE(SUM(CASE WHEN paid_out = 0 THEN commission_amount END), 0)   AS outstanding,
                COALESCE(SUM(CASE WHEN paid_out = 1 THEN commission_amount END), 0)   AS paid
         FROM referrals
         ${ambassadorId ? 'WHERE ambassador_id = ?' : ''}`,
        ambassadorId ? [Number(ambassadorId)] : []
      );

      return json({ referrals: rows, totals });
    }

    if (request.method === 'PATCH') {
      const { id, ambassadorId, paidOut } = await readJson(request);
      if (paidOut === undefined) return json({ error: 'Missing paidOut' }, 400);

      const flag = paidOut ? 1 : 0;
      const stamp = paidOut ? new Date().toISOString() : null;

      if (id) {
        await d1Run(env.DB, 'UPDATE referrals SET paid_out = ?, paid_out_at = ? WHERE id = ?', [
          flag,
          stamp,
          id,
        ]);
        return json({ success: true });
      }

      // Settling up with one ambassador: mark everything currently outstanding.
      // Scoped to paid_out = 0 so an already-settled row keeps its original date.
      if (ambassadorId && paidOut) {
        const meta = await d1Run(env.DB,
          'UPDATE referrals SET paid_out = 1, paid_out_at = ? WHERE ambassador_id = ? AND paid_out = 0',
          [stamp, Number(ambassadorId)]
        );
        return json({ success: true, updated: meta.changes ?? null });
      }

      return json({ error: 'Provide id, or ambassadorId with paidOut: true' }, 400);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Referral admin request failed:', error);
    return json({ error: 'Request failed', details: error.message }, 500);
  }
}
