import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { Db } from './db';

export const SESSION_COOKIE = 'aymen_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface PublicUser {
  id: number;
  ad: string;
  eposta: string;
  telefon: string;
  rol: 'uye' | 'admin';
  dogrulandi: boolean;
}

interface UserRow extends Omit<PublicUser, 'dogrulandi'> {
  sifre_hash: string;
  dogrulandi: number;
}

// ---------- Şifre ----------

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, keyHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length, SCRYPT_PARAMS);
  return crypto.timingSafeEqual(actual, expected);
}

// Kullanıcı yokken de aynı maliyette hash hesaplanır (e-posta var/yok zamanlama farkını gizler).
const DUMMY_HASH = hashPassword('dummy-password-for-timing');

export function normalizeEmail(email: unknown): string {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

// ---------- Kullanıcı & oturum ----------

const toPublic = (row: UserRow): PublicUser => ({
  id: row.id,
  ad: row.ad,
  eposta: row.eposta,
  telefon: row.telefon,
  rol: row.rol,
  dogrulandi: row.dogrulandi === 1,
});

export function createUser(
  db: Db,
  input: { ad: string; eposta: string; telefon?: string; sifre: string; rol?: 'uye' | 'admin'; dogrulandi?: boolean }
): PublicUser {
  const res = db
    .prepare('INSERT INTO users (eposta, ad, telefon, sifre_hash, rol, dogrulandi) VALUES (?, ?, ?, ?, ?, ?)')
    .run(
      input.eposta,
      input.ad,
      input.telefon ?? '',
      hashPassword(input.sifre),
      input.rol ?? 'uye',
      input.dogrulandi ? 1 : 0
    );
  return getUserById(db, Number(res.lastInsertRowid))!;
}

export function getUserById(db: Db, id: number): PublicUser | null {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown as UserRow | undefined;
  return row ? toPublic(row) : null;
}

export function getUserByEmail(db: Db, eposta: string): PublicUser | null {
  const row = db.prepare('SELECT * FROM users WHERE eposta = ?').get(eposta) as unknown as UserRow | undefined;
  return row ? toPublic(row) : null;
}

/** E-posta/şifre doğrular; başarısızlıkta null döner. */
export function authenticate(db: Db, eposta: string, sifre: string): PublicUser | null {
  const row = db.prepare('SELECT * FROM users WHERE eposta = ?').get(eposta) as unknown as UserRow | undefined;
  const ok = verifyPassword(sifre, row?.sifre_hash ?? DUMMY_HASH);
  return row && ok ? toPublic(row) : null;
}

export function checkPassword(db: Db, userId: number, sifre: string): boolean {
  const row = db.prepare('SELECT sifre_hash FROM users WHERE id = ?').get(userId) as
    | { sifre_hash: string }
    | undefined;
  return row ? verifyPassword(sifre, row.sifre_hash) : false;
}

export function setPassword(db: Db, userId: number, sifre: string) {
  db.prepare('UPDATE users SET sifre_hash = ? WHERE id = ?').run(hashPassword(sifre), userId);
}

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

export function createSession(db: Db, userId: number): { token: string; expires: number } {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = Date.now() + SESSION_TTL_MS;
  db.prepare('DELETE FROM sessions WHERE bitis < ?').run(Date.now());
  db.prepare('INSERT INTO sessions (token_hash, user_id, bitis) VALUES (?, ?, ?)').run(
    sha256(token),
    userId,
    expires
  );
  return { token, expires };
}

export function destroySession(db: Db, token: string) {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
}

/** Verilen kullanıcının `keepToken` dışındaki tüm oturumlarını kapatır. */
export function destroyOtherSessions(db: Db, userId: number, keepToken?: string) {
  db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').run(
    userId,
    keepToken ? sha256(keepToken) : ''
  );
}

function userFromToken(db: Db, token: string): PublicUser | null {
  const row = db
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.bitis > ?`
    )
    .get(sha256(token), Date.now()) as unknown as UserRow | undefined;
  return row ? toPublic(row) : null;
}

// ---------- E-posta doğrulama / şifre sıfırlama token'ları ----------

export type TokenKind = 'dogrulama' | 'sifirlama';

const TOKEN_TTL_MS: Record<TokenKind, number> = {
  dogrulama: 24 * 60 * 60 * 1000,
  sifirlama: 60 * 60 * 1000,
};

/** Tek kullanımlık token üretir; aynı türdeki önceki token'lar geçersiz kılınır. */
export function createToken(db: Db, userId: number, kind: TokenKind): string {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('DELETE FROM tokens WHERE bitis < ?').run(Date.now());
  db.prepare('DELETE FROM tokens WHERE user_id = ? AND tur = ?').run(userId, kind);
  db.prepare('INSERT INTO tokens (token_hash, user_id, tur, bitis) VALUES (?, ?, ?, ?)').run(
    sha256(token),
    userId,
    kind,
    Date.now() + TOKEN_TTL_MS[kind]
  );
  return token;
}

/** Token'ı doğrular ve tüketir (tek kullanımlık). Geçersizse null döner. */
export function consumeToken(db: Db, token: string, kind: TokenKind): number | null {
  const hash = sha256(token);
  const row = db
    .prepare('SELECT user_id, bitis FROM tokens WHERE token_hash = ? AND tur = ?')
    .get(hash, kind) as { user_id: number; bitis: number } | undefined;
  if (!row) return null;
  db.prepare('DELETE FROM tokens WHERE token_hash = ?').run(hash);
  return row.bitis > Date.now() ? row.user_id : null;
}

export function markVerified(db: Db, userId: number) {
  db.prepare('UPDATE users SET dogrulandi = 1 WHERE id = ?').run(userId);
}

/** Kullanıcının tüm oturumlarını kapatır. */
export function destroyAllSessions(db: Db, userId: number) {
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

// ---------- Cookie ----------

export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      try {
        return decodeURIComponent(part.slice(idx + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function setSessionCookie(res: Response, token: string, secure: boolean) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

export function clearSessionCookie(res: Response, secure: boolean) {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
}

// ---------- Express middleware ----------

declare module 'express-serve-static-core' {
  interface Request {
    user?: PublicUser;
    sessionToken?: string;
  }
}

/** Çerezdeki oturumu çözer ve `req.user` alanını doldurur (zorunlu değildir). */
export function sessionLoader(db: Db) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const token = readCookie(req, SESSION_COOKIE);
    if (token) {
      const user = userFromToken(db, token);
      if (user) {
        req.user = user;
        req.sessionToken = token;
      }
    }
    next();
  };
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Bu işlem için giriş yapmalısınız.' });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Bu işlem için giriş yapmalısınız.' });
    return;
  }
  if (req.user.rol !== 'admin') {
    res.status(403).json({ error: 'Bu işlem için yönetici yetkisi gerekir.' });
    return;
  }
  next();
}

// ---------- Hız sınırı (brute-force koruması) ----------

export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; reset: number }>();
  return {
    /** İsteği sayar; limit aşıldıysa false döner. */
    take(key: string): boolean {
      const now = Date.now();
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
      }
      const entry = hits.get(key);
      if (!entry || entry.reset < now) {
        hits.set(key, { count: 1, reset: now + windowMs });
        return true;
      }
      entry.count += 1;
      return entry.count <= max;
    },
    /** Başarılı girişten sonra sayacı sıfırlar. */
    clear(key: string) {
      hits.delete(key);
    },
  };
}

// ---------- Yönetici hesabı ----------

/**
 * Yönetici hesabını garanti eder. ADMIN_PASSWORD verilmişse her açılışta o şifreye eşitlenir;
 * verilmemişse ve hesap yoksa rastgele bir şifre üretilip konsola bir kez yazılır.
 */
export function ensureAdmin(db: Db, eposta: string, password?: string): { created: boolean; generatedPassword?: string } {
  if (password !== undefined && password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.`);
  }
  const existing = getUserByEmail(db, eposta);
  if (!existing) {
    const sifre = password ?? crypto.randomBytes(12).toString('base64url');
    createUser(db, { ad: 'Yönetici', eposta, sifre, rol: 'admin', dogrulandi: true });
    return { created: true, generatedPassword: password ? undefined : sifre };
  }
  if (existing.rol !== 'admin') {
    db.prepare("UPDATE users SET rol = 'admin', dogrulandi = 1 WHERE id = ?").run(existing.id);
  }
  if (password !== undefined && !checkPassword(db, existing.id, password)) {
    setPassword(db, existing.id, password);
    destroyOtherSessions(db, existing.id);
  }
  return { created: false };
}
