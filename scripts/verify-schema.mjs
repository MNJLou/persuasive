// Validates the real migrations and every SQL statement the new endpoints run,
// against actual SQLite (D1 is SQLite). No network, no credentials.
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync(':memory:');
let failures = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n        got ${JSON.stringify(actual)}\n        want ${JSON.stringify(expected)}`}`);
};

// --- migrations, verbatim -------------------------------------------------
db.exec(fs.readFileSync('migrations/0001_init.sql', 'utf8'));
db.exec(fs.readFileSync('migrations/0002_seed_stock.sql', 'utf8'));
check('migrations apply', db.prepare('SELECT count(*) c FROM stock').get().c, 45);
check(
  'seed matches the old in-memory values (White-Blue / Medium)',
  db.prepare('SELECT stock FROM stock WHERE color = ? AND size = ?').get('White-Blue', 'Medium').stock,
  3
);

// --- an ambassador at 10% (api/admin/ambassadors.js POST) -----------------
db.prepare(
  `INSERT INTO ambassadors (code, name, email, commission_rate, active, created_at)
   VALUES (?, ?, ?, ?, 1, ?)`
).run('JANE10', 'Jane Dlamini', 'jane@example.com', 0.1, new Date().toISOString());

// --- api/ambassador/validate.js ------------------------------------------
check(
  'validate finds an active code',
  db.prepare('SELECT name FROM ambassadors WHERE code = ? AND active = 1 LIMIT 1').get('JANE10').name,
  'Jane Dlamini'
);

// --- api/orders/record.js -------------------------------------------------
const now = new Date().toISOString();
const ORDER = 'PSV-abc123';
// R500 subtotal, PER20 applied -> R400 paid. Commission must be 10% of 400.
const subtotal = 500, discount = 100, total = 400;

const recordOrder = (ref) =>
  db
    .prepare(
      `INSERT INTO orders (order_ref, customer_name, customer_email, subtotal, discount, total,
                           promo_code, ambassador_code, is_admin_order, items_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(order_ref) DO NOTHING`
    )
    .run(ref, 'Sam Test', 'sam@example.com', subtotal, discount, total, 'PER20', 'JANE10', 0, '[]', now);

recordOrder(ORDER);

const amb = db
  .prepare('SELECT id, code, name, commission_rate FROM ambassadors WHERE code = ? AND active = 1 LIMIT 1')
  .get('JANE10');
const commission = Math.round(amb.commission_rate * total * 100) / 100;
check('commission is 10% of the discounted total, not the subtotal', commission, 40);

const insertReferral = () =>
  db
    .prepare(
      `INSERT INTO referrals (order_ref, ambassador_id, ambassador_code, commission_rate,
                              commission_amount, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(order_ref) DO NOTHING`
    )
    .run(ORDER, amb.id, amb.code, amb.commission_rate, commission, now);
insertReferral();

const decrement = () => {
  for (const [color, size] of [['White-Blue', 'Medium'], ['Cream-Red', 'XXL']]) {
    db.prepare('UPDATE stock SET stock = MAX(0, stock - 1) WHERE color = ? AND size = ?').run(color, size);
  }
};
decrement();

check('stock decremented', db.prepare('SELECT stock FROM stock WHERE color=? AND size=?').get('White-Blue', 'Medium').stock, 2);
check('stock cannot go below zero', db.prepare('SELECT stock FROM stock WHERE color=? AND size=?').get('Cream-Red', 'XXL').stock, 0);

// --- idempotency: the whole point ----------------------------------------
const seen = db.prepare('SELECT order_ref FROM orders WHERE order_ref = ? LIMIT 1').all(ORDER);
check('replay is detected before any write', seen.length > 0, true);
// Prove the DB-level backstop holds even if the guard were bypassed:
recordOrder(ORDER);
insertReferral();
check('replayed order does not duplicate', db.prepare('SELECT count(*) c FROM orders').get().c, 1);
check('replayed referral does not duplicate', db.prepare('SELECT count(*) c FROM referrals').get().c, 1);

// --- api/admin/ambassadors.js GET rollup ---------------------------------
const rollup = db
  .prepare(
    `SELECT a.id, a.code, a.name, a.email, a.commission_rate, a.active, a.created_at,
            COUNT(r.id)                                                            AS order_count,
            COALESCE(SUM(o.total), 0)                                              AS referred_revenue,
            COALESCE(SUM(r.commission_amount), 0)                                  AS commission_total,
            COALESCE(SUM(CASE WHEN r.paid_out = 0 THEN r.commission_amount END), 0) AS commission_outstanding
     FROM ambassadors a
     LEFT JOIN referrals r ON r.ambassador_id = a.id
     LEFT JOIN orders    o ON o.order_ref = r.order_ref
     GROUP BY a.id
     ORDER BY a.active DESC, a.name COLLATE NOCASE`
  )
  .all();
check('rollup order count', rollup[0].order_count, 1);
check('rollup referred revenue', rollup[0].referred_revenue, 400);
check('rollup outstanding', rollup[0].commission_outstanding, 40);

// --- api/admin/referrals.js ----------------------------------------------
const ledger = db
  .prepare(
    `SELECT r.id, r.order_ref, r.ambassador_id, r.ambassador_code,
            r.commission_rate, r.commission_amount, r.paid_out, r.paid_out_at, r.created_at,
            a.name  AS ambassador_name,
            o.customer_name, o.customer_email, o.total AS order_total,
            o.promo_code, o.is_admin_order
     FROM referrals r
     JOIN ambassadors a ON a.id = r.ambassador_id
     LEFT JOIN orders o ON o.order_ref = r.order_ref
     WHERE r.ambassador_id = ?
     ORDER BY r.created_at DESC
     LIMIT 500`
  )
  .all(amb.id);
check('ledger joins order + ambassador', [ledger.length, ledger[0].ambassador_name, ledger[0].order_total], [1, 'Jane Dlamini', 400]);

const totals = db
  .prepare(
    `SELECT COALESCE(SUM(commission_amount), 0)                                   AS total_earned,
            COALESCE(SUM(CASE WHEN paid_out = 0 THEN commission_amount END), 0)   AS outstanding,
            COALESCE(SUM(CASE WHEN paid_out = 1 THEN commission_amount END), 0)   AS paid
     FROM referrals`
  )
  .get();
check('totals before payout', [totals.total_earned, totals.outstanding, totals.paid], [40, 40, 0]);

const paidMeta = db
  .prepare('UPDATE referrals SET paid_out = 1, paid_out_at = ? WHERE ambassador_id = ? AND paid_out = 0')
  .run(now, amb.id);
check('bulk payout reports rows changed', Number(paidMeta.changes), 1);
const after = db
  .prepare(
    `SELECT COALESCE(SUM(CASE WHEN paid_out = 0 THEN commission_amount END), 0) AS outstanding,
            COALESCE(SUM(CASE WHEN paid_out = 1 THEN commission_amount END), 0) AS paid
     FROM referrals`
  )
  .get();
check('totals after payout', [after.outstanding, after.paid], [0, 40]);

// --- rate change must not rewrite history --------------------------------
db.prepare('UPDATE ambassadors SET commission_rate = ? WHERE id = ?').run(0.25, amb.id);
check(
  'raising the rate leaves past commission untouched',
  db.prepare('SELECT commission_amount, commission_rate FROM referrals WHERE order_ref = ?').get(ORDER),
  { commission_amount: 40, commission_rate: 0.1 }
);

// --- api/admin/stock.js POST (set absolute) ------------------------------
db.prepare(
  `INSERT INTO stock (color, size, stock) VALUES (?, ?, ?)
   ON CONFLICT(color, size) DO UPDATE SET stock = excluded.stock`
).run('White-Blue', 'Medium', 9);
check('upsert overwrites an existing row', db.prepare('SELECT stock FROM stock WHERE color=? AND size=?').get('White-Blue', 'Medium').stock, 9);
db.prepare(
  `INSERT INTO stock (color, size, stock) VALUES (?, ?, ?)
   ON CONFLICT(color, size) DO UPDATE SET stock = excluded.stock`
).run('Brand New-Colour', 'Small', 4);
check('upsert creates a new combo', db.prepare('SELECT count(*) c FROM stock').get().c, 46);

// --- an inactive code earns nothing --------------------------------------
db.prepare('UPDATE ambassadors SET active = 0 WHERE id = ?').run(amb.id);
check(
  'deactivated code no longer resolves at checkout',
  db.prepare('SELECT name FROM ambassadors WHERE code = ? AND active = 1 LIMIT 1').get('JANE10'),
  undefined
);

console.log(failures === 0 ? '\nAll SQL checks passed.' : `\n${failures} CHECK(S) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
