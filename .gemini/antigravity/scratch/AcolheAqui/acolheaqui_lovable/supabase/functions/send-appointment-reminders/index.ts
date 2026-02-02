import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  evolutionApiUrl: string,
  evolutionApiKey: string,
  evolutionInstanceName: string,
  phone: string, 
  message: string
): Promise<boolean> => {
  try {
    const formattedPhone = formatPhoneNumber(phone);
    console.log(`Sending WhatsApp reminder to ${formattedPhone}`);

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

// Send email reminder via Resend API
const sendEmailReminder = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  if (!RESEND_API_KEY) {
    console.log("Resend API key not configured, skipping email reminder");
    return false;
  }

  try {
    console.log(`Sending email reminder to ${to}`);
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AcolheAqui <noreply@acolheaqui.com.br>",
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();
    console.log("Resend API response:", JSON.stringify(data));

    if (!response.ok) {
      console.error("Resend API error:", data);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email reminder:", error);
    return false;
  }
};

// Format professional name with Dr./Dra. prefix
const formatProfessionalName = (fullName: string | null, gender: string | null): string => {
  if (!fullName) return 'Profissional';
  const prefix = gender === 'male' ? 'Dr.' : gender === 'other' ? 'Dr.' : 'Dra.';
  return `${prefix} ${fullName}`;
};

serve(async (req) => {
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

    // Parse request body for specific reminder type (optional)
    let reminderType = "24h"; // Default to 24h reminder
    try {
      const body = await req.json();
      if (body.reminderType === "1h") {
        reminderType = "1h";
      }
    } catch {
      // No body provided, use default
    }

    const now = new Date();
    let minTime: Date, maxTime: Date;

    if (reminderType === "1h") {
      // 1 hour reminder: appointments between 50 and 70 minutes from now
      minTime = new Date(now.getTime() + 50 * 60 * 1000);
      maxTime = new Date(now.getTime() + 70 * 60 * 1000);
    } else {
      // 24 hour reminder: appointments between 23 and 25 hours from now
      minTime = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      maxTime = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    }

    const minDate = minTime.toISOString().split("T")[0];
    const maxDate = maxTime.toISOString().split("T")[0];
    const minTimeStr = minTime.toTimeString().substring(0, 5) + ":00";
    const maxTimeStr = maxTime.toTimeString().substring(0, 5) + ":00";

    console.log(`[${reminderType}] Checking for appointments between ${minDate} ${minTimeStr} and ${maxDate} ${maxTimeStr}`);

    // Get appointments that need reminders
    let appointments: any[] = [];

    if (minDate === maxDate) {
      // Same day - simple query
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          profiles!appointments_professional_id_fkey (
            id,
            full_name,
            phone,
            gender,
            email
          )
        `)
        .eq("appointment_date", minDate)
        .gte("appointment_time", minTimeStr)
        .lte("appointment_time", maxTimeStr)
        .in("status", ["pending", "confirmed"])
        .in("payment_status", ["paid", "completed"]);

      if (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }
      appointments = data || [];
    } else {
      // Spans midnight - need two queries
      const { data: todayData, error: todayError } = await supabase
        .from("appointments")
        .select(`
          *,
          profiles!appointments_professional_id_fkey (
            id,
            full_name,
            phone,
            gender,
            email
          )
        `)
        .eq("appointment_date", minDate)
        .gte("appointment_time", minTimeStr)
        .in("status", ["pending", "confirmed"])
        .in("payment_status", ["paid", "completed"]);

      if (todayError) {
        console.error("Error fetching today appointments:", todayError);
        throw todayError;
      }

      const { data: tomorrowData, error: tomorrowError } = await supabase
        .from("appointments")
        .select(`
          *,
          profiles!appointments_professional_id_fkey (
            id,
            full_name,
            phone,
            gender,
            email
          )
        `)
        .eq("appointment_date", maxDate)
        .lte("appointment_time", maxTimeStr)
        .in("status", ["pending", "confirmed"])
        .in("payment_status", ["paid", "completed"]);

      if (tomorrowError) {
        console.error("Error fetching tomorrow appointments:", tomorrowError);
        throw tomorrowError;
      }

      appointments = [...(todayData || []), ...(tomorrowData || [])];
    }

    console.log(`Found ${appointments.length} appointments needing ${reminderType} reminders`);

    const results: any[] = [];

    for (const appointment of appointments) {
      const professionalId = appointment.professional_id;

      // Get WhatsApp settings for this professional
      const { data: whatsappSettings, error: settingsError } = await supabase
        .from("whatsapp_settings")
        .select("*")
        .eq("professional_id", professionalId)
        .eq("is_active", true)
        .eq("reminder_enabled", true)
        .maybeSingle();

      if (settingsError) {
        console.error(`Error fetching WhatsApp settings for professional ${professionalId}:`, settingsError);
        continue;
      }

      // Get custom template if available
      const customTemplate = (whatsappSettings as any)?.template_client_reminder || null;
      
      // Template variable replacement helper
      const replaceTemplateVariables = (template: string, vars: Record<string, string>): string => {
        let result = template;
        for (const [key, value] of Object.entries(vars)) {
          result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
        }
        return result;
      };

      // Format date for display
      const [year, month, day] = appointment.appointment_date.split('-');
      const formattedDate = `${day}/${month}/${year}`;
      const appointmentTime = appointment.appointment_time.substring(0, 5);
      
      const professionalName = formatProfessionalName(appointment.profiles?.full_name, appointment.profiles?.gender);
      const meetLink = appointment.virtual_room_link || '';

      // Template variables
      const templateVars = {
        client_name: appointment.client_name,
        professional_name: professionalName,
        date: formattedDate,
        time: appointmentTime,
        virtual_room_link: meetLink,
      };

      // Determine time reference text
      const timeReference = reminderType === "1h" ? "em *1 hora*" : "*amanhã*";

      // Build reminder message for WhatsApp
      let reminderMessage = '';
      if (customTemplate) {
        reminderMessage = replaceTemplateVariables(customTemplate, templateVars);
      } else {
        reminderMessage = `⏰ *Lembrete de Consulta*

Olá, ${appointment.client_name}!

${reminderType === "1h" ? "Sua consulta começará em *1 hora*!" : "Este é um lembrete da sua consulta agendada para *amanhã*:"}

📅 *Data:* ${formattedDate}
🕐 *Horário:* ${appointmentTime}
👤 *Profissional:* ${professionalName}
${meetLink ? `\n🔗 *Link da Sessão:* ${meetLink}` : ''}

${reminderType === "1h" ? "Prepare-se e acesse o link no horário marcado." : "Por favor, confirme sua presença ou entre em contato caso precise reagendar."}

Até breve! 💜`;
      }

      let whatsappSent = false;
      let emailSent = false;

      // Send WhatsApp reminder
      if (whatsappSettings && whatsappSettings.evolution_api_key && whatsappSettings.evolution_instance_name && appointment.client_phone) {
        const evolutionApiUrl = whatsappSettings.evolution_api_url || "https://evo.agenteluzia.online";
        
        whatsappSent = await sendWhatsAppMessage(
          evolutionApiUrl,
          whatsappSettings.evolution_api_key,
          whatsappSettings.evolution_instance_name,
          appointment.client_phone,
          reminderMessage
        );
      }

      // Send email reminder
      if (appointment.client_email) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2A9D8F; margin-bottom: 20px;">⏰ Lembrete de Consulta</h1>
            <p>Olá, <strong>${appointment.client_name}</strong>!</p>
            <p>${reminderType === "1h" ? "Sua consulta começará em <strong>1 hora</strong>!" : "Este é um lembrete da sua consulta agendada para <strong>amanhã</strong>."}</p>
            
            <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">📋 Detalhes do Agendamento</h3>
              <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>🕐 Horário:</strong> ${appointmentTime}</p>
              <p style="margin: 5px 0;"><strong>👤 Profissional:</strong> ${professionalName}</p>
            </div>
            
            ${meetLink ? `
            <div style="background: linear-gradient(135deg, #2A9D8F 0%, #1e7a6e 100%); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
              <h3 style="margin: 0 0 10px 0; color: #ffffff;">🎥 Link da Sessão Online</h3>
              <p style="margin: 0 0 15px 0; color: rgba(255,255,255,0.9); font-size: 14px;">Acesse a sessão no horário marcado:</p>
              <a href="${meetLink}" style="display: inline-block; background: #ffffff; color: #2A9D8F; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Acessar Sessão</a>
            </div>
            ` : ''}
            
            <p style="color: #6b7280; font-size: 14px;">
              ${reminderType === "1h" ? "Prepare-se e acesse o link no horário marcado." : "Caso precise reagendar, entre em contato com o profissional."}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Este e-mail foi enviado automaticamente pelo sistema AcolheAqui.
            </p>
          </div>
        `;

        emailSent = await sendEmailReminder(
          appointment.client_email,
          `⏰ Lembrete: Consulta ${reminderType === "1h" ? "em 1 hora" : "amanhã"} às ${appointmentTime}`,
          emailHtml
        );
      }

      results.push({
        appointment_id: appointment.id,
        client_name: appointment.client_name,
        client_phone: appointment.client_phone,
        client_email: appointment.client_email,
        appointment_date: appointment.appointment_date,
        appointment_time: appointmentTime,
        reminder_type: reminderType,
        whatsapp_sent: whatsappSent,
        email_sent: emailSent,
      });

      // Add a small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("Reminder results:", JSON.stringify(results));

    const whatsappSuccess = results.filter(r => r.whatsapp_sent).length;
    const emailSuccess = results.filter(r => r.email_sent).length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminderType,
        message: `Enviados ${whatsappSuccess} lembretes WhatsApp e ${emailSuccess} e-mails`,
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
