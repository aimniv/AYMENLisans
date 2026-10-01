import React, { useEffect } from 'react';
import { Link } from '../context/RouterContext';

interface CorporatePageProps {
  pageType: 'gizlilik' | 'kullanim' | 'iade' | 'sss';
}

export const CorporatePage: React.FC<CorporatePageProps> = ({ pageType }) => {
  useEffect(() => {
    const titles: Record<CorporatePageProps['pageType'], string> = {
      gizlilik: 'Gizlilik Politikası | AYMENLisans',
      kullanim: 'Kullanım Şartları | AYMENLisans',
      iade: 'İade Koşulları | AYMENLisans',
      sss: 'Sıkça Sorulan Sorular | AYMENLisans',
    };
    document.title = titles[pageType];
  }, [pageType]);

  return (
    <div className="bg-[#fafafa] py-6 min-h-[65vh]">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="max-w-[780px] mx-auto bg-white border border-[#ececec] rounded-[10px] p-6 space-y-4">
          {pageType === 'gizlilik' && (
            <>
              <h1 className="text-[18px] font-bold text-[#111111]">
                Gizlilik Politikası
              </h1>
              <p className="text-[12px] text-[#4b5563] leading-relaxed">
                AYMENLisans olarak müşterilerimizin kişisel verilerinin güvenliğine en üst düzeyde önem veriyoruz. Sipariş sırasında paylaştığınız ad, soyad, telefon ve e-posta bilgileri yalnızca dijital lisans teslimatı ve faturalandırma işlemleri için kullanılır.
              </p>
              <h2 className="text-[13px] font-bold text-[#111111] pt-2">
                Ödeme ve Kart Güvenliği
              </h2>
              <p className="text-[12px] text-[#4b5563] leading-relaxed">
                Sitemizde kredi veya banka kartı numarası, son kullanma tarihi ya da CVV kodu hiçbir şekilde talep edilmez ve sunucularımızda saklanmaz. Tüm kartlı ödemeler doğrudan lisanslı ödeme kuruluşunun 256-bit SSL şifreli güvenli ödeme sayfası üzerinden gerçekleştirilir.
              </p>
            </>
          )}

          {pageType === 'kullanim' && (
            <>
              <h1 className="text-[18px] font-bold text-[#111111]">
                Kullanım Şartları ve Mesafeli Satış Sözleşmesi
              </h1>
              <p className="text-[12px] text-[#4b5563] leading-relaxed">
                AYMENLisans üzerinden satın alınan tüm ürünler dijital lisans anahtarı veya abonelik tanımlaması niteliğindedir. Fiziksel kargo gönderimi yapılmaz; teslimatlar sipariş sırasında belirtilen e-posta adresine elektronik ortamda gerçekleştirilir.
              </p>
              <h2 className="text-[13px] font-bold text-[#111111] pt-2">
                Aktivasyon ve Kullanım Sorumluluğu
              </h2>
              <p className="text-[12px] text-[#4b5563] leading-relaxed">
                Teslim edilen dijital lisans anahtarları ürün açıklamasında belirtilen süre ve cihaz sayısı için geçerlidir. Teslimatla birlikte adım adım aktivasyon rehberi sağlanmaktadır.
              </p>
            </>
          )}

          {pageType === 'iade' && (
            <>
              <h1 className="text-[18px] font-bold text-[#111111]">
                İade ve Değişim Koşulları
              </h1>
              <p className="text-[12px] text-[#4b5563] leading-relaxed">
                Elektronik ortamda anında ifa edilen dijital lisans anahtarlarında, ürün kodunun çalışmaması veya teknik bir hata yaşanması durumunda teknik destek ekibimiz tarafından ücretsiz yeni anahtar değişimi veya tam ücret iadesi garantisi sunulmaktadır.
              </p>
              <p className="text-[12px] text-[#4b5563] leading-relaxed">
                Destek talepleriniz için{' '}
                <Link href="/iletisim" className="text-[#55a80b] font-semibold hover:underline">
                  İletişim
                </Link>{' '}
                sayfamızdan bize 7/24 ulaşabilirsiniz.
              </p>
            </>
          )}

          {pageType === 'sss' && (
            <>
              <h1 className="text-[18px] font-bold text-[#111111]">
                Sıkça Sorulan Sorular (S.S.S.)
              </h1>
              <div className="space-y-3 pt-2">
                <div className="border border-[#ececec] rounded-[8px] p-3.5">
                  <h2 className="text-[12px] font-bold text-[#111111] mb-1">
                    Satın aldığım lisans ne zaman teslim edilir?
                  </h2>
                  <p className="text-[11px] text-[#4b5563]">
                    Ödeme onayının hemen ardından dijital lisans anahtarınız ve kurulum rehberiniz otomatik olarak e-posta adresinize gönderilir.
                  </p>
                </div>

                <div className="border border-[#ececec] rounded-[8px] p-3.5">
                  <h2 className="text-[12px] font-bold text-[#111111] mb-1">
                    Kart bilgilerim güvende mi?
                  </h2>
                  <p className="text-[11px] text-[#4b5563]">
                    Sitemiz üzerinde kart bilgisi toplanmaz veya saklanmaz. Ödemeler 256-bit SSL korumalı ödeme sağlayıcısı sayfası veya Havale/EFT ile güvenle tamamlanır.
                  </p>
                </div>

                <div className="border border-[#ececec] rounded-[8px] p-3.5">
                  <h2 className="text-[12px] font-bold text-[#111111] mb-1">
                    İndirim kuponunu nasıl kullanabilirim?
                  </h2>
                  <p className="text-[11px] text-[#4b5563]">
                    Sepetim sayfasındaki kupon alanına <strong>HOSGELDIN</strong> kodunu yazarak %10 hoş geldin indiriminden yararlanabilirsiniz.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
