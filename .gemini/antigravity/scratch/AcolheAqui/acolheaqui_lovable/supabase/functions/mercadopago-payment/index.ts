import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  action: 'validate' | 'create_pix' | 'create_boleto' | 'create_card';
  accessToken: string;
  publicKey?: string;
  // Payment data
  amount?: number;
  description?: string;
  payer?: {
    email: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  // Card specific
  token?: string;
  installments?: number;
  payment_method_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: PaymentRequest = await req.json();
    const { action, accessToken, publicKey } = body;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access Token é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing action: ${action}`);

    // Validate credentials
    if (action === 'validate') {
      try {
        const response = await fetch('https://api.mercadopago.com/users/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Mercado Pago validation error:', errorData);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Credenciais inválidas. Verifique seu Access Token.' 
            }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const userData = await response.json();
        console.log('Mercado Pago user validated:', userData.id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Credenciais válidas!',
            user: {
              id: userData.id,
              nickname: userData.nickname,
              email: userData.email,
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Validation error:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao validar credenciais' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create PIX payment
    if (action === 'create_pix') {
      const { amount, description, payer } = body;

      if (!amount || !payer?.email) {
        return new Response(
          JSON.stringify({ success: false, error: 'Dados incompletos para pagamento PIX' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paymentData = {
        transaction_amount: amount,
        description: description || 'Pagamento via PIX',
        payment_method_id: 'pix',
        payer: {
          email: payer.email,
          first_name: payer.first_name,
          last_name: payer.last_name,
          identification: payer.identification,
        },
      };

      console.log('Creating PIX payment:', JSON.stringify(paymentData));

      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('PIX payment error:', result);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.message || 'Erro ao criar pagamento PIX' 
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('PIX payment created:', result.id);

      return new Response(
        JSON.stringify({
          success: true,
          payment_id: result.id,
          status: result.status,
          pix_qr_code: result.point_of_interaction?.transaction_data?.qr_code,
          pix_qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
          expiration_date: result.date_of_expiration,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Boleto payment
    if (action === 'create_boleto') {
      const { amount, description, payer } = body;

      if (!amount || !payer?.email || !payer?.identification) {
        return new Response(
          JSON.stringify({ success: false, error: 'Dados incompletos para pagamento Boleto' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paymentData = {
        transaction_amount: amount,
        description: description || 'Pagamento via Boleto',
        payment_method_id: 'bolbradesco',
        payer: {
          email: payer.email,
          first_name: payer.first_name,
          last_name: payer.last_name,
          identification: payer.identification,
        },
      };

      console.log('Creating Boleto payment:', JSON.stringify(paymentData));

      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Boleto payment error:', result);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.message || 'Erro ao criar pagamento Boleto' 
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Boleto payment created:', result.id);

      return new Response(
        JSON.stringify({
          success: true,
          payment_id: result.id,
          status: result.status,
          boleto_url: result.transaction_details?.external_resource_url,
          barcode: result.barcode?.content,
          expiration_date: result.date_of_expiration,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Card payment
    if (action === 'create_card') {
      const { amount, description, payer, token, installments, payment_method_id } = body;

      if (!amount || !payer?.email || !token || !payment_method_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Dados incompletos para pagamento com Cartão' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paymentData = {
        transaction_amount: amount,
        description: description || 'Pagamento via Cartão',
        payment_method_id: payment_method_id,
        token: token,
        installments: installments || 1,
        payer: {
          email: payer.email,
          identification: payer.identification,
        },
      };

      console.log('Creating Card payment:', JSON.stringify(paymentData));

      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Card payment error:', result);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.message || 'Erro ao processar pagamento com Cartão' 
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Card payment created:', result.id);

      return new Response(
        JSON.stringify({
          success: true,
          payment_id: result.id,
          status: result.status,
          status_detail: result.status_detail,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Ação inválida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
