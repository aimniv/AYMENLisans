import type { Db } from './db';
import { DEFAULT_SETTINGS, Settings, transaction } from './db';
import type { Product } from '../lib/products';
import type { OrderResult } from '../lib/checkout';

// ---------- Ürünler ----------

export function listProducts(db: Db): Product[] {
  const rows = db.prepare('SELECT data FROM products ORDER BY sira ASC').all() as { data: string }[];
  return rows.map((r) => JSON.parse(r.data) as Product);
}

export function getProduct(db: Db, slug: string): Product | null {
  const row = db.prepare('SELECT data FROM products WHERE slug = ?').get(slug) as
    | { data: string }
    | undefined;
  return row ? (JSON.parse(row.data) as Product) : null;
}

export function insertProduct(db: Db, product: Product) {
  const first = db.prepare('SELECT MIN(sira) AS m FROM products').get() as { m: number | null };
  db.prepare('INSERT INTO products (slug, sira, data) VALUES (?, ?, ?)').run(
    product.slug,
    (first.m ?? 0) - 1,
    JSON.stringify(product)
  );
}

export function saveProduct(db: Db, product: Product) {
  db.prepare('UPDATE products SET data = ? WHERE slug = ?').run(JSON.stringify(product), product.slug);
}

export function removeProduct(db: Db, slug: string): boolean {
  return Number(db.prepare('DELETE FROM products WHERE slug = ?').run(slug).changes) > 0;
}

// ---------- Siparişler ----------

export function orderExists(db: Db, siparisNo: string): boolean {
  return Boolean(db.prepare('SELECT 1 FROM orders WHERE siparis_no = ?').get(siparisNo));
}

export function insertOrder(db: Db, order: OrderResult, userId: number | null) {
  const first = db.prepare('SELECT MIN(sira) AS m FROM orders').get() as { m: number | null };
  db.prepare('INSERT INTO orders (siparis_no, user_id, sira, data) VALUES (?, ?, ?, ?)').run(
    order.siparisNo,
    userId,
    (first.m ?? 0) - 1,
    JSON.stringify(order)
  );
}

export function setOrderPaymentToken(db: Db, siparisNo: string, token: string) {
  db.prepare('UPDATE orders SET odeme_token = ? WHERE siparis_no = ?').run(token, siparisNo);
}

export function getOrderByPaymentToken(db: Db, token: string): OrderResult | null {
  const row = db.prepare('SELECT data FROM orders WHERE odeme_token = ?').get(token) as
    | { data: string }
    | undefined;
  return row ? (JSON.parse(row.data) as OrderResult) : null;
}

/** Siparişin bekleyen ödeme token'ını döndürür (yoksa null). */
export function getOrderPaymentToken(db: Db, siparisNo: string): string | null {
  const row = db.prepare('SELECT odeme_token FROM orders WHERE siparis_no = ?').get(siparisNo) as
    | { odeme_token: string | null }
    | undefined;
  return row?.odeme_token ?? null;
}

export function listOrders(db: Db, userId?: number): OrderResult[] {
  const rows = (
    userId === undefined
      ? db.prepare('SELECT data FROM orders ORDER BY sira ASC').all()
      : db.prepare('SELECT data FROM orders WHERE user_id = ? ORDER BY sira ASC').all(userId)
  ) as { data: string }[];
  return rows.map((r) => JSON.parse(r.data) as OrderResult);
}

export function getOrder(db: Db, siparisNo: string): OrderResult | null {
  const row = db.prepare('SELECT data FROM orders WHERE siparis_no = ?').get(siparisNo) as
    | { data: string }
    | undefined;
  return row ? (JSON.parse(row.data) as OrderResult) : null;
}

export function saveOrder(db: Db, order: OrderResult) {
  db.prepare('UPDATE orders SET data = ? WHERE siparis_no = ?').run(
    JSON.stringify(order),
    order.siparisNo
  );
}

export function removeOrder(db: Db, siparisNo: string): boolean {
  return Number(db.prepare('DELETE FROM orders WHERE siparis_no = ?').run(siparisNo).changes) > 0;
}

// ---------- Kuponlar ----------

export function listCoupons(db: Db): Record<string, number> {
  const rows = db.prepare('SELECT kod, oran FROM coupons ORDER BY kod').all() as {
    kod: string;
    oran: number;
  }[];
  return Object.fromEntries(rows.map((r) => [r.kod, r.oran]));
}

export function upsertCoupon(db: Db, kod: string, oran: number) {
  db.prepare(
    'INSERT INTO coupons (kod, oran) VALUES (?, ?) ON CONFLICT(kod) DO UPDATE SET oran = excluded.oran'
  ).run(kod, oran);
}

export function removeCoupon(db: Db, kod: string) {
  db.prepare('DELETE FROM coupons WHERE kod = ?').run(kod);
}

// ---------- Ayarlar ----------

export function getSettings(db: Db): Settings {
  const rows = db.prepare('SELECT anahtar, deger FROM settings').all() as {
    anahtar: string;
    deger: string;
  }[];
  const known = rows.filter((r) => r.anahtar in DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...Object.fromEntries(known.map((r) => [r.anahtar, r.deger])) };
}

export function saveSettings(db: Db, updates: Partial<Settings>) {
  const stmt = db.prepare(
    'INSERT INTO settings (anahtar, deger) VALUES (?, ?) ON CONFLICT(anahtar) DO UPDATE SET deger = excluded.deger'
  );
  transaction(db, () => {
    for (const [k, v] of Object.entries(updates)) stmt.run(k, v);
  });
}

export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];
