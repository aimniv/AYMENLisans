import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from '../lib/products';

export type Db = DatabaseSync;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eposta TEXT NOT NULL UNIQUE,
  ad TEXT NOT NULL,
  telefon TEXT NOT NULL DEFAULT '',
  sifre_hash TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'uye' CHECK (rol IN ('uye', 'admin')),
  dogrulandi INTEGER NOT NULL DEFAULT 0,
  olusturma TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bitis INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS tokens (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tur TEXT NOT NULL CHECK (tur IN ('dogrulama', 'sifirlama')),
  bitis INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tokens_user ON tokens(user_id, tur);

CREATE TABLE IF NOT EXISTS products (
  slug TEXT PRIMARY KEY,
  sira INTEGER NOT NULL,
  data TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  siparis_no TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sira INTEGER NOT NULL,
  data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

CREATE TABLE IF NOT EXISTS coupons (
  kod TEXT PRIMARY KEY,
  oran REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  anahtar TEXT PRIMARY KEY,
  deger TEXT NOT NULL
);
`;

export const DEFAULT_SETTINGS = {
  storeName: 'AYMENLisans',
  announcement: '🎉 Tüm Windows ve Office lisanslarında anında teslimat ve %10 HOSGELDIN indirimi!',
  supportEmail: 'destek@aymenlisans.com',
  whatsappNumber: '+90 536 565 70 03',
  workHours: 'Hafta içi 09:00 - 18:00',
  bankIban: 'TR33 0006 1005 1978 6451 0001 24 (Ziraat Bankası - AYMEN Dijital)',
  paymentProviderUrl: '',
};

export type Settings = typeof DEFAULT_SETTINGS;

/**
 * Veritabanını açar, şemayı oluşturur ve ilk çalıştırmada katalog/kupon/ayar
 * verilerini tohumlar. `:memory:` testler için kullanılabilir.
 */
export function openDb(file: string): Db {
  if (file !== ':memory:') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  migrate(db);
  seed(db);
  return db;
}

/** Eski veritabanlarını yeni şemaya taşır. */
function migrate(db: Db) {
  const cols = db.prepare('PRAGMA table_info(users)').all() as { name: string }[];
  if (!cols.some((c) => c.name === 'dogrulandi')) {
    db.exec('ALTER TABLE users ADD COLUMN dogrulandi INTEGER NOT NULL DEFAULT 0');
    // Yönetici hesapları doğrulanmış sayılır.
    db.exec("UPDATE users SET dogrulandi = 1 WHERE rol = 'admin'");
  }
}

function seed(db: Db) {
  const productCount = (db.prepare('SELECT COUNT(*) AS n FROM products').get() as { n: number }).n;
  if (productCount === 0) {
    const insert = db.prepare('INSERT INTO products (slug, sira, data) VALUES (?, ?, ?)');
    INITIAL_PRODUCTS.forEach((p, i) => insert.run(p.slug, i, JSON.stringify(p)));
  }

  const couponCount = (db.prepare('SELECT COUNT(*) AS n FROM coupons').get() as { n: number }).n;
  if (couponCount === 0) {
    const insert = db.prepare('INSERT INTO coupons (kod, oran) VALUES (?, ?)');
    for (const [kod, oran] of Object.entries(INITIAL_COUPONS)) insert.run(kod, oran);
  }

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (anahtar, deger) VALUES (?, ?)');
  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) insertSetting.run(k, v);
}

/** BEGIN/COMMIT sarmalayıcı; hata olursa geri alır. */
export function transaction<T>(db: Db, fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
