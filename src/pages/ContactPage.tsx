import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Clock, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ContactPage: React.FC = () => {
  const { settings } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'İletişim - Ucuz Lisans Satın Al | AYMENLisans';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 3) {
      setError('Lütfen adınızı ve soyadınızı giriniz (en az 3 karakter).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    if (subject.trim().length < 3) {
      setError('Lütfen mesaj konusunu belirtiniz.');
      return;
    }
    if (message.trim().length < 10) {
      setError('Mesajınız en az 10 karakter olmalıdır.');
      return;
    }

    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="bg-[#fafafa] pb-8">
      <section className="bg-[#111111] text-white py-10 border-b border-[#ececec] text-center">
        <div className="max-w-[1100px] mx-auto px-4">
          <h1 className="text-[24px] font-extrabold tracking-tight mb-1.5">
            Bize Ulaşın
          </h1>
          <p className="text-[11px] text-[#a3a3a3]">
            Sorularınız mı var? Ekibimiz size yardımcı olmaktan mutluluk duyar.
          </p>
        </div>
      </section>

      <div className="max-w-[1100px] mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 max-w-[880px] mx-auto">
          {/* Sol: İletişim Bilgileri */}
          <div className="md:col-span-5 bg-white border border-[#ececec] rounded-[10px] p-5 space-y-4">
            <h2 className="text-[14px] font-bold text-[#111111]">
              İletişim Bilgileri
            </h2>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#55a80b]/10 text-[#55a80b] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-[11px] font-bold text-[#111111]">
                    Dijital Teslimat Merkezi
                  </h3>
                  <p className="text-[10px] text-[#737373] leading-relaxed">
                    Tüm lisans anahtarları ve abonelikler otomatik sistem üzerinden e-posta ile anında teslim edilir.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#55a80b]/10 text-[#55a80b] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-[11px] font-bold text-[#111111]">
                    Çalışma Saatleri
                  </h3>
                  <p className="text-[10px] text-[#55a80b] font-semibold">
                    {settings.workHours || 'Hafta içi 09:00 - 18:00'}
                  </p>
                  <p className="text-[9px] text-[#737373]">
                    7/24 kesintisiz otomatik aktivasyon
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#55a80b]/10 text-[#55a80b] flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-[11px] font-bold text-[#111111]">
                    WhatsApp Destek
                  </h3>
                  <p className="text-[10px] text-[#55a80b] font-semibold">
                    {settings.whatsappNumber || '+90 536 565 70 03'}
                  </p>
                  <p className="text-[9px] text-[#737373]">
                    Ortalama yanıt süresi: 15 dk
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#55a80b]/10 text-[#55a80b] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-[11px] font-bold text-[#111111]">
                    E-Posta
                  </h3>
                  <a
                    href={`mailto:${settings.supportEmail || 'destek@aymenlisans.com'}`}
                    className="text-[10px] text-[#55a80b] hover:underline font-medium"
                  >
                    {settings.supportEmail || 'destek@aymenlisans.com'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ: Mesaj Gönder Formu */}
          <div className="md:col-span-7 bg-white border border-[#ececec] rounded-[10px] p-5">
            <h2 className="text-[14px] font-bold text-[#111111] mb-4">
              Mesaj Gönder
            </h2>

            {submitted && (
              <div
                role="status"
                className="mb-4 bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-[10px] font-medium px-3 py-2.5 rounded-[8px] flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#55a80b] shrink-0" aria-hidden="true" />
                <span>
                  Mesajınız başarıyla iletildi. Destek ekibimiz en kısa sürede e-posta adresinize dönüş yapacaktır.
                </span>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-4 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-[10px] font-medium px-3 py-2 rounded-[8px]"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-[9px] font-semibold text-[#374151] mb-1"
                  >
                    Adınız Soyadınız
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (submitted) setSubmitted(false);
                    }}
                    placeholder="Ad Soyad"
                    className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#55a80b] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-[9px] font-semibold text-[#374151] mb-1"
                  >
                    E-Posta Adresiniz
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (submitted) setSubmitted(false);
                    }}
                    placeholder="ornek@email.com"
                    className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#55a80b] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-[9px] font-semibold text-[#374151] mb-1"
                >
                  Konu
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ne hakkında görüşmek istersiniz?"
                  className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#55a80b] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-[9px] font-semibold text-[#374151] mb-1"
                >
                  Mesajınız
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı buraya yazın..."
                  className="w-full p-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#55a80b] focus:bg-white transition-colors resize-y"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold py-[10px] px-[14px] rounded-[8px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Mesajı Gönder</span>
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
