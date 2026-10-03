import React, { useEffect } from 'react';
import { XCircle, AlertTriangle } from 'lucide-react';
import { useRouter, Link } from '../context/RouterContext';
import { useStore } from '../context/StoreContext';

/** Kart ödemesi tamamlanamadığında (veya sonucu doğrulanamadığında) gösterilir. */
export const PaymentFailedPage: React.FC = () => {
  const { searchParams } = useRouter();
  const { settings } = useStore();
  const siparisNo = searchParams.get('siparisNo');
  const belirsiz = searchParams.get('belirsiz') === '1';

  useEffect(() => {
    document.title = 'Ödeme Tamamlanamadı | AYMENLisans';
  }, []);

  const Icon = belirsiz ? AlertTriangle : XCircle;

  return (
    <div className="bg-[#fafafa] py-8 min-h-[70vh]">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="max-w-[480px] mx-auto bg-white border border-[#ececec] rounded-[10px] p-6 md:p-8 text-center">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
              belirsiz ? 'bg-[#f59e0b]/15 text-[#d97706]' : 'bg-[#dc2626]/10 text-[#dc2626]'
            }`}
          >
            <Icon className="w-8 h-8 stroke-[2.2]" aria-hidden="true" />
          </div>

          <h1 className="text-[18px] font-extrabold text-[#111111] mb-1">
            {belirsiz ? 'Ödeme sonucu doğrulanamadı' : 'Ödeme tamamlanamadı'}
          </h1>
          {siparisNo && (
            <p className="text-[11px] text-[#737373] mb-3">
              Sipariş numaranız: <strong className="text-[#111111]">{siparisNo}</strong>
            </p>
          )}
          <p className="text-[11px] text-[#52525b] mb-5 leading-relaxed">
            {belirsiz ? (
              <>
                Ödeme sonucunu şu anda doğrulayamadık. Kartınızdan tutar çekildiyse endişelenmeyin; sipariş
                numaranızla <a className="text-[#55a80b] font-semibold underline" href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a>{' '}
                adresine yazın, siparişinizi hemen kontrol edelim.
              </>
            ) : (
              <>Kartınızdan çekim yapılmadı. Sepetiniz korunuyor; farklı bir kartla veya Havale/EFT ile tekrar deneyebilirsiniz.</>
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/checkout"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px] transition-colors"
            >
              Tekrar Dene
            </Link>
            <Link
              href="/hesabim"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#f6f6f7] hover:bg-[#e5e7eb] text-[#111111] border border-[#ececec] text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px] transition-colors"
            >
              Siparişlerim
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
