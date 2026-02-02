import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAYS_OF_WEEK = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

const tools = [
  {
    type: "function",
    function: {
      name: "get_available_hours",
      description: "Consulta os horários disponíveis do profissional para uma data específica. Use quando o cliente perguntar sobre disponibilidade ou quiser agendar.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "Data no formato YYYY-MM-DD para consultar disponibilidade",
          },
        },
        required: ["date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_appointment",
      description: "Cria um novo agendamento para o cliente. Use após confirmar data, horário e dados do cliente.",
      parameters: {
        type: "object",
        properties: {
          client_name: {
            type: "string",
            description: "Nome completo do cliente",
          },
          client_email: {
            type: "string",
            description: "Email do cliente",
          },
          client_phone: {
            type: "string",
            description: "Telefone do cliente (opcional)",
          },
          appointment_date: {
            type: "string",
            description: "Data do agendamento no formato YYYY-MM-DD",
          },
          appointment_time: {
            type: "string",
            description: "Horário do agendamento no formato HH:MM",
          },
          session_type: {
            type: "string",
            description: "Tipo de sessão (ex: Consulta Online, Primeira Consulta)",
          },
          notes: {
            type: "string",
            description: "Observações adicionais (opcional)",
          },
        },
        required: ["client_name", "client_email", "appointment_date", "appointment_time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_next_available_slots",
      description: "Retorna os próximos horários disponíveis nos próximos dias. Use quando o cliente quiser saber quando há disponibilidade.",
      parameters: {
        type: "object",
        properties: {
          days_ahead: {
            type: "number",
            description: "Número de dias à frente para buscar (padrão: 7)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_appointment",
      description: "Busca um agendamento existente pelo email ou telefone do cliente. Use quando o cliente quiser cancelar ou remarcar.",
      parameters: {
        type: "object",
        properties: {
          client_email: {
            type: "string",
            description: "Email do cliente para buscar o agendamento",
          },
          client_phone: {
            type: "string",
            description: "Telefone do cliente para buscar o agendamento (opcional)",
          },
        },
        required: ["client_email"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_appointment",
      description: "Cancela um agendamento existente. Use após confirmar com o cliente que deseja cancelar.",
      parameters: {
        type: "object",
        properties: {
          appointment_id: {
            type: "string",
            description: "ID do agendamento a ser cancelado",
          },
          reason: {
            type: "string",
            description: "Motivo do cancelamento (opcional)",
          },
        },
        required: ["appointment_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reschedule_appointment",
      description: "Remarca um agendamento existente para uma nova data/horário. Use após confirmar a nova data com o cliente.",
      parameters: {
        type: "object",
        properties: {
          appointment_id: {
            type: "string",
            description: "ID do agendamento a ser remarcado",
          },
          new_date: {
            type: "string",
            description: "Nova data no formato YYYY-MM-DD",
          },
          new_time: {
            type: "string",
            description: "Novo horário no formato HH:MM",
          },
        },
        required: ["appointment_id", "new_date", "new_time"],
      },
    },
  },
];

async function getAvailableHours(supabase: any, professionalId: string, date: string) {
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // Get professional's available hours for this day
  const { data: hours, error: hoursError } = await supabase
    .from("available_hours")
    .select("*")
    .eq("professional_id", professionalId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  if (hoursError) {
    console.error("Error fetching hours:", hoursError);
    return { error: "Erro ao consultar horários" };
  }

  if (!hours || hours.length === 0) {
    return { available: false, message: `Não há horários disponíveis para ${DAYS_OF_WEEK[dayOfWeek]}.` };
  }

  // Get existing appointments for this date
  const { data: appointments, error: appError } = await supabase
    .from("appointments")
    .select("appointment_time, duration_minutes")
    .eq("professional_id", professionalId)
    .eq("appointment_date", date)
    .neq("status", "cancelled");

  if (appError) {
    console.error("Error fetching appointments:", appError);
  }

  const bookedTimes = new Set(appointments?.map((a: any) => a.appointment_time.substring(0, 5)) || []);

  // Generate available time slots
  const availableSlots: string[] = [];
  for (const hour of hours) {
    const start = hour.start_time.substring(0, 5);
    const end = hour.end_time.substring(0, 5);
    
    let currentTime = start;
    while (currentTime < end) {
      if (!bookedTimes.has(currentTime)) {
        availableSlots.push(currentTime);
      }
      // Add 50 minutes (default session duration)
      const [h, m] = currentTime.split(":").map(Number);
      const totalMinutes = h * 60 + m + 50;
      const newH = Math.floor(totalMinutes / 60);
      const newM = totalMinutes % 60;
      currentTime = `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
    }
  }

  return {
    available: availableSlots.length > 0,
    date,
    day: DAYS_OF_WEEK[dayOfWeek],
    slots: availableSlots,
    message: availableSlots.length > 0
      ? `Horários disponíveis para ${DAYS_OF_WEEK[dayOfWeek]} (${date}): ${availableSlots.join(", ")}`
      : `Não há horários disponíveis para ${DAYS_OF_WEEK[dayOfWeek]} (${date}).`,
  };
}

async function sendNotifications(
  supabaseUrl: string,
  supabaseKey: string,
  notificationData: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    professionalName: string;
    professionalPhone?: string;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
  }
) {
  try {
    console.log("Sending notifications:", JSON.stringify(notificationData));
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-appointment-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(notificationData),
    });

    const result = await response.json();
    console.log("Notification result:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("Error sending notifications:", error);
    return { error: "Falha ao enviar notificações" };
  }
}

async function createAppointment(supabase: any, professionalId: string, params: any, professionalContext?: any) {
  const { client_name, client_email, client_phone, appointment_date, appointment_time, session_type, notes } = params;

  // Input validation
  if (!client_name || client_name.trim().length < 2 || client_name.trim().length > 100) {
    return { success: false, message: "Nome inválido. O nome deve ter entre 2 e 100 caracteres." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!client_email || !emailRegex.test(client_email) || client_email.length > 254) {
    return { success: false, message: "Por favor, informe um email válido." };
  }

  if (client_phone) {
    const phoneDigits = client_phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return { success: false, message: "Por favor, informe um telefone válido." };
    }
  }

  // Date validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!appointment_date || !dateRegex.test(appointment_date)) {
    return { success: false, message: "Por favor, informe uma data válida no formato AAAA-MM-DD." };
  }

  const appointmentDateObj = new Date(appointment_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDateObj < today) {
    return { success: false, message: "Não é possível agendar para datas passadas." };
  }

  // Validate the slot is available
  const availability = await getAvailableHours(supabase, professionalId, appointment_date);
  if (!availability.available || !availability.slots?.includes(appointment_time)) {
    return { success: false, message: `O horário ${appointment_time} não está disponível para ${appointment_date}.` };
  }

  // Sanitize inputs
  const sanitizedName = client_name.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const sanitizedEmail = client_email.toLowerCase().trim();
  const sanitizedPhone = client_phone ? client_phone.replace(/\D/g, "") : null;
  const sanitizedNotes = notes ? notes.trim().slice(0, 1000).replace(/</g, "&lt;").replace(/>/g, "&gt;") : null;

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      professional_id: professionalId,
      client_name: sanitizedName,
      client_email: sanitizedEmail,
      client_phone: sanitizedPhone,
      appointment_date,
      appointment_time: appointment_time + ":00",
      session_type: session_type || "Consulta",
      notes: sanitizedNotes,
      status: "pending",
      payment_status: "pending",
      duration_minutes: 50,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating appointment:", error);
    return { success: false, message: "Erro ao criar agendamento. Por favor, tente novamente." };
  }

  // Create access token for client
  await supabase
    .from("appointment_access_tokens")
    .insert({
      appointment_id: data.id,
      client_email: sanitizedEmail,
    });

  // Send notifications (email and WhatsApp)
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const notificationResult = await sendNotifications(SUPABASE_URL, SUPABASE_ANON_KEY, {
      clientName: sanitizedName,
      clientEmail: sanitizedEmail,
      clientPhone: sanitizedPhone || "",
      professionalName: professionalContext?.full_name || "Profissional",
      professionalPhone: professionalContext?.phone || undefined,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      notes: sanitizedNotes || undefined,
    });
    
    console.log("Notifications sent:", JSON.stringify(notificationResult));
  }

  return {
    success: true,
    appointment: data,
    message: `✅ Agendamento criado com sucesso!\n\n📅 Data: ${appointment_date}\n⏰ Horário: ${appointment_time}\n👤 Cliente: ${sanitizedName}\n📧 Email: ${sanitizedEmail}\n\nNotificações enviadas por email${sanitizedPhone ? " e WhatsApp" : ""}.`,
  };
}

async function getNextAvailableSlots(supabase: any, professionalId: string, daysAhead: number = 7) {
  const results: any[] = [];
  const today = new Date();

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    
    const availability = await getAvailableHours(supabase, professionalId, dateStr);
    if (availability.available && availability.slots && availability.slots.length > 0) {
      results.push({
        date: dateStr,
        day: availability.day,
        slots: availability.slots.slice(0, 5), // Limit to first 5 slots
      });
    }
  }

  if (results.length === 0) {
    return { message: `Não há horários disponíveis nos próximos ${daysAhead} dias.` };
  }

  let message = "📅 **Próximos horários disponíveis:**\n\n";
  for (const r of results) {
    message += `**${r.day} (${r.date})**: ${r.slots.join(", ")}\n`;
  }

  return { slots: results, message };
}

async function findAppointment(supabase: any, professionalId: string, params: any) {
  const { client_email, client_phone } = params;
  
  // Get today's date
  const today = new Date().toISOString().split("T")[0];
  
  let query = supabase
    .from("appointments")
    .select("*")
    .eq("professional_id", professionalId)
    .gte("appointment_date", today)
    .neq("status", "cancelled")
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });
  
  if (client_email) {
    query = query.eq("client_email", client_email);
  }

  const { data: appointments, error } = await query;

  if (error) {
    console.error("Error finding appointments:", error);
    return { success: false, message: "Erro ao buscar agendamentos." };
  }

  if (!appointments || appointments.length === 0) {
    return { 
      success: false, 
      message: `Não encontrei agendamentos futuros para o email ${client_email}.` 
    };
  }

  const appointmentsList = appointments.map((a: any) => {
    const [year, month, day] = a.appointment_date.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    const dateObj = new Date(a.appointment_date + "T00:00:00");
    const dayName = DAYS_OF_WEEK[dateObj.getDay()];
    
    return {
      id: a.id,
      date: a.appointment_date,
      formatted_date: formattedDate,
      day_name: dayName,
      time: a.appointment_time.substring(0, 5),
      client_name: a.client_name,
      status: a.status,
    };
  });

  let message = `📋 **Agendamentos encontrados para ${client_email}:**\n\n`;
  appointmentsList.forEach((a: any, index: number) => {
    message += `${index + 1}. **${a.day_name}, ${a.formatted_date}** às ${a.time}\n   ID: \`${a.id}\`\n\n`;
  });

  return {
    success: true,
    appointments: appointmentsList,
    message,
  };
}

async function cancelAppointment(supabase: any, professionalId: string, params: any, professionalContext?: any) {
  const { appointment_id, reason } = params;

  // Verify the appointment exists and belongs to this professional
  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", appointment_id)
    .eq("professional_id", professionalId)
    .single();

  if (fetchError || !appointment) {
    console.error("Error fetching appointment:", fetchError);
    return { success: false, message: "Agendamento não encontrado." };
  }

  if (appointment.status === "cancelled") {
    return { success: false, message: "Este agendamento já foi cancelado anteriormente." };
  }

  // Cancel the appointment
  const { error: updateError } = await supabase
    .from("appointments")
    .update({ 
      status: "cancelled", 
      notes: reason ? `${appointment.notes || ""}\n\nMotivo do cancelamento: ${reason}`.trim() : appointment.notes 
    })
    .eq("id", appointment_id);

  if (updateError) {
    console.error("Error cancelling appointment:", updateError);
    return { success: false, message: "Erro ao cancelar agendamento. Por favor, tente novamente." };
  }

  const [year, month, day] = appointment.appointment_date.split('-');
  const formattedDate = `${day}/${month}/${year}`;

  return {
    success: true,
    message: `❌ Agendamento cancelado com sucesso!\n\n📅 Data: ${formattedDate}\n⏰ Horário: ${appointment.appointment_time.substring(0, 5)}\n👤 Cliente: ${appointment.client_name}\n\n${reason ? `Motivo: ${reason}` : ""}`,
  };
}

async function rescheduleAppointment(supabase: any, professionalId: string, params: any, professionalContext?: any) {
  const { appointment_id, new_date, new_time } = params;

  // Verify the appointment exists and belongs to this professional
  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", appointment_id)
    .eq("professional_id", professionalId)
    .single();

  if (fetchError || !appointment) {
    console.error("Error fetching appointment:", fetchError);
    return { success: false, message: "Agendamento não encontrado." };
  }

  if (appointment.status === "cancelled") {
    return { success: false, message: "Não é possível remarcar um agendamento cancelado." };
  }

  // Check if the new slot is available
  const availability = await getAvailableHours(supabase, professionalId, new_date);
  if (!availability.available || !availability.slots?.includes(new_time)) {
    return { 
      success: false, 
      message: `O horário ${new_time} não está disponível para ${new_date}. Horários disponíveis: ${availability.slots?.join(", ") || "nenhum"}.` 
    };
  }

  // Update the appointment
  const { error: updateError } = await supabase
    .from("appointments")
    .update({ 
      appointment_date: new_date,
      appointment_time: new_time + ":00",
    })
    .eq("id", appointment_id);

  if (updateError) {
    console.error("Error rescheduling appointment:", updateError);
    return { success: false, message: "Erro ao remarcar agendamento. Por favor, tente novamente." };
  }

  const [year, month, day] = new_date.split('-');
  const formattedDate = `${day}/${month}/${year}`;
  const dateObj = new Date(new_date + "T00:00:00");
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];

  // Send notifications about the reschedule
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (SUPABASE_URL && SUPABASE_ANON_KEY && appointment.client_email) {
    await sendNotifications(SUPABASE_URL, SUPABASE_ANON_KEY, {
      clientName: appointment.client_name,
      clientEmail: appointment.client_email,
      clientPhone: appointment.client_phone || "",
      professionalName: professionalContext?.full_name || "Profissional",
      professionalPhone: professionalContext?.phone || undefined,
      appointmentDate: new_date,
      appointmentTime: new_time,
      notes: "Agendamento remarcado",
    });
  }

  return {
    success: true,
    message: `✅ Agendamento remarcado com sucesso!\n\n📅 Nova data: ${dayName}, ${formattedDate}\n⏰ Novo horário: ${new_time}\n👤 Cliente: ${appointment.client_name}\n\nNotificações enviadas ao cliente.`,
  };
}

async function executeToolCall(supabase: any, professionalId: string, toolName: string, args: any, professionalContext?: any) {
  switch (toolName) {
    case "get_available_hours":
      return await getAvailableHours(supabase, professionalId, args.date);
    case "create_appointment":
      return await createAppointment(supabase, professionalId, args, professionalContext);
    case "get_next_available_slots":
      return await getNextAvailableSlots(supabase, professionalId, args.days_ahead || 7);
    case "find_appointment":
      return await findAppointment(supabase, professionalId, args);
    case "cancel_appointment":
      return await cancelAppointment(supabase, professionalId, args, professionalContext);
    case "reschedule_appointment":
      return await rescheduleAppointment(supabase, professionalId, args, professionalContext);
    default:
      return { error: "Ferramenta não reconhecida" };
  }
}

// Helper function to fetch professional context from database
async function fetchProfessionalContext(supabase: any, professionalId: string) {
  console.log("Fetching professional context for:", professionalId);
  
  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", professionalId)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError);
    return null;
  }

  // Fetch services
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("professional_id", professionalId)
    .eq("is_active", true);

  // Fetch available hours
  const { data: availableHours } = await supabase
    .from("available_hours")
    .select("*")
    .eq("professional_id", professionalId)
    .eq("is_active", true);

// Fetch AI agent config
  const { data: agentConfig } = await supabase
    .from("ai_agent_config")
    .select("*")
    .eq("professional_id", professionalId)
    .single();

  // Fetch WhatsApp settings to determine API type
  const { data: whatsappSettings } = await supabase
    .from("whatsapp_settings")
    .select("*")
    .eq("professional_id", professionalId)
    .single();

  return {
    id: profile.id,
    full_name: profile.full_name,
    specialty: profile.specialty,
    crp: profile.crp,
    bio: profile.bio,
    email: profile.email,
    phone: profile.phone,
    whatsapp_number: (profile as any).whatsapp_number,
    services: services || [],
    available_hours: availableHours || [],
    agent_config: agentConfig || null,
    whatsapp_settings: whatsappSettings || null,
  };
}

// Helper function to identify professional by WhatsApp instance or number
async function identifyProfessionalByWhatsApp(supabase: any, instanceName: string, whatsappNumber: string) {
  console.log("Identifying professional by WhatsApp:", { instanceName, whatsappNumber });
  
  // First try to find by Evolution instance name
  if (instanceName) {
    const { data: byInstance } = await supabase
      .from("whatsapp_settings")
      .select("professional_id")
      .eq("evolution_instance_name", instanceName)
      .eq("is_active", true)
      .single();

    if (byInstance?.professional_id) {
      console.log("Found professional by instance name:", byInstance.professional_id);
      return byInstance.professional_id;
    }
  }

  // Then try to find by whatsapp_number field (new dedicated field)
  if (whatsappNumber) {
    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    
    // Try exact match on whatsapp_number first
    const { data: byWhatsAppNumber } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_professional", true)
      .eq("whatsapp_number", cleanPhone)
      .single();

    if (byWhatsAppNumber?.id) {
      console.log("Found professional by whatsapp_number:", byWhatsAppNumber.id);
      return byWhatsAppNumber.id;
    }

    // Try partial match on whatsapp_number (last 9 digits)
    if (cleanPhone.length >= 9) {
      const last9Digits = cleanPhone.slice(-9);
      const { data: byPartialWhatsApp } = await supabase
        .from("profiles")
        .select("id")
        .eq("is_professional", true)
        .ilike("whatsapp_number", `%${last9Digits}`)
        .single();

      if (byPartialWhatsApp?.id) {
        console.log("Found professional by partial whatsapp_number:", byPartialWhatsApp.id);
        return byPartialWhatsApp.id;
      }
    }

    // Fallback: try phone field
    const { data: byPhone } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_professional", true)
      .or(`phone.eq.${cleanPhone},phone.eq.+${cleanPhone},phone.ilike.%${cleanPhone.slice(-9)}%`)
      .single();

    if (byPhone?.id) {
      console.log("Found professional by phone:", byPhone.id);
      return byPhone.id;
    }
  }

  console.log("No professional found for WhatsApp identification");
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      messages, 
      professionalContext,
      // New fields for centralized workflow
      professionalId,
      instanceName,
      whatsappNumber,
      clientPhone,
      clientName,
    } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Determine professional ID - supports multiple identification methods
    let resolvedProfessionalId = professionalId || professionalContext?.id;
    let resolvedContext = professionalContext;

    // If no direct ID provided, try to identify by WhatsApp
    if (!resolvedProfessionalId && (instanceName || whatsappNumber)) {
      resolvedProfessionalId = await identifyProfessionalByWhatsApp(supabase, instanceName, whatsappNumber);
    }

    if (!resolvedProfessionalId) {
      console.error("Could not identify professional");
      return new Response(
        JSON.stringify({ 
          error: "Profissional não identificado",
          message: "Não foi possível identificar o profissional. Verifique a configuração do WhatsApp." 
        }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch full professional context from database if not provided
    if (!resolvedContext) {
      resolvedContext = await fetchProfessionalContext(supabase, resolvedProfessionalId);
      
      if (!resolvedContext) {
        return new Response(
          JSON.stringify({ 
            error: "Profissional não encontrado",
            message: "Não foi possível encontrar os dados do profissional." 
          }), 
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check if AI agent is active for this professional
    const agentConfig = resolvedContext.agent_config;
    if (!agentConfig?.is_active) {
      console.log("AI agent is not active for professional:", resolvedProfessionalId);
      return new Response(
        JSON.stringify({ 
          error: "Agente IA desativado",
          message: "O agente de agendamento está desativado para este profissional.",
          inactive: true
        }), 
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build dynamic system prompt with professional context
    const agentName = agentConfig?.agent_name || "Assistente Virtual";
    const agentGreeting = agentConfig?.agent_greeting || "Olá! Como posso ajudar você a agendar uma consulta?";
    const agentInstructions = agentConfig?.agent_instructions || "";
    
    let systemPrompt = `Você é ${agentName}, assistente virtual de agendamento para ${resolvedContext.full_name || "o profissional"}.

${agentInstructions}

Suas principais responsabilidades:
1. Ajudar clientes a agendar consultas com o profissional
2. Informar sobre horários disponíveis
3. Cancelar ou remarcar agendamentos existentes
4. Responder dúvidas sobre os serviços oferecidos

Diretrizes de comunicação:
- Seja sempre educado, profissional e empático
- Use português brasileiro
- Seja conciso mas completo nas respostas
- Responda em nome de ${resolvedContext.full_name || "o profissional"}

${agentGreeting ? `Sua saudação padrão: "${agentGreeting}"` : ""}

IMPORTANTE - Fluxo de agendamento:
1. Quando o cliente quiser agendar, primeiro pergunte a data desejada
2. Use a ferramenta get_available_hours ou get_next_available_slots para verificar disponibilidade
3. Apresente os horários disponíveis ao cliente
4. Após o cliente escolher, solicite: nome completo e email (telefone é opcional)
5. Confirme todos os dados antes de criar o agendamento
6. Use create_appointment para finalizar

IMPORTANTE - Fluxo de cancelamento:
1. Quando o cliente quiser cancelar, peça o email usado no agendamento
2. Use find_appointment para buscar os agendamentos do cliente
3. Mostre os agendamentos encontrados e peça confirmação de qual cancelar
4. Pergunte o motivo do cancelamento (opcional)
5. Use cancel_appointment para finalizar

IMPORTANTE - Fluxo de remarcação:
1. Quando o cliente quiser remarcar, peça o email usado no agendamento
2. Use find_appointment para buscar os agendamentos do cliente
3. Mostre os agendamentos encontrados e peça confirmação de qual remarcar
4. Pergunte a nova data e horário desejados
5. Use get_available_hours para verificar disponibilidade na nova data
6. Use reschedule_appointment para finalizar

--- BASE DE CONHECIMENTO DO PROFISSIONAL ---
Nome: ${resolvedContext.full_name || "Não informado"}
Especialidade: ${resolvedContext.specialty || "Não informada"}
CRP: ${resolvedContext.crp || "Não informado"}
Bio: ${resolvedContext.bio || "Não informada"}

Serviços oferecidos:
${resolvedContext.services?.map((s: any) => `- ${s.name}: R$ ${(s.price_cents / 100).toFixed(2)} (${s.duration_minutes} min)`).join("\n") || "Nenhum serviço cadastrado"}

Horários de atendimento configurados:
${resolvedContext.available_hours?.map((h: any) => {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return `- ${days[h.day_of_week]}: ${h.start_time.substring(0, 5)} às ${h.end_time.substring(0, 5)}`;
}).join("\n") || "Nenhum horário configurado"}
---

${clientName ? `O cliente que está conversando se chama: ${clientName}` : ""}
${clientPhone ? `Telefone do cliente: ${clientPhone}` : ""}`;

    console.log("Processing request for professional:", resolvedProfessionalId);
    console.log("Received messages:", JSON.stringify(messages));

    // Determine which AI API to use - professional's OpenAI key or default Lovable AI
    const professionalOpenAIKey = (agentConfig as any)?.openai_api_key;
    const useOpenAI = !!professionalOpenAIKey;
    
    const aiApiUrl = useOpenAI 
      ? "https://api.openai.com/v1/chat/completions"
      : "https://ai.gateway.lovable.dev/v1/chat/completions";
    const aiApiKey = useOpenAI ? professionalOpenAIKey : LOVABLE_API_KEY;
    const aiModel = useOpenAI ? "gpt-4-turbo-preview" : "google/gemini-2.5-flash";

    console.log("Using AI:", useOpenAI ? "OpenAI (professional key)" : "Lovable AI (default)");

    // First API call with tools
    const response = await fetch(aiApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Por favor, aguarde um momento e tente novamente." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Por favor, adicione mais créditos." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua mensagem. Tente novamente." }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    const assistantMessage = data.choices?.[0]?.message;
    
    // Check if there are tool calls
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: any[] = [];
      const conversationMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        assistantMessage,
      ];

      for (const toolCall of assistantMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`Executing tool: ${toolCall.function.name}`, args);
        
        const result = await executeToolCall(
          supabase,
          resolvedProfessionalId,
          toolCall.function.name,
          args,
          resolvedContext
        );
        
        console.log("Tool result:", JSON.stringify(result));
        
        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      // Second API call with tool results - streaming
      const finalResponse = await fetch(aiApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${aiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [...conversationMessages, ...toolResults],
          stream: true,
        }),
      });

      if (!finalResponse.ok) {
        const errorText = await finalResponse.text();
        console.error("Final AI response error:", errorText);
        throw new Error("Erro na resposta final da IA");
      }

      return new Response(finalResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool calls - stream the original response
    // Since we already consumed the response, we need to create a streaming response
    const content = assistantMessage?.content || "Desculpe, não consegui processar sua solicitação.";
    
    const encoder = new TextEncoder();
    const streamData = `data: ${JSON.stringify({
      choices: [{ delta: { content } }]
    })}\n\ndata: [DONE]\n\n`;

    return new Response(encoder.encode(streamData), {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("ai-assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
