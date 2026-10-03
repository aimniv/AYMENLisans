import React, { useState } from 'react';
import { MailWarning } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/** E-postası doğrulanmamış üyelere gösterilen uyarı ve "tekrar gönder" düğmesi. */
export const VerifyEmailNotice: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { user, resendVerification } = useAuth();
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!user || user.dogrulandi) return null;

  const handleResend = async () => {
    setIsSending(true);
    const res = await resendVerification();
    setIsSending(false);
    setState(
      res.ok
        ? { ok: true, text: `Doğrulama bağlantısı ${user.eposta} adresine gönderildi.` }
        : { ok: false, text: res.error }
    );
  };

  return (
    <div
      role="status"
      className={`bg-[#fffbeb] border border-[#fde68a] text-[#92400e] rounded-[8px] px-3 py-2.5 text-[10px] flex flex-col sm:flex-row sm:items-center gap-2 ${className}`}
    >
      <MailWarning className="w-4 h-4 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <strong className="font-bold">E-posta adresiniz doğrulanmamış.</strong>{' '}
        Sipariş verebilmek için <span className="font-semibold">{user.eposta}</span> adresine gönderilen
        bağlantıya tıklayın.
        {state && (
          <div className={`mt-1 font-semibold ${state.ok ? 'text-[#166534]' : 'text-[#dc2626]'}`}>
            {state.text}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleResend}
        disabled={isSending}
        className="shrink-0 bg-white border border-[#fde68a] hover:border-[#92400e] disabled:opacity-60 text-[#92400e] text-[10px] font-semibold px-2.5 py-1.5 rounded-[6px] cursor-pointer"
      >
        {isSending ? 'Gönderiliyor...' : 'Tekrar Gönder'}
      </button>
    </div>
  );
};
