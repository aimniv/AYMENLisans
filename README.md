# AYMENLisans - Dijital Lisans & Abonelik E-Ticaret Platformu

**AYMENLisans**, Windows, Microsoft Office, yapay zeka araçları ve grafik tasarım aboneliklerinin güvenli, hızlı ve anında teslimatla satışa sunulduğu modern bir dijital e-ticaret platformudur.

Kullanıcı dostu, kompakt ve minimalist bir tasarıma sahip olan platform; dinamik ürün yönetimi, kupon sistemi, sipariş takibi ve doğrudan web adresinden erişilebilen **`/admin`** yönetim paneli ile birlikte gelir.

---

## 🚀 Öne Çıkan Özellikler

- **🎨 Modern & Kompakt Arayüz:**
  - Temiz beyaz zemin (`#fafafa`), marka yeşili (`#55a80b`) ve koyu footer (`#111111`).
  - Inter yazı tipi, yüksek okunabilirlik ve optimize edilmiş kompakt tipografi (9–12px arayüz öğeleri).
  - Mobil, tablet ve masaüstü uyumlu (responsive) düzen.

- **⚡ Kod ile Üretilen Dijital Ürün Kartları:**
  - Harici resim dosyalarına veya üçüncü taraf logolarına bağımlılık olmadan, CSS ile oluşturulan 160° diyagonal gradyanlı özel dijital kartlar.
  - Kart içi çentik, kategori etiketi, başlık, alt yazı, süre rozeti ve stokta olmayan ürünler için gri tonlu (%40 saydam) görünüm.

- **🛒 Sepet & Kupon Sistemi:**
  - `localStorage` tabanlı (`cart:v1`) sepet durumu ile sayfa yenilense bile sepet korunur.
  - Header üzerinde anlık güncellenen sepet sayacı rozeti.
  - Dinamik kupon desteği (Örn: `%10` indirim sağlayan `HOSGELDIN` kuponu).
  - Adet seçici (1–10 arası) ve anında tutar hesaplama.

- **🔒 Güvenli Ödeme Mimarisi:**
  - Sitede kart numarası, son kullanma tarihi veya CVV bilgisi **toplanmaz** ve **saklanmaz**.
  - Kredi / Banka kartı seçildiğinde lisanslı ödeme kuruluşunun (iyzico, PayTR vb.) barındırılan güvenli ödeme sayfasına yönlendirme yapılır.
  - Havale / EFT seçeneğiyle sipariş oluşturulup IBAN ve ödeme bildirim talimatları e-posta ile iletilir.
  - Sunucu tarafında (`/api/checkout`) ürün fiyatları katalogdan doğrulanır, kupon uygulanır ve `SP-XXXX` sipariş numarası üretilir.

- **👑 Kapsamlı Yönetim Paneli (`/admin`):**
  - **Doğrudan Erişim:** `siteninlinki/admin` adresi üzerinden yönetici girişi.
  - **Genel Bakış (Dashboard):** Toplam ciro (₺), toplam sipariş, aktif ürünler ve bekleyen lisans teslimatları.
  - **Ürün Yönetimi:** Yeni ürün ekleme, fiyat güncelleme, stok açma/kapama, ürün silme ve renk gradyanı belirleme.
  - **Sipariş Yönetimi:** Tüm müşteri siparişlerini listeleme, durum güncelleme (Teslim Edildi, Hazırlanıyor vb.) ve **lisans anahtarı tanımlama**.
  - **Kupon Yönetimi:** İstenilen kod ve yüzde oranıyla yeni indirim kuponları ekleme / silme.
  - **Mağaza Ayarları:** Sitenin en üst duyuru bandı, destek e-posta adresi, WhatsApp numarası ve banka IBAN bilgilerini canlı olarak değiştirme.

- **👤 Müşteri Hesabım (`/hesabim`):**
  - Müşterinin satın aldığı ürünlerin teslimat durumunu görmesi.
  - Yöneticinin tanımladığı lisans anahtarlarını ve kurulum notlarını tek tıkla kopyalama (`Kopyala` butonu).

---

## 📂 Sayfa ve Rota Yapısı

| Rota | Açıklama |
| :--- | :--- |
| `/` | Koyu hero, güven kartları, kategori butonları ve öne çıkan ürünler. |
| `/windows` | Windows 10 & 11 lisansları, 170px filtre çubuğu ve sıralama. |
| `/microsoft` | Microsoft Office 365, 2024, 2021 lisans anahtarları. |
| `/yapay-zeka` | ChatGPT Plus, Google AI Pro, Claude, Perplexity Pro paketleri. |
| `/tasarim-araclari` | Adobe Creative Cloud, Canva Pro, CapCut, Envato lisansları. |
| `/genel` | Spotify, YouTube Premium, Duolingo, Antivirüs ürünleri. |
| `/urunler` | Katalogdaki tüm ürünlerin listelendiği sayfa. |
| `/ara?q=...` | Başlık, açıklama ve kategoriye göre anlık arama sonuçları. |
| `/urun/[slug]` | Ürün detay, özellik listesi, adet seçici ve sepete ekleme. |
| `/sepet` | Ürün listesi, adet güncelleme, kupon uygulama ve sipariş özeti. |
| `/checkout` | Ad, telefon, fatura tipi, ödeme yöntemi seçimi (kart bilgisi toplanmaz). |
| `/siparis-tamamlandi` | Sipariş onay ekranı, sipariş kodu ve teslimat yönergesi. |
| `/hesabim` | Müşteri siparişleri, lisans anahtarları ve profil bilgileri. |
| `/iletisim` | Destek kanalları, çalışma saatleri ve iletişim formu. |
| **`/admin`** | **Tüm sitenin yönetildiği şifreli yönetim paneli.** |

---

## 🔑 Yönetici (Admin) Giriş Bilgileri

Yönetim paneline erişmek için tarayıcınızdan **`/admin`** adresine gidin:

- **Varsayılan Şifre:** `admin` (ayrıca `admin123` veya `aymen` ile de giriş yapılabilir)
- Şifreyi değiştirmek için `.env` dosyasına `ADMIN_PASSWORD="yeni_sifreniz"` yazabilirsiniz.

---

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Motion, Lucide React
- **Backend:** Express.js, Node.js, TSX
- **Derleme / Sunucu:** Vite 8, Express SPA Middleware

---

## 💻 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için:

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın (Port 3000)
npm run dev

# 3. Üretim (Production) derlemesi
npm run build

# 4. Sunucuyu üretim modunda başlatın
npm start
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

---

## ⚙️ Ortam Değişkenleri (`.env`)

```env
# İsteğe bağlı harici ödeme sağlayıcısı yönlendirme URL'si (iyzico, PayTR vb.)
# Boş bırakıldığında simülasyon modunda doğrudan sipariş tamamlanır
PAYMENT_PROVIDER_CHECKOUT_URL=""

# Yönetim paneli giriş şifresi
ADMIN_PASSWORD="admin"
```

---

## 📄 Lisans

© 2026 AYMENLisans. Tüm hakları saklıdır.
