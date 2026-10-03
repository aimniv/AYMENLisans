import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from './app';
import { ensureAdmin } from './auth';
import { openDb } from './db';
import type { Mail } from './mailer';

let server: Server;
let base: string;
const outbox: Mail[] = [];

/** Bir adrese gönderilen son e-postadaki token'ı döndürür. */
function lastToken(to: string, subjectPart: string): string | null {
  const mail = [...outbox].reverse().find((m) => m.to === to && m.subject.includes(subjectPart));
  return mail?.text.match(/token=([\w-]+)/)?.[1] ?? null;
}

before(() => {
  const db = openDb(':memory:');
  ensureAdmin(db, 'admin@test.com', 'adminpass123');
  const mailer = { send: async (m: Mail) => void outbox.push(m) };
  server = createApp({ db, mailer, appUrl: 'https://magaza.example/', registerLimit: 1000 }).listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
});

/** Çerez saklayan küçük bir istemci. */
function client() {
  let cookie = '';
  return async (method: string, url: string, body?: unknown, headers: Record<string, string> = {}) => {
    const res = await fetch(base + url, {
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

test('herkese açık ayarlar ödeme adresini içermez; admin görür', async () => {
  const anon = client();
  assert.equal((await anon('GET', '/api/settings')).body.paymentProviderUrl, '');

  const admin = client();
  assert.equal((await admin('POST', '/api/auth/login', { eposta: 'admin@test.com', sifre: 'adminpass123' })).status, 200);
  const save = await admin('POST', '/api/settings', { paymentProviderUrl: 'https://pay.example.com/checkout' });
  assert.equal(save.status, 200);
  assert.equal((await admin('GET', '/api/settings')).body.paymentProviderUrl, 'https://pay.example.com/checkout');
  assert.equal((await anon('GET', '/api/settings')).body.paymentProviderUrl, '');
  assert.equal((await admin('POST', '/api/settings', { paymentProviderUrl: 'javascript:alert(1)' })).status, 400);
  await admin('POST', '/api/settings', { paymentProviderUrl: '' });
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
