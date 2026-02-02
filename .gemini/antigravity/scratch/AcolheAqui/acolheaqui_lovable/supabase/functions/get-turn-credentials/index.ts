import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const METERED_TURN_API_KEY = Deno.env.get('METERED_TURN_API_KEY');
    
    if (!METERED_TURN_API_KEY) {
      console.log("METERED_TURN_API_KEY not configured, returning STUN only");
      // Return only STUN servers if TURN API key is not configured
      return new Response(JSON.stringify({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun.relay.metered.ca:80" },
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Fetching TURN credentials from Metered.ca...");
    
    // Fetch TURN credentials from Metered.ca
    const response = await fetch(
      `https://psicoterapia.metered.live/api/v1/turn/credentials?apiKey=${METERED_TURN_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Metered API error:", errorText);
      throw new Error(`Metered API error: ${response.status}`);
    }

    const credentials = await response.json();
    console.log("Got TURN credentials:", credentials.length, "servers");

    // Add Google STUN servers as fallback
    const iceServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      ...credentials
    ];

    return new Response(JSON.stringify({ iceServers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error getting TURN credentials:", error);
    
    // Return STUN-only fallback on error
    return new Response(JSON.stringify({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
