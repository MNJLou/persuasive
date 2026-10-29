import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { adminJson, rand } from '../../lib/adminApi';
import type { Ambassador } from './AmbassadorsPanel';

interface Referral {
  id: number;
  order_ref: string;
  ambassador_id: number;
  ambassador_code: string;
  ambassador_name: string;
  commission_rate: number;
  commission_amount: number;
  paid_out: number;
  paid_out_at: string | null;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  order_total: number | null;
  promo_code: string | null;
  is_admin_order: number;
}

interface Totals {
  total_earned: number;
  outstanding: number;
  paid: number;
}

type PaidFilter = 'all' | 'unpaid' | 'paid';

const shortRef = (ref: string) => ref.slice(0, 14).toUpperCase();
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

export function CommissionsPanel() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [ambassadorId, setAmbassadorId] = useState('');
  const [paidFilter, setPaidFilter] = useState<PaidFilter>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (ambassadorId) params.set('ambassadorId', ambassadorId);
      if (paidFilter === 'unpaid') params.set('paid', '0');
      if (paidFilter === 'paid') params.set('paid', '1');

      const query = params.toString();
      const data = await adminJson<{ referrals: Referral[]; totals: Totals }>(
        `/api/admin/referrals${query ? `?${query}` : ''}`
      );
      setReferrals(data.referrals);
      setTotals(data.totals);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load commissions');
    } finally {
      setLoading(false);
    }
  }, [ambassadorId, paidFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    adminJson<{ ambassadors: Ambassador[] }>('/api/admin/ambassadors')
      .then((data) => setAmbassadors(data.ambassadors))
      .catch(() => {
        /* the filter is a convenience; the ledger below still loads */
      });
  }, []);

  const setPaid = async (body: Record<string, unknown>, message: string) => {
    try {
      await adminJson('/api/admin/referrals', { method: 'PATCH', body: JSON.stringify(body) });
      toast.success(message);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    }
  };

  const selected = ambassadors.find((a) => String(a.id) === ambassadorId);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="text-xs uppercase tracking-wide text-gray-500">Earned to date</div>
          <div className="text-2xl font-semibold mt-1">{rand(totals?.total_earned ?? 0)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-amber-400">
          <div className="text-xs uppercase tracking-wide text-gray-500">Owed now</div>
          <div className="text-2xl font-semibold mt-1 text-amber-700">{rand(totals?.outstanding ?? 0)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="text-xs uppercase tracking-wide text-gray-500">Paid out</div>
          <div className="text-2xl font-semibold mt-1 text-green-700">{rand(totals?.paid ?? 0)}</div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-3 items-end justify-between mb-5">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ambassador</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                value={ambassadorId}
                onChange={(e) => setAmbassadorId(e.target.value)}
              >
                <option value="">All ambassadors</option>
                {ambassadors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                value={paidFilter}
                onChange={(e) => setPaidFilter(e.target.value as PaidFilter)}
              >
                <option value="all">All</option>
                <option value="unpaid">Owed</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {selected && selected.commission_outstanding > 0 && (
            <Button
              onClick={() =>
                setPaid(
                  { ambassadorId: selected.id, paidOut: true },
                  `Marked ${rand(selected.commission_outstanding)} paid to ${selected.name}`
                )
              }
            >
              Mark {rand(selected.commission_outstanding)} paid to {selected.name}
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : referrals.length === 0 ? (
          <p className="text-gray-500">No referrals match this filter yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Order</th>
                  <th className="py-3 px-3">Ambassador</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3 text-right">Order total</th>
                  <th className="py-3 px-3 text-center">Rate</th>
                  <th className="py-3 px-3 text-right">Commission</th>
                  <th className="py-3 px-3 text-center">Payout</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 whitespace-nowrap">{shortDate(r.created_at)}</td>
                    <td className="py-3 px-3 font-mono text-xs">
                      {shortRef(r.order_ref)}
                      {r.is_admin_order ? (
                        <span className="ml-2 text-amber-700">admin</span>
                      ) : null}
                    </td>
                    <td className="py-3 px-3">
                      {r.ambassador_name}
                      <div className="text-xs text-gray-500 font-mono">{r.ambassador_code}</div>
                    </td>
                    <td className="py-3 px-3">
                      {r.customer_name || '—'}
                      {r.customer_email && (
                        <div className="text-xs text-gray-500">{r.customer_email}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">{rand(r.order_total ?? 0)}</td>
                    {/* The rate as it was when the sale happened, not today's. */}
                    <td className="py-3 px-3 text-center">{(r.commission_rate * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 text-right font-semibold">{rand(r.commission_amount)}</td>
                    <td className="py-3 px-3 text-center">
                      {r.paid_out ? (
                        <button
                          type="button"
                          className="text-green-700 hover:underline"
                          title={r.paid_out_at ? `Paid ${shortDate(r.paid_out_at)} — click to undo` : 'Click to undo'}
                          onClick={() => setPaid({ id: r.id, paidOut: false }, 'Marked as unpaid')}
                        >
                          Paid
                        </button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPaid({ id: r.id, paidOut: true }, 'Marked as paid')}
                        >
                          Mark paid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-4">
              Payouts happen outside this site — marking a row paid only records that you have
              settled it. Commission amounts are fixed at the time of sale and never recalculated.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
