import Iyzipay from 'iyzipay';
import iyzipayUtils from 'iyzipay/lib/utils';

export interface PaymentItem {
  id: string;
  name: string;
  category: string;
  /** Satırın toplam tutarı (adet × birim fiyat). */
  price: number;
}

export interface PaymentInit {
  siparisNo: string;
  /** Sepet toplamı (indirim öncesi). */
  araToplam: number;
  /** Tahsil edilecek tutar (indirim sonrası). */
  odenecekTutar: number;
  items: PaymentItem[];
  buyer: { id: number; ad: string; eposta: string; telefon: string; ip: string };
  callbackUrl: string;
}

export interface PaymentResult {
  paid: boolean;
  siparisNo: string;
  paidPrice: number;
  paymentId?: string;
  error?: string;
}

/** Kart ödemesi sağlayıcısı (barındırılan ödeme sayfası: kart bilgisi sitede toplanmaz). */
export interface PaymentProvider {
  /** Ödeme oturumu açar; müşterinin yönlendirileceği adresi ve oturum token'ını döndürür. */
  initialize(input: PaymentInit): Promise<{ token: string; url: string }>;
  /** Token'a ait ödeme sonucunu sağlayıcıdan sorgular. */
  retrieve(token: string): Promise<PaymentResult>;
}

const money = (n: number) => n.toFixed(2);

function splitName(ad: string): { name: string; surname: string } {
  const parts = ad.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], surname: parts[0] };
  return { name: parts.slice(0, -1).join(' '), surname: parts[parts.length - 1] };
}

/** +90 5XX... biçimine çevirir; geçerli görünmüyorsa boş bırakır. */
function toGsm(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? `+90${digits.slice(-10)}` : undefined;
}

function call<T>(fn: (cb: (err: unknown, result: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => fn((err, result) => (err ? reject(err) : resolve(result))));
}

/** iyzico Ortak Ödeme Sayfası (Checkout Form). IYZICO_API_KEY / IYZICO_SECRET_KEY tanımlı değilse null döner. */
export function createIyzicoProvider(env: NodeJS.ProcessEnv = process.env): PaymentProvider | null {
  const apiKey = env.IYZICO_API_KEY;
  const secretKey = env.IYZICO_SECRET_KEY;
  if (!apiKey || !secretKey) return null;

  const iyzipay = new Iyzipay({
    apiKey,
    secretKey,
    uri: env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
  });

  return {
    async initialize(input) {
      const { name, surname } = splitName(input.buyer.ad);
      const address = {
        contactName: input.buyer.ad,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Dijital teslimat (fiziksel gönderim yoktur)',
      };
      const result: any = await call((cb) =>
        iyzipay.checkoutFormInitialize.create(
          {
            locale: Iyzipay.LOCALE.TR,
            conversationId: input.siparisNo,
            price: money(input.araToplam),
            paidPrice: money(input.odenecekTutar),
            currency: Iyzipay.CURRENCY.TRY,
            basketId: input.siparisNo,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: input.callbackUrl,
            buyer: {
              id: `U${input.buyer.id}`,
              name,
              surname,
              email: input.buyer.eposta,
              gsmNumber: toGsm(input.buyer.telefon),
              // Kimlik numarası toplanmıyor; iyzico zorunlu alan için yer tutucu kabul eder.
              identityNumber: '11111111111',
              registrationAddress: address.address,
              ip: input.buyer.ip,
              city: address.city,
              country: address.country,
            },
            shippingAddress: address,
            billingAddress: address,
            basketItems: input.items.map((item) => ({
              id: item.id,
              name: item.name.slice(0, 250),
              category1: item.category,
              itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
              price: money(item.price),
            })),
          },
          cb
        )
      );

      if (result?.status !== 'success' || !result.token || !result.paymentPageUrl) {
        throw new Error(
          `iyzico ödeme oturumu açılamadı: ${result?.errorCode ?? ''} ${result?.errorMessage ?? 'beklenmeyen yanıt'}`
        );
      }
      return { token: result.token, url: result.paymentPageUrl };
    },

    async retrieve(token) {
      const result: any = await call((cb) =>
        iyzipay.checkoutForm.retrieve({ locale: Iyzipay.LOCALE.TR, token }, cb)
      );

      if (result?.status !== 'success') {
        return {
          paid: false,
          siparisNo: String(result?.basketId ?? ''),
          paidPrice: 0,
          error: result?.errorMessage || 'Ödeme tamamlanamadı.',
        };
      }

      // Yanıtın iyzico'dan geldiğini imzayla doğrula.
      if (result.signature) {
        const expected = iyzipayUtils.calculateHmacSHA256Signature(
          [
            result.paymentStatus,
            result.paymentId,
            result.currency,
            result.basketId,
            result.conversationId,
            result.paidPrice,
            result.price,
            result.token,
          ],
          secretKey
        );
        if (expected !== result.signature) throw new Error('iyzico yanıt imzası doğrulanamadı.');
      }

      return {
        paid: result.paymentStatus === 'SUCCESS',
        siparisNo: String(result.basketId ?? ''),
        paidPrice: Number(result.paidPrice),
        paymentId: result.paymentId ? String(result.paymentId) : undefined,
        error: result.paymentStatus === 'SUCCESS' ? undefined : result.errorMessage || 'Ödeme başarısız.',
      };
    },
  };
}
