import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product, formatPriceTL } from '../../lib/products';
import { ProductVisual } from './ProductVisual';
import { StarRating } from './StarRating';
import { Link } from '../context/RouterContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const productUrl = `/urun/${product.slug}`;

  return (
    <article className="bg-white border border-[#ececec] rounded-[10px] p-[10px] flex flex-col justify-between hover:border-[#d4d4d8] transition-colors">
      <div>
        <Link href={productUrl} className="block mb-2.5">
          <ProductVisual product={product} size="md" showDiscountBadge={true} />
        </Link>

        <div className="text-[9px] font-bold uppercase text-[#55a80b] tracking-wide mb-1">
          {product.kategoriAdi.toLocaleUpperCase('tr-TR')}
        </div>

        <h3 className="text-[11px] font-medium text-[#111111] leading-[1.35] line-clamp-3 min-h-[30px] mb-1.5">
          <Link href={productUrl} className="hover:text-[#55a80b] transition-colors">
            {product.ad}
          </Link>
        </h3>

        <div className="mb-1.5">
          <StarRating rating={product.puan} reviewCount={product.yorumSayisi} size="sm" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5 mb-2.5 tabular-nums">
          <span className="text-[13px] font-bold text-[#111111]">
            {formatPriceTL(product.fiyat)}
          </span>
          {product.eskiFiyat && product.eskiFiyat > product.fiyat && (
            <span className="text-[10px] text-[#9ca3af] line-through">
              {formatPriceTL(product.eskiFiyat)}
            </span>
          )}
        </div>

        <Link
          href={productUrl}
          className={`w-full bg-[#55a80b] hover:bg-[#468f07] text-white text-[11px] font-semibold py-[8px] px-3 rounded-[8px] flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
            !product.stok ? 'opacity-60' : ''
          }`}
        >
          <span>İncele</span>
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};
