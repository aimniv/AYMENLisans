import React from 'react';
import { BrandLogo } from './BrandLogo';
import { Link } from '../context/RouterContext';

const FOOTER_PRODUCTS = [
  { label: 'Google AI Pro 18 Ay', href: '/urun/google-ai-pro-18-ay' },
  { label: 'Adobe Creative Cloud PRO', href: '/urun/adobe-creative-cloud-pro' },
  { label: 'ChatGPT Plus', href: '/urun/chatgpt-plus' },
  { label: 'Microsoft Office 365', href: '/urun/microsoft-office-365' },
  { label: 'Windows 11 Pro', href: '/urun/windows-11-pro' },
];

const FOOTER_CATEGORIES = [
  { label: 'Yapay Zeka', href: '/yapay-zeka' },
  { label: 'Tasarım Araçları', href: '/tasarim-araclari' },
  { label: 'Genel', href: '/genel' },
  { label: 'Microsoft', href: '/microsoft' },
  { label: 'Windows', href: '/windows' },
];

const FOOTER_CORPORATE = [
  { label: 'Gizlilik Politikası', href: '/gizlilik-politikasi' },
  { label: 'Kullanım Şartları', href: '/kullanim-sartlari' },
  { label: 'İade Koşulları', href: '/iade-kosullari' },
  { label: 'S.S.S.', href: '/sss' },
  { label: 'İletişim', href: '/iletisim' },
  { label: 'Yönetici Girişi (Admin)', href: '/admin' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#111111] border-t-2 border-[#55a80b] text-white overflow-hidden mt-12">
      {/* Köşelerde çok hafif yeşil radyal parıltı */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#55a80b]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#55a80b]/10 blur-3xl"
      />

      <div className="relative max-w-[1100px] mx-auto px-4 pt-10 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 pb-8">
          {/* Sütun 1 (Geniş) */}
          <div className="md:col-span-4 space-y-3">
            <BrandLogo variant="dark" />
            <p className="text-[10px] leading-relaxed text-[#a3a3a3] max-w-[280px]">
              En uygun fiyatlı Windows, Görsel tasarım, Yapay zeka lisansları burada! Güvenli ödeme ve anında teslimat ile dijital ürünlere hemen sahip olun.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/iletisim"
                aria-label="LinkedIn Sayfamız"
                className="w-7 h-7 rounded-[6px] bg-[#1f1f1f] hover:bg-[#55a80b] text-white flex items-center justify-center transition-colors text-[11px] font-bold"
              >
                in
              </Link>
              <Link
                href="/iletisim"
                aria-label="YouTube Kanalımız"
                className="w-7 h-7 rounded-[6px] bg-[#1f1f1f] hover:bg-[#55a80b] text-white flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Sütun 2: Ürünler */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-[11px] font-bold text-white tracking-wide">
              Ürünler
            </h3>
            <ul className="space-y-1.5">
              {FOOTER_PRODUCTS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 text-[10px] text-[#a3a3a3] hover:text-white transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className="w-1 h-1 rounded-full bg-[#55a80b] shrink-0"
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sütun 3: Kategoriler */}
          <div className="md:col-span-2 space-y-2.5">
            <h3 className="text-[11px] font-bold text-white tracking-wide">
              Kategoriler
            </h3>
            <ul className="space-y-1.5">
              {FOOTER_CATEGORIES.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 text-[10px] text-[#a3a3a3] hover:text-white transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className="w-1 h-1 rounded-full bg-[#55a80b] shrink-0"
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sütun 4: Kurumsal */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-[11px] font-bold text-white tracking-wide">
              Kurumsal
            </h3>
            <ul className="space-y-1.5">
              {FOOTER_CORPORATE.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 text-[10px] text-[#a3a3a3] hover:text-white transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className="w-1 h-1 rounded-full bg-[#55a80b] shrink-0"
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Alt Çizgi ve Telif */}
        <div className="border-t border-white/10 pt-5 text-center">
          <p className="text-[10px] text-[#737373]">
            © 2026 AYMENLisans. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};
