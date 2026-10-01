import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { CATEGORIES, CategorySlug, Product } from '../../lib/products';
import { ProductCard } from '../components/ProductCard';
import { Link, useRouter } from '../context/RouterContext';
import { useStore } from '../context/StoreContext';

interface CategoryPageProps {
  categorySlug?: CategorySlug | 'urunler' | 'ara';
}

type SortOption = 'onerilen' | 'fiyat-artan' | 'fiyat-azalan' | 'puan';

const SIDEBAR_LINKS: { label: string; slug: string; href: string }[] = [
  { label: 'Tüm Ürünler', slug: 'urunler', href: '/urunler' },
  { label: 'Yapay Zeka', slug: 'yapay-zeka', href: '/yapay-zeka' },
  { label: 'Tasarım Araçları', slug: 'tasarim-araclari', href: '/tasarim-araclari' },
  { label: 'Genel', slug: 'genel', href: '/genel' },
  { label: 'Microsoft', slug: 'microsoft', href: '/microsoft' },
  { label: 'Windows', slug: 'windows', href: '/windows' },
];

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug = 'urunler',
}) => {
  const { products } = useStore();
  const { searchParams, navigate } = useRouter();
  const queryParam = (searchParams.get('q') ?? '').trim();

  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [appliedMin, setAppliedMin] = useState<number | null>(null);
  const [appliedMax, setAppliedMax] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('onerilen');

  useEffect(() => {
    if (categorySlug === 'ara') {
      document.title = queryParam
        ? `"${queryParam}" Arama Sonuçları - Ucuz Lisans Satın Al | AYMENLisans`
        : 'Ürün Arama - Ucuz Lisans Satın Al | AYMENLisans';
      return;
    }
    const foundCat = CATEGORIES.find((c) => c.slug === categorySlug);
    if (foundCat) {
      document.title = foundCat.sayfaBasligi;
    } else {
      document.title = 'Tüm Ürünler - Ucuz Lisans Satın Al | AYMENLisans';
    }
  }, [categorySlug, queryParam]);

  const handlePriceFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = minPriceInput.trim() !== '' ? Number(minPriceInput) : null;
    const maxVal = maxPriceInput.trim() !== '' ? Number(maxPriceInput) : null;
    setAppliedMin(minVal !== null && !Number.isNaN(minVal) ? minVal : null);
    setAppliedMax(maxVal !== null && !Number.isNaN(maxVal) ? maxVal : null);
  };

  const handleMinChange = (val: string) => {
    setMinPriceInput(val);
    const num = val.trim() !== '' ? Number(val) : null;
    setAppliedMin(num !== null && !Number.isNaN(num) ? num : null);
  };

  const handleMaxChange = (val: string) => {
    setMaxPriceInput(val);
    const num = val.trim() !== '' ? Number(val) : null;
    setAppliedMax(num !== null && !Number.isNaN(num) ? num : null);
  };

  const handleClearFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setAppliedMin(null);
    setAppliedMax(null);
    setSortBy('onerilen');
    if (categorySlug === 'ara' && queryParam) {
      navigate('/urunler');
    }
  };

  const filteredAndSortedProducts: Product[] = useMemo(() => {
    let list = products;

    if (categorySlug && categorySlug !== 'urunler' && categorySlug !== 'ara') {
      list = list.filter((p) => p.kategori === categorySlug);
    }

    if (categorySlug === 'ara' && queryParam) {
      const q = queryParam.toLocaleLowerCase('tr-TR');
      list = list.filter(
        (p) =>
          p.ad.toLocaleLowerCase('tr-TR').includes(q) ||
          p.kategoriAdi.toLocaleLowerCase('tr-TR').includes(q) ||
          p.aciklama.toLocaleLowerCase('tr-TR').includes(q)
      );
    }

    if (appliedMin !== null) {
      list = list.filter((p) => p.fiyat >= appliedMin);
    }
    if (appliedMax !== null) {
      list = list.filter((p) => p.fiyat <= appliedMax);
    }

    const sorted = [...list];
    if (sortBy === 'fiyat-artan') {
      sorted.sort((a, b) => a.fiyat - b.fiyat);
    } else if (sortBy === 'fiyat-azalan') {
      sorted.sort((a, b) => b.fiyat - a.fiyat);
    } else if (sortBy === 'puan') {
      sorted.sort((a, b) => {
        if (b.puan !== a.puan) return b.puan - a.puan;
        return b.yorumSayisi - a.yorumSayisi;
      });
    }

    return sorted;
  }, [products, categorySlug, queryParam, appliedMin, appliedMax, sortBy]);

  return (
    <div className="bg-[#fafafa] py-5">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-4">
          {/* Sol Kenar Çubuğu (170px, beyaz kart, 16px padding) */}
          <aside
            aria-label="Kategori ve Fiyat Filtreleri"
            className="w-full md:w-[170px] shrink-0 bg-white border border-[#ececec] rounded-[10px] p-[16px]"
          >
            <h2 className="text-[10px] font-bold text-[#111111] mb-2.5">
              İlgili Kategoriler
            </h2>

            <ul className="space-y-2">
              {SIDEBAR_LINKS.map((item) => {
                const isActive =
                  categorySlug === item.slug ||
                  (categorySlug === 'ara' && item.slug === 'urunler');
                return (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-1 text-[10px] transition-colors ${
                        isActive
                          ? 'text-[#55a80b] font-bold'
                          : 'text-[#52525b] hover:text-[#111111]'
                      }`}
                    >
                      <ChevronRight
                        className={`w-2.5 h-2.5 shrink-0 ${
                          isActive ? 'text-[#55a80b]' : 'text-[#a1a1aa]'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <hr className="border-[#ececec] my-3.5" />

            {/* Fiyat Aralığı */}
            <form onSubmit={handlePriceFilterSubmit}>
              <h3 className="text-[10px] font-bold text-[#111111] mb-2">
                Fiyat Aralığı
              </h3>
              <div className="flex items-center gap-1 mb-2">
                <input
                  id="price-min"
                  type="number"
                  min="0"
                  placeholder="En Az"
                  value={minPriceInput}
                  onChange={(e) => handleMinChange(e.target.value)}
                  className="w-full min-w-0 h-[26px] px-1.5 bg-[#f6f6f7] border border-[#ececec] rounded-[6px] text-[9px] text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#55a80b] focus:bg-white"
                />
                <span className="text-[10px] text-[#a1a1aa] select-none">-</span>
                <input
                  id="price-max"
                  type="number"
                  min="0"
                  placeholder="En Çok"
                  value={maxPriceInput}
                  onChange={(e) => handleMaxChange(e.target.value)}
                  className="w-full min-w-0 h-[26px] px-1.5 bg-[#f6f6f7] border border-[#ececec] rounded-[6px] text-[9px] text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#55a80b] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full h-[26px] bg-[#f1f2f3] hover:bg-[#e4e4e7] text-[#111111] text-[10px] font-semibold rounded-[6px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Search className="w-2.5 h-2.5" aria-hidden="true" />
                <span>Ara</span>
              </button>
            </form>

            <hr className="border-[#ececec] my-3.5" />

            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full text-center text-[9px] text-[#737373] hover:text-[#111111] transition-colors cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          </aside>

          {/* Sağ İçerik Sütunu */}
          <div className="flex-1 min-w-0 w-full">
            {/* Üst Beyaz Şerit */}
            <div className="bg-white border border-[#ececec] rounded-[10px] px-3.5 py-2 mb-3 flex items-center justify-between gap-2">
              <div className="text-[10px] text-[#52525b]">
                <strong className="font-bold text-[#111111] tabular-nums">
                  {filteredAndSortedProducts.length}
                </strong>{' '}
                ürün listeleniyor
                {categorySlug === 'ara' && queryParam && (
                  <span className="ml-1 text-[#737373]">
                    (&ldquo;{queryParam}&rdquo;)
                  </span>
                )}
              </div>

              <div className="flex items-center">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-[28px] bg-white border border-[#ececec] rounded-[6px] px-2.5 text-[10px] font-medium text-[#111111] focus:outline-none focus:border-[#55a80b] cursor-pointer"
                >
                  <option value="onerilen">Önerilen Sıralama</option>
                  <option value="fiyat-artan">Fiyat: Artan</option>
                  <option value="fiyat-azalan">Fiyat: Azalan</option>
                  <option value="puan">Puana Göre</option>
                </select>
              </div>
            </div>

            {/* 3 Sütunlu Ürün Kartı Izgarası */}
            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px]">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#ececec] rounded-[10px] p-8 text-center">
                <p className="text-[12px] font-semibold text-[#111111] mb-1">
                  Aradığınız kriterlere uygun ürün bulunamadı.
                </p>
                <p className="text-[10px] text-[#737373] mb-4">
                  Fiyat aralığını değiştirebilir veya tüm ürünleri inceleyebilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="bg-[#55a80b] hover:bg-[#468f07] text-white text-[11px] font-semibold px-3.5 py-2 rounded-[8px] transition-colors cursor-pointer"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
