import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (resets when function cold starts)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // Max 5 appointments per IP per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// Input validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validatePhone(phone: string): boolean {
  // Brazilian phone format or international
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15;
}

function validateName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

function validateNotes(notes: string | null): boolean {
  if (!notes) return true;
  return notes.length <= 1000;
}

function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

function validateDate(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Allow booking up to 90 days in advance
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 90);
  
  return date >= today && date <= maxDate;
}

function validateTime(timeStr: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(timeStr);
}

// Sanitize text input to prevent XSS
function sanitizeText(text: string): string {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";

    console.log(`[create-appointment] Request from IP: ${clientIP}`);

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      console.warn(`[create-appointment] Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: "Muitas solicitações. Por favor, aguarde antes de tentar novamente.",
          code: "RATE_LIMIT_EXCEEDED"
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "3600"
          } 
        }
      );
    }

    const body = await req.json();
    console.log(`[create-appointment] Processing appointment request`);

    const {
      professional_id,
      appointment_date,
      appointment_time,
      client_name,
      client_email,
      client_phone,
      notes,
      duration_minutes = 50,
    } = body;

    // Validate all inputs
    const validationErrors: string[] = [];

    if (!professional_id || !validateUUID(professional_id)) {
      validationErrors.push("ID do profissional inválido");
    }

    if (!appointment_date || !validateDate(appointment_date)) {
      validationErrors.push("Data do agendamento inválida");
    }

    if (!appointment_time || !validateTime(appointment_time)) {
      validationErrors.push("Horário do agendamento inválido");
    }

    if (!client_name || !validateName(client_name)) {
      validationErrors.push("Nome deve ter entre 2 e 100 caracteres");
    }

    if (!client_email || !validateEmail(client_email)) {
      validationErrors.push("E-mail inválido");
    }

    if (!client_phone || !validatePhone(client_phone)) {
      validationErrors.push("Telefone inválido");
    }

    if (!validateNotes(notes)) {
      validationErrors.push("Observações não podem exceder 1000 caracteres");
    }

    if (validationErrors.length > 0) {
      console.warn(`[create-appointment] Validation failed: ${validationErrors.join(", ")}`);
      return new Response(
        JSON.stringify({ 
          error: "Dados inválidos", 
          details: validationErrors,
          code: "VALIDATION_ERROR"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for bypassing RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify professional exists and is active
    const { data: professional, error: profError } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .eq("id", professional_id)
      .eq("is_professional", true)
      .maybeSingle();

    if (profError || !professional) {
      console.error(`[create-appointment] Professional not found: ${professional_id}`);
      return new Response(
        JSON.stringify({ error: "Profissional não encontrado", code: "PROFESSIONAL_NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the time slot is still available
    const { data: existingAppointment, error: checkError } = await supabase
      .from("appointments")
      .select("id")
      .eq("professional_id", professional_id)
      .eq("appointment_date", appointment_date)
      .eq("appointment_time", appointment_time)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (checkError) {
      console.error(`[create-appointment] Error checking availability: ${checkError.message}`);
      throw checkError;
    }

    if (existingAppointment) {
      console.warn(`[create-appointment] Time slot already booked`);
      return new Response(
        JSON.stringify({ 
          error: "Este horário já está reservado. Por favor, escolha outro horário.",
          code: "SLOT_UNAVAILABLE"
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize text inputs
    const sanitizedName = sanitizeText(client_name);
    const sanitizedEmail = client_email.toLowerCase().trim();
    const sanitizedPhone = client_phone.replace(/\D/g, "");
    const sanitizedNotes = notes ? sanitizeText(notes) : null;

    // Insert the appointment
    const { data: appointment, error: insertError } = await supabase
      .from("appointments")
      .insert({
        professional_id,
        appointment_date,
        appointment_time,
        client_name: sanitizedName,
        client_email: sanitizedEmail,
        client_phone: sanitizedPhone,
        notes: sanitizedNotes,
        status: "pending",
        payment_status: "pending",
        duration_minutes,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(`[create-appointment] Insert error: ${insertError.message}`);
      throw insertError;
    }

    console.log(`[create-appointment] Created appointment: ${appointment.id}`);

    // Create access token for client to view their appointment
    const { data: token, error: tokenError } = await supabase
      .from("appointment_access_tokens")
      .insert({
        appointment_id: appointment.id,
        client_email: sanitizedEmail,
      })
      .select("token")
      .single();

    if (tokenError) {
      console.error(`[create-appointment] Token creation error: ${tokenError.message}`);
      // Don't fail the whole request, just log
    }

    console.log(`[create-appointment] Successfully created appointment with access token`);

    return new Response(
      JSON.stringify({
        success: true,
        appointment_id: appointment.id,
        access_token: token?.token || null,
        message: "Agendamento realizado com sucesso!",
      }),
      { 
        status: 201, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": rateLimit.remaining.toString()
        } 
      }
    );

  } catch (error) {
    console.error(`[create-appointment] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno. Por favor, tente novamente.",
        code: "INTERNAL_ERROR"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
