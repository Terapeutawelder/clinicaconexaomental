import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const evolutionApiUrl = Deno.env.get("EVOLUTION_API_URL") || "https://evo.agenteluzia.online";
const evolutionApiKey = Deno.env.get("EVOLUTION_API_KEY");
const evolutionInstanceName = Deno.env.get("EVOLUTION_INSTANCE_NAME");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AppointmentNotification {
  professionalId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName?: string;
  amountCents?: number;
  notes?: string;
  virtualRoomLink?: string;
  accessToken?: string;
  checkoutUrl?: string;
}

// Format phone number to international format (Brazil)
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('55')) {
    return cleaned;
  }
  return `55${cleaned}`;
};

// Send WhatsApp message via Evolution API
const sendWhatsAppMessage = async (
  apiUrl: string,
  apiKey: string,
  instanceName: string,
  phone: string, 
  message: string
): Promise<boolean> => {
  if (!apiKey || !instanceName) {
    console.log("Evolution API not configured, skipping WhatsApp notification");
    return false;
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);
    console.log(`Sending WhatsApp message to ${formattedPhone}`);

    const response = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
      }),
    });

    const responseData = await response.json();
    console.log("Evolution API response:", JSON.stringify(responseData));

    if (!response.ok) {
      console.error("Evolution API error:", responseData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};

// Send email notification via Resend API
const sendEmailNotification = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  if (!RESEND_API_KEY) {
    console.log("Resend API key not configured, skipping email notification");
    return false;
  }

  try {
    console.log(`Sending email to ${to}`);
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AcolheAqui <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    const responseData = await response.json();
    console.log("Resend API response:", JSON.stringify(responseData));

    if (!response.ok) {
      console.error("Resend API error:", responseData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const data: AppointmentNotification = await req.json();
    console.log("Received notification request:", JSON.stringify(data));

    const {
      professionalId,
      clientName,
      clientEmail,
      clientPhone,
      appointmentDate,
      appointmentTime,
      serviceName,
      amountCents,
    } = data;

    // Fetch professional info including gender for title prefix
    const { data: professionalData, error: profError } = await supabase
      .from("profiles")
      .select("full_name, phone, email, whatsapp_number, gender")
      .eq("id", professionalId)
      .single();

    if (profError) {
      console.error("Error fetching professional:", profError);
    }

    // Format professional name with Dr./Dra. prefix based on gender
    const formatProfessionalName = (fullName: string | null, gender: string | null): string => {
      if (!fullName) return 'Profissional';
      const prefix = gender === 'male' ? 'Dr.' : gender === 'other' ? 'Dr.' : 'Dra.';
      return `${prefix} ${fullName}`;
    };

    const professionalName = formatProfessionalName(professionalData?.full_name, professionalData?.gender);
    const professionalPhone = professionalData?.whatsapp_number || professionalData?.phone;

    // Fetch WhatsApp settings for this professional
    const { data: whatsappSettings, error: settingsError } = await supabase
      .from("whatsapp_settings")
      .select("*")
      .eq("professional_id", professionalId)
      .eq("is_active", true)
      .maybeSingle();

    if (settingsError) {
      console.error("Error fetching WhatsApp settings:", settingsError);
    }

    const confirmationEnabled = whatsappSettings?.confirmation_enabled ?? true;
    const useEvolutionApi = whatsappSettings?.evolution_api_key && whatsappSettings?.evolution_instance_name;
    
    // Get custom templates if available
    const customTemplates = {
      clientConfirmation: (whatsappSettings as any)?.template_client_confirmation || null,
      professionalNotification: (whatsappSettings as any)?.template_professional_notification || null,
      emailConfirmation: (whatsappSettings as any)?.template_email_confirmation || null,
    };
    
    // Template variable replacement helper
    const replaceTemplateVariables = (template: string, vars: Record<string, string>): string => {
      let result = template;
      for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
      }
      return result;
    };

    // Format date for display
    const [year, month, day] = appointmentDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    const formattedPrice = amountCents ? (amountCents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }) : null;

    // Template variables for replacement
    const templateVars = {
      client_name: clientName,
      professional_name: professionalName,
      service_name: serviceName || '',
      date: formattedDate,
      time: appointmentTime,
      price: formattedPrice || '',
      client_phone: clientPhone || 'Não informado',
      client_email: clientEmail,
      notes: data.notes || '',
      virtual_room_link: data.virtualRoomLink || '',
      checkout_url: data.checkoutUrl || '',
    };

    const results = {
      emailToClient: false,
      whatsappToClient: false,
      whatsappToProfessional: false,
    };

    // 1. Send email to client
    let clientEmailHtml = '';
    if (customTemplates.emailConfirmation) {
      clientEmailHtml = replaceTemplateVariables(customTemplates.emailConfirmation, templateVars);
    } else {
      clientEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2A9D8F; margin-bottom: 20px;">Agendamento Confirmado! ✅</h1>
          <p>Olá, <strong>${clientName}</strong>!</p>
          <p>Seu agendamento foi realizado com sucesso.</p>
          
          <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">Detalhes do Agendamento</h3>
            <p style="margin: 5px 0;"><strong>Profissional:</strong> ${professionalName}</p>
            ${serviceName ? `<p style="margin: 5px 0;"><strong>Serviço:</strong> ${serviceName}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Data:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${appointmentTime}</p>
            ${formattedPrice ? `<p style="margin: 5px 0;"><strong>Valor:</strong> ${formattedPrice}</p>` : ''}
          </div>
          
          ${data.virtualRoomLink ? `
          <div style="background: linear-gradient(135deg, #2A9D8F 0%, #1e7a6e 100%); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="margin: 0 0 10px 0; color: #ffffff;">🎥 Link da Sessão Online</h3>
            <p style="margin: 0 0 15px 0; color: rgba(255,255,255,0.9); font-size: 14px;">Acesse a sessão no horário marcado pelo link abaixo:</p>
            <a href="${data.virtualRoomLink}" style="display: inline-block; background: #ffffff; color: #2A9D8F; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Acessar Sessão</a>
            <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.7); font-size: 12px; word-break: break-all;">${data.virtualRoomLink}</p>
          </div>
          ` : ''}
          
          ${data.checkoutUrl ? `
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="margin: 0 0 10px 0; color: #ffffff;">💳 Pagamento Pendente</h3>
            <p style="margin: 0 0 15px 0; color: rgba(255,255,255,0.9); font-size: 14px;">Clique no botão abaixo para realizar o pagamento da sua sessão:</p>
            <a href="${data.checkoutUrl}" style="display: inline-block; background: #ffffff; color: #10b981; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Pagar Agora</a>
          </div>
          ` : ''}
          ${data.accessToken ? `
          <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #fcd34d;">
            <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;">📅 Precisa reagendar?</h3>
            <p style="margin: 0 0 12px 0; color: #78350f; font-size: 13px;">Você pode reagendar sua consulta clicando no botão abaixo (até 24h antes):</p>
            <a href="https://www.acolheaqui.com.br/reagendar?token=${data.accessToken}" style="display: inline-block; background: #d97706; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">Reagendar Consulta</a>
          </div>
          ` : ''}
          
          <p style="color: #6b7280; font-size: 14px;">
            Caso precise cancelar, entre em contato diretamente com o profissional.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Este e-mail foi enviado automaticamente pelo sistema AcolheAqui.
          </p>
        </div>
      `;
    }

    results.emailToClient = await sendEmailNotification(
      clientEmail,
      `Agendamento confirmado para ${formattedDate} às ${appointmentTime}`,
      clientEmailHtml
    );

    // 2. Send WhatsApp to client (if enabled)
    if (confirmationEnabled && clientPhone) {
      let clientWhatsAppMessage = '';
      if (customTemplates.clientConfirmation) {
        clientWhatsAppMessage = replaceTemplateVariables(customTemplates.clientConfirmation, templateVars);
      } else {
        clientWhatsAppMessage = `✅ *Agendamento Confirmado!*

Olá, ${clientName}!

Seu agendamento foi realizado com sucesso.

📋 *Detalhes:*
👤 Profissional: ${professionalName}
${serviceName ? `📌 Serviço: ${serviceName}` : ''}
📅 Data: ${formattedDate}
🕐 Horário: ${appointmentTime}
${formattedPrice ? `💰 Valor: ${formattedPrice}` : ''}
${data.checkoutUrl ? `

💳 *Link de Pagamento:*
${data.checkoutUrl}` : ''}

Caso precise remarcar ou cancelar, entre em contato diretamente com o profissional.`;
      }

      if (useEvolutionApi) {
        // Use professional's own Evolution API config
        const apiUrl = whatsappSettings.evolution_api_url || evolutionApiUrl;
        results.whatsappToClient = await sendWhatsAppMessage(
          apiUrl,
          whatsappSettings.evolution_api_key,
          whatsappSettings.evolution_instance_name,
          clientPhone, 
          clientWhatsAppMessage
        );
      } else if (evolutionApiKey && evolutionInstanceName) {
        // Fallback to global Evolution API config
        results.whatsappToClient = await sendWhatsAppMessage(
          evolutionApiUrl,
          evolutionApiKey,
          evolutionInstanceName,
          clientPhone, 
          clientWhatsAppMessage
        );
      }
    }

    // 3. Send WhatsApp to professional (if phone is provided)
    if (professionalPhone) {
      let professionalMessage = '';
      if (customTemplates.professionalNotification) {
        professionalMessage = replaceTemplateVariables(customTemplates.professionalNotification, templateVars);
      } else {
        professionalMessage = `📅 *Novo Agendamento!*

Você tem um novo agendamento:

👤 *Cliente:* ${clientName}
📱 *Telefone:* ${clientPhone || 'Não informado'}
📧 *E-mail:* ${clientEmail}
${serviceName ? `📌 *Serviço:* ${serviceName}` : ''}
📅 *Data:* ${formattedDate}
🕐 *Horário:* ${appointmentTime}
${formattedPrice ? `💰 *Valor:* ${formattedPrice}` : ''}

${data.notes ? `📝 *Observações:* ${data.notes}` : ''}`;
      }

      if (useEvolutionApi) {
        const apiUrl = whatsappSettings.evolution_api_url || evolutionApiUrl;
        results.whatsappToProfessional = await sendWhatsAppMessage(
          apiUrl,
          whatsappSettings.evolution_api_key,
          whatsappSettings.evolution_instance_name,
          professionalPhone, 
          professionalMessage
        );
      } else if (evolutionApiKey && evolutionInstanceName) {
        results.whatsappToProfessional = await sendWhatsAppMessage(
          evolutionApiUrl,
          evolutionApiKey,
          evolutionInstanceName,
          professionalPhone, 
          professionalMessage
        );
      }
    }

    console.log("Notification results:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-appointment-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);