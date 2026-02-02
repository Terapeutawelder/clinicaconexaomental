import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
  const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: googleClientId,
      client_secret: googleClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    console.error('Failed to refresh token');
    return null;
  }

  const data = await response.json();
  return data.access_token;
}

async function getValidAccessToken(settings: any, supabase: any): Promise<string | null> {
  const now = new Date();
  const expiresAt = new Date(settings.token_expires_at);

  // If token is still valid (with 5 min buffer), use it
  if (expiresAt > new Date(now.getTime() + 5 * 60 * 1000)) {
    return settings.access_token;
  }

  // Refresh the token
  console.log('Refreshing access token...');
  const newAccessToken = await refreshAccessToken(settings.refresh_token);
  
  if (newAccessToken) {
    // Update token in database
    const newExpiresAt = new Date(now.getTime() + 3600 * 1000).toISOString();
    await supabase
      .from('google_calendar_settings')
      .update({
        access_token: newAccessToken,
        token_expires_at: newExpiresAt,
        updated_at: now.toISOString(),
      })
      .eq('professional_id', settings.professional_id);
    
    return newAccessToken;
  }

  return null;
}

async function createCalendarEvent(accessToken: string, appointment: any, settings: any) {
  const startDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
  const endDateTime = new Date(startDateTime.getTime() + (appointment.duration_minutes || 50) * 60 * 1000);

  const event: any = {
    summary: `Sessão - ${appointment.client_name}`,
    description: `Sessão de terapia com ${appointment.client_name}\n\nEmail: ${appointment.client_email || 'N/A'}\nTelefone: ${appointment.client_phone || 'N/A'}\n\n${appointment.notes || ''}`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  // Add Google Meet if enabled
  if (settings.auto_create_meet) {
    event.conferenceData = {
      createRequest: {
        requestId: appointment.id,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  // Add attendee if email exists
  if (appointment.client_email) {
    event.attendees = [{ email: appointment.client_email }];
  }

  const calendarId = settings.calendar_id || 'primary';
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events${settings.auto_create_meet ? '?conferenceDataVersion=1' : ''}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to create calendar event:', errorText);
    throw new Error('Failed to create calendar event');
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, professionalId, appointmentId, startDate, endDate, eventData } = await req.json();
    console.log(`Google Calendar Sync - Action: ${action}, Professional: ${professionalId}`);

    // Get Google settings
    const { data: settings, error: settingsError } = await supabase
      .from('google_calendar_settings')
      .select('*')
      .eq('professional_id', professionalId)
      .single();

    if (settingsError || !settings?.is_connected) {
      console.log('Google Calendar not connected');
      return new Response(
        JSON.stringify({ error: 'Google Calendar not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(settings, supabase);
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Failed to get valid access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'sync-appointment') {
      // Sync a single appointment to Google Calendar
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (appointmentError || !appointment) {
        throw new Error('Appointment not found');
      }

      const calendarEvent = await createCalendarEvent(accessToken, appointment, settings);
      console.log('Created calendar event:', calendarEvent.id);

      // Update appointment with Google Calendar event info
      const updateData: any = {};
      if (calendarEvent.hangoutLink) {
        updateData.virtual_room_link = calendarEvent.hangoutLink;
      }

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('appointments')
          .update(updateData)
          .eq('id', appointmentId);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          eventId: calendarEvent.id,
          meetLink: calendarEvent.hangoutLink 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'sync-all') {
      // Sync all pending/confirmed appointments
      const today = new Date().toISOString().split('T')[0];
      
      const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', professionalId)
        .gte('appointment_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('appointment_date', { ascending: true });

      if (apptError) throw apptError;

      let synced = 0;
      let errors = 0;

      for (const appointment of appointments || []) {
        try {
          const calendarEvent = await createCalendarEvent(accessToken, appointment, settings);
          
          if (calendarEvent.hangoutLink) {
            await supabase
              .from('appointments')
              .update({ virtual_room_link: calendarEvent.hangoutLink })
              .eq('id', appointment.id);
          }
          
          synced++;
        } catch (err) {
          console.error(`Failed to sync appointment ${appointment.id}:`, err);
          errors++;
        }
      }

      // Update last sync time
      await supabase
        .from('google_calendar_settings')
        .update({ 
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('professional_id', professionalId);

      console.log(`Synced ${synced} appointments, ${errors} errors`);

      return new Response(
        JSON.stringify({ success: true, synced, errors }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get-busy-times') {
      // Get busy times from Google Calendar to block in scheduling
      if (!startDate || !endDate) {
        return new Response(
          JSON.stringify({ error: 'startDate and endDate are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const calendarId = settings.calendar_id || 'primary';
      const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` + 
        new URLSearchParams({
          timeMin: startDate,
          timeMax: endDate,
          singleEvents: 'true',
          orderBy: 'startTime',
        });

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      const busyTimes = (data.items || []).map((event: any) => ({
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        title: event.summary,
      }));

      return new Response(
        JSON.stringify({ busyTimes }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create-member-event') {
      // Create a Google Calendar event for member area live events
      if (!eventData || !eventData.title || !eventData.startDateTime || !eventData.endDateTime) {
        return new Response(
          JSON.stringify({ error: 'eventData with title, startDateTime, and endDateTime required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const event: any = {
        summary: eventData.title,
        description: eventData.description || `Evento da Área de Membros: ${eventData.title}`,
        start: {
          dateTime: eventData.startDateTime,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: 'America/Sao_Paulo',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      };

      // Always add Google Meet for member events
      const requestId = `member-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      event.conferenceData = {
        createRequest: {
          requestId: requestId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };

      const calendarId = settings.calendar_id || 'primary';
      const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create member event:', errorText);
        throw new Error('Failed to create Google Calendar event');
      }

      const calendarEvent = await response.json();
      console.log('Created member event:', calendarEvent.id, 'Meet link:', calendarEvent.hangoutLink);

      return new Response(
        JSON.stringify({ 
          success: true, 
          eventId: calendarEvent.id,
          meetLink: calendarEvent.hangoutLink,
          htmlLink: calendarEvent.htmlLink,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Google Calendar Sync Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
