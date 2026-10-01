import React from 'react';

interface StarRatingProps {
  rating: number;
  reviewCount: number;
  size?: 'sm' | 'md';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewCount,
  size = 'sm',
}) => {
  const starSizeClass = size === 'md' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
  const countTextClass = size === 'md' ? 'text-[10px]' : 'text-[8px]';

  return (
    <div
      className="inline-flex items-center gap-1"
      aria-label={`5 üzerinden ${rating} yıldız (${reviewCount} değerlendirme)`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((index) => {
          const isFull = rating >= index;
          const isHalf = !isFull && rating >= index - 0.5;

          return (
            <span key={index} className={`relative inline-block ${starSizeClass}`}>
              <svg
                viewBox="0 0 20 20"
                className="w-full h-full text-[#e4e4e7] fill-current"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>

              {(isFull || isHalf) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: isHalf ? '50%' : '100%' }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    className={`${starSizeClass} text-[#fbbf24] fill-current`}
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span className={`${countTextClass} text-[#737373] leading-none tabular-nums`}>
        ({reviewCount})
      </span>
    </div>
  );
};
