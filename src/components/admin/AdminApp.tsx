// The admin site, served at admin.persuasive.online.
//
// Same deployment as the public shop — App.tsx hands over here when the
// hostname starts with `admin.` — so there is one codebase and one deploy, and
// the /api routes it calls are same-origin.
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AdminPanel } from '../AdminPanel';
import { AdminOrderPage } from '../AdminOrderPage';
import { AmbassadorsPanel } from './AmbassadorsPanel';
import { CommissionsPanel } from './CommissionsPanel';
import { clearAdminCredentials, isAdminAuthed, storeAdminCredentials } from '../../lib/adminApi';

type Tab = 'ambassadors' | 'commissions' | 'stock' | 'order';

const TABS: { id: Tab; label: string }[] = [
  { id: 'ambassadors', label: 'Ambassadors' },
  { id: 'commissions', label: 'Commissions' },
  { id: 'stock', label: 'Stock' },
  { id: 'order', label: 'Place order' },
];

export function AdminApp() {
  const [authenticated, setAuthenticated] = useState(isAdminAuthed);
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('ambassadors');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // Kept for the session so each admin API call can re-prove itself —
        // the auth endpoint issues no token. See src/lib/adminApi.ts.
        storeAdminCredentials(password);
        setAuthenticated(true);
        setPassword('');
        toast.success('Signed in');
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearAdminCredentials();
    setAuthenticated(false);
    setTab('ambassadors');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form onSubmit={handleLogin} className="max-w-md w-full bg-white p-8 rounded-lg shadow-md space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Persuasive admin</h1>
            <p className="text-sm text-gray-500 mt-1">Stock, ambassadors and commissions.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              autoFocus
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter admin password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loggingIn || !password}>
            {loggingIn ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Persuasive admin</h1>
            <p className="text-xs text-gray-500">{window.location.hostname}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'ambassadors' && <AmbassadorsPanel />}
        {tab === 'commissions' && <CommissionsPanel />}
        {tab === 'stock' && <AdminPanel embedded onBack={() => setTab('ambassadors')} />}
        {tab === 'order' && <AdminOrderPage onBack={() => setTab('ambassadors')} />}
      </main>
    </div>
  );
}
