import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event: string;
  professionalId: string;
  data: Record<string, unknown>;
  timestamp?: string;
}

interface Webhook {
  id: string;
  url: string;
  secret_token: string | null;
  is_active: boolean;
  events: string[];
}

// Function to dispatch webhook to a single URL
async function dispatchToUrl(
  webhook: Webhook,
  payload: WebhookPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': payload.event,
      'X-Webhook-Timestamp': payload.timestamp || new Date().toISOString(),
    };

    // Add secret token if configured
    if (webhook.secret_token) {
      headers['X-Webhook-Secret'] = webhook.secret_token;
    }

    console.log(`Dispatching webhook to ${webhook.url} for event ${payload.event}`);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event: payload.event,
        data: payload.data,
        timestamp: payload.timestamp || new Date().toISOString(),
      }),
    });

    console.log(`Webhook response from ${webhook.url}: ${response.status}`);

    return {
      success: response.ok,
      statusCode: response.status,
    };
  } catch (error) {
    console.error(`Error dispatching webhook to ${webhook.url}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: WebhookPayload = await req.json();
    const { event, professionalId, data } = payload;

    console.log(`Processing webhook dispatch for event: ${event}, professional: ${professionalId}`);

    if (!event || !professionalId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: event and professionalId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch active webhooks for this professional that are subscribed to this event
    const { data: webhooks, error: webhooksError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('is_active', true);

    if (webhooksError) {
      console.error('Error fetching webhooks:', webhooksError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch webhooks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter webhooks that are subscribed to this event
    const matchingWebhooks = (webhooks || []).filter((webhook: Webhook) => {
      const events = Array.isArray(webhook.events) ? webhook.events : [];
      return events.includes(event);
    });

    console.log(`Found ${matchingWebhooks.length} webhooks for event ${event}`);

    if (matchingWebhooks.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No webhooks configured for this event',
          dispatched: 0 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Dispatch webhooks in parallel
    const timestamp = new Date().toISOString();
    const results = await Promise.all(
      matchingWebhooks.map((webhook: Webhook) =>
        dispatchToUrl(webhook, { ...payload, timestamp })
      )
    );

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`Webhook dispatch complete: ${successCount} successful, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        dispatched: matchingWebhooks.length,
        successful: successCount,
        failed: failedCount,
        results: results.map((r, i) => ({
          url: matchingWebhooks[i].url,
          ...r,
        })),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in dispatch-webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
