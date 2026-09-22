-- Persuasive — initial schema.
-- First durable storage in this project: ambassadors, the commission ledger,
-- an order log (which doubles as the idempotency key store), and stock.

CREATE TABLE IF NOT EXISTS ambassadors (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  code            TEXT    NOT NULL UNIQUE,     -- stored UPPERCASE
  name            TEXT    NOT NULL,
  email           TEXT,
  commission_rate REAL    NOT NULL,            -- 0.10 = 10%
  active          INTEGER NOT NULL DEFAULT 1,  -- SQLite has no boolean: 0/1
  created_at      TEXT    NOT NULL             -- ISO-8601
);

CREATE TABLE IF NOT EXISTS orders (
  order_ref       TEXT PRIMARY KEY,            -- idempotency key, generated before payment
  customer_name   TEXT,
  customer_email  TEXT,
  subtotal        REAL NOT NULL,
  discount        REAL NOT NULL DEFAULT 0,
  total           REAL NOT NULL,
  promo_code      TEXT,
  ambassador_code TEXT,
  is_admin_order  INTEGER NOT NULL DEFAULT 0,
  items_json      TEXT,
  created_at      TEXT NOT NULL
);

-- commission_rate and commission_amount are SNAPSHOTS taken at the time of sale.
-- Changing an ambassador's rate must never alter what is already owed for past
-- orders, so historic commission is never recomputed from ambassadors.commission_rate.
CREATE TABLE IF NOT EXISTS referrals (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  order_ref         TEXT    NOT NULL UNIQUE REFERENCES orders(order_ref),
  ambassador_id     INTEGER NOT NULL REFERENCES ambassadors(id),
  ambassador_code   TEXT    NOT NULL,
  commission_rate   REAL    NOT NULL,
  commission_amount REAL    NOT NULL,
  paid_out          INTEGER NOT NULL DEFAULT 0,
  paid_out_at       TEXT,
  created_at        TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS stock (
  color TEXT    NOT NULL,
  size  TEXT    NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (color, size)
);

CREATE INDEX IF NOT EXISTS idx_referrals_ambassador ON referrals(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_referrals_unpaid     ON referrals(paid_out);
CREATE INDEX IF NOT EXISTS idx_orders_created       ON orders(created_at);
