-- Create transactions table for sales history
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_cpf text,
  amount_cents integer NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  gateway text NOT NULL DEFAULT 'mercadopago',
  gateway_payment_id text,
  gateway_response jsonb DEFAULT '{}'::jsonb,
  pix_qr_code text,
  pix_code text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Professionals can view their own transactions
CREATE POLICY "Professionals can view their own transactions"
ON public.transactions
FOR SELECT
USING (professional_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- Professionals can update their own transactions
CREATE POLICY "Professionals can update their own transactions"
ON public.transactions
FOR UPDATE
USING (professional_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- Anyone can insert transactions (for checkout)
CREATE POLICY "Anyone can insert transactions"
ON public.transactions
FOR INSERT
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();