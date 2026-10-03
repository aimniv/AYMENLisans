import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createApp } from './server/app';
import { createMailer } from './server/mailer';
import { createIyzicoProvider } from './server/payments';
import { ensureAdmin, normalizeEmail } from './server/auth';
import { openDb } from './server/db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = Number(process.env.PORT) || 3000;

  const db = openDb(process.env.DATABASE_PATH || path.join(__dirname, 'data', 'aymenlisans.db'));

  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL) || 'admin@aymenlisans.com';
  const admin = ensureAdmin(db, adminEmail, process.env.ADMIN_PASSWORD || undefined);
  if (admin.generatedPassword) {
    console.log('────────────────────────────────────────────────');
    console.log('Yönetici hesabı oluşturuldu (bu şifre yalnızca bir kez gösterilir):');
    console.log(`  E-posta: ${adminEmail}`);
    console.log(`  Şifre:   ${admin.generatedPassword}`);
    console.log('Sabit bir şifre için .env dosyasında ADMIN_PASSWORD tanımlayın.');
    console.log('────────────────────────────────────────────────');
  }

  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  if (isProd && !process.env.APP_URL) {
    console.warn('APP_URL tanımlı değil: e-postalardaki bağlantılar localhost adresini gösterecek.');
  }

  const paymentProvider = createIyzicoProvider();
  if (!paymentProvider) {
    console.warn(
      isProd
        ? 'IYZICO_API_KEY / IYZICO_SECRET_KEY tanımlı değil: kartla ödeme kapalı, yalnızca Havale/EFT çalışır.'
        : 'iyzico anahtarları tanımlı değil: kartlı siparişler ödenmiş sayılır (yalnızca geliştirme modu).'
    );
  }

  const app = createApp({
    db,
    mailer: createMailer(),
    appUrl,
    secureCookies: isProd,
    paymentProvider,
    simulatePayments: !isProd && !paymentProvider,
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AYMENLisans sunucusu http://0.0.0.0:${PORT} adresinde çalışıyor`);
  });
}

startServer();
