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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, connectionId, data } = await req.json();

    switch (action) {
      case "generate-qr": {
        // Generate a QR code for Baileys connection
        // In production, this would connect to a Baileys server/service
        // For now, we'll generate a placeholder and update the connection
        
        const { data: connection, error: connError } = await supabase
          .from("whatsapp_connections")
          .select("*")
          .eq("id", connectionId)
          .single();

        if (connError || !connection) {
          return new Response(
            JSON.stringify({ error: "Connection not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate a unique session token for this connection attempt
        const sessionToken = crypto.randomUUID();
        
        // Store the session token in the connection
        await supabase
          .from("whatsapp_connections")
          .update({ 
            session_data: { 
              ...connection.session_data,
              pending_session: sessionToken,
              qr_generated_at: new Date().toISOString()
            }
          })
          .eq("id", connectionId);

        // Return QR code data (placeholder for actual Baileys implementation)
        // In production, this would return actual WhatsApp Web QR data
        return new Response(
          JSON.stringify({ 
            success: true,
            qrCode: `whatsapp://connect?session=${sessionToken}`,
            sessionToken,
            message: "QR Code generated. Scan with WhatsApp to connect.",
            // This would be the actual base64 QR image in production
            expiresIn: 60
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check-status": {
        // Check connection status
        const { data: connection, error: connError } = await supabase
          .from("whatsapp_connections")
          .select("*")
          .eq("id", connectionId)
          .single();

        if (connError || !connection) {
          return new Response(
            JSON.stringify({ error: "Connection not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            status: connection.status,
            lastConnectedAt: connection.last_connected_at,
            phoneNumber: connection.phone_number
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "connect": {
        // Mark connection as connected (called after QR scan verification)
        const { phoneNumber, profilePicUrl } = data || {};

        const { error: updateError } = await supabase
          .from("whatsapp_connections")
          .update({ 
            status: "connected",
            last_connected_at: new Date().toISOString(),
            phone_number: phoneNumber || null,
            avatar_url: profilePicUrl || null,
          })
          .eq("id", connectionId);

        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Failed to update connection" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "Connected successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "disconnect": {
        // Disconnect the WhatsApp session
        const { error: updateError } = await supabase
          .from("whatsapp_connections")
          .update({ 
            status: "disconnected",
            session_data: null
          })
          .eq("id", connectionId);

        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Failed to disconnect" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "Disconnected successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "verify-official": {
        // Verify Meta Official API credentials
        const { accessToken, phoneNumberId, wabaId } = data || {};

        if (!accessToken || !phoneNumberId) {
          return new Response(
            JSON.stringify({ error: "Missing credentials" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        try {
          // Verify credentials with Meta API
          const metaResponse = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}`,
            {
              headers: {
                "Authorization": `Bearer ${accessToken}`,
              },
            }
          );

          if (!metaResponse.ok) {
            return new Response(
              JSON.stringify({ error: "Invalid Meta API credentials" }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          const metaData = await metaResponse.json();

          // Update connection with verified status
          await supabase
            .from("whatsapp_connections")
            .update({ 
              status: "connected",
              last_connected_at: new Date().toISOString(),
              phone_number: metaData.display_phone_number || null,
            })
            .eq("id", connectionId);

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Meta API verified",
              phoneNumber: metaData.display_phone_number
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ error: "Failed to verify Meta API" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      case "send-message": {
        // Send a WhatsApp message
        const { to, message, mediaUrl, mediaType } = data || {};

        const { data: connection, error: connError } = await supabase
          .from("whatsapp_connections")
          .select("*")
          .eq("id", connectionId)
          .single();

        if (connError || !connection) {
          return new Response(
            JSON.stringify({ error: "Connection not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (connection.status !== "connected") {
          return new Response(
            JSON.stringify({ error: "Connection is not active" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (connection.driver_type === "official") {
          // Send via Meta Official API
          try {
            const metaResponse = await fetch(
              `https://graph.facebook.com/v18.0/${connection.phone_number_id}/messages`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${connection.access_token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  messaging_product: "whatsapp",
                  to: to,
                  type: "text",
                  text: { body: message },
                }),
              }
            );

            const metaData = await metaResponse.json();

            if (!metaResponse.ok) {
              return new Response(
                JSON.stringify({ error: "Failed to send message", details: metaData }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            // Log message in database
            await supabase.from("whatsapp_messages").insert({
              connection_id: connectionId,
              professional_id: connection.professional_id,
              phone: to,
              content: message,
              direction: "outgoing",
              status: "sent",
              media_type: mediaType || null,
              media_url: mediaUrl || null,
            });

            return new Response(
              JSON.stringify({ success: true, messageId: metaData.messages?.[0]?.id }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } catch (error) {
            return new Response(
              JSON.stringify({ error: "Failed to send message" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          // Baileys - would require a separate Baileys server
          // For now, log the message with pending status
          await supabase.from("whatsapp_messages").insert({
            connection_id: connectionId,
            professional_id: connection.professional_id,
            phone: to,
            content: message,
            direction: "outgoing",
            status: "pending",
            media_type: mediaType || null,
            media_url: mediaUrl || null,
          });

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Message queued for Baileys delivery",
              note: "Baileys server integration required for actual delivery"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    console.error("WhatsApp Manager Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
