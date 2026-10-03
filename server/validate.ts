import { CATEGORY_MAP, CategorySlug, Product } from '../lib/products';

const HEX_COLOR = /^#[0-9a-f]{3,8}$/i;

const str = (v: unknown, max: number): string | undefined =>
  typeof v === 'string' ? v.trim().slice(0, max) : undefined;

const num = (v: unknown): number | undefined => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export const slugify = (text: string) =>
  text
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Yönetici girdisini doğrulayıp tam bir Product nesnesine çevirir.
 * `base` verilirse (güncelleme) eksik alanlar oradan alınır; yalnızca bilinen alanlar kabul edilir.
 */
export function buildProduct(
  input: Record<string, unknown>,
  base?: Product
): { ok: true; product: Product } | { ok: false; error: string } {
  const ad = str(input.ad, 200) ?? base?.ad;
  if (!ad) return { ok: false, error: 'Ürün adı zorunludur.' };

  const kategori = (input.kategori ?? base?.kategori) as CategorySlug | undefined;
  if (!kategori || !(kategori in CATEGORY_MAP)) {
    return { ok: false, error: 'Geçerli bir ürün kategorisi seçiniz.' };
  }

  const fiyat = input.fiyat !== undefined ? num(input.fiyat) : base?.fiyat;
  if (fiyat === undefined || fiyat <= 0 || fiyat > 1_000_000) {
    return { ok: false, error: 'Geçerli bir fiyat giriniz.' };
  }

  const eskiFiyat = 'eskiFiyat' in input ? num(input.eskiFiyat) : base?.eskiFiyat;
  const indirimOrani = 'indirimOrani' in input ? num(input.indirimOrani) : base?.indirimOrani;

  const renkler = input.gorselRenkleri ?? base?.gorselRenkleri ?? ['#0284c7', '#0c4a6e'];
  if (
    !Array.isArray(renkler) ||
    renkler.length !== 2 ||
    !renkler.every((c) => typeof c === 'string' && HEX_COLOR.test(c))
  ) {
    return { ok: false, error: 'Görsel renkleri geçerli iki hex renk olmalıdır.' };
  }
  const gorselRenkleri: [string, string] = [renkler[0], renkler[1]];

  const ozellikRaw = input.ozellikListesi ?? base?.ozellikListesi ?? [
    'Ödeme sonrası anında teslimat',
    'Adım adım aktivasyon rehberi',
    'Satış sonrası destek',
  ];
  const ozellikListesi = Array.isArray(ozellikRaw)
    ? ozellikRaw.map((x) => str(x, 300)).filter((x): x is string => Boolean(x))
    : [];

  const kategoriAdi = CATEGORY_MAP[kategori];
  const aciklama = str(input.aciklama, 2000) || base?.aciklama || ad;
  const yorumSayisi = Math.max(0, Math.floor(num(input.yorumSayisi) ?? base?.yorumSayisi ?? 0));
  const puan = Math.min(5, Math.max(0, num(input.puan) ?? base?.puan ?? 5));

  const slug = base?.slug ?? (str(input.slug, 120) ? slugify(String(input.slug)) : slugify(ad));
  if (!slug) return { ok: false, error: 'Ürün adından geçerli bir adres (slug) üretilemedi.' };

  const product: Product = {
    slug,
    aliases: base?.aliases,
    ad,
    kategori,
    kategoriAdi,
    fiyat: Number(fiyat.toFixed(2)),
    eskiFiyat: eskiFiyat !== undefined ? Number(eskiFiyat.toFixed(2)) : undefined,
    indirimOrani,
    puan,
    yorumSayisi,
    yorumSayısı: yorumSayisi,
    stok: typeof input.stok === 'boolean' ? input.stok : (base?.stok ?? true),
    gorselRenkleri,
    görselRenkleri: gorselRenkleri,
    kartUstEtiket: str(input.kartUstEtiket, 60) || base?.kartUstEtiket || kategoriAdi,
    kartBaslik: str(input.kartBaslik, 120) || base?.kartBaslik || ad.split('|')[0].trim(),
    kartAltYazi: str(input.kartAltYazi, 80) || base?.kartAltYazi || 'Dijital Anahtar',
    kartSureEtiketi: str(input.kartSureEtiketi, 40) || base?.kartSureEtiketi || 'Sınırsız',
    aciklama,
    açıklama: aciklama,
    ozellikListesi,
    özellikListesi: ozellikListesi,
    oneCikan: typeof input.oneCikan === 'boolean' ? input.oneCikan : base?.oneCikan,
  };
  return { ok: true, product };
}
