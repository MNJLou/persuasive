// Cloudflare D1 access through the Worker binding (env.DB).
//
// This replaces the REST client the Vercel functions used: no account ID, no
// database ID, no API token — the binding is wired in wrangler.jsonc and the
// query runs in-process. Same three functions, same return shapes, so the
// route handlers did not need to change how they call it.
//
// `db` is always passed in rather than read from a module-level variable:
// bindings are request-scoped in Workers and must never be cached globally.

// SELECT — returns the rows.
export async function d1Query(db, sql, params = []) {
  const { results } = await db.prepare(sql).bind(...params).all();
  return results ?? [];
}

// INSERT / UPDATE / DELETE — returns meta ({ changes, last_row_id, ... }).
// `changes` is what tells an ON CONFLICT DO NOTHING apart from a real insert.
export async function d1Run(db, sql, params = []) {
  const { meta } = await db.prepare(sql).bind(...params).run();
  return meta ?? {};
}

// Several statements in one round trip. Unlike the REST version this IS
// atomic: D1 runs a binding batch as a single transaction.
export async function d1Batch(db, statements) {
  if (!statements || statements.length === 0) return [];
  return db.batch(statements.map((s) => db.prepare(s.sql).bind(...(s.params || []))));
}
