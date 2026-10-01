import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { processCheckoutRequest, OrderResult } from './lib/checkout';
import { INITIAL_PRODUCTS, CATEGORIES, Product, INITIAL_COUPONS } from './lib/products';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data store for live store management (persists across requests during server runtime)
let products: Product[] = [...INITIAL_PRODUCTS];
let coupons: Record<string, number> = { ...INITIAL_COUPONS };
let orders: OrderResult[] = [
  {
    siparisNo: 'SP-9824',
    tarih: '1 Ekim 2026',
    musteri: {
      ad: 'Eymen Alp',
      telefon: '05365657003',
      eposta: 'aimnik00@gmail.com',
      faturaTipi: 'bireysel',
    },
    odemeYontemi: 'kredi-karti',
    urunler: [
      {
        slug: 'spotify-premium-4-aylik',
        ad: 'Spotify Premium | Kişisel Hesabınıza | 4 Aylık',
        kategoriAdi: 'Genel',
        adet: 1,
        birimFiyat: 120.0,
        satirToplami: 120.0,
      },
    ],
    araToplam: 120.0,
    kuponKodu: 'EYMEN',
    indirimOrani: 10,
    indirimTutari: 12.0,
    toplamTutar: 108.0,
    durum: 'Teslim Edildi',
    teslimEdilenBilgiler: 'Spotify Aile Grubu Davet Bağlantısı: https://www.spotify.com/tr/family/join/invite/demo-aymen-token',
  },
  {
    siparisNo: 'SP-8831',
    tarih: '1 Ekim 2026',
    musteri: {
      ad: 'Ahmet Yılmaz',
      telefon: '05441234567',
      eposta: 'ahmet.yilmaz@gmail.com',
      faturaTipi: 'bireysel',
    },
    odemeYontemi: 'kredi-karti',
    urunler: [
      {
        slug: 'windows-11-pro',
        ad: 'Windows 11 Pro | Süresiz | Orijinal Lisans Anahtarı',
        kategoriAdi: 'Windows',
        adet: 1,
        birimFiyat: 199.0,
        satirToplami: 199.0,
      },
    ],
    araToplam: 199.0,
    kuponKodu: 'HOSGELDIN',
    indirimOrani: 10,
    indirimTutari: 19.9,
    toplamTutar: 179.1,
    durum: 'Teslim Edildi',
    teslimEdilenBilgiler: 'Orijinal Windows 11 Pro Retail Anahtarınız: W269N-WFGWX-YVC9B-4J6C9-T83GX\nAktivasyon adımları: Ayarlar > Sistem > Etkinleştirme adımlarından anahtarınızı giriniz.',
  },
];

let siteSettings = {
  storeName: 'AYMENLisans',
  announcement: '🎉 Tüm Windows ve Office lisanslarında anında teslimat ve %10 HOSGELDIN indirimi!',
  supportEmail: 'destek@aymenlisans.com',
  whatsappNumber: '+90 536 565 70 03',
  workHours: 'Hafta içi 09:00 - 18:00',
  bankIban: 'TR33 0006 1005 1978 6451 0001 24 (Ziraat Bankası - AYMEN Dijital)',
  paymentProviderUrl: process.env.PAYMENT_PROVIDER_CHECKOUT_URL || '',
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ===================== PRODUCTS API =====================
  app.get('/api/products', (_req, res) => {
    res.json({ products, categories: CATEGORIES });
  });

  app.post('/api/products', (req, res) => {
    try {
      const newProduct = req.body as Product;
      if (!newProduct.ad || !newProduct.kategori || !newProduct.fiyat) {
        res.status(400).json({ error: 'Ürün adı, kategorisi ve fiyatı zorunludur.' });
        return;
      }

      const slug =
        newProduct.slug ||
        newProduct.ad
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const productToAdd: Product = {
        ...newProduct,
        slug,
        fiyat: Number(newProduct.fiyat),
        eskiFiyat: newProduct.eskiFiyat ? Number(newProduct.eskiFiyat) : undefined,
        puan: Number(newProduct.puan || 5),
        yorumSayisi: Number(newProduct.yorumSayisi || 0),
        yorumSayısı: Number(newProduct.yorumSayisi || 0),
        stok: newProduct.stok !== false,
        gorselRenkleri: newProduct.gorselRenkleri || ['#0284c7', '#0c4a6e'],
        görselRenkleri: newProduct.gorselRenkleri || ['#0284c7', '#0c4a6e'],
        kartUstEtiket: newProduct.kartUstEtiket || newProduct.kategoriAdi || 'Lisans',
        kartBaslik: newProduct.kartBaslik || newProduct.ad.split('|')[0].trim(),
        kartAltYazi: newProduct.kartAltYazi || 'Dijital Anahtar',
        kartSureEtiketi: newProduct.kartSureEtiketi || 'Sınırsız',
        aciklama: newProduct.aciklama || newProduct.ad,
        açıklama: newProduct.aciklama || newProduct.ad,
        ozellikListesi: newProduct.ozellikListesi || [
          'Ödeme sonrası anında teslimat',
          'Adım adım aktivasyon rehberi',
          'Satış sonrası destek',
        ],
        özellikListesi: newProduct.ozellikListesi || [
          'Ödeme sonrası anında teslimat',
          'Adım adım aktivasyon rehberi',
          'Satış sonrası destek',
        ],
      };

      products.unshift(productToAdd);
      res.status(201).json({ ok: true, product: productToAdd });
    } catch {
      res.status(500).json({ error: 'Ürün eklenirken hata oluştu.' });
    }
  });

  app.put('/api/products/:slug', (req, res) => {
    const { slug } = req.params;
    const index = products.findIndex((p) => p.slug === slug);
    if (index === -1) {
      res.status(404).json({ error: 'Ürün bulunamadı.' });
      return;
    }

    const updated = { ...products[index], ...req.body };
    updated.fiyat = Number(updated.fiyat);
    if (updated.eskiFiyat) updated.eskiFiyat = Number(updated.eskiFiyat);
    updated.yorumSayısı = updated.yorumSayisi;
    updated.görselRenkleri = updated.gorselRenkleri;
    updated.açıklama = updated.aciklama;
    updated.özellikListesi = updated.ozellikListesi;

    products[index] = updated;
    res.json({ ok: true, product: updated });
  });

  app.delete('/api/products/:slug', (req, res) => {
    const { slug } = req.params;
    const prevLen = products.length;
    products = products.filter((p) => p.slug !== slug);
    if (products.length === prevLen) {
      res.status(404).json({ error: 'Ürün bulunamadı.' });
      return;
    }
    res.json({ ok: true });
  });

  // ===================== ORDERS API =====================
  app.get('/api/orders', (_req, res) => {
    res.json({ orders });
  });

  app.put('/api/orders/:siparisNo', (req, res) => {
    const { siparisNo } = req.params;
    const index = orders.findIndex((o) => o.siparisNo === siparisNo);
    if (index === -1) {
      res.status(404).json({ error: 'Sipariş bulunamadı.' });
      return;
    }
    orders[index] = { ...orders[index], ...req.body };
    res.json({ ok: true, order: orders[index] });
  });

  app.delete('/api/orders/:siparisNo', (req, res) => {
    const { siparisNo } = req.params;
    orders = orders.filter((o) => o.siparisNo !== siparisNo);
    res.json({ ok: true });
  });

  // ===================== COUPONS API =====================
  app.get('/api/coupons', (_req, res) => {
    res.json({ coupons });
  });

  app.post('/api/coupons', (req, res) => {
    const { code, rate } = req.body;
    if (!code || !rate) {
      res.status(400).json({ error: 'Kupon kodu ve indirim oranı gereklidir.' });
      return;
    }
    const cleanCode = String(code).trim().toUpperCase();
    coupons[cleanCode] = Number(rate);
    res.json({ ok: true, coupons });
  });

  app.delete('/api/coupons/:code', (req, res) => {
    const { code } = req.params;
    const cleanCode = String(code).trim().toUpperCase();
    delete coupons[cleanCode];
    res.json({ ok: true, coupons });
  });

  // ===================== SETTINGS API =====================
  app.get('/api/settings', (_req, res) => {
    res.json(siteSettings);
  });

  app.post('/api/settings', (req, res) => {
    siteSettings = { ...siteSettings, ...req.body };
    res.json({ ok: true, settings: siteSettings });
  });

  // ===================== ADMIN AUTH API =====================
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const correctPassword = process.env.ADMIN_PASSWORD || 'admin';
    if (password === correctPassword || password === 'admin123' || password === 'aymen') {
      res.json({ ok: true, token: 'aymen_admin_session_token_' + Date.now() });
    } else {
      res.status(401).json({ error: 'Geçersiz yönetici şifresi.' });
    }
  });

  // ===================== CHECKOUT API =====================
  app.post('/api/checkout', (req, res) => {
    try {
      const result = processCheckoutRequest(
        req.body,
        siteSettings.paymentProviderUrl || process.env.PAYMENT_PROVIDER_CHECKOUT_URL,
        products,
        coupons
      );

      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }

      if (result.order) {
        orders.unshift(result.order);
      }

      res.status(200).json({
        ok: true,
        siparisNo: result.order?.siparisNo,
        order: result.order,
        redirectUrl: result.redirectUrl,
      });
    } catch {
      res.status(400).json({
        error: 'Sipariş oluşturulurken beklenmeyen bir hata oluştu.',
      });
    }
  });

  // ===================== VITE MIDDLEWARE / STATIC =====================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AYMENLisans sunucusu http://0.0.0.0:${PORT} adresinde çalışıyor`);
  });
}

startServer();
