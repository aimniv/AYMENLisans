import { Product, getProductBySlug, VALID_COUPONS } from './products';

export interface CheckoutItemInput {
  slug: string;
  adet?: number;
  quantity?: number;
}

export interface CheckoutRequestBody {
  ad?: string;
  adSoyad?: string;
  telefon?: string;
  eposta?: string;
  email?: string;
  faturaTipi?: 'bireysel' | 'kurumsal';
  firmaAdi?: string;
  vergiNo?: string;
  vergiDairesi?: string;
  odemeYontemi?: 'kredi-karti' | 'havale-eft';
  kuponKodu?: string;
  sozlesmeKabul?: boolean;
  urunler?: CheckoutItemInput[];
  items?: CheckoutItemInput[];
}

export interface OrderLineItem {
  slug: string;
  ad: string;
  kategoriAdi: string;
  adet: number;
  birimFiyat: number;
  satirToplami: number;
}

export interface OrderResult {
  siparisNo: string;
  tarih: string;
  musteri: {
    ad: string;
    telefon: string;
    eposta: string;
    faturaTipi: 'bireysel' | 'kurumsal';
    firmaAdi?: string;
    vergiDairesi?: string;
  };
  odemeYontemi: 'kredi-karti' | 'havale-eft';
  urunler: OrderLineItem[];
  araToplam: number;
  kuponKodu: string | null;
  indirimOrani: number;
  indirimTutari: number;
  toplamTutar: number;
  durum: 'Teslim Edildi' | 'Teslimat Hazırlanıyor' | 'Ödeme Bildirimi Bekleniyor' | 'İptal Edildi';
  teslimEdilenBilgiler?: string;
}

export interface CheckoutValidationResult {
  ok: boolean;
  status: number;
  error?: string;
  order?: OrderResult;
  redirectUrl?: string | null;
}

export function processCheckoutRequest(
  body: CheckoutRequestBody,
  envCheckoutUrl?: string,
  catalog?: Product[],
  coupons?: Record<string, number>
): CheckoutValidationResult {
  if (!body || typeof body !== 'object') {
    return {
      ok: false,
      status: 400,
      error: 'Geçersiz istek verisi gönderildi.',
    };
  }

  const rawName = (body.ad ?? body.adSoyad ?? '').trim();
  if (rawName.length < 3) {
    return {
      ok: false,
      status: 400,
      error: 'Adınız ve soyadınız en az 3 karakter olmalıdır.',
    };
  }

  const rawPhone = (body.telefon ?? '').trim();
  const phoneDigits = rawPhone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    return {
      ok: false,
      status: 400,
      error: 'Lütfen en az 10 rakamdan oluşan geçerli bir telefon numarası giriniz.',
    };
  }

  const rawEmail = (body.eposta ?? body.email ?? '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!rawEmail || !emailRegex.test(rawEmail)) {
    return {
      ok: false,
      status: 400,
      error: 'Lütfen teslimat için geçerli bir e-posta adresi giriniz.',
    };
  }

  const odemeYontemi = body.odemeYontemi;
  if (odemeYontemi !== 'kredi-karti' && odemeYontemi !== 'havale-eft') {
    return {
      ok: false,
      status: 400,
      error: 'Lütfen geçerli bir ödeme yöntemi seçiniz.',
    };
  }

  if (body.sozlesmeKabul === false) {
    return {
      ok: false,
      status: 400,
      error: 'Devam etmek için kullanım şartlarını ve mesafeli satış sözleşmesini kabul etmelisiniz.',
    };
  }

  const rawItems = Array.isArray(body.urunler)
    ? body.urunler
    : Array.isArray(body.items)
      ? body.items
      : [];

  if (rawItems.length === 0) {
    return {
      ok: false,
      status: 400,
      error: 'Sepetinizde ürün bulunmamaktadır.',
    };
  }

  const verifiedItems: OrderLineItem[] = [];
  let araToplam = 0;

  for (const item of rawItems) {
    if (!item || typeof item.slug !== 'string') {
      return {
        ok: false,
        status: 400,
        error: 'Geçersiz ürün bilgisi gönderildi.',
      };
    }

    const product = getProductBySlug(item.slug, catalog);
    if (!product) {
      return {
        ok: false,
        status: 400,
        error: `"${item.slug}" kodlu ürün katalogda bulunamadı.`,
      };
    }

    if (!product.stok) {
      return {
        ok: false,
        status: 400,
        error: `"${product.ad}" şu anda stokta bulunmamaktadır.`,
      };
    }

    const adet = Number(item.adet ?? item.quantity ?? 0);
    if (!Number.isInteger(adet) || adet < 1 || adet > 10) {
      return {
        ok: false,
        status: 400,
        error: `"${product.ad}" için ürün adedi 1 ile 10 arasında olmalıdır.`,
      };
    }

    const birimFiyat = product.fiyat;
    const satirToplami = Number((birimFiyat * adet).toFixed(2));
    araToplam = Number((araToplam + satirToplami).toFixed(2));

    verifiedItems.push({
      slug: product.slug,
      ad: product.ad,
      kategoriAdi: product.kategoriAdi,
      adet,
      birimFiyat,
      satirToplami,
    });
  }

  let kuponKodu: string | null = null;
  let indirimOrani = 0;
  const couponList = coupons || VALID_COUPONS;

  if (body.kuponKodu && typeof body.kuponKodu === 'string' && body.kuponKodu.trim() !== '') {
    const normalizedCoupon = body.kuponKodu.trim().toUpperCase();
    const discountPct = couponList[normalizedCoupon];
    if (!discountPct) {
      return {
        ok: false,
        status: 400,
        error: 'Geçersiz veya süresi dolmuş kupon kodu.',
      };
    }
    kuponKodu = normalizedCoupon;
    indirimOrani = discountPct;
  }

  const indirimTutari =
    indirimOrani > 0 ? Number(((araToplam * indirimOrani) / 100).toFixed(2)) : 0;
  const toplamTutar = Number(Math.max(0, araToplam - indirimTutari).toFixed(2));

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const siparisNo = `SP-${randomDigits}`;

  const faturaTipi = body.faturaTipi === 'kurumsal' ? 'kurumsal' : 'bireysel';

  const order: OrderResult = {
    siparisNo,
    tarih: new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    musteri: {
      ad: rawName,
      telefon: rawPhone,
      eposta: rawEmail,
      faturaTipi,
      firmaAdi: faturaTipi === 'kurumsal' ? (body.firmaAdi ?? '').trim() : undefined,
      vergiDairesi: faturaTipi === 'kurumsal' ? (body.vergiDairesi ?? '').trim() : undefined,
    },
    odemeYontemi,
    urunler: verifiedItems,
    araToplam,
    kuponKodu,
    indirimOrani,
    indirimTutari,
    toplamTutar,
    durum: odemeYontemi === 'havale-eft' ? 'Ödeme Bildirimi Bekleniyor' : 'Teslimat Hazırlanıyor',
    teslimEdilenBilgiler: 'Siparişiniz işleniyor. Dijital lisans anahtarınız e-postanıza gönderilecektir.',
  };

  let redirectUrl: string | null = null;
  const configuredUrl = (envCheckoutUrl ?? '').trim();
  if (odemeYontemi === 'kredi-karti' && configuredUrl.length > 0) {
    const separator = configuredUrl.includes('?') ? '&' : '?';
    redirectUrl = `${configuredUrl}${separator}order=${encodeURIComponent(siparisNo)}&amount=${encodeURIComponent(toplamTutar.toFixed(2))}`;
  }

  return {
    ok: true,
    status: 200,
    order,
    redirectUrl,
  };
}
