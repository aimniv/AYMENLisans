import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, formatPriceSymbol } from '../../lib/products';
import { OrderResult } from '../../lib/checkout';
import { useStore } from './StoreContext';

export const CART_STORAGE_KEY = 'cart:v1';
const LAST_ORDER_STORAGE_KEY = 'lastOrder:v1';

export interface StoredCartItem {
  slug: string;
  adet: number;
  quantity: number;
}

export interface CartLineItem {
  slug: string;
  adet: number;
  product: Product;
}

interface CartContextValue {
  items: CartLineItem[];
  isHydrated: boolean;
  totalItemsCount: number;
  subtotal: number;
  couponCode: string | null;
  discountRate: number;
  discountAmount: number;
  total: number;
  addItem: (slug: string, adet?: number) => void;
  updateQuantity: (slug: string, adet: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  lastOrder: OrderResult | null;
  recordOrder: (order: OrderResult) => void;
  savedOrders: OrderResult[];
}

const CartContext = createContext<CartContextValue | null>(null);

function parseStoredCart(raw: string | null): {
  items: StoredCartItem[];
  couponCode: string | null;
} {
  if (!raw) return { items: [], couponCode: null };
  try {
    const parsed = JSON.parse(raw);
    const rawList = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.items)
        ? parsed.items
        : [];
    const items: StoredCartItem[] = [];
    for (const entry of rawList) {
      if (!entry || typeof entry.slug !== 'string') continue;
      const rawQty = Number(entry.adet ?? entry.quantity ?? 1);
      const qty = Math.min(10, Math.max(1, Number.isFinite(rawQty) ? Math.floor(rawQty) : 1));
      const existing = items.find((i) => i.slug === entry.slug);
      if (existing) {
        existing.adet = Math.min(10, existing.adet + qty);
        existing.quantity = existing.adet;
      } else {
        items.push({ slug: entry.slug, adet: qty, quantity: qty });
      }
    }
    const rawCoupon =
      typeof parsed?.couponCode === 'string' && parsed.couponCode.trim().length > 0
        ? parsed.couponCode.toUpperCase()
        : null;
    return { items, couponCode: rawCoupon };
  } catch {
    return { items: [], couponCode: null };
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products, coupons, orders, refreshData } = useStore();
  const [storedItems, setStoredItems] = useState<StoredCartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<OrderResult | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const { items, couponCode: savedCoupon } = parseStoredCart(
      window.localStorage.getItem(CART_STORAGE_KEY)
    );
    setStoredItems(items);
    setCouponCode(savedCoupon);

    try {
      const rawLastOrder = window.localStorage.getItem(LAST_ORDER_STORAGE_KEY);
      if (rawLastOrder) {
        setLastOrder(JSON.parse(rawLastOrder));
      }
    } catch {
      // ignore
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items: storedItems,
          couponCode,
        })
      );
    } catch {
      // ignore
    }
  }, [storedItems, couponCode, isHydrated]);

  const items: CartLineItem[] = useMemo(() => {
    const result: CartLineItem[] = [];
    for (const entry of storedItems) {
      const product = products.find((p) => p.slug === entry.slug);
      if (product && product.stok) {
        result.push({
          slug: product.slug,
          adet: entry.adet,
          product,
        });
      }
    }
    return result;
  }, [storedItems, products]);

  const totalItemsCount = useMemo(
    () => items.reduce((sum, item) => sum + item.adet, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      Number(
        items.reduce((sum, item) => sum + item.product.fiyat * item.adet, 0).toFixed(2)
      ),
    [items]
  );

  const discountRate = useMemo(() => {
    if (!couponCode) return 0;
    return coupons[couponCode] ?? 0;
  }, [couponCode, coupons]);

  const discountAmount = useMemo(() => {
    if (discountRate <= 0 || subtotal <= 0) return 0;
    return Number(((subtotal * discountRate) / 100).toFixed(2));
  }, [subtotal, discountRate]);

  const total = useMemo(
    () => Number(Math.max(0, subtotal - discountAmount).toFixed(2)),
    [subtotal, discountAmount]
  );

  const addItem = useCallback(
    (slug: string, adet = 1) => {
      const product = products.find((p) => p.slug === slug);
      if (!product || !product.stok) return;
      const safeQty = Math.min(10, Math.max(1, Math.floor(adet)));

      setStoredItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.slug === product.slug);
        if (existingIndex >= 0) {
          const updated = [...prev];
          const nextQty = Math.min(10, updated[existingIndex].adet + safeQty);
          updated[existingIndex] = {
            slug: product.slug,
            adet: nextQty,
            quantity: nextQty,
          };
          return updated;
        }
        return [...prev, { slug: product.slug, adet: safeQty, quantity: safeQty }];
      });
    },
    [products]
  );

  const updateQuantity = useCallback(
    (slug: string, adet: number) => {
      const safeQty = Math.min(10, Math.max(1, Math.floor(adet)));
      setStoredItems((prev) =>
        prev.map((item) =>
          item.slug === slug ? { ...item, adet: safeQty, quantity: safeQty } : item
        )
      );
    },
    []
  );

  const removeItem = useCallback((slug: string) => {
    setStoredItems((prev) => prev.filter((item) => item.slug !== slug));
  }, []);

  const clearCart = useCallback(() => {
    setStoredItems([]);
    setCouponCode(null);
  }, []);

  const applyCoupon = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) {
        return { ok: false, message: 'Lütfen bir kupon kodu giriniz.' };
      }
      const rate = coupons[normalized];
      if (!rate) {
        return {
          ok: false,
          message: 'Geçersiz kupon kodu. Demo için "HOSGELDIN" kodunu kullanabilirsiniz.',
        };
      }
      setCouponCode(normalized);
      return { ok: true, message: `%${rate} kupon indirimi uygulandı.` };
    },
    [coupons]
  );

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
  }, []);

  const recordOrder = useCallback(
    (order: OrderResult) => {
      setLastOrder(order);
      try {
        window.localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
      } catch {
        // ignore
      }
      refreshData();
    },
    [refreshData]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated,
        totalItemsCount,
        subtotal,
        couponCode,
        discountRate,
        discountAmount,
        total,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        lastOrder,
        recordOrder,
        savedOrders: orders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
