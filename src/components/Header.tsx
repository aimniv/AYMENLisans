import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Link, useRouter } from '../context/RouterContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Ana Sayfa', href: '/' },
  { label: 'Yapay Zeka', href: '/yapay-zeka' },
  { label: 'Tasarım Araçları', href: '/tasarim-araclari' },
  { label: 'Genel', href: '/genel' },
  { label: 'Microsoft', href: '/microsoft' },
  { label: 'Windows', href: '/windows' },
  { label: 'İletişim', href: '/iletisim' },
];

export const Header: React.FC = () => {
  const { pathname, searchParams, navigate } = useRouter();
  const { totalItemsCount, isHydrated } = useCart();
  const { settings, isAdminLoggedIn } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (pathname === '/ara') {
      setSearchQuery(searchParams.get('q') ?? '');
    }
  }, [pathname, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/ara?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/urunler');
    }
  };

  return (
    <header className="w-full bg-white">
      {/* İsteğe bağlı üst duyuru bandı */}
      {settings.announcement && (
        <div className="bg-[#111111] text-[#fafafa] text-[10px] py-1 px-4 text-center border-b border-[#222222]">
          <span>{settings.announcement}</span>
        </div>
      )}

      {/* Üst Satır */}
      <div className="border-b border-[#ececec]">
        <div className="max-w-[1100px] mx-auto px-4 h-[60px] flex items-center justify-between gap-4">
          {/* Sol: Logo */}
          <div className="flex items-center gap-3">
            <BrandLogo variant="light" />
            {isAdminLoggedIn && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 bg-[#55a80b]/15 text-[#55a80b] hover:bg-[#55a80b] hover:text-white px-2 py-0.5 rounded text-[9px] font-bold transition-colors"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Admin Paneli</span>
              </Link>
            )}
          </div>

          {/* Orta: Arama Kutusu (en fazla 240px, mobilde gizli) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative w-full max-w-[240px]"
            role="search"
          >
            <label htmlFor="header-search-input" className="sr-only">
              Ürün, kategori veya marka ara
            </label>
            <input
              id="header-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün, kategori veya marka ara..."
              className="w-full h-[34px] bg-[#f6f6f7] border border-[#ececec] rounded-[8px] pl-3 pr-8 text-[11px] text-[#111111] placeholder:text-[#8e8e93] focus:outline-none focus:border-[#55a80b] focus:bg-white transition-colors"
            />
            <button
              type="submit"
              aria-label="Ara"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#55a80b] hover:text-[#468f07] transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Sağ: Sepetim & Hesabım */}
          <div className="flex items-center gap-5">
            <Link
              href="/sepet"
              aria-label={`Sepetim (${isHydrated ? totalItemsCount : 0} ürün)`}
              className="group flex flex-col items-center justify-center text-[#111111] hover:text-[#55a80b] transition-colors"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className="w-[18px] h-[18px] stroke-[1.8]" />
                <span
                  aria-live="polite"
                  className="-top-1.5 -right-2.5 absolute min-w-[15px] h-[15px] px-1 rounded-full bg-[#55a80b] text-white text-[9px] font-bold flex items-center justify-center leading-none tabular-nums"
                >
                  {isHydrated ? totalItemsCount : 0}
                </span>
              </div>
              <span className="text-[10px] font-medium mt-1 leading-none text-[#52525b] group-hover:text-[#55a80b]">
                Sepetim
              </span>
            </Link>

            <Link
              href="/hesabim"
              aria-label="Hesabım"
              className="group flex flex-col items-center justify-center text-[#111111] hover:text-[#55a80b] transition-colors"
            >
              <User className="w-[18px] h-[18px] stroke-[1.8]" />
              <span className="text-[10px] font-medium mt-1 leading-none text-[#52525b] group-hover:text-[#55a80b]">
                Hesabım
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Alt Satır: Menü Satırı (11px, aralarında ~36px boşluk) */}
      <div className="border-b border-[#ececec]">
        <div className="max-w-[1100px] mx-auto px-4">
          <nav
            aria-label="Ana Menü"
            className="flex items-center gap-4 sm:gap-6 md:gap-[36px] h-[38px] overflow-x-auto no-scrollbar"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[11px] whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#55a80b] font-bold'
                      : 'text-[#27272a] font-medium hover:text-[#55a80b]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
