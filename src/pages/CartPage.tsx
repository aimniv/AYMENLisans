import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Minus,
  Plus,
  Info,
  ArrowRight,
  Lock,
  CheckCircle2,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductVisual } from '../components/ProductVisual';
import { formatPriceTL, formatPriceSymbol } from '../../lib/products';
import { Link, useRouter } from '../context/RouterContext';

export const CartPage: React.FC = () => {
  const {
    items,
    totalItemsCount,
    subtotal,
    couponCode,
    discountRate,
    discountAmount,
    total,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { navigate } = useRouter();

  const [couponInput, setCouponInput] = useState(couponCode ?? '');
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Sepetim - Ucuz Lisans Satın Al | AYMENLisans';
  }, []);

  useEffect(() => {
    if (couponCode) {
      setCouponInput(couponCode);
    }
  }, [couponCode]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const res = applyCoupon(couponInput);
    if (!res.ok) {
      setCouponError(res.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#fafafa] py-10">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="bg-white border border-[#ececec] rounded-[10px] p-10 text-center max-w-[460px] mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#55a80b]/10 text-[#55a80b] flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className="text-[16px] font-bold text-[#111111] mb-1.5">
              Sepetiniz boş
            </h1>
            <p className="text-[11px] text-[#737373] mb-5">
              Dijital lisans ve abonelik fırsatlarını inceleyerek hemen sepetinize ekleyebilirsiniz.
            </p>
            <Link
              href="/urunler"
              className="inline-flex items-center justify-center gap-1.5 bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px] transition-colors"
            >
              <span>Alışverişe Başla</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] py-6">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start gap-5">
          {/* Sol Sütun: Ürün Listesi */}
          <div className="flex-1 w-full min-w-0">
            <h1 className="text-[16px] font-bold text-[#111111] mb-3.5 flex items-baseline gap-1.5">
              <span>Sepetim</span>
              <span className="text-[12px] font-normal text-[#737373]">
                ({totalItemsCount} Ürün)
              </span>
            </h1>

            <div className="space-y-2.5">
              {items.map(({ slug, adet, product }) => {
                const linePrice = product.fiyat * adet;

                return (
                  <div
                    key={slug}
                    className="bg-white border border-[#ececec] rounded-[10px] p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 shrink-0">
                      <CheckCircle2
                        className="w-4 h-4 text-[#55a80b] fill-[#55a80b]/15 shrink-0"
                        aria-hidden="true"
                      />
                      <Link
                        href={`/urun/${product.slug}`}
                        className="w-14 h-14 block shrink-0"
                      >
                        <ProductVisual
                          product={product}
                          size="xs"
                          showDiscountBadge={false}
                        />
                      </Link>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[8px] font-bold uppercase text-[#737373] tracking-wider mb-0.5">
                        {product.kategoriAdi.toLocaleUpperCase('tr-TR')}
                      </div>
                      <Link
                        href={`/urun/${product.slug}`}
                        className="text-[11px] font-semibold text-[#111111] hover:text-[#55a80b] transition-colors line-clamp-1 block mb-1.5"
                      >
                        {product.ad}
                      </Link>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-[#ecfeff] text-[#0891b2] border border-[#cffafe] text-[9px] font-semibold px-2 py-0.5 rounded-[5px]">
                          ⚡ Hızlı Teslimat
                        </span>

                        <div
                          className="inline-flex items-center bg-[#f6f6f7] border border-[#ececec] rounded-[6px] h-[22px] px-1"
                          aria-label={`${product.ad} adet seçici`}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(slug, adet - 1)}
                            disabled={adet <= 1}
                            aria-label="Adedi azalt"
                            className="w-5 h-5 flex items-center justify-center text-[#52525b] hover:text-[#111111] disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" aria-hidden="true" />
                          </button>
                          <span className="text-[10px] font-bold text-[#111111] px-2 tabular-nums">
                            {adet}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(slug, adet + 1)}
                            disabled={adet >= 10}
                            aria-label="Adedi artır"
                            className="w-5 h-5 flex items-center justify-center text-[#52525b] hover:text-[#111111] disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 pl-2">
                      <span className="text-[13px] font-bold text-[#111111] tabular-nums whitespace-nowrap">
                        {formatPriceSymbol(linePrice)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(slug)}
                        aria-label={`${product.ad} ürününü sepetten sil`}
                        className="text-[#a1a1aa] hover:text-[#ef4444] transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#737373]">
              <Info className="w-3.5 h-3.5 text-[#a1a1aa] shrink-0" aria-hidden="true" />
              <span>
                Sepetinizdeki ürünler, satın alma işlemi tamamlanana kadar rezerve edilmez.
              </span>
            </div>
          </div>

          {/* Sağ Sütun: 300px "Sipariş Özeti" Kartı */}
          <aside
            aria-label="Sipariş Özeti"
            className="w-full lg:w-[300px] shrink-0 bg-white border border-[#ececec] rounded-[10px] p-4"
          >
            <h2 className="text-[12px] font-bold text-[#111111] mb-3">
              Sipariş Özeti
            </h2>

            <div className="space-y-2 text-[10px]">
              <div className="flex items-center justify-between text-[#52525b]">
                <span>Ürünün Toplamı</span>
                <span className="font-semibold text-[#111111] tabular-nums">
                  {formatPriceTL(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#52525b]">
                <span>Kargo Toplam</span>
                <span className="font-medium text-[#111111] tabular-nums">
                  0,00 TL
                </span>
              </div>

              <div className="flex items-center justify-between text-[#55a80b] font-semibold">
                <span>⚡ Anında Teslimat</span>
                <span>Ücretsiz</span>
              </div>
            </div>

            {/* Kupon Satırı */}
            <form onSubmit={handleApplyCoupon} className="mt-3.5">
              <div className="flex items-center gap-1.5">
                <input
                  id="coupon-input"
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    if (couponError) setCouponError(null);
                  }}
                  placeholder="HOSGELDIN"
                  className="flex-1 min-w-0 h-[32px] px-2.5 bg-[#f6f6f7] border border-[#ececec] rounded-[6px] text-[10px] font-semibold uppercase text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#55a80b] focus:bg-white"
                />
                <button
                  type="submit"
                  className="h-[32px] px-3 bg-[#333333] hover:bg-[#111111] text-white text-[10px] font-semibold rounded-[6px] transition-colors shrink-0 cursor-pointer"
                >
                  Uygula
                </button>
              </div>

              {couponError && (
                <p
                  role="alert"
                  className="mt-1.5 text-[9px] font-medium text-[#dc2626]"
                >
                  {couponError}
                </p>
              )}
            </form>

            {couponCode && discountRate > 0 && (
              <div className="mt-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-[6px] px-2.5 py-1.5 flex items-center justify-between text-[10px] font-bold text-[#55a80b]">
                <div className="flex items-center gap-1">
                  <span>Kupon İndirimi (%{discountRate})</span>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponInput('');
                    }}
                    aria-label="Kuponu kaldır"
                    className="text-[#55a80b] hover:text-[#15803d] ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
                <span className="tabular-nums">-{formatPriceSymbol(discountAmount)}</span>
              </div>
            )}

            <hr className="border-[#ececec] my-3.5" />

            <div className="flex items-baseline justify-between mb-3.5">
              <span className="text-[12px] font-bold text-[#111111]">Toplam</span>
              <span className="text-[15px] font-extrabold text-[#55a80b] tabular-nums">
                {formatPriceTL(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold py-[10px] px-[14px] rounded-[8px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Sepeti Onayla</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <div className="mt-2.5 bg-[#f0fdf4] text-[#15803d] text-[9px] font-semibold py-1.5 px-3 rounded-[6px] flex items-center justify-center gap-1">
              <Lock className="w-2.5 h-2.5" aria-hidden="true" />
              <span>🔒 Güvenli ve Şifreli Ödeme</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
