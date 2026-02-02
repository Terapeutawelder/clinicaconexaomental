-- Create function to dispatch webhook when appointment is created or updated
CREATE OR REPLACE FUNCTION public.dispatch_appointment_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  event_type TEXT;
  supabase_url TEXT;
  supabase_anon_key TEXT;
BEGIN
  -- Determine the event type
  IF TG_OP = 'INSERT' THEN
    event_type := 'agendamento_criado';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check for specific status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      IF NEW.status = 'confirmed' THEN
        event_type := 'agendamento_confirmado';
      ELSIF NEW.status = 'cancelled' THEN
        event_type := 'agendamento_cancelado';
      ELSE
        event_type := 'agendamento_reagendado';
      END IF;
    ELSE
      -- Skip if no relevant change
      RETURN NEW;
    END IF;
  END IF;
  
  supabase_url := 'https://dctapmbdsfmzhtbpgigc.supabase.co';
  supabase_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdGFwbWJkc2Ztemh0YnBnaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4Mzg3MjIsImV4cCI6MjA4MjQxNDcyMn0.TdAMzml6AKavQ5FM9mgbqezfVbNE8rkjS4C9qvNikbs';
  
  -- Call the edge function asynchronously using pg_net
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/dispatch-webhook',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || supabase_anon_key
    ),
    body := jsonb_build_object(
      'event', event_type,
      'professionalId', NEW.professional_id,
      'data', jsonb_build_object(
        'appointment_id', NEW.id,
        'client_name', NEW.client_name,
        'client_email', NEW.client_email,
        'client_phone', NEW.client_phone,
        'appointment_date', NEW.appointment_date,
        'appointment_time', NEW.appointment_time,
        'status', NEW.status,
        'payment_status', NEW.payment_status,
        'amount_cents', NEW.amount_cents
      )
    )
  );
  
  RETURN NEW;
END;
$function$;

-- Create trigger for appointment webhooks
DROP TRIGGER IF EXISTS trigger_dispatch_appointment_webhook ON appointments;
CREATE TRIGGER trigger_dispatch_appointment_webhook
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION dispatch_appointment_webhook();

-- Create function to dispatch webhook when transaction status changes
CREATE OR REPLACE FUNCTION public.dispatch_transaction_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  event_type TEXT;
  supabase_url TEXT;
  supabase_anon_key TEXT;
BEGIN
  -- Only trigger on payment_status changes
  IF TG_OP = 'UPDATE' AND OLD.payment_status IS NOT DISTINCT FROM NEW.payment_status THEN
    RETURN NEW;
  END IF;
  
  -- Determine the event type based on payment method and status
  IF NEW.payment_method = 'pix' THEN
    IF NEW.payment_status = 'pending' THEN
      event_type := 'pix_gerado';
    ELSIF NEW.payment_status = 'approved' THEN
      event_type := 'pix_aprovado';
    ELSIF NEW.payment_status = 'expired' THEN
      event_type := 'pix_expirado';
    ELSIF NEW.payment_status = 'refunded' THEN
      event_type := 'reembolsado';
    ELSE
      RETURN NEW;
    END IF;
  ELSIF NEW.payment_method = 'card' THEN
    IF NEW.payment_status = 'approved' THEN
      event_type := 'cartao_aprovado';
    ELSIF NEW.payment_status = 'rejected' THEN
      event_type := 'compra_recusada';
    ELSIF NEW.payment_status = 'refunded' THEN
      event_type := 'reembolsado';
    ELSIF NEW.payment_status = 'chargeback' THEN
      event_type := 'chargeback';
    ELSE
      RETURN NEW;
    END IF;
  ELSIF NEW.payment_method = 'boleto' THEN
    IF NEW.payment_status = 'pending' THEN
      event_type := 'boleto_gerado';
    ELSIF NEW.payment_status = 'approved' THEN
      event_type := 'boleto_pago';
    ELSIF NEW.payment_status = 'expired' THEN
      event_type := 'boleto_expirado';
    ELSIF NEW.payment_status = 'refunded' THEN
      event_type := 'reembolsado';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;
  
  supabase_url := 'https://dctapmbdsfmzhtbpgigc.supabase.co';
  supabase_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdGFwbWJkc2Ztemh0YnBnaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4Mzg3MjIsImV4cCI6MjA4MjQxNDcyMn0.TdAMzml6AKavQ5FM9mgbqezfVbNE8rkjS4C9qvNikbs';
  
  -- Call the edge function asynchronously
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/dispatch-webhook',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || supabase_anon_key
    ),
    body := jsonb_build_object(
      'event', event_type,
      'professionalId', NEW.professional_id,
      'data', jsonb_build_object(
        'transaction_id', NEW.id,
        'customer_name', NEW.customer_name,
        'customer_email', NEW.customer_email,
        'customer_phone', NEW.customer_phone,
        'amount_cents', NEW.amount_cents,
        'payment_method', NEW.payment_method,
        'payment_status', NEW.payment_status,
        'gateway', NEW.gateway
      )
    )
  );
  
  RETURN NEW;
END;
$function$;

-- Create trigger for transaction webhooks
DROP TRIGGER IF EXISTS trigger_dispatch_transaction_webhook ON transactions;
CREATE TRIGGER trigger_dispatch_transaction_webhook
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION dispatch_transaction_webhook();