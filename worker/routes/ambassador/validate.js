// Public: checks an ambassador code typed at checkout.
// Deliberately returns only { valid, name } — never the commission rate, and
// never a list. This endpoint is a code oracle by nature, so it must not leak
// anything beyond "yes, this belongs to someone, and here is who".
import { d1Query } from '../../lib/d1.js';
import { json } from '../../lib/http.js';

export default async function handler(request, env) {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const url = new URL(request.url);
  const code = String(url.searchParams.get('code') || '').trim().toUpperCase();
  if (!code) {
    return json({ error: 'Missing code' }, 400);
  }

  try {
    const rows = await d1Query(
      env.DB,
      'SELECT name FROM ambassadors WHERE code = ? AND active = 1 LIMIT 1',
      [code]
    );

    if (rows.length === 0) {
      return json({ valid: false });
    }

    return json({ valid: true, code, name: rows[0].name });
  } catch (error) {
    console.error('Ambassador validation failed:', error);
    return json({ error: 'Could not check that code right now' }, 503);
  }
}
