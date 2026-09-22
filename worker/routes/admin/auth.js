import { json, readJson, secretsMatch } from '../../lib/http.js';

export default async function handler(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const { password } = await readJson(request);
  const ADMIN_PASSWORD = env.ADMIN_PASSWORD; // `wrangler secret put ADMIN_PASSWORD`

  if (ADMIN_PASSWORD && secretsMatch(password, ADMIN_PASSWORD)) {
    return json({ success: true });
  }

  return json({ error: 'Invalid password' }, 401);
}
