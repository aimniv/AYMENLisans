import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from '../context/RouterContext';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'light',
  className = '',
}) => {
  return (
    <Link
      href="/"
      aria-label="AYMENLisans Ana Sayfa"
      className={`inline-flex items-center select-none tracking-tight ${className}`}
    >
      <Zap
        className="w-5 h-5 text-[#55a80b] fill-[#55a80b] mr-1 shrink-0 -rotate-6"
        aria-hidden="true"
      />
      <span className="text-[20px] font-extrabold leading-none">
        <span className={variant === 'dark' ? 'text-white' : 'text-[#111111]'}>
          AYMEN
        </span>
        <span className="text-[#55a80b]">Lisans</span>
      </span>
    </Link>
  );
};
