import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { OrderResult } from '../../lib/checkout';

export interface AuthUser {
  id: number;
  ad: string;
  eposta: string;
  telefon: string;
  rol: 'uye' | 'admin';
}

type Result = { ok: true } | { ok: false; error: string };

interface AuthContextValue {
  user: AuthUser | null;
  /** İlk oturum kontrolü tamamlanana kadar true. */
  isAuthLoading: boolean;
  /** Oturum açmış üyenin siparişleri (lisans bilgileriyle). */
  myOrders: OrderResult[];
  refreshMyOrders: () => Promise<void>;
  login: (eposta: string, sifre: string) => Promise<Result>;
  register: (input: { ad: string; eposta: string; telefon?: string; sifre: string }) => Promise<Result>;
  logout: () => Promise<void>;
  updateProfile: (input: { ad: string; eposta: string; telefon: string }) => Promise<Result>;
  changePassword: (mevcutSifre: string, yeniSifre: string) => Promise<Result>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function request(
  method: string,
  url: string,
  body?: unknown
): Promise<{ ok: boolean; data: any }> {
  try {
    const res = await fetch(url, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { error: 'Sunucuya bağlanılamadı.' } };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [myOrders, setMyOrders] = useState<OrderResult[]>([]);

  const refreshMyOrders = useCallback(async () => {
    const { ok, data } = await request('GET', '/api/my/orders');
    if (ok && Array.isArray(data.orders)) setMyOrders(data.orders);
  }, []);

  useEffect(() => {
    let cancelled = false;
    request('GET', '/api/auth/me').then(({ ok, data }) => {
      if (cancelled) return;
      setUser(ok ? (data.user ?? null) : null);
      setIsAuthLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user) {
      refreshMyOrders();
    } else {
      setMyOrders([]);
    }
  }, [user?.id, refreshMyOrders]);

  const login = useCallback<AuthContextValue['login']>(async (eposta, sifre) => {
    const { ok, data } = await request('POST', '/api/auth/login', { eposta, sifre });
    if (!ok) return { ok: false, error: data.error || 'Giriş yapılamadı.' };
    setUser(data.user);
    return { ok: true };
  }, []);

  const register = useCallback<AuthContextValue['register']>(async (input) => {
    const { ok, data } = await request('POST', '/api/auth/register', input);
    if (!ok) return { ok: false, error: data.error || 'Kayıt oluşturulamadı.' };
    setUser(data.user);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await request('POST', '/api/auth/logout');
    setUser(null);
  }, []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(async (input) => {
    const { ok, data } = await request('PUT', '/api/auth/profile', input);
    if (!ok) return { ok: false, error: data.error || 'Bilgiler güncellenemedi.' };
    setUser(data.user);
    return { ok: true };
  }, []);

  const changePassword = useCallback<AuthContextValue['changePassword']>(
    async (mevcutSifre, yeniSifre) => {
      const { ok, data } = await request('PUT', '/api/auth/password', { mevcutSifre, yeniSifre });
      if (!ok) return { ok: false, error: data.error || 'Şifre değiştirilemedi.' };
      return { ok: true };
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        myOrders,
        refreshMyOrders,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
