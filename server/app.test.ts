import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from './app';
import { ensureAdmin } from './auth';
import { openDb } from './db';
import { createIyzicoProvider } from './payments';
import type { Mail } from './mailer';
import type { PaymentInit, PaymentResult } from './payments';

let server: Server;
let base: string;
const outbox: Mail[] = [];

/** Test için ödeme sağlayıcısı: iyzico'ya gitmeden oturum/sonuç davranışını taklit eder. */
const fake = {
  sessions: new Map<string, PaymentInit>(),
  forced: new Map<string, PaymentResult>(),
  failInit: false,
  failRetrieve: false,
  async initialize(input: PaymentInit) {
    if (this.failInit) throw new Error('sağlayıcı kapalı');
    const token = `tok-${input.siparisNo}`;
    this.sessions.set(token, input);
    return { token, url: `https://pay.example/checkout?token=${token}` };
  },
  async retrieve(token: string): Promise<PaymentResult> {
    if (this.failRetrieve) throw new Error('ağ hatası');
    const forced = this.forced.get(token);
    if (forced) return forced;
    const s = this.sessions.get(token)!;
    return { paid: true, siparisNo: s.siparisNo, paidPrice: s.odenecekTutar, paymentId: 'PAY-1' };
  },
};

/** Bir adrese gönderilen son e-postadaki token'ı döndürür. */
function lastToken(to: string, subjectPart: string): string | null {
  const mail = [...outbox].reverse().find((m) => m.to === to && m.subject.includes(subjectPart));
  return mail?.text.match(/token=([\w-]+)/)?.[1] ?? null;
}

before(() => {
  const db = openDb(':memory:');
  ensureAdmin(db, 'admin@test.com', 'adminpass123');
  const mailer = { send: async (m: Mail) => void outbox.push(m) };
  server = createApp({ db, mailer, appUrl: 'https://magaza.example/', registerLimit: 1000, paymentProvider: fake }).listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
});

/** Çerez saklayan küçük bir istemci. */
function client(baseUrl?: string) {
  let cookie = '';
  return async (method: string, url: string, body?: unknown, headers: Record<string, string> = {}) => {
    const res = await fetch((baseUrl ?? base) + url, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.startsWith('aymen_session=;') || /Expires=Thu, 01 Jan 1970/.test(set) ? '' : set.split(';')[0];
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null, setCookie: set };
  };
}

/** E-posta doğrulama bağlantısını çalıştırır. */
async function verify(c: ReturnType<typeof client>, eposta: string) {
  const token = lastToken(eposta, 'doğrulayın');
  assert.ok(token, 'doğrulama e-postası gönderilmiş olmalı');
  assert.equal((await c('POST', '/api/auth/verify-email', { token })).status, 200);
}

const checkoutBody = (slug = 'windows-10-home') => ({
  ad: 'Test Kullanıcı',
  telefon: '05551234567',
  eposta: 'test@example.com',
  odemeYontemi: 'havale-eft',
  sozlesmeKabul: true,
  urunler: [{ slug, adet: 1 }],
});

test('üyelik: kayıt, çıkış, giriş, me', async () => {
  const c = client();
  const bad = await c('POST', '/api/auth/register', { ad: 'Ali Veli', eposta: 'ali@example.com', sifre: 'kisa' });
  assert.equal(bad.status, 400);

  const reg = await c('POST', '/api/auth/register', { ad: 'Ali Veli', eposta: 'Ali@Example.com', sifre: 'sifre1234' });
  assert.equal(reg.status, 201);
  assert.equal(reg.body.user.eposta, 'ali@example.com');
  assert.equal(reg.body.user.rol, 'uye');
  assert.equal(reg.body.user.sifre_hash, undefined);
  assert.match(reg.setCookie ?? '', /HttpOnly/);

  assert.equal((await c('GET', '/api/auth/me')).body.user.ad, 'Ali Veli');

  const dup = await client()('POST', '/api/auth/register', { ad: 'Başka Biri', eposta: 'ali@example.com', sifre: 'sifre1234' });
  assert.equal(dup.status, 409);

  await c('POST', '/api/auth/logout');
  assert.equal((await c('GET', '/api/auth/me')).body.user, null);

  assert.equal((await c('POST', '/api/auth/login', { eposta: 'ali@example.com', sifre: 'yanlis-sifre' })).status, 401);
  assert.equal((await c('POST', '/api/auth/login', { eposta: 'ali@example.com', sifre: 'sifre1234' })).status, 200);
  assert.equal((await c('GET', '/api/auth/me')).body.user.eposta, 'ali@example.com');
});

test('giriş denemeleri sınırlanır', async () => {
  const c = client();
  let last = 0;
  for (let i = 0; i < 12; i++) {
    last = (await c('POST', '/api/auth/login', { eposta: 'yok@example.com', sifre: 'xxxxxxxx' })).status;
  }
  assert.equal(last, 429);
});

test('yönetici uçları yetkisiz erişime kapalı', async () => {
  const anon = client();
  assert.equal((await anon('GET', '/api/orders')).status, 401);
  assert.equal((await anon('POST', '/api/products', { ad: 'X' })).status, 401);
  assert.equal((await anon('GET', '/api/coupons')).status, 401);
  assert.equal((await anon('POST', '/api/settings', { storeName: 'x' })).status, 401);

  const member = client();
  await member('POST', '/api/auth/register', { ad: 'Üye Kişi', eposta: 'uye@example.com', sifre: 'sifre1234' });
  assert.equal((await member('GET', '/api/orders')).status, 403);
  assert.equal((await member('DELETE', '/api/products/windows-10-home')).status, 403);
});

test('ayarlar herkese açık okunur, yalnızca admin değiştirir', async () => {
  const anon = client();
  assert.equal((await anon('GET', '/api/settings')).body.storeName, 'AYMENLisans');
  assert.equal((await anon('POST', '/api/settings', { announcement: 'x' })).status, 401);

  const admin = client();
  await admin('POST', '/api/auth/login', { eposta: 'admin@test.com', sifre: 'adminpass123' });
  assert.equal((await admin('POST', '/api/settings', { announcement: 'Yeni duyuru' })).status, 200);
  assert.equal((await anon('GET', '/api/settings')).body.announcement, 'Yeni duyuru');
  assert.equal((await admin('POST', '/api/settings', { announcement: 'x'.repeat(501) })).status, 400);
});

test('kupon doğrulama: liste açık değil, tek tek doğrulanır', async () => {
  const anon = client();
  assert.equal((await anon('POST', '/api/coupons/validate', { code: 'hosgeldin' })).body.rate, 10);
  assert.equal((await anon('POST', '/api/coupons/validate', { code: 'YOK' })).status, 404);
});

test('sipariş: giriş şart, fiyat sunucuda hesaplanır, yalnızca sahibi görür', async () => {
  assert.equal((await client()('POST', '/api/checkout', checkoutBody())).status, 401);

  const a = client();
  await a('POST', '/api/auth/register', { ad: 'Kişi Bir', eposta: 'bir@example.com', sifre: 'sifre1234' });
  await verify(a, 'bir@example.com');
  const b = client();
  await b('POST', '/api/auth/register', { ad: 'Kişi İki', eposta: 'iki@example.com', sifre: 'sifre1234' });

  const order = await a('POST', '/api/checkout', { ...checkoutBody(), kuponKodu: 'HOSGELDIN', fiyat: 1, toplamTutar: 1 });
  assert.equal(order.status, 200);
  assert.match(order.body.siparisNo, /^SP-\d+$/);
  assert.equal(order.body.order.araToplam, 149);
  assert.equal(order.body.order.toplamTutar, 134.1);

  assert.equal((await a('GET', '/api/my/orders')).body.orders.length, 1);
  assert.equal((await b('GET', '/api/my/orders')).body.orders.length, 0);
});

test('admin: sipariş durumu/lisans, ürün ekleme-güncelleme-silme', async () => {
  const buyer = client();
  await buyer('POST', '/api/auth/register', { ad: 'Alıcı Kişi', eposta: 'alici@example.com', sifre: 'sifre1234' });
  await verify(buyer, 'alici@example.com');
  const { body } = await buyer('POST', '/api/checkout', checkoutBody());

  const admin = client();
  await admin('POST', '/api/auth/login', { eposta: 'admin@test.com', sifre: 'adminpass123' });
  assert.ok((await admin('GET', '/api/orders')).body.orders.some((o: { siparisNo: string }) => o.siparisNo === body.siparisNo));

  assert.equal((await admin('PUT', `/api/orders/${body.siparisNo}`, { durum: 'Saçma' })).status, 400);
  const upd = await admin('PUT', `/api/orders/${body.siparisNo}`, {
    durum: 'Teslim Edildi',
    teslimEdilenBilgiler: 'ANAHTAR-123',
    toplamTutar: 0,
  });
  assert.equal(upd.status, 200);
  assert.equal(upd.body.order.toplamTutar, 149);

  const mine = (await buyer('GET', '/api/my/orders')).body.orders[0];
  assert.equal(mine.durum, 'Teslim Edildi');
  assert.equal(mine.teslimEdilenBilgiler, 'ANAHTAR-123');

  const created = await admin('POST', '/api/products', { ad: 'Çok Özel Ürün | 1 Yıl', kategori: 'genel', fiyat: '99.5' });
  assert.equal(created.status, 201);
  assert.equal(created.body.product.slug, 'cok-ozel-urun-1-yil');
  assert.equal(created.body.product.kategoriAdi, 'Genel');
  assert.equal((await admin('POST', '/api/products', { ad: 'Çok Özel Ürün | 1 Yıl', kategori: 'genel', fiyat: 10 })).status, 409);
  assert.equal((await admin('POST', '/api/products', { ad: 'Kötü', kategori: 'yok', fiyat: 10 })).status, 400);
  assert.equal((await admin('POST', '/api/products', { ad: 'Kötü', kategori: 'genel', fiyat: -5 })).status, 400);

  const put = await admin('PUT', '/api/products/cok-ozel-urun-1-yil', { fiyat: 120, stok: false, slug: 'degistirilemez' });
  assert.equal(put.body.product.fiyat, 120);
  assert.equal(put.body.product.slug, 'cok-ozel-urun-1-yil');
  const listed = (await client()('GET', '/api/products')).body.products;
  assert.equal(listed[0].slug, 'cok-ozel-urun-1-yil');

  // Stokta olmayan ürün satın alınamaz
  assert.equal((await buyer('POST', '/api/checkout', checkoutBody('cok-ozel-urun-1-yil'))).status, 400);

  assert.equal((await admin('DELETE', '/api/products/cok-ozel-urun-1-yil')).status, 200);
  assert.equal((await admin('DELETE', '/api/products/cok-ozel-urun-1-yil')).status, 404);
});

test('şifre değişimi: eski şifre gerekir, diğer oturumlar kapanır', async () => {
  const phone = client();
  await phone('POST', '/api/auth/register', { ad: 'Şifre Test', eposta: 'sifre@example.com', sifre: 'eskisifre1' });
  const laptop = client();
  await laptop('POST', '/api/auth/login', { eposta: 'sifre@example.com', sifre: 'eskisifre1' });

  assert.equal((await phone('PUT', '/api/auth/password', { mevcutSifre: 'yanlis', yeniSifre: 'yenisifre1' })).status, 400);
  assert.equal((await phone('PUT', '/api/auth/password', { mevcutSifre: 'eskisifre1', yeniSifre: 'kisa' })).status, 400);
  assert.equal((await phone('PUT', '/api/auth/password', { mevcutSifre: 'eskisifre1', yeniSifre: 'yenisifre1' })).status, 200);

  assert.equal((await phone('GET', '/api/auth/me')).body.user.eposta, 'sifre@example.com');
  assert.equal((await laptop('GET', '/api/auth/me')).body.user, null);
  assert.equal((await client()('POST', '/api/auth/login', { eposta: 'sifre@example.com', sifre: 'eskisifre1' })).status, 401);
  assert.equal((await client()('POST', '/api/auth/login', { eposta: 'sifre@example.com', sifre: 'yenisifre1' })).status, 200);
});

test('profil güncelleme ve e-posta çakışması', async () => {
  const c = client();
  await c('POST', '/api/auth/register', { ad: 'Profil Bir', eposta: 'profil1@example.com', sifre: 'sifre1234' });
  await client()('POST', '/api/auth/register', { ad: 'Profil İki', eposta: 'profil2@example.com', sifre: 'sifre1234' });

  assert.equal((await c('PUT', '/api/auth/profile', { ad: 'Profil Bir', eposta: 'profil2@example.com' })).status, 409);
  const ok = await c('PUT', '/api/auth/profile', { ad: 'Yeni Ad', eposta: 'profil1@example.com', telefon: '05551234567' });
  assert.equal(ok.body.user.ad, 'Yeni Ad');
  assert.equal((await c('GET', '/api/auth/me')).body.user.telefon, '05551234567');
});

test('başka siteden gelen yazma istekleri reddedilir; bilinmeyen api yolu JSON 404', async () => {
  const c = client();
  const res = await c('POST', '/api/auth/login', { eposta: 'x@example.com', sifre: 'xxxxxxxx' }, { Origin: 'https://evil.example' });
  assert.equal(res.status, 403);
  assert.equal((await c('GET', '/api/yok')).status, 404);
  const bad = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bozuk' });
  assert.equal(bad.status, 400);
});

test('e-posta doğrulama: doğrulanmadan sipariş yok, bağlantı tek kullanımlık', async () => {
  const c = client();
  const reg = await c('POST', '/api/auth/register', { ad: 'Doğrulama Test', eposta: 'dogrula@example.com', sifre: 'sifre1234' });
  assert.equal(reg.body.user.dogrulandi, false);

  const mail = outbox.find((m) => m.to === 'dogrula@example.com');
  assert.ok(mail);
  assert.match(mail.text, /^.*https:\/\/magaza\.example\/eposta-dogrula\?token=/m);

  const blocked = await c('POST', '/api/checkout', checkoutBody());
  assert.equal(blocked.status, 403);
  assert.equal(blocked.body.kod, 'EPOSTA_DOGRULANMADI');

  assert.equal((await c('POST', '/api/auth/verify-email', { token: 'sahte' })).status, 400);
  const token = lastToken('dogrula@example.com', 'doğrulayın')!;
  assert.equal((await c('POST', '/api/auth/verify-email', { token })).status, 200);
  assert.equal((await c('POST', '/api/auth/verify-email', { token })).status, 400);

  assert.equal((await c('GET', '/api/auth/me')).body.user.dogrulandi, true);
  assert.equal((await c('POST', '/api/checkout', checkoutBody())).status, 200);
});

test('doğrulama e-postası yeniden gönderilir (sınırlı); e-posta değişince tekrar doğrulanır', async () => {
  const c = client();
  await c('POST', '/api/auth/register', { ad: 'Tekrar Test', eposta: 'tekrar@example.com', sifre: 'sifre1234' });
  const first = lastToken('tekrar@example.com', 'doğrulayın');

  assert.equal((await c('POST', '/api/auth/resend-verification')).status, 200);
  const second = lastToken('tekrar@example.com', 'doğrulayın');
  assert.notEqual(first, second);
  // eski bağlantı geçersiz
  assert.equal((await c('POST', '/api/auth/verify-email', { token: first })).status, 400);

  await c('POST', '/api/auth/resend-verification');
  await c('POST', '/api/auth/resend-verification');
  assert.equal((await c('POST', '/api/auth/resend-verification')).status, 429);

  await verify(c, 'tekrar@example.com');
  assert.equal((await c('GET', '/api/auth/me')).body.user.dogrulandi, true);

  const upd = await c('PUT', '/api/auth/profile', { ad: 'Tekrar Test', eposta: 'yeni-adres@example.com' });
  assert.equal(upd.body.user.dogrulandi, false);
  assert.ok(lastToken('yeni-adres@example.com', 'doğrulayın'));
});

test('şifre sıfırlama: hesap var/yok aynı yanıt, tek kullanımlık, oturumları kapatır', async () => {
  const phone = client();
  await phone('POST', '/api/auth/register', { ad: 'Unutkan Kişi', eposta: 'unutkan@example.com', sifre: 'eskisifre1' });

  const before = outbox.length;
  const unknown = await client()('POST', '/api/auth/forgot-password', { eposta: 'hic-yok@example.com' });
  const known = await client()('POST', '/api/auth/forgot-password', { eposta: 'Unutkan@Example.com' });
  assert.deepEqual(unknown.body, known.body);
  assert.equal(unknown.status, 200);
  assert.equal(outbox.length, before + 1); // yalnızca var olan hesaba e-posta gider
  assert.equal(outbox[outbox.length - 1].to, 'unutkan@example.com');
  assert.match(outbox[outbox.length - 1].text, /https:\/\/magaza\.example\/sifre-sifirla\?token=/);

  const token = lastToken('unutkan@example.com', 'sıfırlama')!;
  const anon = client();
  assert.equal((await anon('POST', '/api/auth/reset-password', { token: 'sahte', yeniSifre: 'yenisifre1' })).status, 400);
  assert.equal((await anon('POST', '/api/auth/reset-password', { token, yeniSifre: 'kisa' })).status, 400);
  assert.equal((await anon('POST', '/api/auth/reset-password', { token, yeniSifre: 'yenisifre1' })).status, 200);
  // aynı bağlantı ikinci kez kullanılamaz
  assert.equal((await anon('POST', '/api/auth/reset-password', { token, yeniSifre: 'baskasifre1' })).status, 400);

  assert.equal((await phone('GET', '/api/auth/me')).body.user, null);
  assert.equal((await client()('POST', '/api/auth/login', { eposta: 'unutkan@example.com', sifre: 'eskisifre1' })).status, 401);
  const login = await client()('POST', '/api/auth/login', { eposta: 'unutkan@example.com', sifre: 'yenisifre1' });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.dogrulandi, true); // e-postaya erişimini kanıtladı
});

test('şifre sıfırlama istekleri sınırlanır; doğrulama token\'ı sıfırlamada kullanılamaz', async () => {
  const c = client();
  let last = 0;
  for (let i = 0; i < 7; i++) last = (await c('POST', '/api/auth/forgot-password', { eposta: 'sinir@example.com' })).status;
  assert.equal(last, 429);

  await c('POST', '/api/auth/register', { ad: 'Çapraz Test', eposta: 'capraz@example.com', sifre: 'sifre1234' });
  const verifyToken = lastToken('capraz@example.com', 'doğrulayın')!;
  assert.equal((await client()('POST', '/api/auth/reset-password', { token: verifyToken, yeniSifre: 'yenisifre1' })).status, 400);
});

// ---------- Kart ödemesi (iyzico) ----------

const cardBody = (slug = 'windows-10-home', extra: object = {}) => ({
  ...checkoutBody(slug),
  odemeYontemi: 'kredi-karti',
  ...extra,
});

async function verifiedMember(eposta: string) {
  const c = client();
  await c('POST', '/api/auth/register', { ad: 'Kart Müşterisi', eposta, sifre: 'sifre1234' });
  await verify(c, eposta);
  return c;
}

/** Ödeme sağlayıcısının müşteriyi döndürdüğü çapraz site POST'unu taklit eder (çerezsiz, yabancı Origin'li). */
const callback = (token: string) =>
  fetch(`${base}/odeme/iyzico/callback`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://cpp.iyzipay.com' },
    body: new URLSearchParams({ token }).toString(),
  });

test('kart: sipariş ödeme bekler, başarılı dönüşte ödenmiş sayılır, tekrar gönderim etkisizdir', async () => {
  const c = await verifiedMember('kart1@example.com');
  const res = await c('POST', '/api/checkout', cardBody('windows-10-home', { kuponKodu: 'HOSGELDIN' }));
  assert.equal(res.status, 200);
  assert.equal(res.body.order.durum, 'Ödeme Bekleniyor');
  assert.match(res.body.redirectUrl, /^https:\/\/pay\.example\/checkout\?token=tok-SP-/);

  // Sağlayıcıya giden tutarlar sunucuda hesaplanmıştır; sepet toplamı kalemlerle uyuşur.
  const init = fake.sessions.get(`tok-${res.body.siparisNo}`)!;
  assert.equal(init.araToplam, 149);
  assert.equal(init.odenecekTutar, 134.1);
  assert.equal(init.items.reduce((t, i) => t + i.price, 0), 149);
  assert.equal(init.callbackUrl, 'https://magaza.example/odeme/iyzico/callback');

  // Henüz ödenmedi: ödeme bekleyen siparişte lisans yok.
  assert.equal((await c('GET', '/api/my/orders')).body.orders[0].durum, 'Ödeme Bekleniyor');

  const cb = await callback(`tok-${res.body.siparisNo}`);
  assert.equal(cb.status, 303);
  assert.equal(cb.headers.get('location'), `https://magaza.example/siparis-tamamlandi?siparisNo=${res.body.siparisNo}`);

  const paid = (await c('GET', '/api/my/orders')).body.orders[0];
  assert.equal(paid.durum, 'Teslimat Hazırlanıyor');
  assert.equal(paid.odemeId, 'PAY-1');
  assert.equal(paid.odeme_token, undefined);

  // Aynı callback ikinci kez gelirse sonuç değişmez
  const again = await callback(`tok-${res.body.siparisNo}`);
  assert.equal(again.headers.get('location'), cb.headers.get('location'));
});

test('kart: başarısız ödeme siparişi iptal eder, ödenmiş sipariş sonradan iptal edilmez', async () => {
  const c = await verifiedMember('kart2@example.com');
  const res = await c('POST', '/api/checkout', cardBody());
  const token = `tok-${res.body.siparisNo}`;
  fake.forced.set(token, { paid: false, siparisNo: res.body.siparisNo, paidPrice: 0, error: 'Yetersiz bakiye' });

  const cb = await callback(token);
  assert.match(cb.headers.get('location')!, /\/odeme-basarisiz\?siparisNo=SP-\d+$/);
  const order = (await c('GET', '/api/my/orders')).body.orders[0];
  assert.equal(order.durum, 'İptal Edildi');
  assert.match(order.teslimEdilenBilgiler, /Yetersiz bakiye/);

  // İptal edilmiş sipariş, sonradan "başarılı" gelen sahte callback ile canlanmaz
  fake.forced.delete(token);
  await callback(token);
  assert.equal((await c('GET', '/api/my/orders')).body.orders[0].durum, 'İptal Edildi');
});

test('kart: tutar uyuşmazlığı ve bilinmeyen token ödeme sayılmaz', async () => {
  const c = await verifiedMember('kart3@example.com');
  const res = await c('POST', '/api/checkout', cardBody());
  const token = `tok-${res.body.siparisNo}`;
  fake.forced.set(token, { paid: true, siparisNo: res.body.siparisNo, paidPrice: 1, paymentId: 'X' });

  const cb = await callback(token);
  assert.match(cb.headers.get('location')!, /belirsiz=1/);
  assert.equal((await c('GET', '/api/my/orders')).body.orders[0].durum, 'Ödeme Bekleniyor');

  const unknown = await callback('uydurma-token');
  assert.equal(unknown.status, 303);
  assert.match(unknown.headers.get('location')!, /\/odeme-basarisiz$/);
  const empty = await fetch(`${base}/odeme/iyzico/callback`, { method: 'POST', redirect: 'manual' });
  assert.equal(empty.status, 303);
});

test('kart: sağlayıcı oturum açamazsa sipariş geri alınır', async () => {
  const c = await verifiedMember('kart4@example.com');
  fake.failInit = true;
  const res = await c('POST', '/api/checkout', cardBody());
  fake.failInit = false;
  assert.equal(res.status, 502);
  assert.equal((await c('GET', '/api/my/orders')).body.orders.length, 0);
});

test('kart: sonuç sorgulanamazsa sipariş beklemede kalır; yönetici ödemeyi yeniden sorgulayabilir', async () => {
  const c = await verifiedMember('kart5@example.com');
  const res = await c('POST', '/api/checkout', cardBody());
  const no = res.body.siparisNo;

  fake.failRetrieve = true;
  const cb = await callback(`tok-${no}`);
  fake.failRetrieve = false;
  assert.match(cb.headers.get('location')!, /belirsiz=1/);
  assert.equal((await c('GET', '/api/my/orders')).body.orders[0].durum, 'Ödeme Bekleniyor');

  assert.equal((await c('POST', `/api/orders/${no}/verify-payment`)).status, 403);
  const admin = client();
  await admin('POST', '/api/auth/login', { eposta: 'admin@test.com', sifre: 'adminpass123' });

  // Ödeme henüz tamamlanmamışsa sipariş iptal edilmez
  fake.forced.set(`tok-${no}`, { paid: false, siparisNo: no, paidPrice: 0, error: 'bekliyor' });
  const pending = await admin('POST', `/api/orders/${no}/verify-payment`);
  assert.equal(pending.body.sonuc, 'pending');
  assert.equal(pending.body.order.durum, 'Ödeme Bekleniyor');

  fake.forced.delete(`tok-${no}`);
  const ok = await admin('POST', `/api/orders/${no}/verify-payment`);
  assert.equal(ok.body.sonuc, 'paid');
  assert.equal(ok.body.order.durum, 'Teslimat Hazırlanıyor');

  // Havale siparişinde kart sorgusu yoktur
  const havale = await c('POST', '/api/checkout', checkoutBody());
  assert.equal((await admin('POST', `/api/orders/${havale.body.siparisNo}/verify-payment`)).status, 400);
});

test('kart: sağlayıcı yoksa kapalıdır (üretim), geliştirme modunda simüle edilir; havale her zaman çalışır', async () => {
  const startApp = (opts: { simulatePayments?: boolean }) => {
    const srv = createApp({ db: openDb(':memory:'), mailer: { send: async (m: Mail) => void outbox.push(m) }, registerLimit: 100, ...opts }).listen(0);
    return { srv, url: `http://127.0.0.1:${(srv.address() as AddressInfo).port}` };
  };
  const register = async (url: string, eposta: string) => {
    const c = client(url);
    await c('POST', '/api/auth/register', { ad: 'Sağlayıcısız Kişi', eposta, sifre: 'sifre1234' });
    assert.equal((await c('POST', '/api/auth/verify-email', { token: lastToken(eposta, 'doğrulayın') })).status, 200);
    return c;
  };

  const prod = startApp({});
  try {
    const c = await register(prod.url, 'prod@example.com');
    const card = await c('POST', '/api/checkout', cardBody());
    assert.equal(card.status, 503);
    assert.equal((await c('GET', '/api/my/orders')).body.orders.length, 0);
    assert.equal((await c('POST', '/api/checkout', checkoutBody())).status, 200);
  } finally {
    prod.srv.close();
  }

  const dev = startApp({ simulatePayments: true });
  try {
    const c = await register(dev.url, 'dev@example.com');
    const card = await c('POST', '/api/checkout', cardBody());
    assert.equal(card.status, 200);
    assert.equal(card.body.order.durum, 'Teslimat Hazırlanıyor');
    assert.equal(card.body.redirectUrl, null);
  } finally {
    dev.srv.close();
  }
});

test('iyzico sağlayıcısı yalnızca anahtarlar tanımlıysa oluşturulur', () => {
  assert.equal(createIyzicoProvider({}), null);
  assert.equal(createIyzicoProvider({ IYZICO_API_KEY: 'k' }), null);
  const provider = createIyzicoProvider({ IYZICO_API_KEY: 'k', IYZICO_SECRET_KEY: 's' });
  assert.equal(typeof provider?.initialize, 'function');
  assert.equal(typeof provider?.retrieve, 'function');
});
