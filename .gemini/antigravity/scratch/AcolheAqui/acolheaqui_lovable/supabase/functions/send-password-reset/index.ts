import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  redirectTo: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectTo }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Generate password recovery link
    const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: redirectTo,
      },
    });

    if (linkError) {
      console.error("Error generating recovery link:", linkError);
      // Don't reveal if email exists or not for security
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const recoveryLink = data?.properties?.action_link;

    if (!recoveryLink) {
      console.error("No recovery link generated");
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send Portuguese email via Resend using fetch
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AcolheAqui <noreply@acolheaqui.com.br>",
        to: [email],
        subject: "Redefina sua senha",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2a9d8f; margin: 0; font-size: 28px;">AcolheAqui</h1>
            </div>
            
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px;">Redefina sua senha</h2>
              
              <p style="color: #4b5563; margin: 0 0 24px 0;">
                Você solicitou recentemente a redefinição da sua senha. Clique no botão abaixo para escolher uma nova senha:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${recoveryLink}" 
                   style="background-color: #2a9d8f; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Redefinir senha
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0;">
                Se você não solicitou essa alteração, pode ignorar este e-mail com segurança.
              </p>
            </div>
            
            <div style="text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">Este link expira em 24 horas.</p>
              <p style="margin: 8px 0 0 0;">© ${new Date().getFullYear()} AcolheAqui. Todos os direitos reservados.</p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
