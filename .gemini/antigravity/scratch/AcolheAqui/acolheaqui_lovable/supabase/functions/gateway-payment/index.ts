import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  gateway: string;
  action: 'create_pix' | 'create_boleto' | 'create_card' | 'check_status';
  accessToken: string;
  amount: number;
  description?: string;
  payer?: {
    email: string;
    first_name: string;
    last_name: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  paymentId?: string;
  card?: {
    token?: string;
    number?: string;
    holder_name?: string;
    exp_month?: string;
    exp_year?: string;
    cvv?: string;
    installments?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: PaymentRequest = await req.json();
    const { gateway, action, accessToken, amount, description, payer, paymentId, card } = payload;

    console.log(`Processing ${action} for gateway: ${gateway}`);

    let result;

    switch (gateway) {
      case 'mercadopago':
        result = await handleMercadoPago(action, accessToken, amount, description, payer, paymentId, card);
        break;
      case 'stripe':
        result = await handleStripe(action, accessToken, amount, description, payer, paymentId, card);
        break;
      case 'pagarme':
        result = await handlePagarme(action, accessToken, amount, description, payer, paymentId, card);
        break;
      case 'pagseguro':
        result = await handlePagSeguro(action, accessToken, amount, description, payer, paymentId, card);
        break;
      case 'pushinpay':
        result = await handlePushinPay(action, accessToken, amount, description, payer, paymentId);
        break;
      case 'asaas':
        result = await handleAsaas(action, accessToken, amount, description, payer, paymentId, card);
        break;
      default:
        throw new Error(`Gateway não suportado: ${gateway}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Gateway payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Mercado Pago Handler
async function handleMercadoPago(
  action: string, 
  accessToken: string, 
  amount: number, 
  description?: string, 
  payer?: any,
  paymentId?: string,
  card?: any
) {
  const baseUrl = 'https://api.mercadopago.com/v1';

  if (action === 'create_pix') {
    const paymentData = {
      transaction_amount: amount,
      description: description || 'Pagamento',
      payment_method_id: 'pix',
      payer: {
        email: payer?.email || 'customer@email.com',
        first_name: payer?.first_name || 'Customer',
        last_name: payer?.last_name || 'Name',
        identification: payer?.identification,
      },
    };

    const response = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago error:', data);
      throw new Error(data.message || 'Erro ao criar pagamento PIX');
    }

    return {
      success: true,
      payment_id: data.id,
      status: data.status,
      pix_qr_code: data.point_of_interaction?.transaction_data?.qr_code,
      pix_qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      expires_at: data.date_of_expiration,
    };
  }

  if (action === 'create_card') {
    const paymentData = {
      transaction_amount: amount,
      description: description || 'Pagamento',
      payment_method_id: 'credit_card',
      token: card?.token,
      installments: card?.installments || 1,
      payer: {
        email: payer?.email,
        identification: payer?.identification,
      },
    };

    const response = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao processar cartão');
    }

    return {
      success: true,
      payment_id: data.id,
      status: data.status,
    };
  }

  if (action === 'check_status' && paymentId) {
    const response = await fetch(`${baseUrl}/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    const data = await response.json();
    return { success: true, status: data.status, payment_id: data.id };
  }

  throw new Error(`Ação não suportada: ${action}`);
}

// Stripe Handler
async function handleStripe(
  action: string,
  secretKey: string,
  amount: number,
  description?: string,
  payer?: any,
  paymentId?: string,
  card?: any
) {
  const baseUrl = 'https://api.stripe.com/v1';
  const authHeader = `Basic ${btoa(`${secretKey}:`)}`;

  if (action === 'create_pix') {
    // Create PaymentIntent for PIX (Brazil only)
    const params = new URLSearchParams({
      'amount': Math.round(amount * 100).toString(),
      'currency': 'brl',
      'payment_method_types[]': 'pix',
      'description': description || 'Pagamento',
      'receipt_email': payer?.email || '',
    });

    const response = await fetch(`${baseUrl}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao criar PIX');
    }

    // Get PIX QR code
    const nextAction = data.next_action?.pix_display_qr_code;

    return {
      success: true,
      payment_id: data.id,
      status: data.status,
      pix_qr_code: nextAction?.data,
      pix_qr_code_base64: nextAction?.image_url_png,
      expires_at: nextAction?.expires_at,
    };
  }

  if (action === 'create_card') {
    const params = new URLSearchParams({
      'amount': Math.round(amount * 100).toString(),
      'currency': 'brl',
      'payment_method': card?.token || '',
      'confirm': 'true',
      'description': description || 'Pagamento',
      'receipt_email': payer?.email || '',
    });

    const response = await fetch(`${baseUrl}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao processar cartão');
    }

    return {
      success: true,
      payment_id: data.id,
      status: data.status === 'succeeded' ? 'approved' : data.status,
    };
  }

  if (action === 'check_status' && paymentId) {
    const response = await fetch(`${baseUrl}/payment_intents/${paymentId}`, {
      headers: { 'Authorization': authHeader },
    });

    const data = await response.json();
    return {
      success: true,
      status: data.status === 'succeeded' ? 'approved' : data.status,
      payment_id: data.id,
    };
  }

  throw new Error(`Ação não suportada: ${action}`);
}

// Pagar.me Handler
async function handlePagarme(
  action: string,
  apiKey: string,
  amount: number,
  description?: string,
  payer?: any,
  paymentId?: string,
  card?: any
) {
  const baseUrl = 'https://api.pagar.me/core/v5';
  const authHeader = `Basic ${btoa(`${apiKey}:`)}`;

  if (action === 'create_pix') {
    const orderData = {
      items: [{
        amount: Math.round(amount * 100),
        description: description || 'Pagamento',
        quantity: 1,
        code: 'service',
      }],
      customer: {
        name: `${payer?.first_name || ''} ${payer?.last_name || ''}`.trim() || 'Cliente',
        email: payer?.email || 'customer@email.com',
        type: 'individual',
        document: payer?.identification?.number || '00000000000',
        phones: { mobile_phone: { country_code: '55', area_code: '11', number: '999999999' } },
      },
      payments: [{
        payment_method: 'pix',
        pix: {
          expires_in: 3600,
        },
      }],
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Pagar.me error:', data);
      throw new Error(data.message || 'Erro ao criar PIX');
    }

    const pixCharge = data.charges?.[0]?.last_transaction;

    return {
      success: true,
      payment_id: data.id,
      status: data.status,
      pix_qr_code: pixCharge?.qr_code,
      pix_qr_code_base64: pixCharge?.qr_code_url,
      expires_at: pixCharge?.expires_at,
    };
  }

  if (action === 'create_card') {
    const orderData = {
      items: [{
        amount: Math.round(amount * 100),
        description: description || 'Pagamento',
        quantity: 1,
        code: 'service',
      }],
      customer: {
        name: `${payer?.first_name || ''} ${payer?.last_name || ''}`.trim() || 'Cliente',
        email: payer?.email || 'customer@email.com',
        type: 'individual',
        document: payer?.identification?.number || '00000000000',
      },
      payments: [{
        payment_method: 'credit_card',
        credit_card: {
          card_token: card?.token,
          installments: card?.installments || 1,
          statement_descriptor: 'ACOLHEAQUI',
        },
      }],
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao processar cartão');
    }

    return {
      success: true,
      payment_id: data.id,
      status: data.status === 'paid' ? 'approved' : data.status,
    };
  }

  if (action === 'check_status' && paymentId) {
    const response = await fetch(`${baseUrl}/orders/${paymentId}`, {
      headers: { 'Authorization': authHeader },
    });

    const data = await response.json();
    return {
      success: true,
      status: data.status === 'paid' ? 'approved' : data.status,
      payment_id: data.id,
    };
  }

  throw new Error(`Ação não suportada: ${action}`);
}

// PagSeguro Handler
async function handlePagSeguro(
  action: string,
  token: string,
  amount: number,
  description?: string,
  payer?: any,
  paymentId?: string,
  card?: any
) {
  const baseUrl = 'https://api.pagseguro.com';

  if (action === 'create_pix') {
    const chargeData = {
      reference_id: crypto.randomUUID(),
      description: description || 'Pagamento',
      amount: {
        value: Math.round(amount * 100),
        currency: 'BRL',
      },
      payment_method: {
        type: 'PIX',
      },
    };

    const response = await fetch(`${baseUrl}/charges`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chargeData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PagSeguro error:', data);
      throw new Error(data.error_messages?.[0]?.description || 'Erro ao criar PIX');
    }

    const pixInfo = data.qr_codes?.[0];

    return {
      success: true,
      payment_id: data.id,
      status: data.status,
      pix_qr_code: pixInfo?.text,
      pix_qr_code_base64: null, // PagSeguro returns image URL
      expires_at: pixInfo?.expiration_date,
    };
  }

  if (action === 'create_card') {
    const chargeData = {
      reference_id: crypto.randomUUID(),
      description: description || 'Pagamento',
      amount: {
        value: Math.round(amount * 100),
        currency: 'BRL',
      },
      payment_method: {
        type: 'CREDIT_CARD',
        installments: card?.installments || 1,
        capture: true,
        card: {
          encrypted: card?.token,
        },
      },
    };

    const response = await fetch(`${baseUrl}/charges`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chargeData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_messages?.[0]?.description || 'Erro ao processar cartão');
    }

    return {
      success: true,
      payment_id: data.id,
      status: data.status === 'PAID' ? 'approved' : data.status.toLowerCase(),
    };
  }

  if (action === 'check_status' && paymentId) {
    const response = await fetch(`${baseUrl}/charges/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await response.json();
    return {
      success: true,
      status: data.status === 'PAID' ? 'approved' : data.status.toLowerCase(),
      payment_id: data.id,
    };
  }

  throw new Error(`Ação não suportada: ${action}`);
}

// PushinPay Handler (PIX only)
async function handlePushinPay(
  action: string,
  apiKey: string,
  amount: number,
  description?: string,
  payer?: any,
  paymentId?: string
) {
  const baseUrl = 'https://api.pushinpay.com.br/api/pix';

  if (action === 'create_pix') {
    const pixData = {
      value: Math.round(amount * 100),
      webhook_url: '',
    };

    const response = await fetch(`${baseUrl}/cashIn`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pixData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PushinPay error:', data);
      throw new Error(data.message || 'Erro ao criar PIX');
    }

    return {
      success: true,
      payment_id: data.id || data.transactionId,
      status: 'pending',
      pix_qr_code: data.qrcode || data.pix_code,
      pix_qr_code_base64: data.qrcode_base64,
      expires_at: null,
    };
  }

  if (action === 'check_status' && paymentId) {
    const response = await fetch(`${baseUrl}/cashIn/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    const data = await response.json();
    return {
      success: true,
      status: data.status === 'PAID' ? 'approved' : data.status?.toLowerCase() || 'pending',
      payment_id: paymentId,
    };
  }

  throw new Error(`Ação não suportada para PushinPay: ${action}`);
}

// Asaas Handler (PIX + status)
async function handleAsaas(
  action: string,
  accessToken: string,
  amount: number,
  description?: string,
  payer?: any,
  paymentId?: string,
  card?: any
) {
  const baseUrl = 'https://api.asaas.com/v3';

  const asaasFetch = async (path: string, init?: RequestInit) => {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'access_token': accessToken,
        ...(init?.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = (data as any)?.errors?.[0]?.description || (data as any)?.message || 'Erro Asaas';
      throw new Error(msg);
    }
    return data;
  };

  if (action === 'create_pix') {
    if (!payer?.email) throw new Error('E-mail do pagador é obrigatório');

    const name = `${payer?.first_name || ''} ${payer?.last_name || ''}`.trim() || 'Cliente';

    const customerPayload: Record<string, unknown> = {
      name,
      email: payer.email,
    };

    const document = payer?.identification?.number;
    if (document) {
      customerPayload.cpfCnpj = document;
    }

    const customer = await asaasFetch('/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerPayload),
    });

    const dueDate = new Date().toISOString().slice(0, 10);

    const payment = await asaasFetch('/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: (customer as any).id,
        billingType: 'PIX',
        value: amount,
        dueDate,
        description: description || 'Pagamento',
      }),
    });

    const qr = await asaasFetch(`/payments/${(payment as any).id}/pixQrCode`);

    return {
      success: true,
      payment_id: (payment as any).id,
      status: String((payment as any).status || 'pending').toLowerCase(),
      pix_qr_code: (qr as any).payload,
      pix_qr_code_base64: (qr as any).encodedImage,
      expires_at: (qr as any).expirationDate || null,
    };
  }

  if (action === 'check_status' && paymentId) {
    const payment = await asaasFetch(`/payments/${paymentId}`);
    const status = String((payment as any).status || 'PENDING');

    const approvedStatuses = new Set(['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH']);

    return {
      success: true,
      status: approvedStatuses.has(status) ? 'approved' : status.toLowerCase(),
      payment_id: (payment as any).id || paymentId,
    };
  }

  if (action === 'create_card') {
    throw new Error('Asaas: pagamento com cartão ainda não suportado neste projeto');
  }

  throw new Error(`Ação não suportada para Asaas: ${action}`);
}

