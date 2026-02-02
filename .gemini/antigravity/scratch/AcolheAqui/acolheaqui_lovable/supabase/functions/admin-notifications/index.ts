import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  action: 'professional_status_changed' | 'payment_confirmed' | 'test';
  professionalId: string;
  data?: {
    newStatus?: string;
    oldStatus?: string;
    planName?: string;
    amount?: number;
    billingCycle?: string;
  };
}

interface Professional {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  subscription_plan: string;
}

// Send WhatsApp message via Baileys server
async function sendWhatsAppNotification(
  phone: string,
  message: string,
  baileysUrl?: string
): Promise<boolean> {
  if (!phone) return false;
  
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (baileysUrl) {
      const response = await fetch(`${baileysUrl}/message/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: 'admin',
          to: cleanPhone,
          message,
        }),
      });
      
      if (response.ok) {
        console.log('WhatsApp sent via Baileys');
        return true;
      }
    }
    
    console.log('WhatsApp notification would be sent to:', cleanPhone);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return false;
  }
}

// Send email notification via Resend API
async function sendEmailNotification(
  resendApiKey: string,
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> {
  if (!to || !resendApiKey) return false;
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AcolheAqui <noreply@acolheaqui.com.br>',
        to: [to],
        subject,
        html: htmlContent,
      }),
    });
    
    if (response.ok) {
      console.log('Email sent successfully');
      return true;
    } else {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      return false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Generate email HTML for status change
function generateStatusChangeEmail(
  professionalName: string,
  newStatus: string
): { subject: string; html: string } {
  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    active: {
      title: '🎉 Sua conta foi ativada!',
      message: 'Parabéns! Sua conta de profissional foi aprovada e já está ativa. Você pode começar a receber pacientes.',
      color: '#10b981',
    },
    pending: {
      title: '⏳ Conta em análise',
      message: 'Sua conta está sendo analisada pela nossa equipe. Em breve você receberá uma atualização.',
      color: '#f59e0b',
    },
    disabled: {
      title: '⚠️ Conta desativada',
      message: 'Sua conta foi temporariamente desativada. Entre em contato com o suporte para mais informações.',
      color: '#ef4444',
    },
  };

  const status = statusMessages[newStatus] || statusMessages.pending;

  return {
    subject: `AcolheAqui - ${status.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">AcolheAqui</h1>
          </div>
          <div style="padding: 30px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background: ${status.color}20; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">${newStatus === 'active' ? '✓' : newStatus === 'pending' ? '⏳' : '⚠'}</span>
              </div>
            </div>
            <h2 style="color: #1e293b; text-align: center; margin-bottom: 10px;">${status.title}</h2>
            <p style="color: #475569; text-align: center; font-size: 16px; line-height: 1.6;">
              Olá, <strong>${professionalName}</strong>!
            </p>
            <p style="color: #475569; text-align: center; font-size: 16px; line-height: 1.6;">
              ${status.message}
            </p>
            ${newStatus === 'active' ? `
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://acolheaqui.lovable.app/dashboard" style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                  Acessar Painel
                </a>
              </div>
            ` : ''}
          </div>
          <div style="background: #f1f5f9; padding: 20px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} AcolheAqui. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Generate email HTML for payment confirmation
function generatePaymentConfirmEmail(
  professionalName: string,
  planName: string,
  amount: number,
  billingCycle: string
): { subject: string; html: string } {
  const cycleLabels: Record<string, string> = {
    monthly: 'Mensal',
    semiannual: 'Semestral',
    annual: 'Anual',
  };

  const formattedAmount = (amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return {
    subject: `AcolheAqui - Pagamento confirmado! Plano ${planName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">AcolheAqui</h1>
          </div>
          <div style="padding: 30px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background: #10b98120; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">💳</span>
              </div>
            </div>
            <h2 style="color: #1e293b; text-align: center; margin-bottom: 10px;">🎉 Pagamento Confirmado!</h2>
            <p style="color: #475569; text-align: center; font-size: 16px; line-height: 1.6;">
              Olá, <strong>${professionalName}</strong>!
            </p>
            <p style="color: #475569; text-align: center; font-size: 16px; line-height: 1.6;">
              Seu pagamento foi confirmado com sucesso. Confira os detalhes abaixo:
            </p>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #64748b; padding: 8px 0;">Plano:</td>
                  <td style="color: #1e293b; font-weight: 600; text-align: right; padding: 8px 0;">${planName}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 8px 0;">Ciclo:</td>
                  <td style="color: #1e293b; font-weight: 600; text-align: right; padding: 8px 0;">${cycleLabels[billingCycle] || billingCycle}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 8px 0; border-top: 1px solid #e2e8f0;">Valor:</td>
                  <td style="color: #10b981; font-weight: 700; text-align: right; padding: 8px 0; border-top: 1px solid #e2e8f0; font-size: 18px;">${formattedAmount}</td>
                </tr>
              </table>
            </div>

            <p style="color: #475569; text-align: center; font-size: 14px; line-height: 1.6;">
              Todos os recursos do plano ${planName} já estão disponíveis para você!
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://acolheaqui.lovable.app/dashboard" style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Acessar Painel
              </a>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 20px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} AcolheAqui. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Generate WhatsApp message for status change
function generateStatusChangeWhatsApp(professionalName: string, newStatus: string): string {
  const messages: Record<string, string> = {
    active: `🎉 *Parabéns, ${professionalName}!*\n\nSua conta na AcolheAqui foi *aprovada e ativada*!\n\nVocê já pode acessar o painel e começar a receber pacientes.\n\n🔗 Acesse: https://acolheaqui.lovable.app/dashboard`,
    pending: `⏳ *Olá, ${professionalName}!*\n\nSua conta na AcolheAqui está *em análise*.\n\nNossa equipe está verificando suas informações. Você receberá uma atualização em breve.`,
    disabled: `⚠️ *Olá, ${professionalName}*\n\nSua conta na AcolheAqui foi *temporariamente desativada*.\n\nEntre em contato com nosso suporte para mais informações.`,
  };
  
  return messages[newStatus] || messages.pending;
}

// Generate WhatsApp message for payment confirmation
function generatePaymentWhatsApp(
  professionalName: string,
  planName: string,
  amount: number
): string {
  const formattedAmount = (amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  
  return `💳 *Pagamento Confirmado!*\n\nOlá, *${professionalName}*!\n\nSeu pagamento de *${formattedAmount}* para o plano *${planName}* foi confirmado com sucesso!\n\nTodos os recursos já estão disponíveis para você.\n\n🔗 Acesse: https://acolheaqui.lovable.app/dashboard`;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const baileysUrl = Deno.env.get('BAILEYS_SERVER_URL');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    const { action, professionalId, data } = payload;

    console.log(`Processing admin notification: ${action} for professional ${professionalId}`);

    if (!professionalId) {
      return new Response(
        JSON.stringify({ error: 'Missing professionalId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch professional data
    const { data: professional, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, subscription_plan')
      .eq('id', professionalId)
      .single();

    if (profError || !professional) {
      console.error('Professional not found:', profError);
      return new Response(
        JSON.stringify({ error: 'Professional not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check notification settings
    const { data: settingsData } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', ['admin_whatsapp_notifications', 'admin_email_notifications']);

    const settings: Record<string, boolean> = {
      admin_whatsapp_notifications: true,
      admin_email_notifications: true,
    };

    settingsData?.forEach((item) => {
      settings[item.key] = item.value === true || item.value === 'true';
    });

    const results = {
      email: false,
      whatsapp: false,
    };

    switch (action) {
      case 'professional_status_changed': {
        const newStatus = data?.newStatus || 'pending';
        
        // Send Email
        if (settings.admin_email_notifications && resendApiKey && professional.email) {
          const emailContent = generateStatusChangeEmail(professional.full_name || 'Profissional', newStatus);
          results.email = await sendEmailNotification(resendApiKey, professional.email, emailContent.subject, emailContent.html);
        }
        
        // Send WhatsApp
        if (settings.admin_whatsapp_notifications && professional.phone) {
          const whatsappMessage = generateStatusChangeWhatsApp(professional.full_name || 'Profissional', newStatus);
          results.whatsapp = await sendWhatsAppNotification(professional.phone, whatsappMessage, baileysUrl);
        }
        break;
      }
      
      case 'payment_confirmed': {
        const planName = data?.planName || professional.subscription_plan || 'Pro';
        const amount = data?.amount || 0;
        const billingCycle = data?.billingCycle || 'monthly';
        
        // Send Email
        if (settings.admin_email_notifications && resendApiKey && professional.email) {
          const emailContent = generatePaymentConfirmEmail(
            professional.full_name || 'Profissional',
            planName,
            amount,
            billingCycle
          );
          results.email = await sendEmailNotification(resendApiKey, professional.email, emailContent.subject, emailContent.html);
        }
        
        // Send WhatsApp
        if (settings.admin_whatsapp_notifications && professional.phone) {
          const whatsappMessage = generatePaymentWhatsApp(
            professional.full_name || 'Profissional',
            planName,
            amount
          );
          results.whatsapp = await sendWhatsAppNotification(professional.phone, whatsappMessage, baileysUrl);
        }
        break;
      }
      
      case 'test': {
        // Test notification
        if (resendApiKey && professional.email) {
          results.email = await sendEmailNotification(
            resendApiKey,
            professional.email,
            'AcolheAqui - Teste de Notificação',
            '<h1>Teste de notificação</h1><p>Esta é uma mensagem de teste do sistema de notificações.</p>'
          );
        }
        if (professional.phone) {
          results.whatsapp = await sendWhatsAppNotification(
            professional.phone,
            '🧪 *Teste de Notificação*\n\nEsta é uma mensagem de teste do sistema AcolheAqui.',
            baileysUrl
          );
        }
        break;
      }
    }

    console.log('Notification results:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in admin-notifications:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
