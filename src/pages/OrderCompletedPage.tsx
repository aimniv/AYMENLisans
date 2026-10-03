import React, { useEffect } from 'react';
import { CheckCircle2, ArrowRight, PackageCheck, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../context/RouterContext';
import { formatPriceTL } from '../../lib/products';

export const OrderCompletedPage: React.FC = () => {
  const { lastOrder: storedOrder, clearCart } = useCart();
  const { myOrders } = useAuth();
  const { searchParams } = useRouter();
  const siparisNoParam = searchParams.get('siparisNo');
  // Kart ödemesinde sipariş durumu ödeme sonrası değişir; güncel kaydı sunucudan al.
  const lastOrder =
    myOrders.find((o) => o.siparisNo === siparisNoParam) ??
    (storedOrder && (!siparisNoParam || storedOrder.siparisNo === siparisNoParam) ? storedOrder : null);
  const isConfirmed =
    lastOrder !== null && lastOrder.durum !== 'Ödeme Bekleniyor' && lastOrder.durum !== 'İptal Edildi';

  useEffect(() => {
    document.title = 'Siparişiniz Alındı | AYMENLisans';
  }, []);

  // Kartla ödeme başarıyla döndüyse sepeti şimdi temizle
  useEffect(() => {
    if (isConfirmed && lastOrder?.odemeYontemi === 'kredi-karti') clearCart();
  }, [isConfirmed, lastOrder?.odemeYontemi, clearCart]);

  const orderNo = lastOrder?.siparisNo || siparisNoParam || 'SP-1042';

  return (
    <div className="bg-[#fafafa] py-8 min-h-[70vh]">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="max-w-[580px] mx-auto bg-white border border-[#ececec] rounded-[10px] p-6 md:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#55a80b]/15 text-[#55a80b] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" aria-hidden="true" />
          </div>

          <h1 className="text-[20px] font-extrabold text-[#111111] mb-1">
            Siparişiniz alındı
          </h1>
          <p className="text-[11px] text-[#737373] mb-5">
            Sipariş numaranız:{' '}
            <strong className="text-[#111111] font-bold">{orderNo}</strong>
          </p>

          {lastOrder && (
            <div className="text-left bg-[#fafafa] border border-[#ececec] rounded-[8px] p-4 mb-5 space-y-3">
              <div className="flex items-center justify-between text-[10px] border-b border-[#ececec] pb-2">
                <span className="text-[#737373]">Alıcı / Teslimat E-Posta:</span>
                <span className="font-semibold text-[#111111]">
                  {lastOrder.musteri.ad} ({lastOrder.musteri.eposta})
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] border-b border-[#ececec] pb-2">
                <span className="text-[#737373]">Ödeme Yöntemi:</span>
                <span className="font-semibold text-[#111111]">
                  {lastOrder.odemeYontemi === 'kredi-karti'
                    ? 'Kredi / Banka Kartı (Güvenli Ödeme)'
                    : 'Havale / EFT'}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold text-[#111111]">
                  Sipariş Edilen Ürünler
                </div>
                {lastOrder.urunler.map((item) => (
                  <div
                    key={item.slug}
                    className="flex items-center justify-between text-[10px] text-[#374151]"
                  >
                    <span className="truncate pr-2">
                      {item.adet}x {item.ad}
                    </span>
                    <span className="font-bold text-[#111111] shrink-0 tabular-nums">
                      {formatPriceTL(item.satirToplami)}
                    </span>
                  </div>
                ))}
              </div>

              {lastOrder.indirimTutari > 0 && (
                <div className="flex items-center justify-between text-[10px] text-[#55a80b] font-bold border-t border-[#ececec] pt-2">
                  <span>Kupon İndirimi ({lastOrder.kuponKodu})</span>
                  <span className="tabular-nums">
                    -{formatPriceTL(lastOrder.indirimTutari)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[12px] font-extrabold text-[#111111] border-t border-[#ececec] pt-2.5">
                <span>Toplam Tutar</span>
                <span className="text-[#55a80b] tabular-nums">
                  {formatPriceTL(lastOrder.toplamTutar)}
                </span>
              </div>
            </div>
          )}

          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[8px] p-3.5 text-left flex items-start gap-2.5 mb-6">
            <Mail className="w-4 h-4 text-[#55a80b] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-[10px] text-[#166534] leading-relaxed">
              {lastOrder?.odemeYontemi === 'havale-eft' ? (
                <span>
                  Havale / EFT için banka hesap (IBAN) bilgileri ve ödeme bildirim adımları e-posta adresinize gönderilmiştir. Ödeme onayının ardından dijital lisans anahtarınız anında iletilecektir.
                </span>
              ) : (
                <span>
                  Dijital lisans anahtarınız ve adım adım aktivasyon rehberiniz belirttiğiniz e-posta adresine gönderilmek üzere hazırlanmaktadır. Ayrıca <strong>Hesabım</strong> sayfasından sipariş durumunuzu takip edebilirsiniz.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/hesabim"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px] transition-colors"
            >
              <PackageCheck className="w-4 h-4" aria-hidden="true" />
              <span>Siparişlerimi Görüntüle</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#f6f6f7] hover:bg-[#e5e7eb] text-[#111111] border border-[#ececec] text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px] transition-colors"
            >
              <span>Ana Sayfaya Dön</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
