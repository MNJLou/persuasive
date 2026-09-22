import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { adminJson, rand } from '../../lib/adminApi';

export interface Ambassador {
  id: number;
  code: string;
  name: string;
  email: string | null;
  commission_rate: number;
  active: number;
  created_at: string;
  order_count: number;
  referred_revenue: number;
  commission_total: number;
  commission_outstanding: number;
}

const emptyDraft = { code: '', name: '', email: '', percent: '10' };

export function AmbassadorsPanel() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  const load = async () => {
    try {
      const data = await adminJson<{ ambassadors: Ambassador[] }>('/api/admin/ambassadors');
      setAmbassadors(data.ambassadors);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load ambassadors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const percent = Number(draft.percent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      toast.error('Commission must be between 0 and 100 percent');
      return;
    }

    setSaving(true);
    try {
      await adminJson('/api/admin/ambassadors', {
        method: 'POST',
        body: JSON.stringify({
          code: draft.code,
          name: draft.name,
          email: draft.email || null,
          // Stored as a fraction; the form talks in percent because that is how
          // a rate gets agreed with an ambassador.
          commissionRate: percent / 100,
        }),
      });
      toast.success(`${draft.code.toUpperCase()} added`);
      setDraft(emptyDraft);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not add ambassador');
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: number, patch: Record<string, unknown>, message: string) => {
    try {
      await adminJson('/api/admin/ambassadors', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...patch }),
      });
      toast.success(message);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    }
  };

  const handleRateChange = (a: Ambassador, value: string) => {
    const percent = Number(value);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      toast.error('Commission must be between 0 and 100 percent');
      return;
    }
    if (percent / 100 === a.commission_rate) return;
    // Only future orders are affected — past referrals carry their own snapshot.
    update(a.id, { commissionRate: percent / 100 }, `${a.code} now earns ${percent}% on new orders`);
  };

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-1">Add an ambassador</h2>
        <p className="text-sm text-gray-500 mb-4">
          Codes are case-insensitive at checkout and cannot be changed afterwards — they are
          recorded on every order the ambassador refers.
        </p>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <Input
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              placeholder="JANE10"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Jane Dlamini"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commission %</label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={draft.percent}
              onChange={(e) => setDraft({ ...draft, percent: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Adding…' : 'Add ambassador'}
          </Button>
        </form>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Ambassadors</h2>
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : ambassadors.length === 0 ? (
          <p className="text-gray-500">No ambassadors yet. Add one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3 text-center">Rate</th>
                  <th className="py-3 px-3 text-right">Orders</th>
                  <th className="py-3 px-3 text-right">Referred</th>
                  <th className="py-3 px-3 text-right">Earned</th>
                  <th className="py-3 px-3 text-right">Outstanding</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {ambassadors.map((a) => (
                  <tr key={a.id} className={`border-b hover:bg-gray-50 ${a.active ? '' : 'opacity-50'}`}>
                    <td className="py-3 px-3 font-mono">{a.code}</td>
                    <td className="py-3 px-3">
                      {a.name}
                      {a.email && <div className="text-xs text-gray-500">{a.email}</div>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          className="w-20"
                          defaultValue={(a.commission_rate * 100).toString()}
                          onBlur={(e) => handleRateChange(a, e.target.value)}
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">{a.order_count}</td>
                    <td className="py-3 px-3 text-right">{rand(a.referred_revenue)}</td>
                    <td className="py-3 px-3 text-right">{rand(a.commission_total)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-amber-700">
                      {rand(a.commission_outstanding)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          update(
                            a.id,
                            { active: !a.active },
                            a.active ? `${a.code} deactivated` : `${a.code} reactivated`
                          )
                        }
                      >
                        {a.active ? 'Active' : 'Inactive'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-4">
              Deactivating a code stops it earning on new orders. Commission already owed is
              unaffected — every referral keeps the rate it was made at.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
