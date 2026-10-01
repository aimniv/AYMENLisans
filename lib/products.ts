export type CategorySlug =
  | 'yapay-zeka'
  | 'tasarim-araclari'
  | 'genel'
  | 'microsoft'
  | 'windows';

export interface CategoryInfo {
  slug: CategorySlug;
  ad: string;
  sayfaBasligi: string;
  aciklama: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'yapay-zeka',
    ad: 'Yapay Zeka',
    sayfaBasligi: 'Yapay Zeka Satın Al - Ucuz Lisans Satın Al | AYMENLisans',
    aciklama: 'En popüler yapay zeka araçları ve profesyonel abonelik paketleri anında teslimat avantajıyla.',
  },
  {
    slug: 'tasarim-araclari',
    ad: 'Tasarım Araçları',
    sayfaBasligi: 'Grafik Tasarım Araçları Lisansları - Ucuz Lisans Satın Al | AYMENLisans',
    aciklama: 'Grafik tasarım, video kurgu ve stok içerik platformları için orijinal dijital abonelikler.',
  },
  {
    slug: 'genel',
    ad: 'Genel',
    sayfaBasligi: 'Genel Lisans Satın Al - Ucuz Lisans Satın Al | AYMENLisans',
    aciklama: 'Müzik, video, eğitim, antivirüs ve yazılımlar için dijital lisans ve abonelikler.',
  },
  {
    slug: 'microsoft',
    ad: 'Microsoft',
    sayfaBasligi: 'Microsoft Office Satın Al - Ucuz Lisans Satın Al | AYMENLisans',
    aciklama: 'Bireysel ve kurumsal kullanıma uygun orijinal Microsoft Office dijital lisans anahtarları.',
  },
  {
    slug: 'windows',
    ad: 'Windows',
    sayfaBasligi: 'Windows Anahtar Kodu Satın Al - Ucuz Lisans Satın Al | AYMENLisans',
    aciklama: 'Windows 10 ve Windows 11 işletim sistemleri için ömür boyu geçerli orijinal lisans anahtarları.',
  },
];

export const CATEGORY_MAP: Record<CategorySlug, string> = {
  'yapay-zeka': 'Yapay Zeka',
  'tasarim-araclari': 'Tasarım Araçları',
  genel: 'Genel',
  microsoft: 'Microsoft',
  windows: 'Windows',
};

export interface Product {
  slug: string;
  aliases?: string[];
  ad: string;
  kategori: CategorySlug;
  kategoriAdi: string;
  fiyat: number;
  eskiFiyat?: number;
  indirimOrani?: number;
  puan: number;
  yorumSayisi: number;
  yorumSayısı: number;
  stok: boolean;
  gorselRenkleri: [string, string];
  görselRenkleri: [string, string];
  kartUstEtiket: string;
  kartBaslik: string;
  kartAltYazi: string;
  kartSureEtiketi: string;
  aciklama: string;
  açıklama: string;
  ozellikListesi: string[];
  özellikListesi: string[];
  oneCikan?: boolean;
}

export const INITIAL_PRODUCTS: Product[] = [
  // ================= WINDOWS =================
  {
    slug: 'windows-10-home',
    ad: 'Windows 10 Home | Süresiz | Orijinal Lisans Anahtarı',
    kategori: 'windows',
    kategoriAdi: 'Windows',
    fiyat: 149.0,
    puan: 5,
    yorumSayisi: 3,
    yorumSayısı: 3,
    stok: true,
    gorselRenkleri: ['#0284c7', '#0c4a6e'],
    görselRenkleri: ['#0284c7', '#0c4a6e'],
    kartUstEtiket: 'Windows',
    kartBaslik: 'Windows 10\nHome',
    kartAltYazi: 'Dijital Anahtar',
    kartSureEtiketi: 'Sınırsız',
    aciklama:
      'Windows 10 Home işletim sistemi için tek bilgisayarda süresiz kullanım sağlayan orijinal perakende dijital lisans anahtarı.',
    açıklama:
      'Windows 10 Home işletim sistemi için tek bilgisayarda süresiz kullanım sağlayan orijinal perakende dijital lisans anahtarı.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      '32 Bit ve 64 Bit tüm dillerle uyumlu süresiz lisans',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      '32 Bit ve 64 Bit tüm dillerle uyumlu süresiz lisans',
    ],
    oneCikan: true,
  },
  {
    slug: 'windows-11-home',
    ad: 'Windows 11 Home | Süresiz | Orijinal Lisans Anahtarı',
    kategori: 'windows',
    kategoriAdi: 'Windows',
    fiyat: 149.0,
    puan: 4.5,
    yorumSayisi: 5,
    yorumSayısı: 5,
    stok: false,
    gorselRenkleri: ['#0284c7', '#0c4a6e'],
    görselRenkleri: ['#0284c7', '#0c4a6e'],
    kartUstEtiket: 'Windows',
    kartBaslik: 'Windows 11\nHome',
    kartAltYazi: 'Dijital Anahtar',
    kartSureEtiketi: 'Sınırsız',
    aciklama:
      'Windows 11 Home kullanıcıları için ömür boyu geçerli orijinal dijital aktivasyon anahtarı.',
    açıklama:
      'Windows 11 Home kullanıcıları için ömür boyu geçerli orijinal dijital aktivasyon anahtarı.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Tek PC için süresiz orijinal aktivasyon',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Tek PC için süresiz orijinal aktivasyon',
    ],
    oneCikan: false,
  },
  {
    slug: 'windows-10-pro',
    ad: 'Windows 10 Pro | Süresiz | Orijinal Lisans Anahtarı',
    kategori: 'windows',
    kategoriAdi: 'Windows',
    fiyat: 199.0,
    puan: 4.5,
    yorumSayisi: 4,
    yorumSayısı: 4,
    stok: true,
    gorselRenkleri: ['#0369a1', '#082f49'],
    görselRenkleri: ['#0369a1', '#082f49'],
    kartUstEtiket: 'Windows',
    kartBaslik: 'Windows 10\nPRO',
    kartAltYazi: 'Dijital Anahtar',
    kartSureEtiketi: 'Sınırsız',
    aciklama:
      'Profesyonel kullanıcılar için Windows 10 Pro süresiz lisans anahtarı. BitLocker ve Uzak Masaüstü özelliklerini açar.',
    açıklama:
      'Profesyonel kullanıcılar için Windows 10 Pro süresiz lisans anahtarı. BitLocker ve Uzak Masaüstü özelliklerini açar.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'BitLocker ve Uzak Masaüstü desteği',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'BitLocker ve Uzak Masaüstü desteği',
    ],
    oneCikan: true,
  },
  {
    slug: 'windows-11-pro',
    ad: 'Windows 11 Pro | Süresiz | Orijinal Lisans Anahtarı',
    kategori: 'windows',
    kategoriAdi: 'Windows',
    fiyat: 199.0,
    puan: 4.5,
    yorumSayisi: 7,
    yorumSayısı: 7,
    stok: true,
    gorselRenkleri: ['#0369a1', '#082f49'],
    görselRenkleri: ['#0369a1', '#082f49'],
    kartUstEtiket: 'Windows',
    kartBaslik: 'Windows 11\nPRO',
    kartAltYazi: 'Dijital Anahtar',
    kartSureEtiketi: 'Sınırsız',
    aciklama:
      'En güncel Windows 11 Pro işletim sistemini saniyeler içinde etkinleştirin. Süresiz geçerli orijinal perakende anahtar.',
    açıklama:
      'En güncel Windows 11 Pro işletim sistemini saniyeler içinde etkinleştirin. Süresiz geçerli orijinal perakende anahtar.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Format sonrası aynı cihazda tekrar etkinleştirilebilir',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Format sonrası aynı cihazda tekrar etkinleştirilebilir',
    ],
    oneCikan: true,
  },

  // ================= MICROSOFT =================
  {
    slug: 'microsoft-office-365',
    ad: 'Microsoft Office 365 | 12 Aylık | Kişisel E-Posta | Windows & Mac',
    kategori: 'microsoft',
    kategoriAdi: 'Microsoft',
    fiyat: 249.0,
    eskiFiyat: 300.0,
    indirimOrani: 17,
    puan: 5,
    yorumSayisi: 4,
    yorumSayısı: 4,
    stok: true,
    gorselRenkleri: ['#1e3a8a', '#0f172a'],
    görselRenkleri: ['#1e3a8a', '#0f172a'],
    kartUstEtiket: 'Office 365',
    kartBaslik: 'Microsoft\nOffice 365',
    kartAltYazi: 'İsme Özel',
    kartSureEtiketi: '12 AY',
    aciklama:
      'Word, Excel, PowerPoint ve Outlook uygulamalarının en güncel sürümlerini tüm cihazlarınızda 12 ay kullanın.',
    açıklama:
      'Word, Excel, PowerPoint ve Outlook uygulamalarının en güncel sürümlerini tüm cihazlarınızda 12 ay kullanın.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Windows, macOS, iOS ve Android tam uyumlu',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Windows, macOS, iOS ve Android tam uyumlu',
    ],
    oneCikan: true,
  },
  {
    slug: 'microsoft-office-2024',
    ad: 'Microsoft Office 2024 | Sınırsız | Tüm Uygulamalara Erişim',
    kategori: 'microsoft',
    kategoriAdi: 'Microsoft',
    fiyat: 299.0,
    puan: 0,
    yorumSayisi: 0,
    yorumSayısı: 0,
    stok: true,
    gorselRenkleri: ['#c2410c', '#7c2d12'],
    görselRenkleri: ['#c2410c', '#7c2d12'],
    kartUstEtiket: 'Office',
    kartBaslik: 'Microsoft\nOffice 2024',
    kartAltYazi: 'Lisans Anahtarı',
    kartSureEtiketi: 'Sınırsız',
    aciklama:
      'En yeni Microsoft Office 2024 Professional Plus paketi ile tüm uygulamalara süresiz sahip olun.',
    açıklama:
      'En yeni Microsoft Office 2024 Professional Plus paketi ile tüm uygulamalara süresiz sahip olun.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Tüm Office 2024 uygulamaları dahil',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Tüm Office 2024 uygulamaları dahil',
    ],
    oneCikan: false,
  },
  {
    slug: 'microsoft-office-2021',
    ad: 'Microsoft Office 2021 | Sınırsız | Tüm Uygulamalara Erişim',
    kategori: 'microsoft',
    kategoriAdi: 'Microsoft',
    fiyat: 99.0,
    puan: 5,
    yorumSayisi: 2,
    yorumSayısı: 2,
    stok: true,
    gorselRenkleri: ['#c2410c', '#7c2d12'],
    görselRenkleri: ['#c2410c', '#7c2d12'],
    kartUstEtiket: 'Office',
    kartBaslik: 'Microsoft\nOffice 2021',
    kartAltYazi: 'Lisans Anahtarı',
    kartSureEtiketi: 'Sınırsız',
    aciklama:
      'Microsoft Office 2021 Professional Plus dijital lisans anahtarı. Tek seferlik ödeme ile süresiz kullanım.',
    açıklama:
      'Microsoft Office 2021 Professional Plus dijital lisans anahtarı. Tek seferlik ödeme ile süresiz kullanım.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Ömür boyu kullanım garantisi',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Ömür boyu kullanım garantisi',
    ],
    oneCikan: true,
  },
  {
    slug: 'microsoft-office-2019',
    ad: 'Microsoft Office 2019 | Sınırsız | Tüm Uygulamalara Erişim',
    kategori: 'microsoft',
    kategoriAdi: 'Microsoft',
    fiyat: 75.0,
    puan: 0,
    yorumSayisi: 0,
    yorumSayısı: 0,
    stok: true,
    gorselRenkleri: ['#c2410c', '#7c2d12'],
    görselRenkleri: ['#c2410c', '#7c2d12'],
    kartUstEtiket: 'Office',
    kartBaslik: 'Microsoft\nOffice 2019',
    kartAltYazi: 'Lisans Anahtarı',
    kartSureEtiketi: 'Sınırsız',
    aciklama: 'Microsoft Office 2019 Professional Plus süresiz dijital lisans anahtarı.',
    açıklama: 'Microsoft Office 2019 Professional Plus süresiz dijital lisans anahtarı.',
    ozellikListesi: ['Ödeme sonrası anında teslimat', 'Adım adım aktivasyon rehberi', 'Satış sonrası destek'],
    özellikListesi: ['Ödeme sonrası anında teslimat', 'Adım adım aktivasyon rehberi', 'Satış sonrası destek'],
    oneCikan: false,
  },
  {
    slug: 'microsoft-office-2016',
    ad: 'Microsoft Office 2016 | Sınırsız | Tüm Uygulamalara Erişim',
    kategori: 'microsoft',
    kategoriAdi: 'Microsoft',
    fiyat: 65.0,
    puan: 0,
    yorumSayisi: 0,
    yorumSayısı: 0,
    stok: true,
    gorselRenkleri: ['#c2410c', '#7c2d12'],
    görselRenkleri: ['#c2410c', '#7c2d12'],
    kartUstEtiket: 'Office',
    kartBaslik: 'Microsoft\nOffice 2016',
    kartAltYazi: 'Lisans Anahtarı',
    kartSureEtiketi: 'Sınırsız',
    aciklama: 'Microsoft Office 2016 Professional Plus süresiz dijital lisans anahtarı.',
    açıklama: 'Microsoft Office 2016 Professional Plus süresiz dijital lisans anahtarı.',
    ozellikListesi: ['Ödeme sonrası anında teslimat', 'Adım adım aktivasyon rehberi', 'Satış sonrası destek'],
    özellikListesi: ['Ödeme sonrası anında teslimat', 'Adım adım aktivasyon rehberi', 'Satış sonrası destek'],
    oneCikan: false,
  },

  // ================= YAPAY ZEKA =================
  {
    slug: 'google-ai-pro-18-ay',
    aliases: ['google-ai-pro-18-aylik'],
    ad: 'Google AI Pro 18 Aylık | Kişisel Mail Adresinize Tanımlanır',
    kategori: 'yapay-zeka',
    kategoriAdi: 'Yapay Zeka',
    fiyat: 499.0,
    eskiFiyat: 699.0,
    indirimOrani: 29,
    puan: 4.5,
    yorumSayisi: 19,
    yorumSayısı: 19,
    stok: true,
    gorselRenkleri: ['#1d4ed8', '#0f172a'],
    görselRenkleri: ['#1d4ed8', '#0f172a'],
    kartUstEtiket: 'AI PRO',
    kartBaslik: 'Google AI\nPRO',
    kartAltYazi: 'Kişisel Hesap',
    kartSureEtiketi: '18 AY',
    aciklama:
      'Gelişmiş multimodal yapay zeka modellerine 18 ay boyunca kendi e-posta adresiniz üzerinden tam erişim sağlayın.',
    açıklama:
      'Gelişmiş multimodal yapay zeka modellerine 18 ay boyunca kendi e-posta adresiniz üzerinden tam erişim sağlayın.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Kendi kişisel e-posta adresinize 18 ay tanımlama',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Kendi kişisel e-posta adresinize 18 ay tanımlama',
    ],
    oneCikan: true,
  },
  {
    slug: 'chatgpt-plus',
    aliases: ['chatgpt-plus-1-aylik'],
    ad: 'ChatGPT Plus | 1 Aylık | Kişisel Hesap Aboneliği',
    kategori: 'yapay-zeka',
    kategoriAdi: 'Yapay Zeka',
    fiyat: 425.0,
    puan: 5,
    yorumSayisi: 4,
    yorumSayısı: 4,
    stok: true,
    gorselRenkleri: ['#0f766e', '#111827'],
    görselRenkleri: ['#0f766e', '#111827'],
    kartUstEtiket: 'YAPAY ZEKA',
    kartBaslik: 'ChatGPT\nPLUS',
    kartAltYazi: 'Dijital Abonelik',
    kartSureEtiketi: '1 AY',
    aciklama:
      'En gelişmiş yapay zeka dil modelleri ve görsel üretim araçlarına 1 ay kesintisiz erişim.',
    açıklama:
      'En gelişmiş yapay zeka dil modelleri ve görsel üretim araçlarına 1 ay kesintisiz erişim.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'En güncel modeller ve görsel üretim araçları',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'En güncel modeller ve görsel üretim araçları',
    ],
    oneCikan: true,
  },

  // ================= TASARIM ARAÇLARI =================
  {
    slug: 'adobe-creative-cloud-pro',
    ad: 'Adobe Creative Cloud PRO | 12 Aylık | Tüm Uygulamalara Erişim',
    kategori: 'tasarim-araclari',
    kategoriAdi: 'Tasarım Araçları',
    fiyat: 299.0,
    eskiFiyat: 399.0,
    indirimOrani: 25,
    puan: 4.5,
    yorumSayisi: 25,
    yorumSayısı: 25,
    stok: true,
    gorselRenkleri: ['#991b1b', '#450a0a'],
    görselRenkleri: ['#991b1b', '#450a0a'],
    kartUstEtiket: 'KREATİF PAKET',
    kartBaslik: 'Adobe Creative\nCloud PRO',
    kartAltYazi: 'Tüm Uygulamalara Erişim',
    kartSureEtiketi: '12 AY',
    aciklama:
      'Photoshop, Illustrator, Premiere Pro ve After Effects dahil 20+ kreatif uygulamaya tam erişim.',
    açıklama:
      'Photoshop, Illustrator, Premiere Pro ve After Effects dahil 20+ kreatif uygulamaya tam erişim.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      '20+ kreatif masaüstü ve mobil uygulamaya tam erişim',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      '20+ kreatif masaüstü ve mobil uygulamaya tam erişim',
    ],
    oneCikan: true,
  },
  {
    slug: 'canva-pro-1-yillik',
    ad: 'Canva Pro | 1 Yıllık | Mail Adresinize Tanımlanır | HEDİYELİ',
    kategori: 'tasarim-araclari',
    kategoriAdi: 'Tasarım Araçları',
    fiyat: 399.0,
    puan: 4.5,
    yorumSayisi: 22,
    yorumSayısı: 22,
    stok: true,
    gorselRenkleri: ['#0891b2', '#3b0764'],
    görselRenkleri: ['#0891b2', '#3b0764'],
    kartUstEtiket: 'TASARIM',
    kartBaslik: 'Canva PRO',
    kartAltYazi: 'Mail Adresinize Tanımlanır',
    kartSureEtiketi: '12 AY',
    aciklama:
      'Milyonlarca premium şablon, stok görsel ve arka plan temizleme aracıyla Canva Pro aboneliği.',
    açıklama:
      'Milyonlarca premium şablon, stok görsel ve arka plan temizleme aracıyla Canva Pro aboneliği.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      '12 ay Pro şablon ve araç erişimi',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      '12 ay Pro şablon ve araç erişimi',
    ],
    oneCikan: false,
  },

  // ================= GENEL =================
  {
    slug: 'spotify-premium-4-aylik',
    aliases: ['spotify-premium'],
    ad: 'Spotify Premium | Kişisel Hesabınıza | 4 Aylık',
    kategori: 'genel',
    kategoriAdi: 'Genel',
    fiyat: 120.0,
    puan: 4.5,
    yorumSayisi: 4,
    yorumSayısı: 4,
    stok: true,
    gorselRenkleri: ['#15803d', '#064e3b'],
    görselRenkleri: ['#15803d', '#064e3b'],
    kartUstEtiket: 'MÜZİK PAKETİ',
    kartBaslik: 'Spotify\nPremium',
    kartAltYazi: 'Dijital Kod',
    kartSureEtiketi: '4 AY',
    aciklama:
      'Reklamsız müzik dinleme ve çevrimdışı indirme desteği sağlayan 4 aylık Spotify Premium kodu.',
    açıklama:
      'Reklamsız müzik dinleme ve çevrimdışı indirme desteği sağlayan 4 aylık Spotify Premium kodu.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Reklamsız ve çevrimdışı müzik',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Reklamsız ve çevrimdışı müzik',
    ],
    oneCikan: true,
  },
  {
    slug: 'youtube-premium-3-aylik',
    ad: 'YouTube Premium | Kişisel Hesabınıza | 3 Aylık',
    kategori: 'genel',
    kategoriAdi: 'Genel',
    fiyat: 99.0,
    eskiFiyat: 120.0,
    indirimOrani: 18,
    puan: 5,
    yorumSayisi: 1,
    yorumSayısı: 1,
    stok: true,
    gorselRenkleri: ['#b91c1c', '#1f2937'],
    görselRenkleri: ['#b91c1c', '#1f2937'],
    kartUstEtiket: 'VİDEO & MÜZİK',
    kartBaslik: 'YouTube\nPremium',
    kartAltYazi: 'Dijital Kod',
    kartSureEtiketi: '3 AY',
    aciklama:
      'Reklamsız video, arka planda oynatma ve YouTube Music Premium içeren 3 aylık dijital abonelik.',
    açıklama:
      'Reklamsız video, arka planda oynatma ve YouTube Music Premium içeren 3 aylık dijital abonelik.',
    ozellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Arka planda video oynatma ve indirme',
    ],
    özellikListesi: [
      'Ödeme sonrası anında teslimat',
      'Adım adım aktivasyon rehberi',
      'Satış sonrası destek',
      'Arka planda video oynatma ve indirme',
    ],
    oneCikan: false,
  },
  {
    slug: 'duolingo-ogrenci-plus',
    ad: 'Duolingo Öğrenci PLUS | Sınırsız | Kişisel Hesap',
    kategori: 'genel',
    kategoriAdi: 'Genel',
    fiyat: 199.0,
    puan: 5,
    yorumSayisi: 3,
    yorumSayısı: 3,
    stok: true,
    gorselRenkleri: ['#4d7c0f', '#14532d'],
    görselRenkleri: ['#4d7c0f', '#14532d'],
    kartUstEtiket: 'DİL EĞİTİMİ',
    kartBaslik: 'Duolingo\nÖğrenci PLUS',
    kartAltYazi: 'Mail Adresinize Tanımlanır',
    kartSureEtiketi: 'Sınırsız',
    aciklama: 'Sınırsız can ve reklamsız yabancı dil öğrenme avantajı sağlayan Duolingo Plus paketi.',
    açıklama: 'Sınırsız can ve reklamsız yabancı dil öğrenme avantajı sağlayan Duolingo Plus paketi.',
    ozellikListesi: ['Ödeme sonrası anında teslimat', 'Adım adım aktivasyon rehberi', 'Satış sonrası destek'],
    özellikListesi: ['Ödeme sonrası anında teslimat', 'Adım adım aktivasyon rehberi', 'Satış sonrası destek'],
    oneCikan: false,
  },
  {
    slug: 'kaspersky-premium-1-yillik',
    ad: 'Kaspersky Premium Antivirüs | 1 Yıllık Dijital Lisans',
    kategori: 'genel',
    kategoriAdi: 'Genel',
    fiyat: 199.0,
    eskiFiyat: 350.0,
    indirimOrani: 43,
    puan: 0,
    yorumSayisi: 0,
    yorumSayısı: 0,
    stok: true,
    gorselRenkleri: ['#0f766e', '#134e4a'],
    görselRenkleri: ['#0f766e', '#134e4a'],
    kartUstEtiket: 'SİBER GÜVENLİK',
    kartBaslik: 'Kaspersky\nPremium Security',
    kartAltYazi: 'Mail Adresinize Tanımlanır',
    kartSureEtiketi: '12 AY',
    aciklama: 'Gerçek zamanlı koruma ve fidye yazılımı kalkanı içeren 1 yıllık lisans anahtarı.',
    açıklama: 'Gerçek zamanlı koruma ve fidye yazılımı kalkanı içeren 1 yıllık lisans anahtarı.',
    ozellikListesi: ['Ödeme sonrası anında teslimat', 'Adım adım aktivasyon rehberi', 'Satış sonrası destek'],
    özellikListesi: ['Ödeme sonrası anında teslimat', 'Adım adım aktivasyon rehberi', 'Satış sonrası destek'],
    oneCikan: false,
  },
];

// In-memory or active catalog (can be extended by server/admin)
let activeProducts: Product[] = [...INITIAL_PRODUCTS];

export function setActiveProducts(newProducts: Product[]) {
  activeProducts = newProducts;
}

export function getActiveProducts(): Product[] {
  return activeProducts;
}

export const PRODUCTS = activeProducts;

export function getProductBySlug(slug: string, catalog = activeProducts): Product | undefined {
  return catalog.find(
    (p) => p.slug === slug || (p.aliases && p.aliases.includes(slug))
  );
}

export function getProductsByCategory(categorySlug?: string, catalog = activeProducts): Product[] {
  if (!categorySlug || categorySlug === 'urunler') {
    return catalog;
  }
  return catalog.filter((p) => p.kategori === categorySlug);
}

export function getFeaturedProducts(catalog = activeProducts): Product[] {
  const featured = catalog.filter((p) => p.stok && p.oneCikan);
  if (featured.length >= 8) {
    return featured.slice(0, 8);
  }
  const rest = catalog.filter((p) => p.stok && !p.oneCikan);
  return [...featured, ...rest].slice(0, 8);
}

export function formatPriceTL(amount: number): string {
  return `${amount.toFixed(2)} TL`;
}

export function formatPriceSymbol(amount: number): string {
  return `${amount.toFixed(2)} ₺`;
}

export interface CouponItem {
  code: string;
  discountRate: number;
  active: boolean;
}

export const INITIAL_COUPONS: Record<string, number> = {
  HOSGELDIN: 10,
  EYMEN: 10,
  AYMEN: 10,
};

export const VALID_COUPONS: Record<string, number> = {
  ...INITIAL_COUPONS,
};
