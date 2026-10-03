import nodemailer from 'nodemailer';

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface Mailer {
  send(mail: Mail): Promise<void>;
}

/** SMTP_HOST tanımlıysa gerçek gönderim yapar; değilse e-postayı konsola yazar (geliştirme). */
export function createMailer(env: NodeJS.ProcessEnv = process.env): Mailer {
  if (!env.SMTP_HOST) {
    console.warn('SMTP_HOST tanımlı değil: e-postalar gönderilmez, konsola yazılır.');
    return {
      async send(mail) {
        console.log(`\n── E-posta (konsol) ── ${mail.to}\nKonu: ${mail.subject}\n${mail.text}\n`);
      },
    };
  }

  const port = Number(env.SMTP_PORT) || 587;
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS ?? '' } : undefined,
  });
  const from = env.MAIL_FROM || env.SMTP_USER || 'AYMENLisans <no-reply@aymenlisans.com>';

  return {
    async send(mail) {
      await transport.sendMail({ from, ...mail });
    },
  };
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function layout(ad: string, intro: string, buttonText: string, link: string, outro: string) {
  const safeLink = escapeHtml(link);
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#111">
<h2 style="color:#55a80b;margin:0 0 16px">AYMENLisans</h2>
<p>Merhaba ${escapeHtml(ad)},</p>
<p>${intro}</p>
<p style="margin:24px 0"><a href="${safeLink}" style="background:#55a80b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">${buttonText}</a></p>
<p style="font-size:12px;color:#555">Düğme çalışmazsa bu adresi tarayıcınıza yapıştırın:<br>${safeLink}</p>
<p style="font-size:12px;color:#555">${outro}</p></div>`;
}

export function verificationEmail(to: string, ad: string, link: string): Mail {
  return {
    to,
    subject: 'E-posta adresinizi doğrulayın | AYMENLisans',
    text: `Merhaba ${ad},\n\nE-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın (24 saat geçerlidir):\n${link}\n\nBu işlemi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.`,
    html: layout(
      ad,
      'E-posta adresinizi doğrulamak için aşağıdaki düğmeye tıklayın. Bağlantı 24 saat geçerlidir.',
      'E-postamı Doğrula',
      link,
      'Bu işlemi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.'
    ),
  };
}

export function passwordResetEmail(to: string, ad: string, link: string): Mail {
  return {
    to,
    subject: 'Şifre sıfırlama talebi | AYMENLisans',
    text: `Merhaba ${ad},\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın (1 saat geçerlidir):\n${link}\n\nBu talebi siz yapmadıysanız bu e-postayı yok sayın; şifreniz değişmez.`,
    html: layout(
      ad,
      'Şifrenizi sıfırlamak için aşağıdaki düğmeye tıklayın. Bağlantı 1 saat geçerlidir.',
      'Şifremi Sıfırla',
      link,
      'Bu talebi siz yapmadıysanız bu e-postayı yok sayın; şifreniz değişmez.'
    ),
  };
}
