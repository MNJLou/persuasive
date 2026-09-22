# Vercel → Cloudflare cutover — remaining steps

Code port done 2026-09-21 (see `worker/`, `wrangler.jsonc`, CLAUDE.md). Everything
below needs the Cloudflare account. Delete this file when cutover is complete.

- [x] 1. `npx wrangler login`, then `npx wrangler d1 list`. Put the real ID in
      `wrangler.jsonc` → `d1_databases[0].database_id` (currently
      `REPLACE_WITH_D1_DATABASE_ID`) and confirm `database_name` is `persuasive`.
- [x] 2. Secrets: `npx wrangler secret put ADMIN_PASSWORD`, `... RESEND_API_KEY`,
      `... YOCO_SECRET_KEY` (values are in `.dev.vars`).
- [x] 3. ~~Add `VITE_YOCO_PUBLIC_KEY` as a build variable.~~ NOT NEEDED — nothing in
      `src/` reads it; Yoco checkout is created server-side with `YOCO_SECRET_KEY`.
      Verified 2026-09-22: no pk_test/pk_live string in the built bundle.
- [x] 4. `npm run d1:migrate:remote` — safe on the existing DB (both migrations are
      idempotent); it just starts wrangler's migration tracking.
- [ ] 5. Commit + push `dev` (the ambassadors/D1 work is uncommitted too — same push).
      Cloudflare build: `npm run build`, deploy: `npx wrangler deploy`. Should go green.
- [ ] 6. Place a real test order on the `*.workers.dev` URL. Check: Yoco redirect
      back, both emails arrive, order + referral rows in D1, stock decremented.
- [ ] 7. Worker → Settings → Domains & Routes → add Custom Domains
      `persuasive.online`, `www.persuasive.online`, `admin.persuasive.online`.
      Delete the old Vercel A/CNAME records in Cloudflare DNS. Leave the Resend
      `send.contact` / `resend._domainkey.contact` TXT records alone.
- [ ] 8. Delete the Vercel project and its env vars.

Local dev from now on: `npm run dev` (Vite, :3000) + `npm run dev:api`
(`wrangler dev`, :8787) in a second terminal. Seed local D1 once with
`npm run d1:migrate:local` (already done on this machine).
