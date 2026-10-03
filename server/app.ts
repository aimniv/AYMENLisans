import crypto from 'crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import { processCheckoutRequest, ORDER_STATUSES, OrderResult } from '../lib/checkout';
import { CATEGORIES } from '../lib/products';
import type { Db } from './db';
import {
  EMAIL_REGEX,
  MIN_PASSWORD_LENGTH,
  authenticate,
  checkPassword,
  consumeToken,
  clearSessionCookie,
  createRateLimiter,
  createSession,
  createToken,
  createUser,
  destroyAllSessions,
  destroyOtherSessions,
  destroySession,
  getUserByEmail,
  getUserById,
  markVerified,
  normalizeEmail,
  requireAdmin,
  requireUser,
  sessionLoader,
  setPassword,
  setSessionCookie,
} from './auth';
import { Mailer, passwordResetEmail, verificationEmail } from './mailer';
import * as store from './store';
import { buildProduct } from './validate';

export interface AppOptions {
  db: Db;
  /** HTTPS isteklerde çerezlere `Secure` bayrağı eklenir (production için true). */
  secureCookies?: boolean;
  /** Harici ödeme sağlayıcısı yönlendirme adresi (ayar boşsa kullanılır). */
  paymentProviderUrl?: string;
  /** E-posta gönderici (doğrulama ve şifre sıfırlama). */
  mailer: Mailer;
  /** E-postalardaki bağlantılar için sitenin kök adresi (Host başlığına güvenilmez). */
  appUrl?: string;
  /** IP başına saatlik kayıt sınırı (varsayılan 10). */
  registerLimit?: number;
}

const PUBLIC_SETTING_KEYS = store.SETTING_KEYS.filter((k) => k !== 'paymentProviderUrl');

const cleanText = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

export function createApp({
  db,
  mailer,
  appUrl = 'http://localhost:3000',
  secureCookies = false,
  paymentProviderUrl = '',
  registerLimit = 10,
}: AppOptions) {
  const app = express();
  app.disable('x-powered-by');
  if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : process.env.TRUST_PROXY);

  const loginLimiter = createRateLimiter(10, 15 * 60 * 1000);
  const registerLimiter = createRateLimiter(registerLimit, 60 * 60 * 1000);
  const forgotLimiter = createRateLimiter(5, 60 * 60 * 1000);
  const resendLimiter = createRateLimiter(3, 60 * 60 * 1000);
  const baseUrl = appUrl.replace(/\/+$/, '');

  /** Gönderim hatası isteği düşürmez ve yanıt süresini etkilemez. */
  const sendMail = (mail: Parameters<Mailer['send']>[0]) => {
    mailer.send(mail).catch((err: Error) => console.error('E-posta gönderilemedi:', err.message));
  };

  const sendVerification = (user: { id: number; ad: string; eposta: string }) => {
    const token = createToken(db, user.id, 'dogrulama');
    sendMail(verificationEmail(user.eposta, user.ad, `${baseUrl}/eposta-dogrula?token=${token}`));
  };

  // ---------- Genel middleware ----------
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use(express.json({ limit: '100kb' }));

  // CSRF: durum değiştiren isteklerde Origin başlığı varsa aynı site olmalı.
  app.use('/api', (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
    const origin = req.headers.origin;
    if (origin) {
      let host: string | null = null;
      try {
        host = new URL(origin).host;
      } catch {
        // geçersiz origin
      }
      if (host !== req.headers.host) {
        res.status(403).json({ error: 'Geçersiz istek kaynağı.' });
        return;
      }
    }
    next();
  });

  app.use('/api', sessionLoader(db));

  // `Secure` çerezi yalnızca isteğin HTTPS olduğu anlaşılıyorsa verilir (proxy için TRUST_PROXY gerekir).
  const isSecure = (req: Request) => secureCookies && req.secure;

  const clientKey = (req: Request, extra = '') => `${req.ip ?? 'ip'}|${extra}`;

  // ---------- Üyelik ----------

  app.post('/api/auth/register', (req, res) => {
    if (!registerLimiter.take(clientKey(req))) {
      res.status(429).json({ error: 'Çok fazla kayıt denemesi. Lütfen daha sonra tekrar deneyiniz.' });
      return;
    }
    const ad = cleanText(req.body?.ad, 100);
    const eposta = normalizeEmail(req.body?.eposta);
    const telefon = cleanText(req.body?.telefon, 30);
    const sifre = typeof req.body?.sifre === 'string' ? req.body.sifre : '';

    if (ad.length < 3) {
      res.status(400).json({ error: 'Adınız ve soyadınız en az 3 karakter olmalıdır.' });
      return;
    }
    if (!EMAIL_REGEX.test(eposta) || eposta.length > 200) {
      res.status(400).json({ error: 'Lütfen geçerli bir e-posta adresi giriniz.' });
      return;
    }
    if (telefon && telefon.replace(/\D/g, '').length < 10) {
      res.status(400).json({ error: 'Telefon numarası en az 10 rakamdan oluşmalıdır.' });
      return;
    }
    if (sifre.length < MIN_PASSWORD_LENGTH || sifre.length > 200) {
      res.status(400).json({ error: `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.` });
      return;
    }
    if (getUserByEmail(db, eposta)) {
      res.status(409).json({ error: 'Bu e-posta adresiyle kayıtlı bir hesap zaten var.' });
      return;
    }

    const user = createUser(db, { ad, eposta, telefon, sifre });
    sendVerification(user);
    const { token } = createSession(db, user.id);
    setSessionCookie(res, token, isSecure(req));
    res.status(201).json({ ok: true, user });
  });

  app.post('/api/auth/login', (req, res) => {
    const eposta = normalizeEmail(req.body?.eposta);
    const sifre = typeof req.body?.sifre === 'string' ? req.body.sifre : '';
    const key = clientKey(req, eposta);

    if (!loginLimiter.take(key)) {
      res.status(429).json({ error: 'Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyiniz.' });
      return;
    }
    const user = eposta && sifre ? authenticate(db, eposta, sifre) : null;
    if (!user) {
      res.status(401).json({ error: 'E-posta adresi veya şifre hatalı.' });
      return;
    }
    loginLimiter.clear(key);
    const { token } = createSession(db, user.id);
    setSessionCookie(res, token, isSecure(req));
    res.json({ ok: true, user });
  });

  app.post('/api/auth/logout', (req, res) => {
    if (req.sessionToken) destroySession(db, req.sessionToken);
    clearSessionCookie(res, isSecure(req));
    res.json({ ok: true });
  });

  app.get('/api/auth/me', (req, res) => {
    res.json({ user: req.user ?? null });
  });

  app.put('/api/auth/profile', requireUser, (req, res) => {
    const ad = cleanText(req.body?.ad, 100);
    const eposta = normalizeEmail(req.body?.eposta);
    const telefon = cleanText(req.body?.telefon, 30);

    if (ad.length < 3) {
      res.status(400).json({ error: 'Adınız ve soyadınız en az 3 karakter olmalıdır.' });
      return;
    }
    if (!EMAIL_REGEX.test(eposta) || eposta.length > 200) {
      res.status(400).json({ error: 'Lütfen geçerli bir e-posta adresi giriniz.' });
      return;
    }
    if (telefon && telefon.replace(/\D/g, '').length < 10) {
      res.status(400).json({ error: 'Telefon numarası en az 10 rakamdan oluşmalıdır.' });
      return;
    }
    const existing = getUserByEmail(db, eposta);
    if (existing && existing.id !== req.user!.id) {
      res.status(409).json({ error: 'Bu e-posta adresi başka bir hesap tarafından kullanılıyor.' });
      return;
    }
    const emailChanged = eposta !== req.user!.eposta;
    db.prepare(
      'UPDATE users SET ad = ?, eposta = ?, telefon = ?, dogrulandi = CASE WHEN ? THEN 0 ELSE dogrulandi END WHERE id = ?'
    ).run(ad, eposta, telefon, emailChanged ? 1 : 0, req.user!.id);
    // E-posta değiştiyse yeni adres yeniden doğrulanmalıdır.
    if (emailChanged) sendVerification({ id: req.user!.id, ad, eposta });
    res.json({ ok: true, user: getUserById(db, req.user!.id) });
  });

  app.put('/api/auth/password', requireUser, (req, res) => {
    const mevcut = typeof req.body?.mevcutSifre === 'string' ? req.body.mevcutSifre : '';
    const yeni = typeof req.body?.yeniSifre === 'string' ? req.body.yeniSifre : '';

    if (!checkPassword(db, req.user!.id, mevcut)) {
      res.status(400).json({ error: 'Mevcut şifreniz hatalı.' });
      return;
    }
    if (yeni.length < MIN_PASSWORD_LENGTH || yeni.length > 200) {
      res.status(400).json({ error: `Yeni şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.` });
      return;
    }
    setPassword(db, req.user!.id, yeni);
    // Diğer cihazlardaki oturumlar kapatılır.
    destroyOtherSessions(db, req.user!.id, req.sessionToken);
    res.json({ ok: true });
  });

  // ---------- E-posta doğrulama & şifre sıfırlama ----------

  app.post('/api/auth/verify-email', (req, res) => {
    const token = typeof req.body?.token === 'string' ? req.body.token : '';
    const userId = token ? consumeToken(db, token, 'dogrulama') : null;
    if (!userId) {
      res.status(400).json({ error: 'Doğrulama bağlantısı geçersiz veya süresi dolmuş.' });
      return;
    }
    markVerified(db, userId);
    res.json({ ok: true });
  });

  app.post('/api/auth/resend-verification', requireUser, (req, res) => {
    if (req.user!.dogrulandi) {
      res.json({ ok: true });
      return;
    }
    if (!resendLimiter.take(String(req.user!.id))) {
      res.status(429).json({ error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyiniz.' });
      return;
    }
    sendVerification(req.user!);
    res.json({ ok: true });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const eposta = normalizeEmail(req.body?.eposta);
    if (!EMAIL_REGEX.test(eposta)) {
      res.status(400).json({ error: 'Lütfen geçerli bir e-posta adresi giriniz.' });
      return;
    }
    if (!forgotLimiter.take(clientKey(req, eposta))) {
      res.status(429).json({ error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyiniz.' });
      return;
    }
    // Hesap var olsun ya da olmasın aynı yanıt döner (e-posta taramasını önlemek için).
    const user = getUserByEmail(db, eposta);
    if (user) {
      const token = createToken(db, user.id, 'sifirlama');
      sendMail(passwordResetEmail(user.eposta, user.ad, `${baseUrl}/sifre-sifirla?token=${token}`));
    }
    res.json({ ok: true });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const token = typeof req.body?.token === 'string' ? req.body.token : '';
    const yeni = typeof req.body?.yeniSifre === 'string' ? req.body.yeniSifre : '';
    if (yeni.length < MIN_PASSWORD_LENGTH || yeni.length > 200) {
      res.status(400).json({ error: `Yeni şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.` });
      return;
    }
    const userId = token ? consumeToken(db, token, 'sifirlama') : null;
    if (!userId) {
      res.status(400).json({ error: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.' });
      return;
    }
    setPassword(db, userId, yeni);
    markVerified(db, userId); // e-postaya erişimini kanıtladı
    destroyAllSessions(db, userId);
    res.json({ ok: true });
  });

  // ---------- Ürünler ----------

  app.get('/api/products', (_req, res) => {
    res.json({ products: store.listProducts(db), categories: CATEGORIES });
  });

  app.post('/api/products', requireAdmin, (req, res) => {
    const built = buildProduct(req.body ?? {});
    if (!built.ok) {
      res.status(400).json({ error: built.error });
      return;
    }
    if (store.getProduct(db, built.product.slug)) {
      res.status(409).json({ error: 'Bu adresle (slug) kayıtlı bir ürün zaten var.' });
      return;
    }
    store.insertProduct(db, built.product);
    res.status(201).json({ ok: true, product: built.product });
  });

  app.put('/api/products/:slug', requireAdmin, (req, res) => {
    const current = store.getProduct(db, req.params.slug);
    if (!current) {
      res.status(404).json({ error: 'Ürün bulunamadı.' });
      return;
    }
    const built = buildProduct(req.body ?? {}, current);
    if (!built.ok) {
      res.status(400).json({ error: built.error });
      return;
    }
    store.saveProduct(db, built.product);
    res.json({ ok: true, product: built.product });
  });

  app.delete('/api/products/:slug', requireAdmin, (req, res) => {
    if (!store.removeProduct(db, req.params.slug)) {
      res.status(404).json({ error: 'Ürün bulunamadı.' });
      return;
    }
    res.json({ ok: true });
  });

  // ---------- Siparişler ----------

  /** Üyenin kendi siparişleri (lisans anahtarları dahil). */
  app.get('/api/my/orders', requireUser, (req, res) => {
    res.json({ orders: store.listOrders(db, req.user!.id) });
  });

  app.get('/api/orders', requireAdmin, (_req, res) => {
    res.json({ orders: store.listOrders(db) });
  });

  app.put('/api/orders/:siparisNo', requireAdmin, (req, res) => {
    const order = store.getOrder(db, req.params.siparisNo);
    if (!order) {
      res.status(404).json({ error: 'Sipariş bulunamadı.' });
      return;
    }
    const { durum, teslimEdilenBilgiler } = req.body ?? {};
    if (durum !== undefined) {
      if (!ORDER_STATUSES.includes(durum)) {
        res.status(400).json({ error: 'Geçersiz sipariş durumu.' });
        return;
      }
      order.durum = durum;
    }
    if (teslimEdilenBilgiler !== undefined) {
      order.teslimEdilenBilgiler = cleanText(teslimEdilenBilgiler, 5000);
    }
    store.saveOrder(db, order);
    res.json({ ok: true, order });
  });

  app.delete('/api/orders/:siparisNo', requireAdmin, (req, res) => {
    if (!store.removeOrder(db, req.params.siparisNo)) {
      res.status(404).json({ error: 'Sipariş bulunamadı.' });
      return;
    }
    res.json({ ok: true });
  });

  // ---------- Kuponlar ----------

  /** Kupon kodunu sunucuda doğrular; kod listesi herkese açık değildir. */
  app.post('/api/coupons/validate', (req, res) => {
    const code = cleanText(req.body?.code, 40).toUpperCase();
    const rate = store.listCoupons(db)[code];
    if (!rate) {
      res.status(404).json({ error: 'Geçersiz veya süresi dolmuş kupon kodu.' });
      return;
    }
    res.json({ ok: true, code, rate });
  });

  app.get('/api/coupons', requireAdmin, (_req, res) => {
    res.json({ coupons: store.listCoupons(db) });
  });

  app.post('/api/coupons', requireAdmin, (req, res) => {
    const code = cleanText(req.body?.code, 40).toUpperCase();
    const rate = Number(req.body?.rate);
    if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
      res.status(400).json({ error: 'Kupon kodu 2-40 karakter (harf, rakam, - veya _) olmalıdır.' });
      return;
    }
    if (!Number.isFinite(rate) || rate <= 0 || rate > 100) {
      res.status(400).json({ error: 'İndirim oranı 1 ile 100 arasında olmalıdır.' });
      return;
    }
    store.upsertCoupon(db, code, rate);
    res.json({ ok: true, coupons: store.listCoupons(db) });
  });

  app.delete('/api/coupons/:code', requireAdmin, (req, res) => {
    store.removeCoupon(db, cleanText(req.params.code, 40).toUpperCase());
    res.json({ ok: true, coupons: store.listCoupons(db) });
  });

  // ---------- Ayarlar ----------

  app.get('/api/settings', (req, res) => {
    const all = store.getSettings(db);
    if (req.user?.rol === 'admin') {
      res.json(all);
      return;
    }
    res.json({
      ...Object.fromEntries(PUBLIC_SETTING_KEYS.map((k) => [k, all[k]])),
      paymentProviderUrl: '',
    });
  });

  app.post('/api/settings', requireAdmin, (req, res) => {
    const updates: Partial<ReturnType<typeof store.getSettings>> = {};
    for (const key of store.SETTING_KEYS) {
      const value = req.body?.[key];
      if (value === undefined) continue;
      if (typeof value !== 'string' || value.length > 500) {
        res.status(400).json({ error: `"${key}" ayarı geçersiz.` });
        return;
      }
      if (key === 'paymentProviderUrl' && value.trim() !== '' && !/^https:\/\//i.test(value.trim())) {
        res.status(400).json({ error: 'Ödeme sağlayıcısı adresi https:// ile başlamalıdır.' });
        return;
      }
      updates[key] = value.trim();
    }
    store.saveSettings(db, updates);
    res.json({ ok: true, settings: store.getSettings(db) });
  });

  // ---------- Ödeme / sipariş oluşturma ----------

  const generateOrderNo = () => {
    for (let i = 0; i < 30; i++) {
      const no = `SP-${crypto.randomInt(1000, 10000)}`;
      if (!store.orderExists(db, no)) return no;
    }
    // 4 haneli aralık doluya yakınsa daha uzun numaraya geç.
    for (;;) {
      const no = `SP-${crypto.randomInt(100000, 1000000)}`;
      if (!store.orderExists(db, no)) return no;
    }
  };

  app.post('/api/checkout', requireUser, (req, res) => {
    if (!req.user!.dogrulandi) {
      res.status(403).json({
        error: 'Sipariş vermek için e-posta adresinizi doğrulamalısınız.',
        kod: 'EPOSTA_DOGRULANMADI',
      });
      return;
    }
    const result = processCheckoutRequest(
      req.body,
      store.getSettings(db).paymentProviderUrl || paymentProviderUrl,
      store.listProducts(db),
      store.listCoupons(db),
      generateOrderNo
    );

    if (!result.ok || !result.order) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    store.insertOrder(db, result.order as OrderResult, req.user!.id);
    res.status(200).json({
      ok: true,
      siparisNo: result.order.siparisNo,
      order: result.order,
      redirectUrl: result.redirectUrl,
    });
  });

  // Bilinmeyen API yolları SPA'ya düşmesin.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Servis bulunamadı.' });
  });

  // Hata yakalayıcı (ör. geçersiz JSON gövdesi).
  app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 500;
    if (status === 500) console.error(err);
    res.status(status).json({
      error: status === 500 ? 'Beklenmeyen bir sunucu hatası oluştu.' : 'Geçersiz istek.',
    });
  });

  return app;
}
