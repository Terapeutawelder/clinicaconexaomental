import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token and get appointment_id
    const { data: tokenData, error: tokenError } = await supabase
      .from("appointment_access_tokens")
      .select("appointment_id, expires_at, client_email")
      .eq("token", token)
      .maybeSingle();

    if (tokenError) {
      console.error("Token lookup error:", tokenError);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: "Token não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Token expirado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch appointment with professional info
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        id,
        client_name,
        client_email,
        appointment_date,
        appointment_time,
        duration_minutes,
        status,
        payment_status,
        session_type,
        virtual_room_link,
        notes,
        professional_id
      `)
      .eq("id", tokenData.appointment_id)
      .maybeSingle();

    if (appointmentError) {
      console.error("Appointment lookup error:", appointmentError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar agendamento" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!appointment) {
      return new Response(
        JSON.stringify({ error: "Agendamento não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify email matches (security check)
    if (appointment.client_email !== tokenData.client_email) {
      return new Response(
        JSON.stringify({ error: "Token inválido para este agendamento" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch professional info
    const { data: professional, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, specialty, avatar_url")
      .eq("id", appointment.professional_id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup error:", profileError);
    }

    // Build response (excluding sensitive data like recordings and AI analysis)
    const response = {
      appointment: {
        id: appointment.id,
        client_name: appointment.client_name,
        client_email: appointment.client_email,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        duration_minutes: appointment.duration_minutes,
        status: appointment.status,
        payment_status: appointment.payment_status,
        session_type: appointment.session_type,
        virtual_room_link: appointment.virtual_room_link,
        notes: appointment.notes,
        professional: professional || {
          full_name: "Profissional",
          specialty: "",
          avatar_url: null,
        },
      },
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
