import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderCompletedPage } from './pages/OrderCompletedPage';
import { ContactPage } from './pages/ContactPage';
import { AccountPage } from './pages/AccountPage';
import { CorporatePage } from './pages/CorporatePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { PaymentFailedPage } from './pages/PaymentFailedPage';
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from './pages/EmailPages';

const AppRoutes: React.FC = () => {
  const { pathname } = useRouter();
  const cleanPath =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  // Admin rotası: siteninlinki/admin
  if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
    return <AdminPage />;
  }

  if (cleanPath === '/') {
    return <HomePage />;
  }

  if (cleanPath === '/windows') {
    return <CategoryPage key="windows" categorySlug="windows" />;
  }
  if (cleanPath === '/microsoft') {
    return <CategoryPage key="microsoft" categorySlug="microsoft" />;
  }
  if (cleanPath === '/yapay-zeka') {
    return <CategoryPage key="yapay-zeka" categorySlug="yapay-zeka" />;
  }
  if (cleanPath === '/tasarim-araclari') {
    return <CategoryPage key="tasarim-araclari" categorySlug="tasarim-araclari" />;
  }
  if (cleanPath === '/genel') {
    return <CategoryPage key="genel" categorySlug="genel" />;
  }
  if (cleanPath === '/urunler') {
    return <CategoryPage key="urunler" categorySlug="urunler" />;
  }
  if (cleanPath === '/ara') {
    return <CategoryPage key="ara" categorySlug="ara" />;
  }

  if (cleanPath.startsWith('/urun/')) {
    const slug = decodeURIComponent(cleanPath.replace('/urun/', ''));
    return <ProductDetailPage slug={slug} />;
  }

  if (cleanPath === '/sepet') {
    return <CartPage />;
  }

  if (cleanPath === '/checkout' || cleanPath === '/odeme') {
    return <CheckoutPage />;
  }

  if (cleanPath === '/odeme-basarisiz') {
    return <PaymentFailedPage />;
  }

  if (cleanPath === '/siparis-tamamlandi') {
    return <OrderCompletedPage />;
  }

  if (cleanPath === '/iletisim') {
    return <ContactPage />;
  }

  if (cleanPath === '/giris') {
    return <LoginPage key="giris" initialMode="giris" />;
  }
  if (cleanPath === '/kayit') {
    return <LoginPage key="kayit" initialMode="kayit" />;
  }

  if (cleanPath === '/eposta-dogrula') {
    return <VerifyEmailPage />;
  }
  if (cleanPath === '/sifremi-unuttum') {
    return <ForgotPasswordPage />;
  }
  if (cleanPath === '/sifre-sifirla') {
    return <ResetPasswordPage />;
  }

  if (cleanPath === '/hesabim') {
    return <AccountPage />;
  }

  if (cleanPath === '/gizlilik-politikasi') {
    return <CorporatePage pageType="gizlilik" />;
  }
  if (cleanPath === '/kullanim-sartlari') {
    return <CorporatePage pageType="kullanim" />;
  }
  if (cleanPath === '/iade-kosullari') {
    return <CorporatePage pageType="iade" />;
  }
  if (cleanPath === '/sss') {
    return <CorporatePage pageType="sss" />;
  }

  return <CategoryPage key="fallback-urunler" categorySlug="urunler" />;
};

const MainShell: React.FC = () => {
  const { pathname } = useRouter();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const isCheckout = pathname === '/checkout' || pathname === '/odeme';

  // Admin sayfasında tam ekran yönetim arayüzü gösterilir
  if (isAdmin) {
    return (
      <main className="min-h-screen bg-[#f6f6f7] text-[#111111]">
        <AppRoutes />
      </main>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isCheckout ? 'bg-[#f1f2f3]' : 'bg-[#fafafa]'
      } text-[#111111]`}
    >
      <Header />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <MainShell />
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </RouterProvider>
  );
}

export default App;
