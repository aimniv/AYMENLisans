import React, { useEffect, useState } from 'react';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../context/RouterContext';

type Mode = 'giris' | 'kayit';

/** Yalnızca site içi yollara yönlendirir (açık yönlendirme / open redirect koruması). */
export function safeRedirect(target: string | null, fallback = '/hesabim'): string {
  if (target && target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')) {
    return target;
  }
  return fallback;
}

const inputClass =
  'w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#55a80b] focus:bg-white transition-colors';

export const LoginPage: React.FC<{ initialMode?: Mode }> = ({ initialMode = 'giris' }) => {
  const { user, isAuthLoading, login, register } = useAuth();
  const { searchParams, navigate } = useRouter();
  const redirectTo = safeRedirect(searchParams.get('yonlendir'));

  const [mode, setMode] = useState<Mode>(initialMode);
  const [ad, setAd] = useState('');
  const [eposta, setEposta] = useState('');
  const [telefon, setTelefon] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Giriş Yap / Üye Ol | AYMENLisans';
  }, []);

  useEffect(() => {
    if (user) navigate(redirectTo);
  }, [user, redirectTo, navigate]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'kayit') {
      if (ad.trim().length < 3) {
        setError('Adınız ve soyadınız en az 3 karakter olmalıdır.');
        return;
      }
      if (sifre.length < 8) {
        setError('Şifre en az 8 karakter olmalıdır.');
        return;
      }
      if (sifre !== sifreTekrar) {
        setError('Şifreler birbiriyle eşleşmiyor.');
        return;
      }
    }

    setIsSubmitting(true);
    const result =
      mode === 'giris'
        ? await login(eposta.trim(), sifre)
        : await register({
            ad: ad.trim(),
            eposta: eposta.trim(),
            telefon: telefon.trim() || undefined,
            sifre,
          });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
    }
  };

  if (isAuthLoading || user) {
    return <div className="min-h-[60vh]" aria-busy="true" />;
  }

  return (
    <div className="bg-[#fafafa] py-10 min-h-[70vh]">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="max-w-[400px] mx-auto bg-white border border-[#ececec] rounded-[10px] p-5">
          <div role="tablist" aria-label="Hesap işlemi" className="grid grid-cols-2 gap-1 bg-[#f6f6f7] rounded-[8px] p-1 mb-4">
            {(
              [
                ['giris', 'Giriş Yap', LogIn],
                ['kayit', 'Üye Ol', UserPlus],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => switchMode(key)}
                className={`flex items-center justify-center gap-1.5 h-[32px] rounded-[6px] text-[11px] font-semibold transition-colors cursor-pointer ${
                  mode === key ? 'bg-white text-[#55a80b] shadow-sm' : 'text-[#52525b] hover:text-[#111111]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <h1 className="text-[15px] font-bold text-[#111111] mb-0.5">
            {mode === 'giris' ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
          </h1>
          <p className="text-[10px] text-[#737373] mb-4">
            {mode === 'giris'
              ? 'Siparişlerinizi ve lisans anahtarlarınızı görüntülemek için giriş yapın.'
              : 'Üye olarak sipariş verebilir, lisanslarınıza istediğiniz zaman ulaşabilirsiniz.'}
          </p>

          {error && (
            <div
              role="alert"
              className="mb-3 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-[10px] font-semibold px-3 py-2 rounded-[8px] flex items-center gap-2"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            {mode === 'kayit' && (
              <div>
                <label htmlFor="auth-name" className="block text-[9px] font-semibold text-[#374151] mb-1">
                  Adınız Soyadınız
                </label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  value={ad}
                  onChange={(e) => setAd(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-[9px] font-semibold text-[#374151] mb-1">
                E-Posta Adresi
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={eposta}
                onChange={(e) => setEposta(e.target.value)}
                placeholder="ornek@eposta.com"
                className={inputClass}
              />
            </div>

            {mode === 'kayit' && (
              <div>
                <label htmlFor="auth-phone" className="block text-[9px] font-semibold text-[#374151] mb-1">
                  Telefon <span className="font-normal text-[#9ca3af]">(isteğe bağlı)</span>
                </label>
                <input
                  id="auth-phone"
                  type="tel"
                  autoComplete="tel"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-pass" className="block text-[9px] font-semibold text-[#374151] mb-1">
                Şifre
              </label>
              <input
                id="auth-pass"
                type="password"
                autoComplete={mode === 'giris' ? 'current-password' : 'new-password'}
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                placeholder={mode === 'kayit' ? 'En az 8 karakter' : '••••••••'}
                className={inputClass}
              />
            </div>

            {mode === 'kayit' && (
              <div>
                <label htmlFor="auth-pass2" className="block text-[9px] font-semibold text-[#374151] mb-1">
                  Şifre (Tekrar)
                </label>
                <input
                  id="auth-pass2"
                  type="password"
                  autoComplete="new-password"
                  value={sifreTekrar}
                  onChange={(e) => setSifreTekrar(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#55a80b] hover:bg-[#468f07] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[12px] font-semibold py-[10px] rounded-[8px] transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Lütfen bekleyin...' : mode === 'giris' ? 'Giriş Yap' : 'Üye Ol'}
            </button>
          </form>

          {mode === 'kayit' && (
            <p className="mt-3 text-[9px] text-[#737373] text-center">
              Üye olarak{' '}
              <Link href="/kullanim-sartlari" className="underline hover:text-[#55a80b]">
                Kullanım Şartları
              </Link>{' '}
              ve{' '}
              <Link href="/gizlilik-politikasi" className="underline hover:text-[#55a80b]">
                Gizlilik Politikası
              </Link>
              'nı kabul etmiş olursunuz.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
