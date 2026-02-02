import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateRequest {
  gateway: 'mercadopago' | 'pushinpay' | 'pagarme' | 'pagseguro' | 'stripe' | 'asaas';
  credentials: Record<string, string>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gateway, credentials }: ValidateRequest = await req.json();

    console.log(`Validating credentials for gateway: ${gateway}`);

    let isValid = false;
    let message = '';
    let userData: Record<string, unknown> = {};

    switch (gateway) {
      case 'mercadopago': {
        const accessToken = credentials.accessToken;
        if (!accessToken) {
          return new Response(
            JSON.stringify({ success: false, error: 'Access Token é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          const response = await fetch('https://api.mercadopago.com/users/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });

          if (response.ok) {
            const data = await response.json();
            isValid = true;
            message = `Conectado como: ${data.nickname || data.email}`;
            userData = { id: data.id, nickname: data.nickname, email: data.email };
          } else {
            message = 'Access Token inválido';
          }
        } catch (e) {
          console.error('Mercado Pago validation error:', e);
          message = 'Erro ao conectar com Mercado Pago';
        }
        break;
      }

      case 'stripe': {
        const secretKey = credentials.secretKey;
        if (!secretKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'Secret Key é obrigatória' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          const response = await fetch('https://api.stripe.com/v1/balance', {
            headers: { 'Authorization': `Bearer ${secretKey}` },
          });

          if (response.ok) {
            const data = await response.json();
            isValid = true;
            message = 'Stripe conectado com sucesso';
            userData = { available: data.available, pending: data.pending };
          } else {
            message = 'Secret Key inválida';
          }
        } catch (e) {
          console.error('Stripe validation error:', e);
          message = 'Erro ao conectar com Stripe';
        }
        break;
      }

      case 'pagarme': {
        const apiKey = credentials.apiKey;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'API Key é obrigatória' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          const response = await fetch('https://api.pagar.me/core/v5/balance', {
            headers: { 
              'Authorization': `Basic ${btoa(apiKey + ':')}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            isValid = true;
            message = 'Pagar.me conectado com sucesso';
          } else {
            message = 'API Key inválida';
          }
        } catch (e) {
          console.error('Pagar.me validation error:', e);
          message = 'Erro ao conectar com Pagar.me';
        }
        break;
      }

      case 'pagseguro': {
        const { email, token } = credentials;
        if (!email || !token) {
          return new Response(
            JSON.stringify({ success: false, error: 'E-mail e Token são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          // PagSeguro validation via session endpoint
          const response = await fetch(
            `https://ws.pagseguro.uol.com.br/v2/sessions?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
            { method: 'POST' }
          );

          if (response.ok) {
            isValid = true;
            message = 'PagSeguro conectado com sucesso';
          } else {
            message = 'Credenciais inválidas';
          }
        } catch (e) {
          console.error('PagSeguro validation error:', e);
          message = 'Erro ao conectar com PagSeguro';
        }
        break;
      }

      case 'pushinpay': {
        const apiKey = credentials.apiKey;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'API Key é obrigatória' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // PushinPay doesn't have a public validation endpoint
        // We assume credentials are valid if format is correct
        if (apiKey.startsWith('pk_') || apiKey.length > 20) {
          isValid = true;
          message = 'Formato de API Key válido';
        } else {
          message = 'Formato de API Key inválido';
        }
        break;
      }

      case 'asaas': {
        const accessToken = credentials.accessToken || credentials.apiKey;
        if (!accessToken) {
          return new Response(
            JSON.stringify({ success: false, error: 'Access Token é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          const response = await fetch('https://api.asaas.com/v3/myAccount', {
            headers: { 'access_token': accessToken },
          });

          if (response.ok) {
            const data = await response.json();
            isValid = true;
            message = `Asaas conectado com sucesso`;
            userData = { name: data?.name, email: data?.email, id: data?.id };
          } else {
            message = 'Access Token inválido';
          }
        } catch (e) {
          console.error('Asaas validation error:', e);
          message = 'Erro ao conectar com Asaas';
        }
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Gateway não suportado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Validation result for ${gateway}: ${isValid ? 'success' : 'failed'}`);

    return new Response(
      JSON.stringify({
        success: isValid,
        message,
        userData: isValid ? userData : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
