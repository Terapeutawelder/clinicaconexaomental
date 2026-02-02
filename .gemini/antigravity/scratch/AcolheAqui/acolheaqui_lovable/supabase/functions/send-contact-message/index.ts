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

interface ContactMessageRequest {
  professionalId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
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
  phone: string, 
  message: string
): Promise<boolean> => {
  if (!evolutionApiKey || !evolutionInstanceName) {
    console.log("Evolution API not configured, skipping WhatsApp notification");
    return false;
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);
    console.log(`Sending WhatsApp message to ${formattedPhone}`);

    const response = await fetch(`${evolutionApiUrl}/message/sendText/${evolutionInstanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": evolutionApiKey,
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

    const data: ContactMessageRequest = await req.json();
    console.log("Received contact message request:", JSON.stringify(data));

    const { professionalId, name, email, phone, message } = data;

    // Validate required fields
    if (!professionalId || !name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate message length
    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message too long (max 2000 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch professional info using the secure function
    const { data: professionalContact, error: contactError } = await supabase
      .rpc("get_professional_contact", { professional_id: professionalId });

    if (contactError || !professionalContact || professionalContact.length === 0) {
      console.error("Error fetching professional contact:", contactError);
      return new Response(
        JSON.stringify({ error: "Professional not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const professionalEmail = professionalContact[0]?.email;
    const professionalPhone = professionalContact[0]?.phone;

    // Fetch professional name and gender for notifications
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, gender")
      .eq("id", professionalId)
      .single();

    // Format professional name with Dr./Dra. prefix based on gender
    const formatProfessionalName = (fullName: string | null, gender: string | null): string => {
      if (!fullName) return 'Profissional';
      const prefix = gender === 'male' ? 'Dr.' : gender === 'other' ? 'Dr.' : 'Dra.';
      return `${prefix} ${fullName}`;
    };

    const professionalName = formatProfessionalName(profileData?.full_name, profileData?.gender);

    const results = {
      emailSent: false,
      whatsappSent: false,
    };

    // Send email notification to professional
    if (professionalEmail) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f0; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #2a9d8f, #264653); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .field { margin-bottom: 20px; }
            .field-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
            .field-value { font-size: 16px; color: #264653; }
            .message-box { background: #f5f5f0; padding: 20px; border-radius: 8px; border-left: 4px solid #2a9d8f; }
            .footer { background: #264653; color: white; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📩 Nova Mensagem de Contato</h1>
            </div>
            <div class="content">
              <p>Olá ${professionalName},</p>
              <p>Você recebeu uma nova mensagem através do seu site:</p>
              
              <div class="field">
                <div class="field-label">Nome</div>
                <div class="field-value">${name}</div>
              </div>
              
              <div class="field">
                <div class="field-label">E-mail</div>
                <div class="field-value"><a href="mailto:${email}">${email}</a></div>
              </div>
              
              ${phone ? `
              <div class="field">
                <div class="field-label">Telefone</div>
                <div class="field-value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              ` : ''}
              
              <div class="field">
                <div class="field-label">Mensagem</div>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>Esta mensagem foi enviada através da plataforma AcolheAqui</p>
            </div>
          </div>
        </body>
        </html>
      `;

      results.emailSent = await sendEmailNotification(
        professionalEmail,
        `📩 Nova mensagem de ${name}`,
        emailHtml
      );
    }

    // Send WhatsApp notification to professional
    if (professionalPhone) {
      const whatsappMessage = `📩 *Nova Mensagem de Contato*

*De:* ${name}
*E-mail:* ${email}
${phone ? `*Telefone:* ${phone}` : ''}

*Mensagem:*
${message}

---
_Enviado via AcolheAqui_`;

      results.whatsappSent = await sendWhatsAppMessage(professionalPhone, whatsappMessage);
    }

    // Check if at least one notification was sent
    if (!results.emailSent && !results.whatsappSent) {
      console.warn("No notifications were sent - professional may not have contact info configured");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contact message sent successfully",
        notifications: results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Error in send-contact-message function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
