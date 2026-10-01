import { processCheckoutRequest } from '../../../lib/checkout';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const result = processCheckoutRequest(
      body,
      process.env.PAYMENT_PROVIDER_CHECKOUT_URL
    );

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        siparisNo: result.order?.siparisNo,
        order: result.order,
        redirectUrl: result.redirectUrl,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'İstek işlenirken bir sunucu hatası oluştu.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
