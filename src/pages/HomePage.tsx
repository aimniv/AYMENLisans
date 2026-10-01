import React, { useEffect } from 'react';
import { ArrowRight, Zap, ShieldCheck, Headphones } from 'lucide-react';
import { CATEGORIES } from '../../lib/products';
import { ProductCard } from '../components/ProductCard';
import { Link } from '../context/RouterContext';
import { useStore } from '../context/StoreContext';

export const HomePage: React.FC = () => {
  const { products } = useStore();

  const featuredProducts = products.filter((p) => p.stok && p.oneCikan).slice(0, 8);
  const displayProducts =
    featuredProducts.length >= 4
      ? featuredProducts
      : products.filter((p) => p.stok).slice(0, 8);

  useEffect(() => {
    document.title = 'Ucuz Lisans Satın Al | AYMENLisans';
  }, []);

  return (
    <div className="bg-[#fafafa]">
      {/* Koyu (#111) Hero Alanı */}
      <section className="relative bg-[#111111] text-white overflow-hidden border-b border-[#ececec]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[240px] rounded-full bg-[#55a80b]/15 blur-3xl"
        />
        <div className="relative max-w-[1100px] mx-auto px-4 py-12 md:py-16 text-center">
          <h1 className="text-[26px] md:text-[32px] font-extrabold tracking-tight text-white mb-2.5">
            Ucuz Lisans Satın Al
          </h1>
          <p className="text-[12px] md:text-[13px] text-[#a3a3a3] max-w-[560px] mx-auto leading-relaxed mb-6">
            En uygun fiyatlı Windows, Microsoft Office, görsel tasarım ve yapay zeka lisansları burada! Güvenli ödeme ve anında teslimat ile dijital ürünlere hemen sahip olun.
          </p>
          <Link
            href="/urunler"
            className="inline-flex items-center justify-center gap-1.5 bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px] transition-colors whitespace-nowrap"
          >
            <span>Ürünleri İncele</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-7">
        {/* 3 Küçük Güven Kartı */}
        <section aria-label="Mağaza Güvenceleri" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-[#ececec] rounded-[10px] p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#55a80b]/10 text-[#55a80b] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-[#111111]">Anında Teslimat</h2>
              <p className="text-[10px] text-[#737373]">
                Ödeme sonrası dijital kodunuz dakikalar içinde e-postanızda.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#ececec] rounded-[10px] p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#55a80b]/10 text-[#55a80b] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-[#111111]">Güvenli Ödeme</h2>
              <p className="text-[10px] text-[#737373]">
                256-bit SSL şifreleme ile korunan güvenli ödeme altyapısı.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#ececec] rounded-[10px] p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#55a80b]/10 text-[#55a80b] flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-[#111111]">Destek</h2>
              <p className="text-[10px] text-[#737373]">
                Adım adım aktivasyon rehberi ve satış sonrası teknik destek.
              </p>
            </div>
          </div>
        </section>

        {/* Kategori Hızlı Erişim Butonları */}
        <section aria-label="Kategoriler">
          <div className="flex items-center flex-wrap gap-2">
            <Link
              href="/urunler"
              className="bg-[#55a80b] text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-[8px] transition-colors whitespace-nowrap"
            >
              Tüm Ürünler
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="bg-white hover:border-[#55a80b] hover:text-[#55a80b] text-[#111111] border border-[#ececec] text-[11px] font-medium px-3.5 py-1.5 rounded-[8px] transition-colors whitespace-nowrap"
              >
                {cat.ad}
              </Link>
            ))}
          </div>
        </section>

        {/* Öne Çıkan Ürünler */}
        <section aria-labelledby="featured-heading">
          <div className="flex items-center justify-between mb-3.5">
            <h2
              id="featured-heading"
              className="text-[15px] font-bold text-[#111111] tracking-tight"
            >
              Öne Çıkan Ürünler
            </h2>
            <Link
              href="/urunler"
              className="text-[11px] font-semibold text-[#55a80b] hover:text-[#468f07] inline-flex items-center gap-1"
            >
              <span>Tümünü Gör</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[12px]">
            {displayProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
