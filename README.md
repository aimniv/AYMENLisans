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

- **🔒 Güvenli Ödeme Mimarisi (iyzico):**
  - Sitede kart numarası, son kullanma tarihi veya CVV bilgisi **toplanmaz** ve **saklanmaz**; müşteri iyzico'nun barındırılan **Ortak Ödeme Sayfası**'na yönlendirilir.
  - Akış: sipariş `Ödeme Bekleniyor` olarak kaydedilir → iyzico ödeme oturumu açılır → müşteri öder → iyzico müşteriyi `/odeme/iyzico/callback` adresine döndürür → sunucu sonucu iyzico'dan **token ile kendisi sorgular** (yanıt imzası doğrulanır; sipariş no ve tutar eşleşmelidir) → sipariş `Teslimat Hazırlanıyor` olur. Başarısız ödemede sipariş `İptal Edildi` olur ve sepet korunur.
  - Müşteri dönüş adresine ulaşamazsa (sekme kapandı vb.) yönetici panelindeki siparişte **Ödemeyi Sorgula** düğmesiyle ödemeyi iyzico'dan yeniden sorgulayabilir.
  - Havale / EFT seçeneğiyle sipariş oluşturulup IBAN ve ödeme bildirim talimatları iletilir.
  - Sunucu tarafında (`/api/checkout`) ürün fiyatları katalogdan doğrulanır, kupon uygulanır ve `SP-XXXX` sipariş numarası üretilir.

- **👑 Kapsamlı Yönetim Paneli (`/admin`):**
  - **Doğrudan Erişim:** `siteninlinki/admin` adresi üzerinden yönetici girişi.
  - **Genel Bakış (Dashboard):** Toplam ciro (₺), toplam sipariş, aktif ürünler ve bekleyen lisans teslimatları.
  - **Ürün Yönetimi:** Yeni ürün ekleme, fiyat güncelleme, stok açma/kapama, ürün silme ve renk gradyanı belirleme.
  - **Sipariş Yönetimi:** Tüm müşteri siparişlerini listeleme, durum güncelleme (Teslim Edildi, Hazırlanıyor vb.) ve **lisans anahtarı tanımlama**.
  - **Kupon Yönetimi:** İstenilen kod ve yüzde oranıyla yeni indirim kuponları ekleme / silme.
  - **Mağaza Ayarları:** Sitenin en üst duyuru bandı, destek e-posta adresi, WhatsApp numarası ve banka IBAN bilgilerini canlı olarak değiştirme.

- **👤 Üyelik & Müşteri Hesabım (`/giris`, `/hesabim`):**
  - E-posta + şifre ile üye olma ve giriş yapma (`/giris`, `/kayit`). Sipariş vermek için giriş gerekir.
  - Müşterinin yalnızca **kendi** siparişlerini, teslimat durumunu ve yöneticinin tanımladığı lisans anahtarlarını görmesi (`Kopyala` butonu).
  - Ad / e-posta / telefon güncelleme ve şifre değiştirme (şifre değişince diğer cihazlardaki oturumlar kapanır).
  - **E-posta doğrulama:** Kayıtta doğrulama bağlantısı (24 saat) gönderilir; sipariş vermek için e-posta doğrulanmalıdır. E-posta adresi değişirse yeniden doğrulanır.
  - **Şifre sıfırlama:** `/sifremi-unuttum` ile 1 saat geçerli, tek kullanımlık bağlantı gönderilir; sıfırlayınca tüm oturumlar kapanır. Hesap var/yok aynı yanıt verilir.

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
| `/checkout` | Ad, telefon, fatura tipi, ödeme yöntemi seçimi (giriş gerekir, kart bilgisi toplanmaz). |
| `/siparis-tamamlandi` | Sipariş onay ekranı, sipariş kodu ve teslimat yönergesi. |
| `/odeme-basarisiz` | Kart ödemesi tamamlanamadığında bilgilendirme ve tekrar deneme. |
| `/giris`, `/kayit` | Üye girişi ve üyelik oluşturma. |
| `/sifremi-unuttum`, `/sifre-sifirla` | Şifre sıfırlama isteği ve yeni şifre belirleme. |
| `/eposta-dogrula` | E-postadaki doğrulama bağlantısının açıldığı sayfa. |
| `/hesabim` | Müşteri siparişleri, lisans anahtarları ve profil bilgileri (giriş gerekir). |
| `/iletisim` | Destek kanalları, çalışma saatleri ve iletişim formu. |
| **`/admin`** | **Tüm sitenin yönetildiği şifreli yönetim paneli.** |

---

## 🔑 Yönetici (Admin) Girişi

Yönetim paneli (`/admin`) ayrı bir şifre yerine **yönetici rolündeki üye hesabıyla** açılır:

- **E-posta:** `ADMIN_EMAIL` (varsayılan: `admin@aymenlisans.com`)
- **Şifre:** `ADMIN_PASSWORD` (en az 8 karakter). Tanımlıysa her açılışta hesap bu şifreye eşitlenir.
- `ADMIN_PASSWORD` tanımlı değilse ve hesap henüz yoksa sunucu rastgele bir şifre üretir ve **ilk açılışta konsola bir kez yazar**.

> Eski sabit şifreler (`admin`, `admin123`, `aymen`) kaldırılmıştır.

---

## 🔌 Backend & API

Veriler **SQLite** (`node:sqlite`, Node ≥ 22.5) ile `data/aymenlisans.db` dosyasında kalıcı tutulur; ilk açılışta katalog, kuponlar ve ayarlar tohumlanır. Şifreler `scrypt` ile hash'lenir, oturumlar `HttpOnly` çerezdeki rastgele token ile yönetilir (veritabanında yalnızca hash'i saklanır, 30 gün geçerli). Giriş/kayıt denemeleri hız sınırlıdır; durum değiştiren isteklerde aynı-site (Origin) kontrolü yapılır.

| Uç nokta | Yetki | Açıklama |
| :--- | :--- | :--- |
| `POST /api/auth/register`, `/login`, `/logout` | herkes | Üyelik, giriş, çıkış |
| `GET /api/auth/me` | herkes | Oturumdaki kullanıcı (yoksa `null`) |
| `POST /api/auth/verify-email` | herkes | E-posta doğrulama token'ını tüketir |
| `POST /api/auth/resend-verification` | üye | Doğrulama e-postasını tekrar gönderir (saatte 3) |
| `POST /api/auth/forgot-password`, `/reset-password` | herkes | Şifre sıfırlama bağlantısı iste / yeni şifre belirle |
| `PUT /api/auth/profile`, `/password` | üye | Profil ve şifre güncelleme |
| `GET /api/my/orders` | üye | Üyenin kendi siparişleri ve lisansları |
| `POST /api/checkout` | doğrulanmış üye | Sipariş oluşturur (fiyat/kupon sunucuda hesaplanır); kartta iyzico ödeme adresini döndürür |
| `POST /odeme/iyzico/callback` | iyzico | Ödeme sonrası dönüş; sonuç iyzico'dan sorgulanır, müşteri yönlendirilir |
| `POST /api/orders/:no/verify-payment` | admin | Bekleyen kart ödemesini iyzico'dan yeniden sorgular |
| `GET /api/products` | herkes | Ürün kataloğu |
| `POST/PUT/DELETE /api/products` | admin | Ürün yönetimi |
| `GET/PUT/DELETE /api/orders` | admin | Tüm siparişler, durum ve lisans tanımlama |
| `POST /api/coupons/validate` | herkes | Tek bir kuponu doğrular (liste gizlidir) |
| `GET/POST/DELETE /api/coupons` | admin | Kupon yönetimi |
| `GET /api/settings` | herkes (ödeme adresi hariç) | Mağaza ayarları |
| `POST /api/settings` | admin | Mağaza ayarlarını günceller |

Testler: `npm test` (üyelik, yetkilendirme, sipariş ve yönetim akışları).

---

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Motion, Lucide React
- **Backend:** Express.js, Node.js (≥ 22.5), SQLite (`node:sqlite`), TSX
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

Örnek için `.env.example` dosyasına bakın.

```env
PORT=3000
APP_URL="https://siteniz.com"             # E-posta bağlantılarının kök adresi
SMTP_HOST=""                           # Boşsa e-postalar konsola yazılır
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
MAIL_FROM="AYMENLisans <no-reply@siteniz.com>"
DATABASE_PATH="./data/aymenlisans.db"   # SQLite dosyası
ADMIN_EMAIL="admin@aymenlisans.com"     # Yönetici hesabı e-postası
ADMIN_PASSWORD=""                       # En az 8 karakter; boşsa ilk açılışta rastgele üretilir
TRUST_PROXY=""                          # nginx/Cloudflare arkasında "true"
IYZICO_API_KEY=""                       # iyzico anahtarları; boşsa kartla ödeme kapalı
IYZICO_SECRET_KEY=""
IYZICO_BASE_URL="https://sandbox-api.iyzipay.com"   # canlı: https://api.iyzipay.com
```

> **iyzico kurulumu:** [iyzico sandbox](https://sandbox-merchant.iyzipay.com) panelinden API anahtarlarını alıp `IYZICO_API_KEY` / `IYZICO_SECRET_KEY` olarak girin. Dönüş adresi her istekle `APP_URL` + `/odeme/iyzico/callback` olarak gönderilir; `APP_URL` internetten erişilebilir (canlıda `https://`) olmalıdır. Canlıya geçerken anahtarları ve `IYZICO_BASE_URL` değerini canlı olanlarla değiştirin. Geliştirme modunda (`npm run dev`) anahtar yoksa kartlı siparişler ödenmiş sayılır; **üretimde anahtar yoksa kartla ödeme kapalıdır**.
>
> **Üretim notu:** `npm run build && npm start` ile çalıştırın. Çerezler yalnızca HTTPS isteklerde `Secure` işaretlenir; HTTPS'i bir proxy sonlandırıyorsa `TRUST_PROXY=true` verin. `data/` klasörünü yedekleyin.

---

## 📄 Lisans

© 2026 AYMENLisans. Tüm hakları saklıdır.
