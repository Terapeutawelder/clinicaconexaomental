import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature, x-webhook-secret",
};

interface WebhookPayload {
  gateway: string;
  event_type: string;
  data: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const gateway = url.searchParams.get("gateway") || "unknown";
    const rawBody = await req.text();

    console.log(`Received webhook from gateway: ${gateway}`);

    let event: WebhookPayload | null = null;

    switch (gateway) {
      case "stripe":
        event = await handleStripeWebhook(req, rawBody);
        break;
      case "mercadopago":
        event = await handleMercadoPagoWebhook(rawBody);
        break;
      case "asaas":
        event = await handleAsaasWebhook(rawBody);
        break;
      case "pagseguro":
        event = await handlePagSeguroWebhook(rawBody);
        break;
      case "pagarme":
        event = await handlePagarmeWebhook(rawBody);
        break;
      default:
        // Try to parse as generic JSON
        try {
          const body = JSON.parse(rawBody);
          event = { gateway: "generic", event_type: body.type || "unknown", data: body };
        } catch {
          throw new Error(`Unknown gateway: ${gateway}`);
        }
    }

    if (!event) {
      return new Response(JSON.stringify({ error: "Could not parse webhook" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process the event
    const result = await processSubscriptionEvent(supabase, event);

    // Log the webhook
    await supabase.from("admin_activity_log").insert({
      action: `webhook_${event.event_type}`,
      entity_type: "subscription",
      entity_id: result.subscriptionId,
      details: {
        gateway: event.gateway,
        event_type: event.event_type,
        processed: result.success,
      },
    });

    return new Response(JSON.stringify({ processed: true, subscriptionId: result.subscriptionId, event_type: result.event_type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Stripe webhook handler
async function handleStripeWebhook(req: Request, rawBody: string): Promise<WebhookPayload> {
  const body = JSON.parse(rawBody);
  
  const eventTypeMap: Record<string, string> = {
    "customer.subscription.created": "subscription_created",
    "customer.subscription.updated": "subscription_updated",
    "customer.subscription.deleted": "subscription_cancelled",
    "invoice.paid": "payment_succeeded",
    "invoice.payment_failed": "payment_failed",
    "checkout.session.completed": "checkout_completed",
  };

  return {
    gateway: "stripe",
    event_type: eventTypeMap[body.type] || body.type,
    data: {
      subscription_id: body.data?.object?.subscription || body.data?.object?.id,
      customer_id: body.data?.object?.customer,
      status: body.data?.object?.status,
      amount: body.data?.object?.amount_total || body.data?.object?.amount_paid,
      currency: body.data?.object?.currency,
      current_period_start: body.data?.object?.current_period_start,
      current_period_end: body.data?.object?.current_period_end,
      cancel_at_period_end: body.data?.object?.cancel_at_period_end,
      metadata: body.data?.object?.metadata,
      raw: body,
    },
  };
}

// Mercado Pago webhook handler
async function handleMercadoPagoWebhook(rawBody: string): Promise<WebhookPayload> {
  const body = JSON.parse(rawBody);

  const eventTypeMap: Record<string, string> = {
    "subscription_preapproval": "subscription_created",
    "subscription_preapproval.updated": "subscription_updated",
    "subscription_authorized_payment": "payment_succeeded",
    "payment": "payment_received",
  };

  return {
    gateway: "mercadopago",
    event_type: eventTypeMap[body.type] || body.type,
    data: {
      subscription_id: body.data?.id,
      action: body.action,
      status: body.data?.status,
      external_reference: body.data?.external_reference,
      payer_email: body.data?.payer?.email,
      amount: body.data?.transaction_amount,
      raw: body,
    },
  };
}

// Asaas webhook handler
async function handleAsaasWebhook(rawBody: string): Promise<WebhookPayload> {
  const body = JSON.parse(rawBody);

  const eventTypeMap: Record<string, string> = {
    "PAYMENT_CREATED": "payment_created",
    "PAYMENT_CONFIRMED": "payment_succeeded",
    "PAYMENT_RECEIVED": "payment_succeeded",
    "PAYMENT_OVERDUE": "payment_overdue",
    "PAYMENT_REFUNDED": "payment_refunded",
    "SUBSCRIPTION_CREATED": "subscription_created",
    "SUBSCRIPTION_UPDATED": "subscription_updated",
    "SUBSCRIPTION_DELETED": "subscription_cancelled",
    "SUBSCRIPTION_RENEWED": "subscription_renewed",
  };

  return {
    gateway: "asaas",
    event_type: eventTypeMap[body.event] || body.event,
    data: {
      subscription_id: body.payment?.subscription || body.subscription?.id,
      payment_id: body.payment?.id,
      customer_id: body.payment?.customer || body.subscription?.customer,
      status: body.payment?.status || body.subscription?.status,
      amount: body.payment?.value || body.subscription?.value,
      billing_type: body.payment?.billingType,
      due_date: body.payment?.dueDate,
      next_due_date: body.subscription?.nextDueDate,
      raw: body,
    },
  };
}

// PagSeguro webhook handler
async function handlePagSeguroWebhook(rawBody: string): Promise<WebhookPayload> {
  const body = JSON.parse(rawBody);

  const eventTypeMap: Record<string, string> = {
    "SUBSCRIPTION.CREATED": "subscription_created",
    "SUBSCRIPTION.ACTIVE": "subscription_activated",
    "SUBSCRIPTION.CANCELLED": "subscription_cancelled",
    "SUBSCRIPTION.SUSPENDED": "subscription_suspended",
    "CHARGE.PAID": "payment_succeeded",
    "CHARGE.FAILED": "payment_failed",
  };

  return {
    gateway: "pagseguro",
    event_type: eventTypeMap[body.event_type] || body.event_type,
    data: {
      subscription_id: body.resource?.id,
      reference: body.resource?.reference_id,
      status: body.resource?.status,
      amount: body.resource?.amount?.value,
      customer_id: body.resource?.customer?.id,
      raw: body,
    },
  };
}

// Pagar.me webhook handler
async function handlePagarmeWebhook(rawBody: string): Promise<WebhookPayload> {
  const body = JSON.parse(rawBody);

  const eventTypeMap: Record<string, string> = {
    "subscription.created": "subscription_created",
    "subscription.updated": "subscription_updated",
    "subscription.canceled": "subscription_cancelled",
    "charge.paid": "payment_succeeded",
    "charge.payment_failed": "payment_failed",
    "charge.refunded": "payment_refunded",
  };

  return {
    gateway: "pagarme",
    event_type: eventTypeMap[body.type] || body.type,
    data: {
      subscription_id: body.data?.subscription?.id,
      charge_id: body.data?.charge?.id,
      customer_id: body.data?.customer?.id,
      status: body.data?.subscription?.status || body.data?.charge?.status,
      amount: body.data?.charge?.amount || body.data?.subscription?.current_cycle?.amount,
      metadata: body.data?.subscription?.metadata,
      raw: body,
    },
  };
}

// Process subscription events
async function processSubscriptionEvent(supabase: any, event: WebhookPayload) {
  const { event_type, data, gateway } = event;

  let subscriptionId: string | null = null;
  let success = true;

  try {
    switch (event_type) {
      case "subscription_created":
      case "checkout_completed": {
        // Find or create subscription
        const professionalId = data.metadata?.professional_id || data.external_reference;
        const plan = data.metadata?.plan || "pro";

        if (professionalId) {
          const { data: sub, error } = await supabase
            .from("subscriptions")
            .upsert({
              professional_id: professionalId,
              plan: plan,
              status: "active",
              gateway: gateway,
              gateway_subscription_id: data.subscription_id,
              gateway_customer_id: data.customer_id,
              amount_cents: data.amount,
              current_period_start: data.current_period_start
                ? new Date(data.current_period_start * 1000).toISOString()
                : new Date().toISOString(),
              current_period_end: data.current_period_end
                ? new Date(data.current_period_end * 1000).toISOString()
                : null,
            }, { onConflict: "professional_id" })
            .select()
            .single();

          if (!error && sub) {
            subscriptionId = sub.id;

            // Update profile
            await supabase
              .from("profiles")
              .update({
                subscription_plan: plan,
                subscription_status: "active",
              })
              .eq("id", professionalId);
          }
        }
        break;
      }

      case "subscription_updated":
      case "subscription_renewed": {
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("id, professional_id")
          .eq("gateway_subscription_id", data.subscription_id)
          .single();

        if (existing) {
          subscriptionId = existing.id;

          await supabase
            .from("subscriptions")
            .update({
              status: mapStatus(data.status),
              current_period_end: data.current_period_end
                ? new Date(data.current_period_end * 1000).toISOString()
                : data.next_due_date,
              cancel_at_period_end: data.cancel_at_period_end || false,
            })
            .eq("id", existing.id);

          await supabase
            .from("profiles")
            .update({ subscription_status: mapStatus(data.status) })
            .eq("id", existing.professional_id);
        }
        break;
      }

      case "subscription_cancelled": {
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("id, professional_id")
          .eq("gateway_subscription_id", data.subscription_id)
          .single();

        if (existing) {
          subscriptionId = existing.id;

          await supabase
            .from("subscriptions")
            .update({ status: "cancelled" })
            .eq("id", existing.id);

          await supabase
            .from("profiles")
            .update({
              subscription_status: "cancelled",
              subscription_plan: "free",
            })
            .eq("id", existing.professional_id);
        }
        break;
      }

      case "payment_succeeded": {
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("id, professional_id, plan, billing_cycle")
          .eq("gateway_subscription_id", data.subscription_id)
          .single();

        if (existing) {
          subscriptionId = existing.id;

          // Record payment
          await supabase.from("subscription_payments").insert({
            subscription_id: existing.id,
            professional_id: existing.professional_id,
            amount_cents: data.amount,
            gateway: gateway,
            gateway_payment_id: data.payment_id || data.charge_id,
            payment_method: data.billing_type || "card",
            status: "approved",
            paid_at: new Date().toISOString(),
          });

          // Update subscription status
          await supabase
            .from("subscriptions")
            .update({ status: "active" })
            .eq("id", existing.id);

          await supabase
            .from("profiles")
            .update({ subscription_status: "active" })
            .eq("id", existing.professional_id);

          // Send payment confirmation notification
          try {
            const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
            const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
            
            await fetch(`${supabaseUrl}/functions/v1/admin-notifications`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseAnonKey}`,
              },
              body: JSON.stringify({
                action: "payment_confirmed",
                professionalId: existing.professional_id,
                data: {
                  planName: existing.plan || "Pro",
                  amount: data.amount,
                  billingCycle: existing.billing_cycle || "monthly",
                },
              }),
            });
            console.log("Payment confirmation notification sent");
          } catch (notifError) {
            console.error("Error sending payment notification:", notifError);
          }
        }
        break;
      }

      case "payment_failed":
      case "payment_overdue": {
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("id, professional_id")
          .eq("gateway_subscription_id", data.subscription_id)
          .single();

        if (existing) {
          subscriptionId = existing.id;

          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("id", existing.id);

          await supabase
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("id", existing.professional_id);
        }
        break;
      }

      case "payment_refunded": {
        const { data: payment } = await supabase
          .from("subscription_payments")
          .select("id")
          .eq("gateway_payment_id", data.payment_id || data.charge_id)
          .single();

        if (payment) {
          await supabase
            .from("subscription_payments")
            .update({ status: "refunded" })
            .eq("id", payment.id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event_type}`);
    }
  } catch (error: any) {
    console.error("Error processing event:", error);
    success = false;
  }

  return { success, subscriptionId, event_type };
}

function mapStatus(gatewayStatus: string): string {
  const statusMap: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "cancelled",
    cancelled: "cancelled",
    unpaid: "past_due",
    incomplete: "past_due",
    incomplete_expired: "expired",
    paused: "cancelled",
    suspended: "cancelled",
  };

  return statusMap[gatewayStatus?.toLowerCase()] || "active";
}
