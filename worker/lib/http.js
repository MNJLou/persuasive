// Small helpers shared by every route: JSON responses, body parsing, and the
// admin gate.

export function json(data, status = 200) {
  return Response.json(data, { status });
}

// Parses a JSON body, tolerating an empty or malformed one (returns {}) so the
// handlers' own validation produces the 400, not a parse exception.
export async function readJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return {};
  }
}

// Constant-time string comparison. Lengths are compared first (a length leak is
// acceptable; the content is not), then the bytes via Web Crypto.
export function secretsMatch(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  if (x.byteLength !== y.byteLength) return false;
  return crypto.subtle.timingSafeEqual(x, y);
}

// Shared gate for admin-only endpoints.
//
// /api/admin/auth only compares a password and returns success — it issues no
// token, so the frontend's sessionStorage flag protects nothing on the server.
// Every admin endpoint therefore re-sends the password as a header and it is
// checked here. Returns a Response to send when the request is refused, or
// null when it may proceed.
export function requireAdmin(request, env) {
  const expected = env.ADMIN_PASSWORD;

  if (!expected) {
    console.error('ADMIN_PASSWORD is not set — refusing admin request');
    return json({ error: 'Server configuration error' }, 500);
  }

  const supplied = request.headers.get('x-admin-password');
  if (!secretsMatch(supplied, expected)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  return null;
}
