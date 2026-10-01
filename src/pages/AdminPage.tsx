import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Ticket,
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  LogOut,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Clock,
  Key,
  X,
  Save,
  Search,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, CATEGORIES, formatPriceTL, CategorySlug } from '../../lib/products';
import { OrderResult } from '../../lib/checkout';
import { Link } from '../context/RouterContext';

export const AdminPage: React.FC = () => {
  const {
    products,
    coupons,
    orders,
    settings,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrder,
    deleteOrder,
    addCoupon,
    deleteCoupon,
    updateSettings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'coupons' | 'settings'>('dashboard');

  // Auth State
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals & Forms
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    ad: '',
    kategori: 'windows',
    fiyat: 149,
    eskiFiyat: undefined,
    indirimOrani: undefined,
    stok: true,
    kartUstEtiket: 'Windows',
    kartBaslik: 'Windows 11\nPRO',
    kartAltYazi: 'Dijital Anahtar',
    kartSureEtiketi: 'Sınırsız',
    gorselRenkleri: ['#0284c7', '#0c4a6e'],
    aciklama: '',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
    ],
  });

  // License Modal for Order
  const [selectedOrderForLicense, setSelectedOrderForLicense] = useState<OrderResult | null>(null);
  const [licenseText, setLicenseText] = useState('');

  // New Coupon Form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponRate, setNewCouponRate] = useState(15);

  // Settings Form
  const [settingsForm, setSettingsForm] = useState(settings);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Yönetim Paneli | AYMENLisans';
  }, []);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (passwordInput === 'admin' || passwordInput === 'admin123' || passwordInput === 'aymen') {
      loginAdmin('admin_authenticated_' + Date.now());
      setPasswordInput('');
    } else {
      setAuthError('Hatalı şifre. Varsayılan şifre: "admin"');
    }
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      ad: '',
      kategori: 'windows',
      fiyat: 149,
      eskiFiyat: undefined,
      indirimOrani: undefined,
      stok: true,
      kartUstEtiket: 'Windows',
      kartBaslik: 'Yeni Ürün\nLisansı',
      kartAltYazi: 'Dijital Anahtar',
      kartSureEtiketi: 'Sınırsız',
      gorselRenkleri: ['#0284c7', '#0c4a6e'],
      aciklama: 'Orijinal dijital lisans anahtarı. Ödeme sonrası anında teslim edilir.',
      ozellikListesi: [
        'Ödeme sonrası anında teslimat',
        'Adım adım aktivasyon rehberi',
        'Satış sonrası destek',
      ],
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({ ...product });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.ad || !productForm.fiyat) return;

    if (editingProduct) {
      await updateProduct(editingProduct.slug, productForm);
    } else {
      await addProduct(productForm);
    }
    setIsProductModalOpen(false);
  };

  const handleSaveLicense = async () => {
    if (!selectedOrderForLicense) return;
    await updateOrder(selectedOrderForLicense.siparisNo, {
      teslimEdilenBilgiler: licenseText,
      durum: 'Teslim Edildi',
    });
    setSelectedOrderForLicense(null);
  };

  const handleAddCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    await addCoupon(newCouponCode, Number(newCouponRate));
    setNewCouponCode('');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settingsForm);
    setSaveStatus('Ayarlar başarıyla kaydedildi!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Dashboard Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.toplamTutar || 0), 0);
  const totalOrdersCount = orders.length;
  const inStockCount = products.filter((p) => p.stok).length;
  const pendingOrdersCount = orders.filter((o) => o.durum !== 'Teslim Edildi' && o.durum !== 'İptal Edildi').length;

  // Filtered lists
  const filteredProducts = products.filter((p) =>
    p.ad.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.kategoriAdi.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    o.siparisNo.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.musteri.ad.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.musteri.eposta.toLowerCase().includes(orderSearch.toLowerCase())
  );

  // If not logged in, show Login Screen
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-[#f1f2f3]">
        <div className="max-w-[400px] w-full bg-white border border-[#ececec] rounded-[12px] p-6 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#55a80b]/15 text-[#55a80b] flex items-center justify-center mx-auto mb-3">
              <Key className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="text-[18px] font-extrabold text-[#111111]">
              AYMENLisans Yönetim Paneli
            </h1>
            <p className="text-[11px] text-[#737373] mt-1">
              Ürünleri, siparişleri, kuponları ve ayarları yönetmek için giriş yapın.
            </p>
          </div>

          {authError && (
            <div className="mb-4 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-[10px] font-semibold px-3 py-2 rounded-[8px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#374151] mb-1">
                Yönetici Şifresi
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Şifrenizi giriniz (varsayılan: admin)"
                className="w-full h-[38px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] focus:outline-none focus:border-[#55a80b] focus:bg-white"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold py-[10px] rounded-[8px] transition-colors cursor-pointer"
            >
              Yönetim Paneline Giriş Yap
            </button>
          </form>

          <div className="mt-5 text-center border-t border-[#ececec] pt-4">
            <Link
              href="/"
              className="text-[11px] text-[#737373] hover:text-[#111111] font-medium"
            >
              ← Mağazaya Geri Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f6f7] min-h-[90vh]">
      {/* Admin Üst Çubuk */}
      <div className="bg-[#111111] text-white border-b border-[#222222]">
        <div className="max-w-[1240px] mx-auto px-4 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#55a80b] flex items-center justify-center font-bold text-white text-[11px]">
                A
              </div>
              <span className="font-extrabold text-[14px] tracking-tight">
                AYMEN<span className="text-[#55a80b]">Lisans</span> Panel
              </span>
            </div>

            <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />

            <nav className="hidden sm:flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                  activeTab === 'dashboard' ? 'bg-[#55a80b] text-white' : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                Genel Bakış
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                  activeTab === 'products' ? 'bg-[#55a80b] text-white' : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                Ürünler ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                  activeTab === 'orders' ? 'bg-[#55a80b] text-white' : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                Siparişler ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('coupons')}
                className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                  activeTab === 'coupons' ? 'bg-[#55a80b] text-white' : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                Kuponlar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                  activeTab === 'settings' ? 'bg-[#55a80b] text-white' : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                Site Ayarları
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-[6px] transition-colors"
            >
              <span>Mağazayı Gör</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={logoutAdmin}
              aria-label="Çıkış Yap"
              className="text-[#a3a3a3] hover:text-white p-1.5 transition-colors cursor-pointer"
              title="Güvenli Çıkış"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Sekme Barı */}
      <div className="sm:hidden bg-[#1f1f1f] text-white px-4 py-2 flex items-center gap-2 overflow-x-auto text-[10px]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-[#55a80b]' : 'text-gray-300'}`}
        >
          Genel Bakış
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'products' ? 'bg-[#55a80b]' : 'text-gray-300'}`}
        >
          Ürünler
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'orders' ? 'bg-[#55a80b]' : 'text-gray-300'}`}
        >
          Siparişler
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'coupons' ? 'bg-[#55a80b]' : 'text-gray-300'}`}
        >
          Kuponlar
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'settings' ? 'bg-[#55a80b]' : 'text-gray-300'}`}
        >
          Ayarlar
        </button>
      </div>

      {/* Ana İçerik */}
      <div className="max-w-[1240px] mx-auto px-4 py-6">
        {/* ===================== TAB: DASHBOARD ===================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[18px] font-extrabold text-[#111111]">
                  Yönetim Genel Bakış
                </h1>
                <p className="text-[11px] text-[#737373]">
                  Canlı mağaza performansı, sipariş durumları ve hızlı işlemler.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewProductModal}
                className="bg-[#55a80b] hover:bg-[#468f07] text-white text-[11px] font-semibold px-3.5 py-2 rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Ürün Ekle</span>
              </button>
            </div>

            {/* Metrik Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#ececec] rounded-[10px] p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-[#737373] uppercase">
                    Toplam Ciro
                  </div>
                  <div className="text-[20px] font-extrabold text-[#111111] mt-0.5 tabular-nums">
                    {formatPriceTL(totalRevenue)}
                  </div>
                  <div className="text-[9px] text-[#55a80b] font-medium mt-1">
                    Aktif siparişler dahil
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#55a80b]/10 text-[#55a80b] flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-[#ececec] rounded-[10px] p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-[#737373] uppercase">
                    Toplam Sipariş
                  </div>
                  <div className="text-[20px] font-extrabold text-[#111111] mt-0.5 tabular-nums">
                    {totalOrdersCount}
                  </div>
                  <div className="text-[9px] text-[#0284c7] font-medium mt-1">
                    Son işlemler listelendi
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-[#ececec] rounded-[10px] p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-[#737373] uppercase">
                    Katalogdaki Ürünler
                  </div>
                  <div className="text-[20px] font-extrabold text-[#111111] mt-0.5 tabular-nums">
                    {products.length}
                  </div>
                  <div className="text-[9px] text-[#55a80b] font-medium mt-1">
                    {inStockCount} adeti stokta aktif
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#55a80b]/10 text-[#55a80b] flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-[#ececec] rounded-[10px] p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-[#737373] uppercase">
                    Bekleyen Teslimat
                  </div>
                  <div className="text-[20px] font-extrabold text-[#ea580c] mt-0.5 tabular-nums">
                    {pendingOrdersCount}
                  </div>
                  <div className="text-[9px] text-[#737373] font-medium mt-1">
                    Lisans gönderimi bekleniyor
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#ea580c]/10 text-[#ea580c] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Son Siparişler Tablosu Özeti */}
            <div className="bg-white border border-[#ececec] rounded-[10px] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[13px] font-bold text-[#111111]">
                  Son Gelen Siparişler
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-[11px] font-semibold text-[#55a80b] hover:underline"
                >
                  Tüm Siparişleri Gör ({orders.length}) →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-[11px] text-[#737373] py-4 text-center">
                  Henüz kaydedilmiş sipariş bulunmuyor.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-[#ececec] text-[#737373] text-[9px] uppercase">
                        <th className="py-2">Sipariş No</th>
                        <th className="py-2">Müşteri</th>
                        <th className="py-2">Ürünler</th>
                        <th className="py-2">Tutar</th>
                        <th className="py-2">Ödeme</th>
                        <th className="py-2">Durum</th>
                        <th className="py-2 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ececec]">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.siparisNo} className="hover:bg-[#fafafa]">
                          <td className="py-2.5 font-bold text-[#111111]">
                            {order.siparisNo}
                          </td>
                          <td className="py-2.5">
                            <div className="font-semibold text-[#111111]">{order.musteri.ad}</div>
                            <div className="text-[9px] text-[#737373]">{order.musteri.eposta}</div>
                          </td>
                          <td className="py-2.5 text-[#374151]">
                            {order.urunler.map((u) => `${u.adet}x ${u.ad}`).join(', ')}
                          </td>
                          <td className="py-2.5 font-bold text-[#55a80b] tabular-nums">
                            {formatPriceTL(order.toplamTutar)}
                          </td>
                          <td className="py-2.5 text-[10px]">
                            {order.odemeYontemi === 'kredi-karti' ? 'Kredi Kartı' : 'Havale/EFT'}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                order.durum === 'Teslim Edildi'
                                  ? 'bg-[#f0fdf4] text-[#166534]'
                                  : 'bg-[#fef3c7] text-[#92400e]'
                              }`}
                            >
                              {order.durum}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderForLicense(order);
                                setLicenseText(order.teslimEdilenBilgiler || '');
                              }}
                              className="text-[10px] font-semibold text-[#55a80b] hover:underline"
                            >
                              Lisans Gir / Düzenle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: PRODUCTS ===================== */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#ececec] rounded-[10px] p-4">
              <div>
                <h1 className="text-[16px] font-extrabold text-[#111111]">
                  Ürün Yönetimi ({products.length} Ürün)
                </h1>
                <p className="text-[10px] text-[#737373]">
                  Ürün fiyatlarını, stok durumlarını, başlıkları ve açıklamaları buradan anında değiştirin.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3 h-3 text-[#737373] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="h-[32px] pl-7 pr-2.5 bg-[#f6f6f7] border border-[#ececec] rounded-[6px] text-[10px] focus:outline-none focus:border-[#55a80b]"
                  />
                </div>

                <button
                  type="button"
                  onClick={openNewProductModal}
                  className="bg-[#55a80b] hover:bg-[#468f07] text-white text-[11px] font-semibold px-3 py-1.5 rounded-[6px] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Ürün Ekle</span>
                </button>
              </div>
            </div>

            {/* Ürünler Tablosu */}
            <div className="bg-white border border-[#ececec] rounded-[10px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-[#f9fafb] border-b border-[#ececec] text-[#737373] text-[9px] uppercase">
                      <th className="py-2.5 px-4">Ürün</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Fiyat</th>
                      <th className="py-2.5 px-3">Eski Fiyat</th>
                      <th className="py-2.5 px-3">Stok Durumu</th>
                      <th className="py-2.5 px-3">Süre / Etiket</th>
                      <th className="py-2.5 px-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ececec]">
                    {filteredProducts.map((p) => (
                      <tr key={p.slug} className="hover:bg-[#fafafa]">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              style={{
                                backgroundImage: `linear-gradient(160deg, ${p.gorselRenkleri[0]}, ${p.gorselRenkleri[1]})`,
                              }}
                              className="w-8 h-8 rounded-[4px] flex items-center justify-center text-[7px] font-bold text-white shrink-0 text-center leading-tight p-0.5"
                            >
                              {p.kartUstEtiket}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#111111] line-clamp-1">{p.ad}</div>
                              <div className="text-[9px] text-[#737373]">/{p.slug}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-[10px] font-semibold text-[#55a80b] uppercase">
                            {p.kategoriAdi}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-extrabold text-[#111111] tabular-nums">
                          {formatPriceTL(p.fiyat)}
                        </td>

                        <td className="py-3 px-3 text-[#9ca3af] line-through tabular-nums">
                          {p.eskiFiyat ? formatPriceTL(p.eskiFiyat) : '-'}
                        </td>

                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => updateProduct(p.slug, { stok: !p.stok })}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                              p.stok
                                ? 'bg-[#f0fdf4] text-[#166534] hover:bg-[#dcfce7]'
                                : 'bg-[#fef2f2] text-[#991b1b] hover:bg-[#fee2e2]'
                            }`}
                          >
                            {p.stok ? '✓ Stokta Var' : '✕ Stokta Yok'}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-[10px] text-[#52525b]">
                          {p.kartSureEtiketi}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditProductModal(p)}
                              className="text-[#0284c7] hover:text-[#0369a1] p-1 cursor-pointer"
                              title="Düzenle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`"${p.ad}" ürününü silmek istediğinize emin misiniz?`)) {
                                  deleteProduct(p.slug);
                                }
                              }}
                              className="text-[#ef4444] hover:text-[#b91c1c] p-1 cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: ORDERS ===================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#ececec] rounded-[10px] p-4">
              <div>
                <h1 className="text-[16px] font-extrabold text-[#111111]">
                  Sipariş Yönetimi ({orders.length} Sipariş)
                </h1>
                <p className="text-[10px] text-[#737373]">
                  Müşteri siparişlerini inceleyin, durumlarını değiştirin ve aktivasyon lisans anahtarlarını tanımlayın.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3 h-3 text-[#737373] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Sipariş no veya müşteri ara..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="h-[32px] pl-7 pr-2.5 bg-[#f6f6f7] border border-[#ececec] rounded-[6px] text-[10px] focus:outline-none focus:border-[#55a80b]"
                />
              </div>
            </div>

            <div className="bg-white border border-[#ececec] rounded-[10px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-[#f9fafb] border-b border-[#ececec] text-[#737373] text-[9px] uppercase">
                      <th className="py-2.5 px-4">Sipariş No</th>
                      <th className="py-2.5 px-3">Tarih</th>
                      <th className="py-2.5 px-3">Müşteri</th>
                      <th className="py-2.5 px-3">Telefon</th>
                      <th className="py-2.5 px-3">Satın Alınanlar</th>
                      <th className="py-2.5 px-3">Tutar</th>
                      <th className="py-2.5 px-3">Ödeme</th>
                      <th className="py-2.5 px-3">Durum</th>
                      <th className="py-2.5 px-4 text-right">Lisans / İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ececec]">
                    {filteredOrders.map((order) => (
                      <tr key={order.siparisNo} className="hover:bg-[#fafafa]">
                        <td className="py-3 px-4 font-bold text-[#111111]">
                          #{order.siparisNo}
                        </td>
                        <td className="py-3 px-3 text-[10px] text-[#737373]">
                          {order.tarih}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#111111]">{order.musteri.ad}</div>
                          <div className="text-[9px] text-[#737373]">{order.musteri.eposta}</div>
                        </td>
                        <td className="py-3 px-3 text-[10px] text-[#52525b]">
                          {order.musteri.telefon}
                        </td>
                        <td className="py-3 px-3">
                          {order.urunler.map((u) => (
                            <div key={u.slug} className="text-[10px] font-medium text-[#111111]">
                              {u.adet}x {u.ad}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-3 font-extrabold text-[#55a80b] tabular-nums">
                          {formatPriceTL(order.toplamTutar)}
                        </td>
                        <td className="py-3 px-3 text-[10px]">
                          {order.odemeYontemi === 'kredi-karti' ? 'Kredi Kartı' : 'Havale/EFT'}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={order.durum}
                            onChange={(e) =>
                              updateOrder(order.siparisNo, {
                                durum: e.target.value as OrderResult['durum'],
                              })
                            }
                            className="text-[9px] font-bold border border-[#ececec] rounded px-1.5 py-1 bg-white focus:outline-none focus:border-[#55a80b]"
                          >
                            <option value="Teslim Edildi">Teslim Edildi</option>
                            <option value="Teslimat Hazırlanıyor">Teslimat Hazırlanıyor</option>
                            <option value="Ödeme Bildirimi Bekleniyor">Ödeme Bildirimi Bekleniyor</option>
                            <option value="İptal Edildi">İptal Edildi</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderForLicense(order);
                                setLicenseText(order.teslimEdilenBilgiler || '');
                              }}
                              className="bg-[#55a80b]/15 text-[#55a80b] hover:bg-[#55a80b] hover:text-white px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Lisans Gir
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Sipariş ${order.siparisNo} silinsin mi?`)) {
                                  deleteOrder(order.siparisNo);
                                }
                              }}
                              className="text-[#ef4444] hover:text-[#b91c1c] p-1 cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: COUPONS ===================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-4 max-w-[800px]">
            <div className="bg-white border border-[#ececec] rounded-[10px] p-5">
              <h1 className="text-[16px] font-extrabold text-[#111111] mb-1">
                İndirim Kuponları Yönetimi
              </h1>
              <p className="text-[11px] text-[#737373] mb-4">
                Müşterilerin sepette kullanabileceği promosyon ve indirim kuponlarını tanımlayın.
              </p>

              {/* Yeni Kupon Formu */}
              <form onSubmit={handleAddCouponSubmit} className="flex flex-wrap items-end gap-3 pb-5 border-b border-[#ececec]">
                <div>
                  <label className="block text-[9px] font-semibold text-[#374151] mb-1">
                    Kupon Kodu
                  </label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="Örn: YAZ15"
                    className="h-[34px] px-3 uppercase bg-[#f6f6f7] border border-[#ececec] rounded-[6px] text-[11px] font-bold focus:outline-none focus:border-[#55a80b]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-[#374151] mb-1">
                    İndirim Oranı (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={newCouponRate}
                    onChange={(e) => setNewCouponRate(Number(e.target.value))}
                    className="h-[34px] w-28 px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[6px] text-[11px] font-bold focus:outline-none focus:border-[#55a80b]"
                  />
                </div>

                <button
                  type="submit"
                  className="h-[34px] bg-[#55a80b] hover:bg-[#468f07] text-white text-[11px] font-semibold px-4 rounded-[6px] transition-colors cursor-pointer"
                >
                  Kupon Ekle
                </button>
              </form>

              {/* Kupon Listesi */}
              <div className="pt-4 space-y-2">
                <h2 className="text-[12px] font-bold text-[#111111] mb-2">
                  Aktif Kuponlar
                </h2>
                {Object.entries(coupons).map(([code, rate]) => (
                  <div
                    key={code}
                    className="flex items-center justify-between p-3 bg-[#fafafa] border border-[#ececec] rounded-[8px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#55a80b]/15 text-[#55a80b] flex items-center justify-center font-bold">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[12px] font-extrabold text-[#111111] tracking-wide">
                          {code}
                        </div>
                        <div className="text-[9px] text-[#737373]">
                          Sepette %{rate} anında indirim uygular
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-extrabold text-[#55a80b]">
                        %{rate} İndirim
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteCoupon(code)}
                        className="text-[#ef4444] hover:text-[#b91c1c] p-1 cursor-pointer"
                        title="Kuponu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: SETTINGS ===================== */}
        {activeTab === 'settings' && (
          <div className="space-y-4 max-w-[800px]">
            <div className="bg-white border border-[#ececec] rounded-[10px] p-5">
              <h1 className="text-[16px] font-extrabold text-[#111111] mb-1">
                Mağaza ve İletişim Ayarları
              </h1>
              <p className="text-[11px] text-[#737373] mb-4">
                Sitenin en üst duyuru bandını, banka hesap (IBAN) ve ödeme ayarlarını buradan yönetin.
              </p>

              {saveStatus && (
                <div className="mb-4 bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-[11px] font-semibold px-3 py-2 rounded-[8px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#55a80b]" />
                  <span>{saveStatus}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#374151] mb-1">
                    Mağaza Adı
                  </label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] focus:outline-none focus:border-[#55a80b]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#374151] mb-1">
                    Üst Duyuru / Kampanya Bandı Metni
                  </label>
                  <input
                    type="text"
                    value={settingsForm.announcement}
                    onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                    className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] focus:outline-none focus:border-[#55a80b]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#374151] mb-1">
                      Destek E-Posta
                    </label>
                    <input
                      type="email"
                      value={settingsForm.supportEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                      className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] focus:outline-none focus:border-[#55a80b]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#374151] mb-1">
                      WhatsApp Destek Hattı
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] focus:outline-none focus:border-[#55a80b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#374151] mb-1">
                    Havale / EFT Banka Hesap Bilgisi (IBAN & Alıcı)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.bankIban}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankIban: e.target.value })}
                    className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] focus:outline-none focus:border-[#55a80b]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#374151] mb-1">
                    Kartlı Ödeme Yönlendirme URL'si (Opsiyonel / PAYMENT_PROVIDER_CHECKOUT_URL)
                  </label>
                  <input
                    type="text"
                    placeholder="https://odeme.iyzico.com/... veya boş bırakın"
                    value={settingsForm.paymentProviderUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, paymentProviderUrl: e.target.value })}
                    className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] focus:outline-none focus:border-[#55a80b]"
                  />
                  <span className="text-[9px] text-[#737373] mt-1 block">
                    Boş bırakıldığında simülasyon modunda doğrudan sipariş oluşturulur.
                  </span>
                </div>

                <button
                  type="submit"
                  className="bg-[#55a80b] hover:bg-[#468f07] text-white text-[12px] font-semibold px-5 py-2.5 rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Ayarları Kaydet</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ===================== MODAL: ÜRÜN EKLE / DÜZENLE ===================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#ececec] rounded-[12px] max-w-[600px] w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#ececec] mb-4">
              <h2 className="text-[15px] font-bold text-[#111111]">
                {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-[#737373] hover:text-[#111111] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#374151] mb-1">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  required
                  value={productForm.ad}
                  onChange={(e) => setProductForm({ ...productForm, ad: e.target.value })}
                  placeholder="Örn: Windows 11 Pro | Süresiz Lisans"
                  className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] focus:outline-none focus:border-[#55a80b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#374151] mb-1">
                    Kategori
                  </label>
                  <select
                    value={productForm.kategori}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        kategori: e.target.value as CategorySlug,
                      })
                    }
                    className="w-full h-[36px] px-2.5 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] focus:outline-none focus:border-[#55a80b]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.ad}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#374151] mb-1">
                    Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.fiyat}
                    onChange={(e) => setProductForm({ ...productForm, fiyat: Number(e.target.value) })}
                    className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] focus:outline-none focus:border-[#55a80b]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#374151] mb-1">
                    Eski Fiyat (Opsiyonel)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.eskiFiyat || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        eskiFiyat: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="İndirim öncesi"
                    className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] focus:outline-none focus:border-[#55a80b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#374151] mb-1">
                    Kart Üst Etiket
                  </label>
                  <input
                    type="text"
                    value={productForm.kartUstEtiket}
                    onChange={(e) => setProductForm({ ...productForm, kartUstEtiket: e.target.value })}
                    placeholder="Örn: Windows / AI PRO"
                    className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] focus:outline-none focus:border-[#55a80b]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#374151] mb-1">
                    Kart Süre Etiketi
                  </label>
                  <input
                    type="text"
                    value={productForm.kartSureEtiketi}
                    onChange={(e) => setProductForm({ ...productForm, kartSureEtiketi: e.target.value })}
                    placeholder="Örn: Sınırsız / 12 AY"
                    className="w-full h-[36px] px-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] focus:outline-none focus:border-[#55a80b]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#374151] mb-1">
                    Stok Durumu
                  </label>
                  <select
                    value={productForm.stok ? 'true' : 'false'}
                    onChange={(e) => setProductForm({ ...productForm, stok: e.target.value === 'true' })}
                    className="w-full h-[36px] px-2.5 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] focus:outline-none focus:border-[#55a80b]"
                  >
                    <option value="true">Stokta Var</option>
                    <option value="false">Stokta Yok</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#374151] mb-1">
                  Açıklama
                </label>
                <textarea
                  rows={3}
                  value={productForm.aciklama}
                  onChange={(e) => setProductForm({ ...productForm, aciklama: e.target.value })}
                  className="w-full p-2.5 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] focus:outline-none focus:border-[#55a80b]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ececec]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-[#ececec] rounded-[8px] text-[11px] font-medium text-[#374151] hover:bg-[#fafafa] cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#55a80b] hover:bg-[#468f07] text-white rounded-[8px] text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: LİSANS ANAHTARI GİRİŞİ ===================== */}
      {selectedOrderForLicense && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#ececec] rounded-[12px] max-w-[500px] w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#ececec] mb-4">
              <div>
                <h2 className="text-[14px] font-bold text-[#111111]">
                  Lisans Teslimatı: #{selectedOrderForLicense.siparisNo}
                </h2>
                <p className="text-[10px] text-[#737373]">
                  Müşteri: {selectedOrderForLicense.musteri.ad} ({selectedOrderForLicense.musteri.eposta})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForLicense(null)}
                className="text-[#737373] hover:text-[#111111] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#374151] mb-1">
                  Müşteriye Teslim Edilecek Lisans Anahtarı veya Giriş Bilgileri
                </label>
                <textarea
                  rows={4}
                  value={licenseText}
                  onChange={(e) => setLicenseText(e.target.value)}
                  placeholder="Örn: Orijinal Lisans Anahtarınız: W269N-WFGWX-YVC9B-4J6C9-T83GX"
                  className="w-full p-3 bg-[#f6f6f7] border border-[#ececec] rounded-[8px] text-[11px] text-[#111111] font-mono focus:outline-none focus:border-[#55a80b]"
                />
                <span className="text-[9px] text-[#737373] mt-1 block">
                  Kaydettiğinizde müşterinin 'Hesabım' sayfasında ve sipariş detayında anında görüntülenecektir.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForLicense(null)}
                  className="px-4 py-2 border border-[#ececec] rounded-[8px] text-[11px] font-medium text-[#374151] hover:bg-[#fafafa] cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={handleSaveLicense}
                  className="px-4 py-2 bg-[#55a80b] hover:bg-[#468f07] text-white rounded-[8px] text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Lisansı Kaydet ve Teslim Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
