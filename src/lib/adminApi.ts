// Admin API access.
//
// api/admin/auth.js issues no token — it only compares a password — so the
// server previously had no way to tell an admin request from any other. Every
// admin endpoint now re-checks the password on each call, which means the
// browser has to keep it for the session. sessionStorage is per-tab and dies
// with the tab; it is not a substitute for real sessions, but it does close
// the door that `api/admin/stock.js` used to leave wide open.

const PASSWORD_KEY = 'adminPassword';
const AUTH_KEY = 'adminAuth';

export function storeAdminCredentials(password: string) {
  sessionStorage.setItem(AUTH_KEY, 'true');
  sessionStorage.setItem(PASSWORD_KEY, password);
}

export function clearAdminCredentials() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(PASSWORD_KEY);
}

export function isAdminAuthed(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const password = sessionStorage.getItem(PASSWORD_KEY) || '';
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': password,
      ...(init.headers || {}),
    },
  });
}

/** Throws with the server's message so callers can toast something useful. */
export async function adminJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await adminFetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const rand = (amount: number) =>
  `R${Number(amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
