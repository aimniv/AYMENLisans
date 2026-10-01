import React from 'react';
import { CheckCheck } from 'lucide-react';
import { Product } from '../../lib/products';

interface ProductVisualProps {
  product: Product;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDiscountBadge?: boolean;
  className?: string;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  product,
  size = 'md',
  showDiscountBadge = true,
  className = '',
}) => {
  const [colorStart, colorEnd] = product.gorselRenkleri || ['#0284c7', '#0c4a6e'];
  const isOutOfStock = !product.stok;

  const isMini = size === 'xs' || size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div
      className={`relative aspect-square w-full bg-[#fafafa] rounded-[8px] flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      {showDiscountBadge && product.indirimOrani && product.indirimOrani > 0 && !isMini && (
        <div
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-[#ef4444] text-white text-[9px] font-bold flex items-center justify-center shadow-sm tabular-nums"
          aria-label={`Yüzde ${product.indirimOrani} indirim`}
        >
          %{product.indirimOrani}
        </div>
      )}

      {/* Dijital Kart: %60 genişlik, 3:4.1 oran, 8px yuvarlak köşe, 160° diyagonal gradyan */}
      <div
        style={{
          backgroundImage: `linear-gradient(160deg, ${colorStart} 0%, ${colorEnd} 100%)`,
          aspectRatio: '3 / 4.1',
        }}
        className={`relative w-[60%] rounded-[8px] shadow-md flex flex-col justify-between text-white overflow-hidden transition-transform duration-200 ${
          isOutOfStock ? 'grayscale opacity-40' : ''
        }`}
      >
        {/* Üst çentik */}
        <div
          className={`w-full bg-black/25 flex items-center justify-center ${
            isMini ? 'py-1' : isLarge ? 'py-2.5' : 'py-1.5'
          }`}
        >
          <div
            className={`bg-white rounded-full ${
              isMini ? 'w-3.5 h-0.5' : isLarge ? 'w-10 h-2' : 'w-7 h-1.5'
            }`}
          />
        </div>

        {/* Orta Metinler */}
        <div
          className={`flex-1 flex flex-col items-center justify-center text-center ${
            isMini ? 'px-1' : isLarge ? 'px-4' : 'px-2.5'
          }`}
        >
          {!isMini && (
            <>
              <span
                className={`font-semibold tracking-wide text-white/90 ${
                  isLarge ? 'text-[13px]' : 'text-[9px]'
                }`}
              >
                {product.kartUstEtiket}
              </span>
              <div
                className={`w-3/4 h-[1px] bg-white/25 ${
                  isLarge ? 'my-2.5' : 'my-1.5'
                }`}
              />
            </>
          )}

          <div
            className={`font-extrabold leading-tight tracking-tight whitespace-pre-line ${
              isMini ? 'text-[7px]' : isLarge ? 'text-[18px]' : 'text-[11px]'
            }`}
          >
            {product.kartBaslik}
          </div>

          {!isMini && (
            <span
              className={`text-white/80 font-medium mt-1 ${
                isLarge ? 'text-[10px]' : 'text-[7px]'
              }`}
            >
              {product.kartAltYazi}
            </span>
          )}
        </div>

        {/* Alt Şerit */}
        <div
          className={`w-full bg-black/30 flex items-center justify-center relative ${
            isMini ? 'py-0.5' : isLarge ? 'py-2' : 'py-1.5'
          }`}
        >
          <span
            className={`font-bold tracking-wide leading-none ${
              isMini ? 'text-[6px]' : isLarge ? 'text-[13px]' : 'text-[9px]'
            }`}
          >
            {product.kartSureEtiketi}
          </span>
          {!isMini && (
            <CheckCheck
              className={`absolute right-2 text-white/75 ${
                isLarge ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
              }`}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {isOutOfStock && !isMini && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <span className="bg-[#4b5563]/95 text-white text-[10px] font-semibold px-2.5 py-1 rounded-[6px] shadow">
            Stokta Yok
          </span>
        </div>
      )}
    </div>
  );
};
