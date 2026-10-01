import React, { useState, useEffect } from 'react';
import {
  Package,
  Wallet,
  UserCog,
  KeyRound,
  Copy,
  Check,
  Truck,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatPriceSymbol } from '../../lib/products';
import { ProductVisual } from '../components/ProductVisual';
import { Link } from '../context/RouterContext';

type AccountTab = 'siparislerim' | 'cuzdanim' | 'bilgilerim' | 'sifre';

export const AccountPage: React.FC = () => {
  const { savedOrders } = useCart();
  const { products } = useStore();
  const [activeTab, setActiveTab] = useState<AccountTab>('siparislerim');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('Eymen Alp');
  const [profileEmail, setProfileEmail] = useState('aimnik00@gmail.com');
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Hesabım - Ucuz Lisans Satın Al | AYMENLisans';
    if (savedOrders.length > 0) {
      setProfileName(savedOrders[0].musteri.ad);
      setProfileEmail(savedOrders[0].musteri.eposta);
    }
  }, [savedOrders]);

  const handleCopyInfo = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg('Hesap bilgileriniz başarıyla güncellendi.');
    setTimeout(() => setProfileSavedMsg(null), 3000);
  };

  return (
    <div className="bg-[#fafafa] py-6 min-h-[70vh]">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-5">
          {/* Sol Profil Kartı */}
          <aside
            aria-label="Hesap Menüsü"
            className="w-full md:w-[220px] shrink-0 bg-white border border-[#ececec] rounded-[10px] overflow-hidden"
          >
            <div className="bg-gradient-to-b from-[#3f7d08] to-[#295205] p-4 text-center text-white">
              <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 text-white font-bold text-[15px] flex items-center justify-center mx-auto mb-2">
                {profileName.charAt(0).toLocaleUpperCase('tr-TR')}
              </div>
              <div className="text-[12px] font-bold truncate">{profileName}</div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-[9px] text-white/80 truncate max-w-[120px]">
                  {profileEmail}
                </span>
                <span className="bg-black/30 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tabular-nums">
                  0.00 ₺
                </span>
              </div>
            </div>

            <nav className="p-2 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('siparislerim')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-[7px] text-[10px] transition-colors cursor-pointer ${
                  activeTab === 'siparislerim'
                    ? 'bg-[#f0fdf4] text-[#55a80b] font-bold'
                    : 'text-[#374151] hover:bg-[#f6f6f7] font-medium'
                }`}
              >
                <Package className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Siparişlerim</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cuzdanim')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-[7px] text-[10px] transition-colors cursor-pointer ${
                  activeTab === 'cuzdanim'
                    ? 'bg-[#f0fdf4] text-[#55a80b] font-bold'
                    : 'text-[#374151] hover:bg-[#f6f6f7] font-medium'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Cüzdanım</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bilgilerim')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-[7px] text-[10px] transition-colors cursor-pointer ${
                  activeTab === 'bilgilerim'
                    ? 'bg-[#f0fdf4] text-[#55a80b] font-bold'
                    : 'text-[#374151] hover:bg-[#f6f6f7] font-medium'
                }`}
              >
                <UserCog className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Bilgilerimi Güncelle</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sifre')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-[7px] text-[10px] transition-colors cursor-pointer ${
                  activeTab === 'sifre'
                    ? 'bg-[#f0fdf4] text-[#55a80b] font-bold'
                    : 'text-[#374151] hover:bg-[#f6f6f7] font-medium'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Şifre Değiştir</span>
              </button>

              <div className="pt-2 border-t border-[#ececec]">
                <Link
                  href="/admin"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[7px] text-[10px] text-[#55a80b] hover:bg-[#f0fdf4] font-bold transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Yönetici Paneli (Admin)</span>
                </Link>
              </div>
            </nav>
          </aside>

          {/* Sağ İçerik Sütunu */}
          <div className="flex-1 min-w-0 w-full">
            {activeTab === 'siparislerim' && (
              <div>
                <h1 className="text-[15px] font-bold text-[#111111] mb-3.5">
                  Siparişlerim & Dosyalarım
                </h1>

                {savedOrders.length === 0 ? (
                  <div className="bg-white border border-[#ececec] rounded-[10px] p-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#55a80b]/10 text-[#55a80b] flex items-center justify-center mx-auto mb-2.5">
                      <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h2 className="text-[13px] font-bold text-[#111111] mb-1">
                      Henüz aktif bir siparişiniz bulunmuyor
                    </h2>
                    <p className="text-[10px] text-[#737373] mb-4">
                      Satın aldığınız lisans anahtarları ve aktivasyon bilgileri burada listelenir.
                    </p>
                    <Link
                      href="/urunler"
                      className="inline-flex items-center gap-1.5 bg-[#55a80b] hover:bg-[#468f07] text-white text-[11px] font-semibold px-3.5 py-2 rounded-[8px] transition-colors"
                    >
                      <span>Ürünleri İncele</span>
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedOrders.map((order) =>
                      order.urunler.map((line, idx) => {
                        const product = products.find((p) => p.slug === line.slug);
                        const cardKey = `${order.siparisNo}-${line.slug}-${idx}`;
                        const deliveryText =
                          order.teslimEdilenBilgiler ||
                          `Sipariş Kodu: #${order.siparisNo} | Ürün: ${line.ad} | E-Posta: ${order.musteri.eposta}`;

                        return (
                          <div
                            key={cardKey}
                            className="bg-white border border-[#ececec] rounded-[10px] p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                {product && (
                                  <div className="w-12 h-12 shrink-0">
                                    <ProductVisual
                                      product={product}
                                      size="xs"
                                      showDiscountBadge={false}
                                    />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <h2 className="text-[11px] font-bold text-[#111111] line-clamp-1">
                                    {line.ad}
                                  </h2>
                                  <div className="text-[9px] text-[#737373] mt-0.5">
                                    Sipariş Kodu: #{order.siparisNo} · {order.tarih}
                                  </div>

                                  <div className="mt-1.5">
                                    <span
                                      className={`inline-flex items-center gap-1 text-white text-[8px] font-semibold px-2 py-0.5 rounded-[4px] ${
                                        order.durum === 'Teslim Edildi'
                                          ? 'bg-[#55a80b]'
                                          : 'bg-[#0284c7]'
                                      }`}
                                    >
                                      <Truck className="w-2.5 h-2.5" aria-hidden="true" />
                                      <span>{order.durum}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0 tabular-nums">
                                <div className="text-[12px] font-extrabold text-[#55a80b]">
                                  {formatPriceSymbol(line.satirToplami)}
                                </div>
                                {order.kuponKodu && (
                                  <span className="inline-block mt-1 bg-[#f6f6f7] border border-[#ececec] text-[#374151] text-[8px] font-bold px-1.5 py-0.5 rounded">
                                    {order.kuponKodu}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Teslim Edilen Bilgiler / Lisans Alanı */}
                            <div className="bg-[#fafafa] border border-[#ececec] rounded-[8px] p-3 text-[9px] text-[#374151] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#111111]">
                                  🔑 Teslim Edilen Bilgiler & Lisans:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyInfo(cardKey, deliveryText)}
                                  className="inline-flex items-center gap-1 bg-white border border-[#ececec] hover:border-[#55a80b] text-[#111111] text-[9px] font-semibold px-2 py-1 rounded-[6px] shrink-0 cursor-pointer"
                                >
                                  {copiedId === cardKey ? (
                                    <>
                                      <Check className="w-2.5 h-2.5 text-[#55a80b]" aria-hidden="true" />
                                      <span>Kopyalandı</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-2.5 h-2.5" aria-hidden="true" />
                                      <span>Kopyala</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="font-mono text-[9px] text-[#1f2937] whitespace-pre-line bg-white p-2 rounded border border-[#ececec]">
                                {deliveryText}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cuzdanim' && (
              <div className="bg-white border border-[#ececec] rounded-[10px] p-5">
                <h1 className="text-[14px] font-bold text-[#111111] mb-2">
                  Cüzdanım
                </h1>
                <p className="text-[11px] text-[#737373] mb-4">
                  Mevcut bakiye tutarınız:{' '}
                  <strong className="text-[#55a80b] font-bold">0.00 TL</strong>
                </p>
                <p className="text-[10px] text-[#52525b]">
                  Tüm alışverişlerinizde sepet adımında doğrudan güvenli ödeme veya Havale/EFT yöntemini kullanabilirsiniz.
                </p>
              </div>
            )}

            {activeTab === 'bilgilerim' && (
              <div className="bg-white border border-[#ececec] rounded-[10px] p-5">
                <h1 className="text-[14px] font-bold text-[#111111] mb-3.5">
                  Bilgilerimi Güncelle
                </h1>
                {profileSavedMsg && (
                  <div
                    role="status"
                    className="mb-3 bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-[10px] font-medium px-3 py-2 rounded-[8px]"
                  >
                    {profileSavedMsg}
                  </div>
                )}
                <form onSubmit={handleProfileSave} className="space-y-3 max-w-[400px]">
                  <div>
                    <label
                      htmlFor="acc-name"
                      className="block text-[9px] font-semibold text-[#374151] mb-1"
                    >
                      Adınız Soyadınız
                    </label>
                    <input
                      id="acc-name"
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full h-[34px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] focus:outline-none focus:border-[#55a80b] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="acc-email"
                      className="block text-[9px] font-semibold text-[#374151] mb-1"
                    >
                      E-Posta Adresi
                    </label>
                    <input
                      id="acc-email"
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full h-[34px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] focus:outline-none focus:border-[#55a80b] focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#55a80b] hover:bg-[#468f07] text-white text-[11px] font-semibold px-4 py-2 rounded-[8px] transition-colors cursor-pointer"
                  >
                    Değişiklikleri Kaydet
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'sifre' && (
              <div className="bg-white border border-[#ececec] rounded-[10px] p-5">
                <h1 className="text-[14px] font-bold text-[#111111] mb-3.5">
                  Şifre Değiştir
                </h1>
                <form onSubmit={handleProfileSave} className="space-y-3 max-w-[400px]">
                  <div>
                    <label
                      htmlFor="acc-current-pass"
                      className="block text-[9px] font-semibold text-[#374151] mb-1"
                    >
                      Mevcut Şifre
                    </label>
                    <input
                      id="acc-current-pass"
                      type="password"
                      placeholder="••••••••"
                      className="w-full h-[34px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] focus:outline-none focus:border-[#55a80b] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="acc-new-pass"
                      className="block text-[9px] font-semibold text-[#374151] mb-1"
                    >
                      Yeni Şifre
                    </label>
                    <input
                      id="acc-new-pass"
                      type="password"
                      placeholder="En az 8 karakter"
                      className="w-full h-[34px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] focus:outline-none focus:border-[#55a80b] focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#55a80b] hover:bg-[#468f07] text-white text-[11px] font-semibold px-4 py-2 rounded-[8px] transition-colors cursor-pointer"
                  >
                    Şifreyi Güncelle
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
