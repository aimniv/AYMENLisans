import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Check,
  User,
  Phone,
  Mail,
  Building2,
  CreditCard,
  Landmark,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { VerifyEmailNotice } from '../components/VerifyEmailNotice';
import { ProductVisual } from '../components/ProductVisual';
import { formatPriceTL } from '../../lib/products';
import { Link, useRouter } from '../context/RouterContext';

export const CheckoutPage: React.FC = () => {
  const {
    items,
    subtotal,
    couponCode,
    discountAmount,
    total,
    clearCart,
    recordOrder,
  } = useCart();
  const { navigate } = useRouter();
  const { user, isAuthLoading } = useAuth();

  const [adSoyad, setAdSoyad] = useState('');
  const [telefon, setTelefon] = useState('');
  const [eposta, setEposta] = useState('');
  const [faturaTipi, setFaturaTipi] = useState<'bireysel' | 'kurumsal'>('bireysel');
  const [firmaAdi, setFirmaAdi] = useState('');
  const [vergiDairesi, setVergiDairesi] = useState('');
  const [odemeYontemi, setOdemeYontemi] = useState<'kredi-karti' | 'havale-eft'>(
    'kredi-karti'
  );
  const [sozlesmeKabul, setSozlesmeKabul] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Ödeme - Ucuz Lisans Satın Al | AYMENLisans';
  }, []);

  // Üyenin kayıtlı bilgileriyle formu önceden doldur
  useEffect(() => {
    if (!user) return;
    setAdSoyad((prev) => prev || user.ad);
    setEposta((prev) => prev || user.eposta);
    setTelefon((prev) => prev || user.telefon);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg('Sepetinizde ürün bulunmamaktadır.');
      return;
    }

    if (adSoyad.trim().length < 3) {
      setErrorMsg('Adınız ve soyadınız en az 3 karakter olmalıdır.');
      return;
    }

    const phoneDigits = telefon.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setErrorMsg('Lütfen en az 10 rakamdan oluşan geçerli bir telefon numarası giriniz.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(eposta.trim())) {
      setErrorMsg('Lütfen teslimat için geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (!sozlesmeKabul) {
      setErrorMsg(
        'Devam etmek için kullanım şartlarını ve mesafeli satış sözleşmesini kabul etmelisiniz.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad: adSoyad.trim(),
          telefon: telefon.trim(),
          eposta: eposta.trim(),
          faturaTipi,
          firmaAdi: faturaTipi === 'kurumsal' ? firmaAdi.trim() : undefined,
          vergiDairesi: faturaTipi === 'kurumsal' ? vergiDairesi.trim() : undefined,
          odemeYontemi,
          kuponKodu: couponCode ?? undefined,
          sozlesmeKabul,
          urunler: items.map((item) => ({
            slug: item.slug,
            adet: item.adet,
          })),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        navigate('/giris?yonlendir=/checkout');
        return;
      }

      if (!response.ok || !data.ok) {
        setErrorMsg(data.error || 'Sipariş işlemi sırasında bir hata oluştu.');
        setIsSubmitting(false);
        return;
      }

      if (data.order) {
        recordOrder(data.order);
      }
      clearCart();

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      navigate(`/siparis-tamamlandi?siparisNo=${encodeURIComponent(data.siparisNo)}`);
    } catch {
      setErrorMsg('Sunucu ile bağlantı kurulamadı. Lütfen tekrar deneyiniz.');
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return <div className="bg-[#f1f2f3] min-h-[65vh]" aria-busy="true" />;
  }

  if (!user) {
    return (
      <div className="bg-[#f1f2f3] min-h-[65vh] py-10">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="bg-white border border-[#ececec] rounded-[10px] p-8 text-center max-w-[440px] mx-auto">
            <h1 className="text-[15px] font-bold text-[#111111] mb-1.5">
              Ödemeye devam etmek için giriş yapın
            </h1>
            <p className="text-[11px] text-[#737373] mb-4">
              Lisans anahtarlarınız hesabınıza teslim edilir. Sepetiniz giriş yaptıktan sonra korunur.
            </p>
            <Link
              href="/giris?yonlendir=/checkout"
              className="inline-flex items-center justify-center bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px]"
            >
              Giriş Yap / Üye Ol
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user.dogrulandi) {
    return (
      <div className="bg-[#f1f2f3] min-h-[65vh] py-10">
        <div className="max-w-[560px] mx-auto px-4">
          <VerifyEmailNotice />
          <p className="text-[10px] text-[#737373] mt-3 text-center">
            Doğruladıktan sonra bu sayfayı yenileyin; sepetiniz korunur.
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#f1f2f3] min-h-[65vh] py-10">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="bg-white border border-[#ececec] rounded-[10px] p-8 text-center max-w-[440px] mx-auto">
            <h1 className="text-[15px] font-bold text-[#111111] mb-1.5">
              Ödeme yapılacak ürün bulunamadı
            </h1>
            <p className="text-[11px] text-[#737373] mb-4">
              Sepetiniz şu anda boş. Ürünleri inceleyerek sepetinize ekleyebilirsiniz.
            </p>
            <Link
              href="/urunler"
              className="inline-flex items-center justify-center bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px]"
            >
              Ürünleri İncele
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f2f3] py-6 min-h-[75vh]">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="max-w-[820px] mx-auto">
          {/* Üst Adım Göstergesi */}
          <div className="relative flex flex-col sm:flex-row items-center justify-center mb-5 gap-3">
            <Link
              href="/sepet"
              className="sm:absolute sm:left-0 inline-flex items-center gap-1 bg-white border border-[#ececec] hover:border-[#d4d4d8] rounded-full px-3 py-1 text-[10px] font-medium text-[#374151] transition-colors"
            >
              <ChevronLeft className="w-3 h-3" aria-hidden="true" />
              <span>‹ Sepete Dön</span>
            </Link>

            <div
              aria-label="Sipariş Adımları"
              className="flex items-center gap-2 text-[10px] font-medium"
            >
              <span className="inline-flex items-center gap-1 text-[#737373]">
                <Check className="w-3 h-3 text-[#737373]" aria-hidden="true" />
                <span>Sepet</span>
              </span>

              <span className="w-8 h-[1.5px] bg-[#55a80b]" aria-hidden="true" />

              <span className="inline-flex items-center gap-1.5 text-[#55a80b] font-bold">
                <span className="w-4 h-4 rounded-full bg-[#55a80b] text-white text-[9px] font-bold flex items-center justify-center">
                  2
                </span>
                <span>Ödeme</span>
              </span>

              <span className="w-8 h-[1.5px] bg-[#d4d4d8]" aria-hidden="true" />

              <span className="inline-flex items-center gap-1.5 text-[#9ca3af]">
                <span className="w-4 h-4 rounded-full bg-[#e5e7eb] text-[#737373] text-[9px] font-bold flex items-center justify-center">
                  3
                </span>
                <span>Tamamlandı</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-4">
            {/* Sol Beyaz Kart: Ödeme Bilgileri */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex-1 w-full bg-white border border-[#ececec] rounded-[10px] p-5"
            >
              <h1 className="text-[14px] font-bold text-[#111111] pb-3 mb-4 border-b border-[#ececec]">
                Ödeme Bilgileri
              </h1>

              {errorMsg && (
                <div
                  role="alert"
                  className="mb-4 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-[10px] font-medium px-3 py-2 rounded-[8px]"
                >
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label
                    htmlFor="checkout-name"
                    className="block text-[9px] font-semibold text-[#374151] mb-1"
                  >
                    Adınız Soyadınız
                  </label>
                  <div className="relative">
                    <User
                      className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      value={adSoyad}
                      onChange={(e) => setAdSoyad(e.target.value)}
                      placeholder="Adınız Soyadınız"
                      className="w-full h-[36px] pl-8 pr-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#55a80b] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="block text-[9px] font-semibold text-[#374151] mb-1"
                  >
                    Telefon Numarası
                  </label>
                  <div className="relative">
                    <Phone
                      className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      value={telefon}
                      onChange={(e) => setTelefon(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full h-[36px] pl-8 pr-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#55a80b] focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="checkout-email"
                  className="block text-[9px] font-semibold text-[#374151] mb-1"
                >
                  E-Posta Adresi
                </label>
                <div className="relative">
                  <Mail
                    className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={eposta}
                    onChange={(e) => setEposta(e.target.value)}
                    placeholder="ornek@eposta.com"
                    className="w-full h-[36px] pl-8 pr-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#55a80b] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="mb-4">
                <span className="block text-[9px] font-semibold text-[#374151] mb-1.5">
                  Fatura Bilgileri
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFaturaTipi('bireysel')}
                    className={`h-[36px] rounded-[8px] px-3 text-[10px] font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      faturaTipi === 'bireysel'
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-[#f6f6f7] text-[#374151] border border-[#ececec] hover:bg-[#ededf0]'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Bireysel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFaturaTipi('kurumsal')}
                    className={`h-[36px] rounded-[8px] px-3 text-[10px] font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      faturaTipi === 'kurumsal'
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-[#f6f6f7] text-[#374151] border border-[#ececec] hover:bg-[#ededf0]'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Kurumsal</span>
                  </button>
                </div>

                {faturaTipi === 'kurumsal' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
                    <div>
                      <input
                        type="text"
                        value={firmaAdi}
                        onChange={(e) => setFirmaAdi(e.target.value)}
                        placeholder="Firma Adı"
                        className="w-full h-[34px] px-2.5 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[10px] text-[#111111] focus:outline-none focus:border-[#55a80b] focus:bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={vergiDairesi}
                        onChange={(e) => setVergiDairesi(e.target.value)}
                        placeholder="Vergi Dairesi"
                        className="w-full h-[34px] px-2.5 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[10px] text-[#111111] focus:outline-none focus:border-[#55a80b] focus:bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Ödeme Yöntemi */}
              <div className="mb-4">
                <span className="block text-[9px] font-semibold text-[#374151] mb-1.5">
                  Ödeme Yöntemi
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOdemeYontemi('kredi-karti')}
                    className={`rounded-[8px] p-2.5 text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      odemeYontemi === 'kredi-karti'
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-[#f6f6f7] text-[#374151] border border-[#ececec] hover:bg-[#ededf0]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-[10px] font-bold leading-tight">
                        Kredi / Banka Kartı
                      </div>
                      <div
                        className={`text-[8px] mt-0.5 ${
                          odemeYontemi === 'kredi-karti' ? 'text-[#a3a3a3]' : 'text-[#737373]'
                        }`}
                      >
                        Güvenli ödeme sayfası
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOdemeYontemi('havale-eft')}
                    className={`rounded-[8px] p-2.5 text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      odemeYontemi === 'havale-eft'
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-[#f6f6f7] text-[#374151] border border-[#ececec] hover:bg-[#ededf0]'
                    }`}
                  >
                    <Landmark className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-[10px] font-bold leading-tight">
                        Havale / EFT
                      </div>
                      <div
                        className={`text-[8px] mt-0.5 ${
                          odemeYontemi === 'havale-eft' ? 'text-[#a3a3a3]' : 'text-[#737373]'
                        }`}
                      >
                        Dekont ile bildirim
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-2.5 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] px-3 py-2 text-[9px] text-[#52525b]">
                  {odemeYontemi === 'kredi-karti' ? (
                    <span>
                      Onay adımında kart bilgileriniz sitemizde talep edilmez; doğrudan lisanslı ödeme altyapımızın 256-bit SSL korumalı güvenli sayfasına yönlendirilirsiniz.
                    </span>
                  ) : (
                    <span>
                      Sipariş sonrasında banka hesap (IBAN) bilgileri ve sipariş kodunuz e-posta adresinize iletilecektir.
                    </span>
                  )}
                </div>
              </div>

              {/* Sözleşme Onayı */}
              <div className="mb-4">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sozlesmeKabul}
                    onChange={(e) => setSozlesmeKabul(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 accent-[#55a80b] rounded shrink-0"
                  />
                  <span className="text-[9px] text-[#52525b] leading-snug">
                    <Link
                      href="/kullanim-sartlari"
                      className="text-[#55a80b] font-semibold hover:underline"
                    >
                      Kullanım şartlarını
                    </Link>
                    ,{' '}
                    <Link
                      href="/iade-kosullari"
                      className="text-[#55a80b] font-semibold hover:underline"
                    >
                      iade politikasını
                    </Link>{' '}
                    ve mesafeli satış sözleşmesini okudum ve kabul ediyorum *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#55a80b] hover:bg-[#468f07] disabled:opacity-60 text-white text-[12px] font-semibold py-[11px] px-[14px] rounded-[8px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {isSubmitting
                    ? 'İşleminiz Yapılıyor...'
                    : `🔒 ${formatPriceTL(total)} Güvenli Öde`}
                </span>
              </button>

              <div className="mt-3 flex items-center justify-center gap-1 text-[9px] text-[#737373]">
                <ShieldCheck className="w-3 h-3 text-[#52525b]" aria-hidden="true" />
                <span>🛡 Ödemeleriniz 256-bit SSL ile şifrelenir.</span>
              </div>
            </form>

            {/* Sağ Sütun: Sipariş Özeti Kartı */}
            <aside
              aria-label="Sipariş Özeti"
              className="w-full md:w-[220px] shrink-0 bg-white border border-[#ececec] rounded-[10px] p-4"
            >
              <h2 className="text-[11px] font-bold text-[#111111] mb-3">
                Sipariş Özeti
              </h2>

              <div className="space-y-2.5 pb-3 border-b border-[#ececec]">
                {items.map(({ slug, adet, product }) => (
                  <div key={slug} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 shrink-0">
                      <ProductVisual
                        product={product}
                        size="xs"
                        showDiscountBadge={false}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-semibold text-[#111111] leading-tight line-clamp-2">
                        {product.ad}
                      </div>
                      <div className="text-[8px] text-[#737373] mt-0.5 tabular-nums">
                        {adet} Adet x {product.fiyat.toFixed(2)}₺
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-2.5 space-y-1.5 text-[9px] border-b border-dashed border-[#e5e7eb]">
                <div className="flex items-center justify-between text-[#52525b]">
                  <span>Ara Toplam</span>
                  <span className="font-semibold text-[#111111] tabular-nums">
                    {formatPriceTL(subtotal)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-[#55a80b] font-bold">
                    <span>İndirim</span>
                    <span className="tabular-nums">-{formatPriceTL(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-baseline justify-between">
                <span className="text-[10px] font-bold text-[#111111]">
                  Toplam Tutar
                </span>
                <span className="text-[15px] font-extrabold text-[#55a80b] tabular-nums">
                  {formatPriceTL(total)}
                </span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};
