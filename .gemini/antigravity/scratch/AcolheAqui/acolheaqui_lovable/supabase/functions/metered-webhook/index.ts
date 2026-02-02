import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MeteredWebhookPayload {
  event: string;
  app_id?: string;
  usage_percentage?: number;
  current_usage?: number;
  limit?: number;
  timestamp?: string;
  data?: Record<string, unknown>;
}

async function sendEmail(
  resendApiKey: string,
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Sistema <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  console.log("Email sent successfully");
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Metered webhook received");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: MeteredWebhookPayload = await req.json();
    console.log("Webhook payload:", JSON.stringify(payload, null, 2));

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@example.com";

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const usagePercentage = payload.usage_percentage || 0;
    let alertLevel = "";
    let alertColor = "";
    let shouldNotify = false;

    if (usagePercentage >= 100) {
      alertLevel = "CRÍTICO";
      alertColor = "#DC2626";
      shouldNotify = true;
    } else if (usagePercentage >= 80) {
      alertLevel = "ATENÇÃO";
      alertColor = "#F59E0B";
      shouldNotify = true;
    }

    if (shouldNotify) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: ${alertColor}; color: white; padding: 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 24px; }
            .stat { background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 12px 0; display: flex; justify-content: space-between; align-items: center; }
            .stat-label { color: #6b7280; font-size: 14px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
            .progress-bar { background: #e5e7eb; border-radius: 9999px; height: 12px; overflow: hidden; margin-top: 16px; }
            .progress-fill { background: ${alertColor}; height: 100%; }
            .footer { background: #f8f9fa; padding: 16px; text-align: center; color: #6b7280; font-size: 12px; }
            .action-needed { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Alerta de Uso TURN Server - ${alertLevel}</h1>
            </div>
            <div class="content">
              <p>O uso do seu servidor TURN (Metered.ca) atingiu <strong>${usagePercentage}%</strong> da cota mensal.</p>
              
              <div class="stat">
                <div>
                  <div class="stat-label">Uso Atual</div>
                  <div class="stat-value">${usagePercentage}%</div>
                </div>
                <div>
                  <div class="stat-label">Status</div>
                  <div class="stat-value" style="color: ${alertColor}">${alertLevel}</div>
                </div>
              </div>
              
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(usagePercentage, 100)}%"></div>
              </div>
              
              ${usagePercentage >= 100 ? `
              <div class="action-needed">
                <strong>🚨 Ação Necessária:</strong>
                <p style="margin: 8px 0 0 0;">A cota foi atingida. Novas videochamadas podem ser afetadas.</p>
                <ul style="margin: 8px 0;">
                  <li>Fazer upgrade do plano Metered.ca</li>
                  <li>Migrar para servidor TURN próprio (Coturn)</li>
                </ul>
              </div>
              ` : `
              <div class="action-needed">
                <strong>⚠️ Atenção:</strong>
                <p style="margin: 8px 0 0 0;">A cota está próxima do limite. Monitore o uso.</p>
              </div>
              `}
              
              <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
                Timestamp: ${payload.timestamp || new Date().toISOString()}<br>
                App ID: ${payload.app_id || 'N/A'}
              </p>
            </div>
            <div class="footer">
              Alerta automático do sistema de videochamadas
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail(
        resendApiKey,
        adminEmail,
        `[${alertLevel}] Uso TURN Server: ${usagePercentage}%`,
        emailHtml
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: shouldNotify ? "Alert sent" : "Event logged",
        usage_percentage: usagePercentage,
        alert_level: alertLevel || "none"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing webhook:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
