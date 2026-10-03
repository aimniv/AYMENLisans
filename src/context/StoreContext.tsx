import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, INITIAL_PRODUCTS } from '../../lib/products';
import { OrderResult } from '../../lib/checkout';
import { useAuth } from './AuthContext';

export interface SiteSettings {
  storeName: string;
  announcement: string;
  supportEmail: string;
  whatsappNumber: string;
  workHours: string;
  bankIban: string;
  paymentProviderUrl: string;
}

interface StoreContextValue {
  products: Product[];
  coupons: Record<string, number>;
  orders: OrderResult[];
  settings: SiteSettings;
  isLoading: boolean;
  isAdminLoggedIn: boolean;
  refreshData: () => Promise<void>;
  addProduct: (product: Partial<Product>) => Promise<{ ok: boolean; error?: string }>;
  updateProduct: (slug: string, updates: Partial<Product>) => Promise<{ ok: boolean; error?: string }>;
  deleteProduct: (slug: string) => Promise<{ ok: boolean; error?: string }>;
  updateOrder: (siparisNo: string, updates: Partial<OrderResult>) => Promise<{ ok: boolean; error?: string }>;
  deleteOrder: (siparisNo: string) => Promise<{ ok: boolean; error?: string }>;
  addCoupon: (code: string, rate: number) => Promise<{ ok: boolean; error?: string }>;
  deleteCoupon: (code: string) => Promise<{ ok: boolean; error?: string }>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<{ ok: boolean; error?: string }>;
}

const DEFAULT_SETTINGS: SiteSettings = {
  storeName: 'AYMENLisans',
  announcement: '🎉 Tüm Windows ve Office lisanslarında anında teslimat ve %10 HOSGELDIN indirimi!',
  supportEmail: 'destek@aymenlisans.com',
  whatsappNumber: '+90 536 565 70 03',
  workHours: 'Hafta içi 09:00 - 18:00',
  bankIban: 'TR33 0006 1005 1978 6451 0001 24 (Ziraat Bankası - AYMEN Dijital)',
  paymentProviderUrl: '',
};

const StoreContext = createContext<StoreContextValue | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aymen_store_products');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [coupons, setCoupons] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const isAdminLoggedIn = user?.rol === 'admin';

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch Products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData.products)) {
          setProducts(prodData.products);
          localStorage.setItem('aymen_store_products', JSON.stringify(prodData.products));
        }
      }

      if (isAdminLoggedIn) {
        // Siparişler ve kuponlar yalnızca yöneticiye açıktır
        const ordRes = await fetch('/api/orders');
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          if (Array.isArray(ordData.orders)) {
            setOrders(ordData.orders);
          }
        }

        const coupRes = await fetch('/api/coupons');
        if (coupRes.ok) {
          const coupData = await coupRes.json();
          if (coupData.coupons) {
            setCoupons(coupData.coupons);
          }
        }
      } else {
        setOrders([]);
        setCoupons({});
      }

      // Fetch Settings
      const setRes = await fetch('/api/settings');
      if (setRes.ok) {
        const setData = await setRes.json();
        if (setData) {
          setSettings(setData);
        }
      }
    } catch {
      // Keep in-memory/localStorage values on error
    } finally {
      setIsLoading(false);
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Ürün eklenemedi.' };
      }
      setProducts((prev) => [data.product, ...prev]);
      localStorage.setItem('aymen_store_products', JSON.stringify([data.product, ...products]));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Sunucuya bağlanılamadı.' };
    }
  }, [products]);

  const updateProduct = useCallback(async (slug: string, updates: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Ürün güncellenemedi.' };
      }
      setProducts((prev) =>
        prev.map((p) => (p.slug === slug ? { ...p, ...data.product } : p))
      );
      return { ok: true };
    } catch {
      return { ok: false, error: 'Sunucuya bağlanılamadı.' };
    }
  }, []);

  const deleteProduct = useCallback(async (slug: string) => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        return { ok: false, error: data.error || 'Ürün silinemedi.' };
      }
      setProducts((prev) => prev.filter((p) => p.slug !== slug));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Sunucuya bağlanılamadı.' };
    }
  }, []);

  const updateOrder = useCallback(async (siparisNo: string, updates: Partial<OrderResult>) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(siparisNo)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Sipariş güncellenemedi.' };
      }
      setOrders((prev) =>
        prev.map((o) => (o.siparisNo === siparisNo ? { ...o, ...data.order } : o))
      );
      return { ok: true };
    } catch {
      return { ok: false, error: 'Sunucuya bağlanılamadı.' };
    }
  }, []);

  const deleteOrder = useCallback(async (siparisNo: string) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(siparisNo)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        return { ok: false, error: data.error || 'Sipariş silinemedi.' };
      }
      setOrders((prev) => prev.filter((o) => o.siparisNo !== siparisNo));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Sunucuya bağlanılamadı.' };
    }
  }, []);

  const addCoupon = useCallback(async (code: string, rate: number) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, rate }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Kupon eklenemedi.' };
      }
      setCoupons(data.coupons);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Sunucuya bağlanılamadı.' };
    }
  }, []);

  const deleteCoupon = useCallback(async (code: string) => {
    try {
      const res = await fetch(`/api/coupons/${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Kupon silinemedi.' };
      }
      setCoupons(data.coupons);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Sunucuya bağlanılamadı.' };
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<SiteSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Ayarlar kaydedilemedi.' };
      }
      setSettings(data.settings);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Sunucuya bağlanılamadı.' };
    }
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        coupons,
        orders,
        settings,
        isLoading,
        isAdminLoggedIn,
        refreshData,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrder,
        deleteOrder,
        addCoupon,
        deleteCoupon,
        updateSettings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
