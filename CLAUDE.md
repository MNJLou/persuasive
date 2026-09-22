# Persuasive — Project Context

E-commerce site for the "Persuasive" custom-embroidery shirt brand. Single-product builder (color + embroidery color + size), Yoco checkout, Resend email confirmations.

## Stack
- React 18 + TypeScript + Vite (`vite 6.3.5`)
- Tailwind + shadcn/ui (Radix primitives) — components live in `src/components/ui/`
- Cloudflare Workers for hosting: the Vite build is served as static assets, `worker/index.js` answers `/api/*`. Config in `wrangler.jsonc`. **Ported from Vercel 2026-09-21, deployed and verified live 2026-09-22.**
- Resend for transactional email
- Yoco hosted checkout for payments (ZAR, cents)
- Cloudflare D1 for durable data (stock, orders, ambassadors, commissions), via the `DB` binding

## Dev commands
- `npm run dev` — Vite on `:3000`, UI only, but it **proxies `/api/*` to `:8787`**. Run `npm run dev:api` (`wrangler dev`) in a second terminal and you have the full stack with hot reload. Without it, API calls fail with a proxy error.
- `npm run dev:cf` — `vite build && wrangler dev`: the production shape (Worker serving `dist/`) at `localhost:8787`. No hot reload.
- `wrangler dev` uses a **local** D1 (`.wrangler/state`). Seed it once with `npm run d1:migrate:local`. Secrets come from `.dev.vars`.
- `npm run deploy` — `vite build && wrangler deploy`. **This is the only way the site ships.** Workers Builds is NOT connected to the repo (deployments show `Source: Upload`), so pushing to git deploys nothing. If you connect it later, use build `npm run build`, deploy `npx wrangler deploy`.
- `node scripts/verify-schema.mjs` — applies the migrations to an in-memory SQLite (D1 is SQLite) and asserts the commission, idempotency, rollup and payout SQL. No network, no credentials. Run it after touching the schema or any query.
- `npm run build` — `vite build`. Production build. **Transpiles only** — TypeScript is not installed, so SWC strips types and type errors do NOT fail the build.

## Routing
No React Router. Page state is a `useState` union in `src/App.tsx`:
`'home' | 'shop' | 'checkout' | 'proceed-checkout' | 'checkout-success' | 'admin' | 'admin-order'`

The only URL-driven entries are:
- hostname starting `admin.` (i.e. `admin.persuasive.online`) → `AdminApp`, the full admin site. Same deployment as the shop; `App.tsx` branches on hostname before any shop state exists.
- `/admin` → `AdminPanel` (stock management) — the older entry point, still works
- `?payment=success` → triggers `PaymentSuccess` (Yoco return)

Everything else is in-memory state. Refreshing mid-flow drops you back to `home`.

## Data persistence — Cloudflare D1
Data lives in a **Cloudflare D1** database (`persuasive`), live in production since 2026-09-22. Schema in `migrations/0001_init.sql`:

- `stock` — `(color, size)` → count. Until the 2026-09-22 cutover this was a module-level array in `api/admin/stock.js` that reset on every cold start; that bug is gone. The seeded counts came from that array, so treat them as arbitrary until someone sets real numbers in `/admin`.
- `orders` — one row per completed order, keyed on a client-generated `order_ref`. This is the **idempotency key**: `/api/orders/record` returns early if the ref is already present, which is what stops a refresh of `?payment=success` decrementing stock or paying commission twice.
- `ambassadors` — code, name, rate, active flag.
- `referrals` — the commission ledger, one row per attributed order.

**`referrals.commission_rate` and `commission_amount` are snapshots** taken at the time of sale. Changing an ambassador's rate must never rewrite what is already owed, so never recompute historic commission by joining to `ambassadors.commission_rate`.

All queries go through `worker/lib/d1.js` on the `env.DB` binding (declared in `wrangler.jsonc`). Every function takes `db` as its first argument — bindings are request-scoped, never cache one at module level. Always use `?` placeholders with `params`. `d1Batch` is a real transaction on the binding (it was not over REST).

The owner notification email is still sent and is still a useful cross-check on the ledger, but it is no longer the only record.

Migrations are tracked by wrangler (`migrations_dir` on the binding):
```
npm run d1:migrate:local    # the SQLite wrangler dev uses
npm run d1:migrate:remote   # production
```
Both migration files are idempotent (`IF NOT EXISTS` / `INSERT OR IGNORE`). Note the production database was **empty** before 2026-09-22 — `d1:migrate:remote` created the schema from scratch rather than adopting tracking on an existing one, despite what earlier notes claimed. New migrations go in `migrations/NNNN_name.sql`.

## Order flows

### Customer (paid)
`ProceedCheckoutPage.handlePay` → generates an `orderRef` and stashes the order (with any `ambassadorCode`) in `localStorage.pendingOrder` → `POST /api/yoco/checkout` → redirects to Yoco → Yoco returns to `?payment=success` → `App.tsx` routes to `PaymentSuccess` → reads `pendingOrder` → `POST /api/send-email` → `POST /api/orders/record` (order row + referral + stock, idempotent on `orderRef`) → clears localStorage.

The record call deliberately runs **outside** the email success check: the customer has paid, so what they bought and what their referrer earned must be written whether or not Resend cooperated.

### Admin (no payment) — added 2026-05-14
Footer link on `HomePage` → password `<Dialog>` → `POST /api/admin/auth` → on success, `sessionStorage.adminAuth = 'true'` and route to `'admin-order'` page (`AdminOrderPage.tsx`). That page reuses `ProductCustomizer` to build a cart, then collects billing/delivery, then `POST /api/send-email` with `isAdminOrder: true`, then `POST /api/orders/record`. No Yoco call. The same page is also the "Place order" tab on the admin subdomain.

The `isAdminOrder` flag in `worker/routes/send-email.js`:
- Prefixes owner subject with `[ADMIN]`
- Adds an amber banner inside owner email body
- Changes customer email heading from "Payment Successful" → "Order Confirmed"
- Customer email subject stays neutral ("Order Confirmation - Your Custom Shirts")

## Ambassadors — added 2026-09-06
Ambassadors refer customers with a code typed at checkout. **Attribution only: the code gives the customer no discount.** The ambassador earns a percentage of the order total the customer actually paid (i.e. after any promo discount), stored per ambassador so terms can differ.

- Checkout field → `GET /api/ambassador/validate?code=` → shows "Referred by {name}". That endpoint returns **only** `{ valid, name }` — never the rate, never the list, because it is a code oracle by nature.
- On completion, `POST /api/orders/record` writes the `referrals` row with the rate and amount snapshotted.
- An unknown or deactivated code is **not** an error — the order stands, it just earns nobody anything.
- Admins manage codes and payouts on the admin subdomain. Payouts happen outside the site; "mark paid" only records that it was settled.
- Shared frontend logic lives in `src/lib/orderCodes.ts` (`useAmbassadorCode`). The two checkout pages keep their own markup because they use different design systems — only the logic is shared.

## Auth
Single shared admin password from the `ADMIN_PASSWORD` secret, validated by `worker/routes/admin/auth.js`. No real user accounts.

`/api/admin/auth` issues **no token** — it only compares the password — so the `sessionStorage.adminAuth` flag protects nothing server-side. Every admin endpoint therefore re-checks the password on each request via an `x-admin-password` header (`requireAdmin` in `worker/lib/http.js`, constant-time compare); the browser keeps it in `sessionStorage` for the session (`src/lib/adminApi.ts`). Not sessions, but it means the admin endpoints are not open to anyone who knows the URL.

`GET /api/admin/stock` stays public — `ProductCustomizer` calls it to show availability. Writes are gated.

## Environment variables
Worker secrets (runtime, read as `env.X` in `worker/`): set with `npx wrangler secret put <NAME>` or in the dashboard. Locally they live in `.dev.vars` (gitignored).
- `ADMIN_PASSWORD` — admin gate
- `RESEND_API_KEY` — Resend email API
- `YOCO_SECRET_KEY` — Yoco server-side

Build-time (Vite): none required.
- `VITE_YOCO_PUBLIC_KEY` — **unused, do not bother setting it.** Nothing in `src/` reads it and no `pk_test`/`pk_live` string appears in the built bundle (verified 2026-09-22). Yoco checkout is created entirely server-side in `worker/routes/yoco/checkout.js` with `YOCO_SECRET_KEY`; the browser only follows the returned redirect. It is a leftover from an earlier inline-widget integration.

D1 needs no env vars — it is the `DB` binding in `wrangler.jsonc`. The old `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_D1_DATABASE_ID` / `CLOUDFLARE_API_TOKEN` trio is gone; if you see them referenced, it is stale.

**Env var gotchas:**
- Secrets take effect on the next deploy; `wrangler secret put` triggers one.
- `wrangler dev` and Vite both read their files once at startup → restart after edits.
- Don't quote values (`KEY=value`, not `KEY="value"`).
- Never put a secret in `wrangler.jsonc` `vars` — that file is committed.

## DNS / Email setup
Domain bought at **domains.co.za**, but **nameservers point to Cloudflare** (`imani.ns.cloudflare.com`, `max.ns.cloudflare.com`). Cloudflare is the authoritative DNS provider. **All DNS records (Resend SPF/DKIM, etc.) must be added in Cloudflare** — anything added at domains.co.za is ignored.

The site hostnames (`persuasive.online`, `www`, `admin.persuasive.online`) are **Custom Domains on the Worker** (dashboard → Worker → Settings → Domains & Routes). Cloudflare manages those records itself; do not hand-create A/CNAME records for them.

Resend sends from `alessandro@contact.persuasive.online`. The `contact.persuasive.online` subdomain is verified on Resend. Verification needs:
- SPF TXT at `send.contact` → `v=spf1 include:amazonses.com ~all`
- DKIM TXT at `resend._domainkey.contact` → **must include `v=DKIM1; k=rsa;` prefix** before `p=...` (Resend rejects records that are only `p=...`)

**Cloudflare gotchas:**
- Mail-related DNS records (TXT, MX, DKIM CNAME) must be **DNS-only (grey cloud)**, not proxied (orange cloud). Orange-cloud breaks Resend verification silently.
- Cloudflare auto-appends the zone to record names. Enter `resend._domainkey.contact`, not the full FQDN, or you'll create a doubled name.

## Known issues / tech debt
- The Resend SDK doesn't throw on API errors — it returns `{ data: null, error }`. `worker/routes/send-email.js` checks `.error` on both sends and fails the request (fixed 2026-09-21; it used to log "sent" and answer 200). Keep that check if you touch the send calls.
- **Referrals are recorded from the browser.** `/api/orders/record` is called by the client, so fabricated orders could inflate an ambassador's commission. The idempotent `order_ref`, the snapshotted amounts and the owner email make it detectable after the fact. The real fix is attributing on a **Yoco webhook**, passing `orderRef` + `ambassadorCode` as Yoco checkout metadata so the webhook can recover them server-side.
- The customer email's "What's Next?" section assumes shipping — may read oddly for in-person admin sales.
- The project has no TypeScript installed, so `npm run build` (SWC) **transpiles without type checking**. Type errors do not fail the build.
- Caps and crop tops have no `stock` rows, so they are treated as unlimited (`ProductCustomizer` defaults unknown combos to 999).

## File map (the parts that matter)
- `src/App.tsx` — page state + routing + headers
- `src/components/HomePage.tsx` — landing + footer with admin link + password dialog
- `src/components/ProductCustomizer.tsx` — variant/size picker, source of truth for shirt + embroidery options
- `src/components/CheckoutPage.tsx` — cart view
- `src/components/ProceedCheckoutPage.tsx` — billing/delivery form for paid checkout, triggers Yoco
- `src/components/PaymentSuccess.tsx` — Yoco return handler, fires email + stock decrement
- `src/components/AdminPanel.tsx` — `/admin` stock management
- `src/components/AdminOrderPage.tsx` — admin-only "place order without payment" flow
- `src/components/admin/AdminApp.tsx` — the admin site shell (login + tabs), served on `admin.*`
- `src/components/admin/AmbassadorsPanel.tsx` — ambassador CRUD + per-ambassador rollups
- `src/components/admin/CommissionsPanel.tsx` — commission ledger, filters, mark-as-paid
- `src/lib/orderCodes.ts` — `PROMO_CODES`, `useAmbassadorCode`, `newOrderRef` (shared by both checkout pages)
- `src/lib/adminApi.ts` — admin credential storage + `x-admin-password` fetch wrapper
- `wrangler.jsonc` — Worker config: assets, `run_worker_first: ["/api/*"]`, `DB` binding
- `worker/index.js` — Worker entry: pathname → route table, last-resort error handler
- `worker/lib/d1.js` — D1 binding client (`d1Query` / `d1Run` / `d1Batch`, all take `db` first)
- `worker/lib/http.js` — `json()`, `readJson()`, `requireAdmin()`, `secretsMatch()`
- `worker/routes/admin/auth.js` — password check
- `worker/routes/admin/stock.js` — stock CRUD against D1
- `worker/routes/admin/ambassadors.js` — ambassador CRUD + rollups
- `worker/routes/admin/referrals.js` — commission ledger + payout marking
- `worker/routes/ambassador/validate.js` — public code lookup for checkout (returns only `{ valid, name }`)
- `worker/routes/orders/record.js` — order row + referral + stock, idempotent on `orderRef`
- `worker/routes/send-email.js` — Resend customer + owner emails (handles `isAdminOrder`, shows ambassador code to the owner only)
- `worker/routes/yoco/checkout.js` — Yoco hosted checkout session creator
- `migrations/` — D1 schema and stock seed, tracked by `wrangler d1 migrations`
