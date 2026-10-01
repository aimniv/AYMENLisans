import React, { useState, useEffect } from 'react';
import { Zap, Check, Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { formatPriceTL } from '../../lib/products';
import { ProductVisual } from '../components/ProductVisual';
import { StarRating } from '../components/StarRating';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { Link, useRouter } from '../context/RouterContext';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { products } = useStore();
  const product = products.find((p) => p.slug === slug || (p.aliases && p.aliases.includes(slug)));
  const { addItem } = useCart();
  const { navigate } = useRouter();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
    if (product) {
      document.title = `${product.ad} | AYMENLisans`;
    } else {
      document.title = 'Ürün Bulunamadı | AYMENLisans';
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 py-10">
        <div className="bg-white border border-[#ececec] rounded-[10px] p-8 text-center">
          <h1 className="text-[16px] font-bold text-[#111111] mb-2">
            Aradığınız ürün bulunamadı
          </h1>
          <p className="text-[11px] text-[#737373] mb-4">
            Ürün kaldırılmış veya bağlantı adresi değişmiş olabilir.
          </p>
          <Link
            href="/urunler"
            className="inline-flex items-center gap-1.5 bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Tüm Ürünlere Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(10, prev + 1));
  };

  const handleAddToCart = () => {
    if (!product.stok) return;
    addItem(product.slug, quantity);
    navigate('/sepet');
  };

  return (
    <div className="bg-[#fafafa] py-6">
      <div className="max-w-[1100px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav aria-label="Sayfa Konumu" className="mb-3 flex items-center gap-1.5 text-[10px] text-[#737373]">
          <Link href="/" className="hover:text-[#111111]">
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link href={`/${product.kategori}`} className="hover:text-[#111111]">
            {product.kategoriAdi}
          </Link>
          <span>/</span>
          <span className="text-[#111111] font-medium truncate max-w-[260px]">
            {product.ad}
          </span>
        </nav>

        {/* Beyaz Kart İçinde İki Sütun */}
        <div className="bg-white border border-[#ececec] rounded-[10px] p-5 md:p-7">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
            {/* Sol: Büyük Ürün Görseli */}
            <div className="md:col-span-5">
              <ProductVisual product={product} size="lg" showDiscountBadge={true} />
            </div>

            {/* Sağ: Ürün Detayları */}
            <div className="md:col-span-7 flex flex-col">
              <Link
                href={`/${product.kategori}`}
                className="text-[10px] font-bold uppercase text-[#55a80b] tracking-wider mb-1.5 inline-block w-fit"
              >
                {product.kategoriAdi.toLocaleUpperCase('tr-TR')}
              </Link>

              <h1 className="text-[18px] font-bold text-[#111111] leading-snug mb-2">
                {product.ad}
              </h1>

              <div className="mb-3">
                <StarRating
                  rating={product.puan}
                  reviewCount={product.yorumSayisi}
                  size="md"
                />
              </div>

              <div className="flex items-baseline gap-2.5 mb-3 tabular-nums">
                <span className="text-[24px] font-extrabold text-[#55a80b] leading-none">
                  {formatPriceTL(product.fiyat)}
                </span>
                {product.eskiFiyat && product.eskiFiyat > product.fiyat && (
                  <span className="text-[13px] text-[#9ca3af] line-through">
                    {formatPriceTL(product.eskiFiyat)}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <span className="inline-flex items-center gap-1 bg-[#ecfeff] text-[#0891b2] border border-[#cffafe] text-[10px] font-semibold px-2.5 py-1 rounded-[6px]">
                  <Zap className="w-3 h-3 fill-[#0891b2]" aria-hidden="true" />
                  <span>⚡ Hızlı Teslimat</span>
                </span>
              </div>

              <p className="text-[12px] text-[#4b5563] leading-relaxed mb-4">
                {product.aciklama}
              </p>

              <ul className="space-y-1.5 mb-6 border-t border-b border-[#ececec] py-3.5">
                {product.ozellikListesi.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-[11px] text-[#27272a]"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#55a80b]/15 text-[#55a80b] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" aria-hidden="true" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div
                  className="inline-flex items-center justify-between bg-[#f6f6f7] border border-[#ececec] rounded-[8px] h-[40px] px-2 w-full sm:w-[116px] shrink-0"
                  aria-label="Ürün Adedi Seçici"
                >
                  <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={!product.stok || quantity <= 1}
                    aria-label="Adedi azalt"
                    className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#111111] hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <span className="text-[12px] font-bold text-[#111111] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    disabled={!product.stok || quantity >= 10}
                    aria-label="Adedi artır"
                    className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#111111] hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {product.stok ? (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 h-[40px] bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px] flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                    <span>Sepete Ekle</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex-1 h-[40px] bg-[#9ca3af] text-white text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px] flex items-center justify-center cursor-not-allowed opacity-70 whitespace-nowrap"
                  >
                    Stokta Yok
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
