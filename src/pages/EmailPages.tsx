import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../context/RouterContext';

const inputClass =
  'w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#55a80b] focus:bg-white transition-colors';
const buttonClass =
  'w-full bg-[#55a80b] hover:bg-[#468f07] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[12px] font-semibold py-[10px] rounded-[8px] transition-colors cursor-pointer';

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-[#fafafa] py-10 min-h-[70vh]">
    <div className="max-w-[1100px] mx-auto px-4">
      <div className="max-w-[400px] mx-auto bg-white border border-[#ececec] rounded-[10px] p-5">
        <h1 className="text-[15px] font-bold text-[#111111] mb-3">{title}</h1>
        {children}
      </div>
    </div>
  </div>
);

const ErrorBox: React.FC<{ text: string }> = ({ text }) => (
  <div
    role="alert"
    className="mb-3 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-[10px] font-semibold px-3 py-2 rounded-[8px] flex items-center gap-2"
  >
    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
    <span>{text}</span>
  </div>
);

const SuccessBox: React.FC<{ text: string }> = ({ text }) => (
  <div
    role="status"
    className="mb-3 bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-[10px] font-medium px-3 py-2 rounded-[8px] flex items-center gap-2"
  >
    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
    <span>{text}</span>
  </div>
);

/** /eposta-dogrula?token=... */
export const VerifyEmailPage: React.FC = () => {
  const { verifyEmail, user } = useAuth();
  const { searchParams } = useRouter();
  const token = searchParams.get('token');
  const [state, setState] = useState<{ status: 'loading' | 'ok' | 'error'; error?: string }>({
    status: 'loading',
  });
  const started = useRef(false);

  useEffect(() => {
    document.title = 'E-posta Doğrulama | AYMENLisans';
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token) {
      setState({ status: 'error', error: 'Doğrulama bağlantısı eksik veya hatalı.' });
      return;
    }
    // Bağlantı tek kullanımlıktır; yalnızca bir kez gönderilir.
    verifyEmail(token).then((res) =>
      setState(res.ok ? { status: 'ok' } : { status: 'error', error: res.error })
    );
  }, [token, verifyEmail]);

  return (
    <Card title="E-posta Doğrulama">
      {state.status === 'loading' && <p className="text-[11px] text-[#737373]">Doğrulanıyor...</p>}
      {state.status === 'ok' && (
        <>
          <SuccessBox text="E-posta adresiniz doğrulandı." />
          <Link
            href={user ? '/urunler' : '/giris'}
            className="inline-flex items-center justify-center bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px]"
          >
            {user ? 'Alışverişe Başla' : 'Giriş Yap'}
          </Link>
        </>
      )}
      {state.status === 'error' && (
        <>
          <ErrorBox text={state.error ?? 'E-posta doğrulanamadı.'} />
          <p className="text-[10px] text-[#737373]">
            Yeni bir bağlantı için{' '}
            <Link href="/hesabim" className="text-[#55a80b] font-semibold underline">
              hesabınıza giriş yapıp
            </Link>{' '}
            "Tekrar Gönder" düğmesini kullanın.
          </p>
        </>
      )}
    </Card>
  );
};

/** /sifremi-unuttum */
export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [eposta, setEposta] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Şifremi Unuttum | AYMENLisans';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const res = await forgotPassword(eposta.trim());
    setIsSubmitting(false);
    if (res.ok) setSent(true);
    else setError(res.error);
  };

  return (
    <Card title="Şifremi Unuttum">
      {sent ? (
        <SuccessBox text="Bu e-posta adresiyle kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi. Bağlantı 1 saat geçerlidir." />
      ) : (
        <>
          <p className="text-[10px] text-[#737373] mb-3">
            Hesabınızın e-posta adresini girin; şifrenizi sıfırlamanız için bir bağlantı gönderelim.
          </p>
          {error && <ErrorBox text={error} />}
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div>
              <label htmlFor="forgot-email" className="block text-[9px] font-semibold text-[#374151] mb-1">
                E-Posta Adresi
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={eposta}
                onChange={(e) => setEposta(e.target.value)}
                placeholder="ornek@eposta.com"
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={isSubmitting} className={buttonClass}>
              {isSubmitting ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
            </button>
          </form>
        </>
      )}
      <div className="mt-4 text-center">
        <Link href="/giris" className="text-[10px] text-[#737373] hover:text-[#111111] font-medium">
          ← Girişe Dön
        </Link>
      </div>
    </Card>
  );
};

/** /sifre-sifirla?token=... */
export const ResetPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const { searchParams } = useRouter();
  const token = searchParams.get('token') ?? '';
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Şifre Sıfırla | AYMENLisans';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError('Şifre sıfırlama bağlantısı eksik veya hatalı.');
      return;
    }
    if (sifre.length < 8) {
      setError('Yeni şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (sifre !== sifreTekrar) {
      setError('Şifreler birbiriyle eşleşmiyor.');
      return;
    }
    setIsSubmitting(true);
    const res = await resetPassword(token, sifre);
    setIsSubmitting(false);
    if (res.ok) setDone(true);
    else setError(res.error);
  };

  return (
    <Card title="Yeni Şifre Belirle">
      {done ? (
        <>
          <SuccessBox text="Şifreniz güncellendi. Tüm cihazlardaki oturumlar kapatıldı; yeni şifrenizle giriş yapabilirsiniz." />
          <Link
            href="/giris"
            className="inline-flex items-center justify-center bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold px-[14px] py-[10px] rounded-[8px]"
          >
            Giriş Yap
          </Link>
        </>
      ) : (
        <>
          {error && <ErrorBox text={error} />}
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div>
              <label htmlFor="reset-pass" className="block text-[9px] font-semibold text-[#374151] mb-1">
                Yeni Şifre
              </label>
              <input
                id="reset-pass"
                type="password"
                autoComplete="new-password"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                placeholder="En az 8 karakter"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="reset-pass2" className="block text-[9px] font-semibold text-[#374151] mb-1">
                Yeni Şifre (Tekrar)
              </label>
              <input
                id="reset-pass2"
                type="password"
                autoComplete="new-password"
                value={sifreTekrar}
                onChange={(e) => setSifreTekrar(e.target.value)}
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={isSubmitting} className={buttonClass}>
              {isSubmitting ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
          {error?.includes('geçersiz') && (
            <div className="mt-3 text-center">
              <Link href="/sifremi-unuttum" className="text-[10px] text-[#55a80b] font-semibold underline">
                Yeni bağlantı iste
              </Link>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
