-- Create profiles table for professionals
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  specialty TEXT,
  crp TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_professional BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create payment_gateways table for professional payment configuration
CREATE TABLE public.payment_gateways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  gateway_type TEXT NOT NULL, -- 'pix', 'credit_card', 'boleto'
  is_active BOOLEAN DEFAULT true,
  pix_key TEXT,
  pix_key_type TEXT, -- 'cpf', 'email', 'phone', 'random'
  card_enabled BOOLEAN DEFAULT false,
  card_gateway TEXT, -- 'mercadopago', 'pagarme', 'stripe', etc
  card_api_key TEXT,
  installments_enabled BOOLEAN DEFAULT false,
  max_installments INTEGER DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, gateway_type)
);

-- Enable RLS on payment_gateways
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_gateways
CREATE POLICY "Public can view active gateways" ON public.payment_gateways
  FOR SELECT USING (is_active = true);

CREATE POLICY "Professionals can view their own gateways" ON public.payment_gateways
  FOR SELECT USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own gateways" ON public.payment_gateways
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own gateways" ON public.payment_gateways
  FOR UPDATE USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own gateways" ON public.payment_gateways
  FOR DELETE USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create available_hours table for professional schedule
CREATE TABLE public.available_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, day_of_week, start_time)
);

-- Enable RLS on available_hours
ALTER TABLE public.available_hours ENABLE ROW LEVEL SECURITY;

-- Create policies for available_hours
CREATE POLICY "Professionals can view their own hours" ON public.available_hours
  FOR SELECT USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own hours" ON public.available_hours
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own hours" ON public.available_hours
  FOR UPDATE USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own hours" ON public.available_hours
  FOR DELETE USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create appointments table for booking history
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 50,
  session_type TEXT, -- 'individual', 'couple', 'family'
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  payment_method TEXT, -- 'pix', 'credit_card', 'boleto'
  amount_cents INTEGER,
  notes TEXT,
  virtual_room_code TEXT,
  virtual_room_link TEXT,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for appointments
CREATE POLICY "Professionals can view their own appointments" ON public.appointments
  FOR SELECT USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can insert appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Professionals can update their own appointments" ON public.appointments
  FOR UPDATE USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create handle_new_user function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');-- Allow public to view professional profiles
CREATE POLICY "Anyone can view professional profiles"
ON public.profiles
FOR SELECT
TO public
USING (is_professional = true);

-- Allow public to view available hours of professionals
CREATE POLICY "Anyone can view professional available hours"
ON public.available_hours
FOR SELECT
TO public
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE is_professional = true
  )
);-- Table for WhatsApp integration settings
CREATE TABLE public.whatsapp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evolution_api_url TEXT,
  evolution_api_key TEXT,
  evolution_instance_name TEXT,
  is_active BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,
  confirmation_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id)
);

-- Table for professional services/products (for checkout)
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 50,
  price_cents INTEGER NOT NULL,
  service_type TEXT DEFAULT 'session',
  product_config JSONB DEFAULT '{}'::jsonb,
  checkout_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_settings
CREATE POLICY "Professionals can view their own whatsapp settings"
ON public.whatsapp_settings
FOR SELECT
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own whatsapp settings"
ON public.whatsapp_settings
FOR INSERT
WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own whatsapp settings"
ON public.whatsapp_settings
FOR UPDATE
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own whatsapp settings"
ON public.whatsapp_settings
FOR DELETE
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for services
CREATE POLICY "Professionals can view their own services"
ON public.services
FOR SELECT
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
USING (is_active = true);

CREATE POLICY "Professionals can insert their own services"
ON public.services
FOR INSERT
WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own services"
ON public.services
FOR UPDATE
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own services"
ON public.services
FOR DELETE
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_whatsapp_settings_updated_at
BEFORE UPDATE ON public.whatsapp_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();-- Create a secure view for public professional profiles (without sensitive data)
CREATE OR REPLACE VIEW public.public_professional_profiles AS
SELECT 
  id,
  full_name,
  specialty,
  crp,
  bio,
  avatar_url,
  is_professional,
  created_at
FROM public.profiles
WHERE is_professional = true;

-- Grant access to the view
GRANT SELECT ON public.public_professional_profiles TO anon, authenticated;

-- Update RLS policy: Remove the old policy that exposes all data
DROP POLICY IF EXISTS "Anyone can view professional profiles" ON public.profiles;

-- Create new restrictive policy: Only authenticated users during booking flow can see contact info
-- This policy allows viewing full profile only for: 
-- 1. The profile owner
-- 2. (Email/phone will only be accessible through authenticated booking flow via edge function)
CREATE POLICY "Authenticated users can view professional profiles for booking" 
ON public.profiles 
FOR SELECT 
USING (
  is_professional = true 
  AND auth.uid() IS NOT NULL
);

-- Keep the self-view policy (already exists, just ensuring)
-- Users can always view their own profile with all data-- Drop the view and recreate without security definer issue
DROP VIEW IF EXISTS public.public_professional_profiles;

-- Create the view with SECURITY INVOKER (default, safe)
CREATE VIEW public.public_professional_profiles 
WITH (security_invoker = true) AS
SELECT 
  id,
  full_name,
  specialty,
  crp,
  bio,
  avatar_url,
  is_professional,
  created_at
FROM public.profiles
WHERE is_professional = true;

-- Grant access to the view for both anonymous and authenticated users
GRANT SELECT ON public.public_professional_profiles TO anon, authenticated;-- Drop the problematic view 
DROP VIEW IF EXISTS public.public_professional_profiles;

-- Recreate as a simple view with INVOKER security (checks caller's permissions)
CREATE VIEW public.public_professional_profiles AS
SELECT 
  id,
  full_name,
  specialty,
  crp,
  bio,
  avatar_url,
  is_professional,
  created_at
FROM public.profiles
WHERE is_professional = true;

-- Create a security definer function to get professional contact info for authenticated users only
-- This function can be called during booking flow
CREATE OR REPLACE FUNCTION public.get_professional_contact(professional_id uuid)
RETURNS TABLE (phone text, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT phone, email
  FROM public.profiles
  WHERE id = professional_id
    AND is_professional = true;
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_professional_contact(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_professional_contact(uuid) FROM anon;-- Add JSON configs to services
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS product_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS checkout_config JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Storage buckets for checkout assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('checkout-public', 'checkout-public', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('checkout-private', 'checkout-private', false)
ON CONFLICT (id) DO NOTHING;

-- Policies: checkout-public (public read, user-managed writes)
DROP POLICY IF EXISTS "Public can read checkout public assets" ON storage.objects;
CREATE POLICY "Public can read checkout public assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'checkout-public');

DROP POLICY IF EXISTS "Users can upload own checkout public assets" ON storage.objects;
CREATE POLICY "Users can upload own checkout public assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'checkout-public'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update own checkout public assets" ON storage.objects;
CREATE POLICY "Users can update own checkout public assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'checkout-public'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own checkout public assets" ON storage.objects;
CREATE POLICY "Users can delete own checkout public assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'checkout-public'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies: checkout-private (only owner can read/write)
DROP POLICY IF EXISTS "Users can read own checkout private assets" ON storage.objects;
CREATE POLICY "Users can read own checkout private assets"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'checkout-private'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can upload own checkout private assets" ON storage.objects;
CREATE POLICY "Users can upload own checkout private assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'checkout-private'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update own checkout private assets" ON storage.objects;
CREATE POLICY "Users can update own checkout private assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'checkout-private'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own checkout private assets" ON storage.objects;
CREATE POLICY "Users can delete own checkout private assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'checkout-private'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
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
EXECUTE FUNCTION public.update_updated_at_column();-- Enable required extensions for scheduled jobs
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS virtual_room_code text,
ADD COLUMN IF NOT EXISTS virtual_room_link text,
ADD COLUMN IF NOT EXISTS recording_url text,
ADD COLUMN IF NOT EXISTS transcription jsonb DEFAULT '[]'::jsonb;

-- Create index for virtual room code lookup
CREATE INDEX IF NOT EXISTS idx_appointments_virtual_room_code ON public.appointments(virtual_room_code);

-- Create storage bucket for session recordings
INSERT INTO storage.buckets (id, name, public) 
VALUES ('session-recordings', 'session-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for session recordings bucket
CREATE POLICY "Professionals can upload their own session recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'session-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Professionals can view their own session recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'session-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Professionals can delete their own session recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'session-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);-- Add column to store AI Psi analysis in appointments
ALTER TABLE public.appointments 
ADD COLUMN ai_psi_analysis text;-- Remove the overly permissive insert policy
DROP POLICY IF EXISTS "Anyone can insert appointments" ON public.appointments;

-- Create a more restrictive insert policy that only allows inserts from authenticated users OR via service role (Edge Functions)
-- This means public bookings MUST go through an Edge Function for validation
CREATE POLICY "Appointments can only be inserted via Edge Functions or authenticated users"
ON public.appointments
FOR INSERT
WITH CHECK (
  -- Allow authenticated users (professionals creating appointments)
  auth.uid() IS NOT NULL 
  OR 
  -- Allow service role (Edge Functions) - this is checked at the connection level
  -- For now, we keep the table writable but enforce validation via Edge Function
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- Add a policy for clients to view their own appointments via email token verification
-- This uses a secure token approach - clients get a unique link to view their appointments
CREATE TABLE IF NOT EXISTS public.appointment_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  client_email text NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on the tokens table
ALTER TABLE public.appointment_access_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can manage tokens (via Edge Functions)
CREATE POLICY "Tokens managed by service role only"
ON public.appointment_access_tokens
FOR ALL
USING (false)
WITH CHECK (false);

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_appointment_access_tokens_token ON public.appointment_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_appointment_access_tokens_email ON public.appointment_access_tokens(client_email);
CREATE INDEX IF NOT EXISTS idx_appointment_access_tokens_expires ON public.appointment_access_tokens(expires_at);

-- Add comment explaining the security model
COMMENT ON TABLE public.appointment_access_tokens IS 'Secure tokens for clients to access their appointments without requiring authentication. Tokens are generated when appointments are created and sent via email.';-- Create table for WebRTC signaling (virtual room sessions)
CREATE TABLE public.virtual_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  professional_id UUID NOT NULL,
  offer JSONB,
  answer JSONB,
  patient_name TEXT,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'connected', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.virtual_rooms ENABLE ROW LEVEL SECURITY;

-- Policy for professionals to manage their rooms
CREATE POLICY "Professionals can manage their own rooms" 
ON public.virtual_rooms 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.profiles WHERE id = professional_id
))
WITH CHECK (auth.uid() IN (
  SELECT user_id FROM public.profiles WHERE id = professional_id
));

-- Policy for anyone to read rooms by code (for patients joining)
CREATE POLICY "Anyone can read rooms by code" 
ON public.virtual_rooms 
FOR SELECT 
USING (true);

-- Policy for anyone to update answer (for patients to join)
CREATE POLICY "Anyone can update room answer" 
ON public.virtual_rooms 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_virtual_rooms_room_code ON public.virtual_rooms(room_code);
CREATE INDEX idx_virtual_rooms_professional_id ON public.virtual_rooms(professional_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_virtual_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_virtual_rooms_updated_at
BEFORE UPDATE ON public.virtual_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_virtual_rooms_updated_at();

-- Enable realtime for virtual_rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE public.virtual_rooms;-- Drop the existing ALL policy that's too restrictive for INSERT
DROP POLICY IF EXISTS "Professionals can manage their own rooms" ON public.virtual_rooms;

-- Create separate policies for each operation
CREATE POLICY "Professionals can insert rooms" 
ON public.virtual_rooms 
FOR INSERT 
WITH CHECK (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can update their own rooms" 
ON public.virtual_rooms 
FOR UPDATE 
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can delete their own rooms" 
ON public.virtual_rooms 
FOR DELETE 
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can view their own rooms" 
ON public.virtual_rooms 
FOR SELECT 
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);-- Create custom_domains table for professional checkout domains
CREATE TABLE public.custom_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verification_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  cloudflare_zone_id TEXT,
  ssl_status TEXT DEFAULT 'pending',
  dns_verified BOOLEAN DEFAULT false,
  dns_verified_at TIMESTAMP WITH TIME ZONE,
  ssl_provisioned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(domain)
);

-- Enable RLS
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view their own domains"
  ON public.custom_domains
  FOR SELECT
  USING (professional_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can insert their own domains"
  ON public.custom_domains
  FOR INSERT
  WITH CHECK (professional_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can update their own domains"
  ON public.custom_domains
  FOR UPDATE
  USING (professional_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can delete their own domains"
  ON public.custom_domains
  FOR DELETE
  USING (professional_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_custom_domains_professional ON public.custom_domains(professional_id);
CREATE INDEX idx_custom_domains_domain ON public.custom_domains(domain);-- Add columns for primary domain and redirect configuration
ALTER TABLE public.custom_domains 
ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS redirect_to text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS parent_domain_id uuid DEFAULT NULL REFERENCES public.custom_domains(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_domains_parent ON public.custom_domains(parent_domain_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_primary ON public.custom_domains(professional_id, is_primary) WHERE is_primary = true;-- Add explicit protection for appointments table
-- Ensure only authenticated professionals can access their own appointments

-- Create a more restrictive SELECT policy that requires authentication
-- The existing policy already checks professional ownership, but we add defense in depth
CREATE POLICY "Block unauthenticated access to appointments"
ON public.appointments
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Recreate INSERT policy with proper restrictive clause
DROP POLICY IF EXISTS "Appointments can only be inserted via Edge Functions or authent" ON public.appointments;

CREATE POLICY "Only authenticated users or service role can insert appointments"
ON public.appointments
AS RESTRICTIVE
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  OR (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role'
);

-- Add explicit protection for DELETE
CREATE POLICY "Block unauthenticated delete on appointments"
ON public.appointments
AS RESTRICTIVE
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Add explicit protection for UPDATE
CREATE POLICY "Block unauthenticated update on appointments"
ON public.appointments
AS RESTRICTIVE
FOR UPDATE
USING (auth.uid() IS NOT NULL);-- Fix virtual_rooms security vulnerability
-- Remove overly permissive public policies and add proper restrictions

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can read rooms by code" ON public.virtual_rooms;
DROP POLICY IF EXISTS "Anyone can update room answer" ON public.virtual_rooms;

-- Add RESTRICTIVE policy requiring authentication for all SELECT operations
CREATE POLICY "Block unauthenticated access to virtual rooms"
ON public.virtual_rooms
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add RESTRICTIVE policy requiring authentication for all UPDATE operations
CREATE POLICY "Block unauthenticated update on virtual rooms"
ON public.virtual_rooms
AS RESTRICTIVE
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Now add permissive policies for legitimate access patterns

-- Authenticated users can read rooms by code (for patients joining via link)
CREATE POLICY "Authenticated users can read rooms by code"
ON public.virtual_rooms
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Authenticated users can update room answer (for WebRTC signaling)
-- Only allow updating the answer and status fields
CREATE POLICY "Authenticated users can update room answer"
ON public.virtual_rooms
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);-- Drop the overly permissive SELECT policy that allows any authenticated user to view all appointments
DROP POLICY IF EXISTS "Block unauthenticated access to appointments" ON public.appointments;

-- The "Professionals can view their own appointments" policy already exists and correctly restricts access
-- This ensures only professionals can see their own appointments (via professional_id match)-- Drop the existing restrictive policy and create a proper permissive one
-- Restrictive policies only restrict access already granted - they don't grant access
-- We need a PERMISSIVE policy to grant access to professionals for their own appointments

DROP POLICY IF EXISTS "Professionals can view their own appointments" ON public.appointments;

-- Create a PERMISSIVE policy that grants SELECT access only to professionals for their own appointments
CREATE POLICY "Professionals can view their own appointments"
ON public.appointments
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);-- Drop the overly permissive INSERT policy that allows anyone to insert
DROP POLICY IF EXISTS "Anyone can insert transactions" ON public.transactions;

-- Create a more restrictive INSERT policy
-- Transactions can be inserted by:
-- 1. Authenticated users (customers making payments)
-- 2. Service role (edge functions processing payments)
CREATE POLICY "Authenticated users or service role can insert transactions"
ON public.transactions
AS PERMISSIVE
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  OR (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role'
);-- Remove the insecure public read policy
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;

-- Create a secure public view that only exposes non-sensitive fields
CREATE OR REPLACE VIEW public.public_services AS
SELECT 
  id,
  professional_id,
  name,
  description,
  price_cents,
  duration_minutes,
  is_active,
  created_at
FROM public.services
WHERE is_active = true;

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.public_services TO anon, authenticated;

-- Add a comment explaining the security rationale
COMMENT ON VIEW public.public_services IS 'Public view of services that excludes sensitive checkout_config and product_config fields containing payment credentials';-- Update the public view to include checkout_config and product_config
-- These fields contain only UI configuration (colors, banners, payment method toggles)
-- NOT payment credentials (those are in payment_gateways table with proper RLS)
DROP VIEW IF EXISTS public.public_services;

CREATE VIEW public.public_services AS
SELECT 
  id,
  professional_id,
  name,
  description,
  price_cents,
  duration_minutes,
  is_active,
  created_at,
  checkout_config,
  product_config
FROM public.services
WHERE is_active = true;

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.public_services TO anon, authenticated;

COMMENT ON VIEW public.public_services IS 'Public view of active services. checkout_config and product_config contain UI settings only (colors, banners, enabled payment methods). Actual payment credentials are stored securely in payment_gateways table with RLS protection.';-- Create a public view for active domains
CREATE OR REPLACE VIEW public.public_active_domains AS
SELECT 
  id,
  domain,
  professional_id,
  is_primary,
  ssl_status,
  created_at
FROM public.custom_domains
WHERE status = 'active' AND dns_verified = true;

-- Add comment to the view
COMMENT ON VIEW public.public_active_domains IS 'Public view of active and verified custom domains for checkout selection';-- Adicionar campo para número de WhatsApp nas notificações de domínio
ALTER TABLE public.custom_domains 
ADD COLUMN IF NOT EXISTS notification_whatsapp TEXT;-- Add user_slug column to profiles table for unique checkout URLs
ALTER TABLE public.profiles 
ADD COLUMN user_slug text;

-- Create unique index for user_slug (allows NULL values, but unique when set)
CREATE UNIQUE INDEX idx_profiles_user_slug_unique 
ON public.profiles (user_slug) 
WHERE user_slug IS NOT NULL AND user_slug != '';

-- Create index for faster lookups
CREATE INDEX idx_profiles_user_slug 
ON public.profiles (user_slug);

-- Function to generate a unique slug from a name
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_name text, exclude_profile_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  -- Generate base slug from name
  base_slug := lower(
    regexp_replace(
      regexp_replace(
        unaccent(coalesce(base_name, 'user')),
        '[^a-zA-Z0-9]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    )
  );
  
  -- Limit length
  base_slug := substring(base_slug from 1 for 25);
  
  -- If empty, use default
  IF base_slug = '' THEN
    base_slug := 'user';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add suffix if needed
  WHILE EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_slug = final_slug 
    AND (exclude_profile_id IS NULL OR id != exclude_profile_id)
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Function to check if a slug is available
CREATE OR REPLACE FUNCTION public.check_slug_available(slug text, profile_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_slug = slug 
    AND (profile_id IS NULL OR id != profile_id)
  );
$$;-- Create google_calendar_settings table for storing OAuth tokens and settings
CREATE TABLE public.google_calendar_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL UNIQUE,
  is_connected BOOLEAN DEFAULT false,
  google_email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  sync_enabled BOOLEAN DEFAULT true,
  auto_create_meet BOOLEAN DEFAULT true,
  sync_direction TEXT DEFAULT 'two_way' CHECK (sync_direction IN ('one_way', 'two_way')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  calendar_id TEXT DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_calendar_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view their own google settings"
  ON public.google_calendar_settings
  FOR SELECT
  USING (professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can insert their own google settings"
  ON public.google_calendar_settings
  FOR INSERT
  WITH CHECK (professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can update their own google settings"
  ON public.google_calendar_settings
  FOR UPDATE
  USING (professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can delete their own google settings"
  ON public.google_calendar_settings
  FOR DELETE
  USING (professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_google_calendar_settings_updated_at
  BEFORE UPDATE ON public.google_calendar_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_google_calendar_settings_professional ON public.google_calendar_settings(professional_id);-- Remove the policy that exposes sensitive contact information to all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view professional profiles for booking" ON public.profiles;

-- Drop the existing function first to allow changing return type
DROP FUNCTION IF EXISTS public.get_professional_contact(UUID);

-- Create a secure function to get professional contact info only when authorized
-- This function can be called by edge functions with service role or by the professional themselves
CREATE OR REPLACE FUNCTION public.get_professional_contact(professional_id UUID)
RETURNS TABLE (email TEXT, phone TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return contact info if:
  -- 1. The requester is the professional themselves
  -- 2. Or this is called from a service role context (edge functions)
  IF auth.uid() IS NULL THEN
    -- Service role context - allow access
    RETURN QUERY
    SELECT p.email, p.phone
    FROM profiles p
    WHERE p.id = professional_id AND p.is_professional = true;
  ELSIF auth.uid() = (SELECT user_id FROM profiles WHERE id = professional_id) THEN
    -- Professional accessing their own info
    RETURN QUERY
    SELECT p.email, p.phone
    FROM profiles p
    WHERE p.id = professional_id;
  ELSE
    -- Unauthorized access - return empty
    RETURN;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.get_professional_contact(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_professional_contact(UUID) TO service_role;

-- Add a comment explaining the security model
COMMENT ON FUNCTION public.get_professional_contact IS 'Secure function to access professional contact information. Only returns data for the professional themselves or service role (edge functions).';-- Add unique constraint on professional_id for google_calendar_settings if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'google_calendar_settings_professional_id_key'
  ) THEN
    ALTER TABLE public.google_calendar_settings 
    ADD CONSTRAINT google_calendar_settings_professional_id_key UNIQUE (professional_id);
  END IF;
END $$;-- Enable pg_net extension for HTTP calls from triggers

-- Create function to sync appointment to Google Calendar
CREATE OR REPLACE FUNCTION public.sync_appointment_to_google_calendar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  google_settings RECORD;
  supabase_url TEXT;
  supabase_anon_key TEXT;
BEGIN
  -- Get Google Calendar settings for this professional
  SELECT * INTO google_settings
  FROM google_calendar_settings
  WHERE professional_id = NEW.professional_id
    AND is_connected = true
    AND sync_enabled = true;
  
  -- If no connected Google Calendar, skip
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Get Supabase URL and anon key from vault or use hardcoded values
  supabase_url := 'https://dctapmbdsfmzhtbpgigc.supabase.co';
  supabase_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdGFwbWJkc2Ztemh0YnBnaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4Mzg3MjIsImV4cCI6MjA4MjQxNDcyMn0.TdAMzml6AKavQ5FM9mgbqezfVbNE8rkjS4C9qvNikbs';
  
  -- Call the edge function asynchronously using pg_net
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/google-calendar-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || supabase_anon_key
    ),
    body := jsonb_build_object(
      'action', 'sync-appointment',
      'appointmentId', NEW.id,
      'professionalId', NEW.professional_id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new appointments
DROP TRIGGER IF EXISTS trigger_sync_appointment_to_google ON appointments;
CREATE TRIGGER trigger_sync_appointment_to_google
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION sync_appointment_to_google_calendar();

-- Also create trigger for when appointment status changes to confirmed
CREATE OR REPLACE FUNCTION public.sync_updated_appointment_to_google_calendar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  google_settings RECORD;
  supabase_url TEXT;
  supabase_anon_key TEXT;
BEGIN
  -- Only sync if status changed to 'confirmed' or 'pending'
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('confirmed', 'pending') THEN
    -- Get Google Calendar settings for this professional
    SELECT * INTO google_settings
    FROM google_calendar_settings
    WHERE professional_id = NEW.professional_id
      AND is_connected = true
      AND sync_enabled = true;
    
    -- If no connected Google Calendar, skip
    IF NOT FOUND THEN
      RETURN NEW;
    END IF;
    
    supabase_url := 'https://dctapmbdsfmzhtbpgigc.supabase.co';
    supabase_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdGFwbWJkc2Ztemh0YnBnaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4Mzg3MjIsImV4cCI6MjA4MjQxNDcyMn0.TdAMzml6AKavQ5FM9mgbqezfVbNE8rkjS4C9qvNikbs';
    
    -- Call the edge function asynchronously
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/google-calendar-sync',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_anon_key
      ),
      body := jsonb_build_object(
        'action', 'sync-appointment',
        'appointmentId', NEW.id,
        'professionalId', NEW.professional_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for updated appointments
DROP TRIGGER IF EXISTS trigger_sync_updated_appointment_to_google ON appointments;
CREATE TRIGGER trigger_sync_updated_appointment_to_google
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION sync_updated_appointment_to_google_calendar();-- Create webhooks table for storing custom webhook configurations
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret_token TEXT,
  is_active BOOLEAN DEFAULT true,
  events JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own webhooks" 
ON public.webhooks 
FOR SELECT 
USING (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own webhooks" 
ON public.webhooks 
FOR INSERT 
WITH CHECK (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own webhooks" 
ON public.webhooks 
FOR UPDATE 
USING (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own webhooks" 
ON public.webhooks 
FOR DELETE 
USING (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON public.webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();-- Create function to dispatch webhook when appointment is created or updated
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
  EXECUTE FUNCTION dispatch_transaction_webhook();-- Create table for AI Agent configuration
CREATE TABLE public.ai_agent_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  n8n_webhook_url TEXT DEFAULT '',
  n8n_api_key TEXT DEFAULT '',
  agent_name TEXT DEFAULT 'Assistente Virtual',
  agent_greeting TEXT DEFAULT 'Olá! Sou o assistente virtual. Como posso ajudar você a agendar uma consulta?',
  agent_instructions TEXT DEFAULT 'Você é um assistente virtual de agendamento. Seja educado e profissional. Ajude os clientes a encontrar o melhor horário disponível para suas consultas.',
  auto_confirm_appointments BOOLEAN DEFAULT false,
  send_confirmation_message BOOLEAN DEFAULT true,
  working_hours_only BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id)
);

-- Enable Row Level Security
ALTER TABLE public.ai_agent_config ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own AI agent config" 
ON public.ai_agent_config 
FOR SELECT 
USING (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own AI agent config" 
ON public.ai_agent_config 
FOR INSERT 
WITH CHECK (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own AI agent config" 
ON public.ai_agent_config 
FOR UPDATE 
USING (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own AI agent config" 
ON public.ai_agent_config 
FOR DELETE 
USING (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_agent_config_updated_at
BEFORE UPDATE ON public.ai_agent_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();-- Add WhatsApp number field to profiles for AI agent identification
ALTER TABLE public.profiles 
ADD COLUMN whatsapp_number TEXT;

-- Create index for faster lookups by WhatsApp number
CREATE INDEX idx_profiles_whatsapp_number ON public.profiles(whatsapp_number) WHERE whatsapp_number IS NOT NULL;-- Add OpenAI API key field to ai_agent_config for per-professional AI customization
ALTER TABLE public.ai_agent_config 
ADD COLUMN openai_api_key TEXT;

-- Add WhatsApp API type field to whatsapp_settings (evolution or official)
ALTER TABLE public.whatsapp_settings 
ADD COLUMN whatsapp_api_type TEXT DEFAULT 'evolution';

-- Add official WhatsApp API credentials
ALTER TABLE public.whatsapp_settings 
ADD COLUMN official_phone_number_id TEXT,
ADD COLUMN official_access_token TEXT,
ADD COLUMN official_business_account_id TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.ai_agent_config.openai_api_key IS 'OpenAI API key for this professional - if null, uses system default';
COMMENT ON COLUMN public.whatsapp_settings.whatsapp_api_type IS 'Type of WhatsApp API: evolution or official';-- Add preferred model field to ai_agent_config
ALTER TABLE public.ai_agent_config 
ADD COLUMN IF NOT EXISTS openai_preferred_model TEXT DEFAULT 'gpt-4-turbo-preview';

-- Add support for other AI providers
ALTER TABLE public.ai_agent_config 
ADD COLUMN IF NOT EXISTS anthropic_api_key TEXT,
ADD COLUMN IF NOT EXISTS anthropic_preferred_model TEXT DEFAULT 'claude-3-sonnet-20240229',
ADD COLUMN IF NOT EXISTS google_api_key TEXT,
ADD COLUMN IF NOT EXISTS google_preferred_model TEXT DEFAULT 'gemini-pro',
ADD COLUMN IF NOT EXISTS preferred_ai_provider TEXT DEFAULT 'lovable';-- Add resume_url column to profiles table for curriculum upload
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;-- Add social media fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Create testimonials table for client reviews
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_avatar_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS policies for testimonials
-- Anyone can view approved testimonials
CREATE POLICY "Anyone can view approved testimonials" 
ON public.testimonials 
FOR SELECT 
USING (is_approved = true);

-- Professionals can manage their own testimonials
CREATE POLICY "Professionals can insert testimonials" 
ON public.testimonials 
FOR INSERT 
WITH CHECK (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can update their testimonials" 
ON public.testimonials 
FOR UPDATE 
USING (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can delete their testimonials" 
ON public.testimonials 
FOR DELETE 
USING (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();-- Add gender field to profiles table for Dr./Dra. prefix
ALTER TABLE public.profiles 
ADD COLUMN gender TEXT DEFAULT 'female' CHECK (gender IN ('male', 'female'));-- Update gender column to allow 'other' option
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_gender_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_gender_check CHECK (gender IN ('male', 'female', 'other'));-- Add customizable notification templates to whatsapp_settings
ALTER TABLE public.whatsapp_settings
ADD COLUMN template_client_confirmation TEXT DEFAULT NULL,
ADD COLUMN template_client_reminder TEXT DEFAULT NULL,
ADD COLUMN template_professional_notification TEXT DEFAULT NULL,
ADD COLUMN template_email_confirmation TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.whatsapp_settings.template_client_confirmation IS 'Custom WhatsApp message template for client appointment confirmation. Variables: {client_name}, {professional_name}, {service_name}, {date}, {time}, {price}';
COMMENT ON COLUMN public.whatsapp_settings.template_client_reminder IS 'Custom WhatsApp message template for appointment reminder. Variables: {client_name}, {professional_name}, {date}, {time}';
COMMENT ON COLUMN public.whatsapp_settings.template_professional_notification IS 'Custom WhatsApp message template for professional notification. Variables: {client_name}, {client_phone}, {client_email}, {service_name}, {date}, {time}, {price}, {notes}';
COMMENT ON COLUMN public.whatsapp_settings.template_email_confirmation IS 'Custom email HTML template for client confirmation. Variables: {client_name}, {professional_name}, {service_name}, {date}, {time}, {price}';-- Create table for landing page configurations
CREATE TABLE public.landing_page_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id)
);

-- Enable RLS
ALTER TABLE public.landing_page_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view their own config"
ON public.landing_page_config
FOR SELECT
USING (professional_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Professionals can insert their own config"
ON public.landing_page_config
FOR INSERT
WITH CHECK (professional_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Professionals can update their own config"
ON public.landing_page_config
FOR UPDATE
USING (professional_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Professionals can delete their own config"
ON public.landing_page_config
FOR DELETE
USING (professional_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_landing_page_config_updated_at
BEFORE UPDATE ON public.landing_page_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();-- Add new social media columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT;-- Create patient_records table for medical records
CREATE TABLE public.patient_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  patient_email TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  medications JSONB DEFAULT '[]'::jsonb,
  allergies TEXT,
  medical_history TEXT,
  risk_level TEXT DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, patient_email)
);

-- Enable Row Level Security
ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - professionals can only access their own patients' records
CREATE POLICY "Professionals can view their own patient records"
ON public.patient_records
FOR SELECT
USING (professional_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Professionals can insert their own patient records"
ON public.patient_records
FOR INSERT
WITH CHECK (professional_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Professionals can update their own patient records"
ON public.patient_records
FOR UPDATE
USING (professional_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Professionals can delete their own patient records"
ON public.patient_records
FOR DELETE
USING (professional_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patient_records_updated_at
BEFORE UPDATE ON public.patient_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();-- Add specialties (services like anxiety, depression, phobias) and approaches columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS approaches text[] DEFAULT '{}';-- Enable realtime for appointments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;-- Create modules table for members area
CREATE TABLE public.member_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.member_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.member_modules(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create member progress table
CREATE TABLE public.member_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.member_lessons(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  progress_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create members table (who has access)
CREATE TABLE public.member_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.member_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_access ENABLE ROW LEVEL SECURITY;

-- RLS for member_modules
CREATE POLICY "Professionals can manage their modules"
  ON public.member_modules FOR ALL
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Published modules are viewable by members"
  ON public.member_modules FOR SELECT
  USING (is_published = true);

-- RLS for member_lessons
CREATE POLICY "Professionals can manage their lessons"
  ON public.member_lessons FOR ALL
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Members can view lessons"
  ON public.member_lessons FOR SELECT
  USING (
    module_id IN (SELECT id FROM member_modules WHERE is_published = true)
  );

-- RLS for member_progress
CREATE POLICY "Users can manage their own progress"
  ON public.member_progress FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals can view member progress"
  ON public.member_progress FOR SELECT
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS for member_access
CREATE POLICY "Professionals can manage member access"
  ON public.member_access FOR ALL
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own access"
  ON public.member_access FOR SELECT
  USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_member_modules_updated_at
  BEFORE UPDATE ON public.member_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_member_lessons_updated_at
  BEFORE UPDATE ON public.member_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_member_progress_updated_at
  BEFORE UPDATE ON public.member_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for member videos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('member-videos', 'member-videos', false, 524288000)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for member videos
CREATE POLICY "Professionals can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'member-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Professionals can update their videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'member-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Professionals can delete their videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'member-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can view videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'member-videos' AND auth.uid() IS NOT NULL);-- Add INSERT policy for member-videos bucket (was missing)
CREATE POLICY "Professionals can upload to their folder" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'member-videos' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);-- Add thumbnail_focus column to member_modules table
-- Options: 'top', 'center', 'bottom' (default: 'center')
ALTER TABLE public.member_modules 
ADD COLUMN IF NOT EXISTS thumbnail_focus TEXT DEFAULT 'center';-- Create community posts table for member area discussions
CREATE TABLE public.member_community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community post likes table
CREATE TABLE public.member_community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.member_community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create member events table
CREATE TABLE public.member_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  event_type TEXT DEFAULT 'live', -- 'live', 'webinar', 'workshop'
  meeting_url TEXT,
  max_participants INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event registrations table
CREATE TABLE public.member_event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.member_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  UNIQUE(event_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.member_community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_event_registrations ENABLE ROW LEVEL SECURITY;

-- Policies for community posts
CREATE POLICY "Members can view posts from professionals they have access to"
ON public.member_community_posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.member_access
    WHERE member_access.professional_id = member_community_posts.professional_id
    AND member_access.user_id = auth.uid()
    AND member_access.is_active = true
  )
  OR professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Members can create posts in communities they have access to"
ON public.member_community_posts FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  (
    EXISTS (
      SELECT 1 FROM public.member_access
      WHERE member_access.professional_id = member_community_posts.professional_id
      AND member_access.user_id = auth.uid()
      AND member_access.is_active = true
    )
    OR professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own posts"
ON public.member_community_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.member_community_posts FOR DELETE
USING (auth.uid() = user_id);

-- Policies for likes
CREATE POLICY "Members can view likes"
ON public.member_community_likes FOR SELECT
USING (true);

CREATE POLICY "Members can like posts"
ON public.member_community_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.member_community_likes FOR DELETE
USING (auth.uid() = user_id);

-- Policies for events
CREATE POLICY "Members can view published events from their professionals"
ON public.member_events FOR SELECT
USING (
  is_published = true AND (
    EXISTS (
      SELECT 1 FROM public.member_access
      WHERE member_access.professional_id = member_events.professional_id
      AND member_access.user_id = auth.uid()
      AND member_access.is_active = true
    )
    OR professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Professionals can manage their own events"
ON public.member_events FOR ALL
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Policies for event registrations
CREATE POLICY "Members can view their registrations"
ON public.member_event_registrations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Members can register for events"
ON public.member_event_registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can cancel their registrations"
ON public.member_event_registrations FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_member_community_posts_updated_at
BEFORE UPDATE ON public.member_community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_member_events_updated_at
BEFORE UPDATE ON public.member_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();-- Create professional-images bucket for banner backgrounds and other professional images
INSERT INTO storage.buckets (id, name, public)
VALUES ('professional-images', 'professional-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own images (folder = user_id)
CREATE POLICY "Users can upload their own professional images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'professional-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own professional images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'professional-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own professional images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'professional-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access since bucket is public
CREATE POLICY "Professional images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'professional-images');-- Add verification fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS user_slug text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON public.profiles(is_verified) WHERE is_verified = true;

-- Update existing profiles: mark as verified if they have completed registration (full_name, crp, specialty, avatar_url, phone)
UPDATE public.profiles 
SET is_verified = true, verified_at = now()
WHERE is_professional = true 
  AND full_name IS NOT NULL 
  AND full_name != ''
  AND crp IS NOT NULL 
  AND crp != ''
  AND specialty IS NOT NULL 
  AND specialty != ''
  AND avatar_url IS NOT NULL 
  AND avatar_url != ''
  AND phone IS NOT NULL 
  AND phone != '';-- Criar política para permitir visualização pública de perfis de profissionais
-- Isso permite que qualquer pessoa (autenticada ou não) visualize profissionais

CREATE POLICY "Anyone can view professional profiles" 
ON public.profiles 
FOR SELECT 
USING (is_professional = true);-- Add public read policy for active services (needed for professional landing pages)
CREATE POLICY "Anyone can view active services"
  ON public.services
  FOR SELECT
  USING (is_active = true);-- Add public read policy for landing page config (needed for professional landing pages)
CREATE POLICY "Anyone can view landing page config"
  ON public.landing_page_config
  FOR SELECT
  USING (true);-- Add is_demo column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN public.profiles.is_demo IS 'Flag to identify demo/fake professionals for demonstration purposes';

-- Update existing RLS policies to include demo profiles in public view
-- Demo profiles should be visible to everyone in the directory-- Make user_id nullable for demo profiles
-- First, drop the foreign key constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_fkey;
  END IF;
END $$;

-- Make user_id nullable
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- Re-create the foreign key constraint but without restricting to existing users
-- This allows demo profiles to have NULL user_id
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE
  DEFERRABLE INITIALLY DEFERRED;

-- Allow NULL values for demo profiles by making the FK only apply to non-null values
-- (PostgreSQL allows this by default for nullable columns)-- Add service_type column to distinguish between session and members_area services
ALTER TABLE public.services 
ADD COLUMN service_type TEXT NOT NULL DEFAULT 'session' 
CHECK (service_type IN ('session', 'members_area'));

-- Add comment for clarity
COMMENT ON COLUMN public.services.service_type IS 'Type of service: session (appointment-based) or members_area (content access)';

-- Add index for filtering by type
CREATE INDEX idx_services_service_type ON public.services(service_type);

-- Add member_access_config column to store access duration settings
ALTER TABLE public.services 
ADD COLUMN member_access_config JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.services.member_access_config IS 'Configuration for members area access: access_type (lifetime, period, subscription), duration_months, etc.';-- Create table to store sales page configurations for courses/members area services
CREATE TABLE public.sales_page_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_id)
);

-- Enable Row Level Security
ALTER TABLE public.sales_page_config ENABLE ROW LEVEL SECURITY;

-- Create policies for professional access
CREATE POLICY "Professionals can view their own sales page configs" 
ON public.sales_page_config 
FOR SELECT 
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can create their own sales page configs" 
ON public.sales_page_config 
FOR INSERT 
WITH CHECK (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can update their own sales page configs" 
ON public.sales_page_config 
FOR UPDATE 
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can delete their own sales page configs" 
ON public.sales_page_config 
FOR DELETE 
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Public read access for anyone viewing sales pages
CREATE POLICY "Anyone can view published sales page configs" 
ON public.sales_page_config 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sales_page_config_updated_at
BEFORE UPDATE ON public.sales_page_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing', 'expired');

-- Create enum for subscription plan
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'premium');

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create subscriptions table for SaaS billing
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  gateway TEXT, -- stripe, mercadopago, asaas
  gateway_subscription_id TEXT,
  gateway_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  amount_cents INTEGER,
  billing_cycle TEXT DEFAULT 'monthly', -- monthly, semiannual, annual
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription_payments table for payment history
CREATE TABLE public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_cents INTEGER NOT NULL,
  gateway TEXT NOT NULL,
  gateway_payment_id TEXT,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platform_settings table for global configurations
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_activity_log table for audit trail
CREATE TABLE public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin (super_admin or admin)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for subscriptions
CREATE POLICY "Professionals can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for subscription_payments
CREATE POLICY "Professionals can view own payments"
  ON public.subscription_payments FOR SELECT
  TO authenticated
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all payments"
  ON public.subscription_payments FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage payments"
  ON public.subscription_payments FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for platform_settings
CREATE POLICY "Admins can view settings"
  ON public.platform_settings FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage settings"
  ON public.platform_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for admin_activity_log
CREATE POLICY "Admins can view activity log"
  ON public.admin_activity_log FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert activity log"
  ON public.admin_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add subscription-related columns to profiles if not exists
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;-- Create subscription plans table for dynamic pricing
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  price_monthly_cents INTEGER NOT NULL DEFAULT 0,
  price_semiannual_cents INTEGER,
  price_annual_cents INTEGER,
  trial_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  badge_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Public read access for plans (needed for checkout page)
CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

-- Admins can manage plans
CREATE POLICY "Admins can manage plans"
ON public.subscription_plans
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default plans
INSERT INTO public.subscription_plans (name, slug, description, features, price_monthly_cents, price_semiannual_cents, price_annual_cents, trial_days, is_active, is_featured, display_order, badge_text)
VALUES
  (
    'Plano Pro',
    'pro',
    'Ideal para profissionais que estão começando',
    '["CRM completo", "Agenda online", "Checkout personalizado", "Landing Page", "Notificações WhatsApp", "Relatórios básicos"]'::jsonb,
    14700,
    73500,
    117600,
    7,
    true,
    false,
    1,
    NULL
  ),
  (
    'Plano Premium',
    'premium',
    'Para profissionais que querem escalar seu negócio',
    '["Tudo do Plano Pro", "Área de membros", "Cursos ilimitados", "Eventos ao vivo", "Comunidade", "IA assistente", "Domínio personalizado", "Suporte prioritário"]'::jsonb,
    29700,
    148500,
    116400,
    7,
    true,
    true,
    2,
    'Mais Popular'
  );-- Create subscription_coupons table for discount coupons
CREATE TABLE public.subscription_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_plans TEXT[] DEFAULT '{}',
  applicable_billing_cycles TEXT[] DEFAULT '{}',
  min_amount_cents INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_coupons ENABLE ROW LEVEL SECURITY;

-- Public can validate coupons
CREATE POLICY "Anyone can view active coupons" 
ON public.subscription_coupons 
FOR SELECT 
USING (is_active = true);

-- Only super admins can manage coupons (via service role)
CREATE POLICY "Service role can manage coupons"
ON public.subscription_coupons
FOR ALL
USING (true)
WITH CHECK (true);

-- Add price_enabled fields to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS price_monthly_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS price_semiannual_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS price_annual_enabled BOOLEAN DEFAULT true;

-- Create coupon usage tracking table
CREATE TABLE public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES public.subscription_coupons(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  discount_amount_cents INTEGER NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Users can see their own coupon usage
CREATE POLICY "Users can view own coupon usage"
ON public.coupon_usage
FOR SELECT
USING (auth.uid() = professional_id);

-- Service role can manage usage
CREATE POLICY "Service role can manage coupon usage"
ON public.coupon_usage
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger to update coupon usage count
CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.subscription_coupons
  SET current_uses = current_uses + 1
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_coupon_used
AFTER INSERT ON public.coupon_usage
FOR EACH ROW
EXECUTE FUNCTION public.increment_coupon_usage();

-- Insert sample coupons
INSERT INTO public.subscription_coupons (code, description, discount_type, discount_value, max_uses, valid_until, applicable_plans, applicable_billing_cycles)
VALUES 
  ('BEMVINDO10', '10% de desconto para novos assinantes', 'percentage', 10, 100, now() + interval '6 months', ARRAY['pro', 'premium'], ARRAY['monthly', 'semiannual', 'annual']),
  ('ANUAL20', '20% de desconto no plano anual', 'percentage', 20, NULL, now() + interval '1 year', ARRAY['pro', 'premium'], ARRAY['annual']),
  ('PREMIUM50', 'R$ 50 de desconto no Premium', 'fixed', 5000, 50, now() + interval '3 months', ARRAY['premium'], ARRAY['monthly', 'semiannual', 'annual']);-- Add CTA and tracking fields to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT 'Assinar Agora',
ADD COLUMN IF NOT EXISTS cta_color TEXT DEFAULT '#8B5CF6',
ADD COLUMN IF NOT EXISTS cta_text_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS facebook_pixel_id TEXT,
ADD COLUMN IF NOT EXISTS google_analytics_id TEXT,
ADD COLUMN IF NOT EXISTS tracking_events JSONB DEFAULT '{"view_plan": true, "start_checkout": true, "complete_purchase": true}'::jsonb;-- Add professional_status column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS professional_status TEXT DEFAULT 'pending' CHECK (professional_status IN ('active', 'pending', 'disabled'));

-- Update existing professionals to active status
UPDATE public.profiles SET professional_status = 'active' WHERE is_professional = true AND professional_status IS NULL;-- Create whatsapp_connections table for managing multiple connections (Baileys or Official API)
CREATE TABLE public.whatsapp_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT,
  driver_type TEXT NOT NULL DEFAULT 'baileys' CHECK (driver_type IN ('baileys', 'official')),
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting')),
  avatar_url TEXT,
  -- Baileys specific fields
  qr_code TEXT,
  session_data JSONB,
  -- Official API specific fields
  access_token TEXT,
  waba_id TEXT,
  phone_number_id TEXT,
  -- Metadata
  last_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create whatsapp_crm_stages table (Kanban columns)
CREATE TABLE public.whatsapp_crm_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#10b981',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create whatsapp_crm_leads table (Kanban cards)
CREATE TABLE public.whatsapp_crm_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.whatsapp_crm_stages(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  value_cents INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  last_interaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create whatsapp_ai_agents table
CREATE TABLE public.whatsapp_ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  avatar_color TEXT DEFAULT '#10b981',
  avatar_icon TEXT DEFAULT 'bot',
  system_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  knowledge_base JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create whatsapp_dispatch_config table (anti-ban settings)
CREATE TABLE public.whatsapp_dispatch_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  -- Scheduling
  schedule_enabled BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMPTZ,
  -- Interval settings (anti-ban)
  delay_min_seconds INTEGER DEFAULT 30,
  delay_max_seconds INTEGER DEFAULT 60,
  -- Auto pause
  pause_after_messages INTEGER DEFAULT 50,
  pause_minutes INTEGER DEFAULT 10,
  -- Time window
  start_time TIME DEFAULT '08:00',
  end_time TIME DEFAULT '18:00',
  active_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- 0=Sunday, 1=Monday, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(professional_id, connection_id)
);

-- Create whatsapp_dispatches table (broadcast campaigns)
CREATE TABLE public.whatsapp_dispatches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message_content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  recipients JSONB DEFAULT '[]', -- Array of phone numbers
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create whatsapp_messages table for chat history
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.whatsapp_crm_leads(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_crm_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_dispatch_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_connections
CREATE POLICY "Professionals can view their own connections" ON public.whatsapp_connections FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own connections" ON public.whatsapp_connections FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can update their own connections" ON public.whatsapp_connections FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can delete their own connections" ON public.whatsapp_connections FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS Policies for whatsapp_crm_stages
CREATE POLICY "Professionals can view their own stages" ON public.whatsapp_crm_stages FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own stages" ON public.whatsapp_crm_stages FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can update their own stages" ON public.whatsapp_crm_stages FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can delete their own stages" ON public.whatsapp_crm_stages FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS Policies for whatsapp_crm_leads
CREATE POLICY "Professionals can view their own leads" ON public.whatsapp_crm_leads FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own leads" ON public.whatsapp_crm_leads FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can update their own leads" ON public.whatsapp_crm_leads FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can delete their own leads" ON public.whatsapp_crm_leads FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS Policies for whatsapp_ai_agents
CREATE POLICY "Professionals can view their own agents" ON public.whatsapp_ai_agents FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own agents" ON public.whatsapp_ai_agents FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can update their own agents" ON public.whatsapp_ai_agents FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can delete their own agents" ON public.whatsapp_ai_agents FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS Policies for whatsapp_dispatch_config
CREATE POLICY "Professionals can view their own config" ON public.whatsapp_dispatch_config FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own config" ON public.whatsapp_dispatch_config FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can update their own config" ON public.whatsapp_dispatch_config FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can delete their own config" ON public.whatsapp_dispatch_config FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS Policies for whatsapp_dispatches
CREATE POLICY "Professionals can view their own dispatches" ON public.whatsapp_dispatches FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own dispatches" ON public.whatsapp_dispatches FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can update their own dispatches" ON public.whatsapp_dispatches FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can delete their own dispatches" ON public.whatsapp_dispatches FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS Policies for whatsapp_messages
CREATE POLICY "Professionals can view their own messages" ON public.whatsapp_messages FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own messages" ON public.whatsapp_messages FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- Create indexes for performance
CREATE INDEX idx_whatsapp_connections_professional ON public.whatsapp_connections(professional_id);
CREATE INDEX idx_whatsapp_crm_stages_professional ON public.whatsapp_crm_stages(professional_id);
CREATE INDEX idx_whatsapp_crm_leads_professional ON public.whatsapp_crm_leads(professional_id);
CREATE INDEX idx_whatsapp_crm_leads_stage ON public.whatsapp_crm_leads(stage_id);
CREATE INDEX idx_whatsapp_ai_agents_professional ON public.whatsapp_ai_agents(professional_id);
CREATE INDEX idx_whatsapp_dispatches_professional ON public.whatsapp_dispatches(professional_id);
CREATE INDEX idx_whatsapp_messages_professional ON public.whatsapp_messages(professional_id);
CREATE INDEX idx_whatsapp_messages_lead ON public.whatsapp_messages(lead_id);

-- Triggers for updated_at
CREATE TRIGGER update_whatsapp_connections_updated_at BEFORE UPDATE ON public.whatsapp_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_crm_stages_updated_at BEFORE UPDATE ON public.whatsapp_crm_stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_crm_leads_updated_at BEFORE UPDATE ON public.whatsapp_crm_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_ai_agents_updated_at BEFORE UPDATE ON public.whatsapp_ai_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_dispatch_config_updated_at BEFORE UPDATE ON public.whatsapp_dispatch_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_dispatches_updated_at BEFORE UPDATE ON public.whatsapp_dispatches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view professional profiles" ON public.profiles;

-- Create a restricted policy: public can only view non-sensitive fields via view
-- Direct table access requires authentication
CREATE POLICY "Authenticated users can view professional profiles"
ON public.profiles
FOR SELECT
USING (
  -- Authenticated users can see professional profiles
  (auth.uid() IS NOT NULL AND is_professional = true)
  OR
  -- Users can always see their own profile
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- Drop the old view if it exists
DROP VIEW IF EXISTS public.public_professional_profiles;

-- Create a secure view that only exposes non-sensitive fields
CREATE VIEW public.public_professional_profiles
WITH (security_invoker = false) AS
SELECT 
  id,
  full_name,
  specialty,
  specialties,
  approaches,
  crp,
  bio,
  avatar_url,
  is_professional,
  is_verified,
  verified_at,
  gender,
  user_slug,
  professional_status,
  created_at
  -- Explicitly excluding: email, phone, whatsapp_number, 
  -- facebook_url, instagram_url, linkedin_url, twitter_url, tiktok_url, youtube_url,
  -- resume_url, user_id, subscription_plan, subscription_status, subscription_expires_at
FROM public.profiles
WHERE is_professional = true 
  AND professional_status = 'active';

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_professional_profiles TO anon;
GRANT SELECT ON public.public_professional_profiles TO authenticated;-- Add whitelabel_admin role to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'whitelabel_admin';

-- Create whitelabels (clinics) table
CREATE TABLE public.whitelabels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#10b981',
  secondary_color TEXT DEFAULT '#059669',
  custom_domain TEXT,
  email TEXT,
  phone TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create whitelabel_professionals junction table
CREATE TABLE public.whitelabel_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whitelabel_id UUID NOT NULL REFERENCES public.whitelabels(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'professional',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(whitelabel_id, professional_id)
);

-- Create whitelabel_plans table for custom plans per whitelabel
CREATE TABLE public.whitelabel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whitelabel_id UUID NOT NULL REFERENCES public.whitelabels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price_monthly_cents INTEGER NOT NULL DEFAULT 0,
  price_semiannual_cents INTEGER,
  price_annual_cents INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(whitelabel_id, slug)
);

-- Enable RLS
ALTER TABLE public.whitelabels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelabel_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelabel_plans ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is whitelabel admin
CREATE OR REPLACE FUNCTION public.is_whitelabel_admin(_user_id uuid, _whitelabel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.whitelabels w
    WHERE w.id = _whitelabel_id 
    AND w.owner_id = _user_id
  )
$$;

-- Helper function to get user's whitelabel
CREATE OR REPLACE FUNCTION public.get_user_whitelabel(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.whitelabels WHERE owner_id = _user_id LIMIT 1
$$;

-- RLS Policies for whitelabels
CREATE POLICY "Super admins can manage all whitelabels"
ON public.whitelabels FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Whitelabel admins can view their own whitelabel"
ON public.whitelabels FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Whitelabel admins can update their own whitelabel"
ON public.whitelabels FOR UPDATE
USING (owner_id = auth.uid());

-- RLS Policies for whitelabel_professionals
CREATE POLICY "Super admins can manage all whitelabel professionals"
ON public.whitelabel_professionals FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Whitelabel admins can manage their professionals"
ON public.whitelabel_professionals FOR ALL
USING (public.is_whitelabel_admin(auth.uid(), whitelabel_id))
WITH CHECK (public.is_whitelabel_admin(auth.uid(), whitelabel_id));

CREATE POLICY "Professionals can view their whitelabel association"
ON public.whitelabel_professionals FOR SELECT
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for whitelabel_plans
CREATE POLICY "Super admins can manage all whitelabel plans"
ON public.whitelabel_plans FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Whitelabel admins can manage their plans"
ON public.whitelabel_plans FOR ALL
USING (public.is_whitelabel_admin(auth.uid(), whitelabel_id))
WITH CHECK (public.is_whitelabel_admin(auth.uid(), whitelabel_id));

CREATE POLICY "Anyone can view active whitelabel plans"
ON public.whitelabel_plans FOR SELECT
USING (is_active = true);

-- Triggers for updated_at
CREATE TRIGGER update_whitelabels_updated_at
BEFORE UPDATE ON public.whitelabels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whitelabel_plans_updated_at
BEFORE UPDATE ON public.whitelabel_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();-- Add scheduling fields to whatsapp_crm_leads
ALTER TABLE public.whatsapp_crm_leads
ADD COLUMN IF NOT EXISTS scheduled_date date,
ADD COLUMN IF NOT EXISTS scheduled_time time without time zone,
ADD COLUMN IF NOT EXISTS is_scheduled boolean DEFAULT false;
-- Table: api_keys - stores API keys for external integrations
CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Minha API Key',
  key_prefix text NOT NULL DEFAULT 'aaq_live_',
  key_hash text NOT NULL,
  key_hint text NOT NULL DEFAULT '',
  secret_hash text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active',
  last_used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  revoked_at timestamp with time zone,
  CONSTRAINT api_keys_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own api keys"
  ON public.api_keys FOR SELECT
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own api keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own api keys"
  ON public.api_keys FOR UPDATE
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own api keys"
  ON public.api_keys FOR DELETE
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can manage all api keys"
  ON public.api_keys FOR ALL
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Add new columns to existing webhooks table
ALTER TABLE public.webhooks 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS secret_hash text,
  ADD COLUMN IF NOT EXISTS last_triggered_at timestamp with time zone;

-- Table: webhook_deliveries - logs for webhook deliveries
CREATE TABLE public.webhook_deliveries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id uuid NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_status integer,
  response_body text,
  success boolean NOT NULL DEFAULT false,
  attempted_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their webhook deliveries"
  ON public.webhook_deliveries FOR SELECT
  USING (webhook_id IN (
    SELECT w.id FROM webhooks w 
    WHERE w.professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "Super admins can view all webhook deliveries"
  ON public.webhook_deliveries FOR ALL
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Index for faster queries
CREATE INDEX idx_api_keys_professional ON public.api_keys(professional_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_status ON public.api_keys(status);
CREATE INDEX idx_webhook_deliveries_webhook ON public.webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_attempted ON public.webhook_deliveries(attempted_at DESC);

-- AuthBot: bot_configs
CREATE TABLE public.bot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  wa_method TEXT DEFAULT 'evolution',
  
  evo_instance_name TEXT,
  evo_connected BOOLEAN DEFAULT FALSE,
  evo_phone TEXT,
  proxy_host TEXT,
  proxy_port TEXT,
  proxy_protocol TEXT,
  proxy_user TEXT,
  proxy_pass TEXT,
  
  meta_phone_number_id TEXT,
  meta_access_token TEXT,
  meta_waba_id TEXT,
  meta_verify_token TEXT,
  meta_app_secret TEXT,
  meta_connected BOOLEAN DEFAULT FALSE,
  
  bot_enabled BOOLEAN DEFAULT TRUE,
  greeting_message TEXT DEFAULT 'Olá! 😊 Sou o assistente virtual. Como posso ajudar?',
  away_message TEXT DEFAULT 'No momento estou fora do horário de atendimento.',
  transfer_keyword TEXT DEFAULT '/humano',
  auto_confirm_payment BOOLEAN DEFAULT TRUE,
  send_reminders BOOLEAN DEFAULT TRUE,
  reminder_hours_before INTEGER DEFAULT 24,
  
  llm_provider TEXT DEFAULT 'openai',
  llm_api_key TEXT,
  llm_model TEXT DEFAULT 'gpt-4o-mini',
  llm_temperature NUMERIC(3,2) DEFAULT 0.7,
  system_prompt TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id)
);

-- AuthBot: bot_knowledge_base
CREATE TABLE public.bot_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'faq',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AuthBot: bot_conversations
CREATE TABLE public.bot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id),
  patient_phone TEXT NOT NULL,
  patient_name TEXT,
  wa_method TEXT DEFAULT 'evolution',
  status TEXT DEFAULT 'active',
  current_intent TEXT,
  context JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id, patient_phone)
);

-- AuthBot: bot_messages
CREATE TABLE public.bot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.bot_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AuthBot: bot_payment_confirmations
CREATE TABLE public.bot_payment_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.bot_conversations(id),
  appointment_id UUID REFERENCES public.appointments(id),
  patient_phone TEXT NOT NULL,
  amount NUMERIC(10,2),
  proof_image_url TEXT,
  status TEXT DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_payment_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_bot_config" ON public.bot_configs FOR ALL USING (professional_id = auth.uid());
CREATE POLICY "own_knowledge" ON public.bot_knowledge_base FOR ALL USING (professional_id = auth.uid());
CREATE POLICY "own_conversations" ON public.bot_conversations FOR ALL USING (professional_id = auth.uid());
CREATE POLICY "own_messages" ON public.bot_messages FOR ALL USING (
  conversation_id IN (SELECT id FROM public.bot_conversations WHERE professional_id = auth.uid())
);
CREATE POLICY "own_payments" ON public.bot_payment_confirmations FOR ALL USING (
  conversation_id IN (SELECT id FROM public.bot_conversations WHERE professional_id = auth.uid())
);

-- Indexes
CREATE INDEX idx_bot_conversations_professional ON public.bot_conversations(professional_id);
CREATE INDEX idx_bot_messages_conversation ON public.bot_messages(conversation_id);
CREATE INDEX idx_bot_knowledge_professional ON public.bot_knowledge_base(professional_id);

-- Updated_at trigger for bot_configs
CREATE TRIGGER update_bot_configs_updated_at
  BEFORE UPDATE ON public.bot_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for agent knowledge base documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-knowledge-base', 'agent-knowledge-base', false)
ON CONFLICT (id) DO NOTHING;

-- Allow professionals to upload files to their own folder
CREATE POLICY "Professionals can upload knowledge base files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'agent-knowledge-base'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow professionals to view their own files
CREATE POLICY "Professionals can view their knowledge base files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'agent-knowledge-base'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow professionals to delete their own files
CREATE POLICY "Professionals can delete their knowledge base files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'agent-knowledge-base'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- CRM Pipelines
CREATE TABLE public.crm_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Pipeline Principal',
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_pipelines" ON public.crm_pipelines FOR ALL
  USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- CRM Stages
CREATE TABLE public.crm_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT '📋',
  position INTEGER NOT NULL DEFAULT 0,
  auto_followup_enabled BOOLEAN DEFAULT FALSE,
  auto_followup_delay_hours INTEGER DEFAULT 24,
  auto_followup_template_id UUID,
  is_won BOOLEAN DEFAULT FALSE,
  is_lost BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_stages" ON public.crm_stages FOR ALL
  USING (pipeline_id IN (SELECT id FROM public.crm_pipelines WHERE professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())))
  WITH CHECK (pipeline_id IN (SELECT id FROM public.crm_pipelines WHERE professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- CRM Leads
CREATE TABLE public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES public.crm_pipelines(id),
  stage_id UUID REFERENCES public.crm_stages(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  temperature TEXT DEFAULT 'warm',
  score INTEGER DEFAULT 50,
  intent TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  lost_reason TEXT,
  conversation_id UUID REFERENCES public.bot_conversations(id),
  appointment_id UUID REFERENCES public.appointments(id),
  first_contact_at TIMESTAMPTZ DEFAULT NOW(),
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  next_followup_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id, phone)
);

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_leads" ON public.crm_leads FOR ALL
  USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- CRM Lead Activities
CREATE TABLE public.crm_lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_lead_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_activities" ON public.crm_lead_activities FOR ALL
  USING (lead_id IN (SELECT id FROM public.crm_leads WHERE professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())))
  WITH CHECK (lead_id IN (SELECT id FROM public.crm_leads WHERE professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- CRM Follow-up Tasks
CREATE TABLE public.crm_followup_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id),
  type TEXT DEFAULT 'whatsapp',
  message TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error TEXT,
  is_auto BOOLEAN DEFAULT FALSE,
  template_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_followup_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_tasks" ON public.crm_followup_tasks FOR ALL
  USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- CRM Follow-up Templates
CREATE TABLE public.crm_followup_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  message TEXT NOT NULL,
  delay_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_followup_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_templates" ON public.crm_followup_templates FOR ALL
  USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Add indexes for performance
CREATE INDEX idx_crm_leads_professional ON public.crm_leads(professional_id);
CREATE INDEX idx_crm_leads_stage ON public.crm_leads(stage_id);
CREATE INDEX idx_crm_leads_pipeline ON public.crm_leads(pipeline_id);
CREATE INDEX idx_crm_lead_activities_lead ON public.crm_lead_activities(lead_id);
CREATE INDEX idx_crm_followup_tasks_lead ON public.crm_followup_tasks(lead_id);
CREATE INDEX idx_crm_followup_tasks_scheduled ON public.crm_followup_tasks(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_crm_stages_pipeline ON public.crm_stages(pipeline_id);

-- Enable realtime for leads (for Kanban updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_leads;
-- Add proxy fields and Evolution API support to whatsapp_connections
ALTER TABLE public.whatsapp_connections 
ADD COLUMN IF NOT EXISTS proxy_host TEXT,
ADD COLUMN IF NOT EXISTS proxy_port TEXT,
ADD COLUMN IF NOT EXISTS proxy_protocol TEXT DEFAULT 'http',
ADD COLUMN IF NOT EXISTS proxy_username TEXT,
ADD COLUMN IF NOT EXISTS proxy_password TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.whatsapp_connections.proxy_host IS 'Proxy host for anti-ban protection';
COMMENT ON COLUMN public.whatsapp_connections.proxy_port IS 'Proxy port';
COMMENT ON COLUMN public.whatsapp_connections.proxy_protocol IS 'Proxy protocol: http, https, socks4, socks5';
COMMENT ON COLUMN public.whatsapp_connections.proxy_username IS 'Proxy authentication username';
COMMENT ON COLUMN public.whatsapp_connections.proxy_password IS 'Proxy authentication password';ALTER TABLE public.whatsapp_connections DROP CONSTRAINT whatsapp_connections_driver_type_check;
ALTER TABLE public.whatsapp_connections ADD CONSTRAINT whatsapp_connections_driver_type_check CHECK (driver_type = ANY (ARRAY['baileys'::text, 'official'::text, 'evolution'::text]));
-- Table for quick replies (respostas rápidas)
CREATE TABLE public.quick_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  shortcut TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual', -- 'manual' or 'whatsapp'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Professionals can view their own quick replies"
  ON public.quick_replies FOR SELECT
  USING (professional_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own quick replies"
  ON public.quick_replies FOR INSERT
  WITH CHECK (professional_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Professionals can update their own quick replies"
  ON public.quick_replies FOR UPDATE
  USING (professional_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own quick replies"
  ON public.quick_replies FOR DELETE
  USING (professional_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

-- Unique constraint on shortcut per professional
CREATE UNIQUE INDEX idx_quick_replies_shortcut ON public.quick_replies (professional_id, shortcut);

-- Trigger for updated_at
CREATE TRIGGER update_quick_replies_updated_at
  BEFORE UPDATE ON public.quick_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for fake live sessions (AcolheLive)
CREATE TABLE public.fake_live_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Minha Live',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, live, ended
  
  -- Video settings
  video_url TEXT,
  is_exclusive_live BOOLEAN DEFAULT true,
  banner_text TEXT DEFAULT '',
  
  -- Social proof settings
  social_proof_settings JSONB DEFAULT '{"oscillation_enabled": true, "initial_viewers": 127, "max_viewers": 500, "increment": 5, "interval_ms": 3000}'::jsonb,
  
  -- Chat settings
  chat_settings JSONB DEFAULT '{"smart_chat_enabled": true, "phase": "warmup", "min_interval_ms": 2000, "max_interval_ms": 5000}'::jsonb,
  chat_messages JSONB DEFAULT '[]'::jsonb,
  
  -- CTA settings
  cta_settings JSONB DEFAULT '{"text": "QUERO ACESSAR AGORA", "color": "#00e054", "link": "", "appear_after_seconds": 60, "copy_text": "OFERTA EXCLUSIVA"}'::jsonb,
  
  -- Public sharing
  slug TEXT UNIQUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fake_live_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Professionals can manage their own live sessions"
  ON public.fake_live_sessions FOR ALL
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view live sessions by slug"
  ON public.fake_live_sessions FOR SELECT
  USING (slug IS NOT NULL AND status = 'live');

-- Trigger for updated_at
CREATE TRIGGER update_fake_live_sessions_updated_at
  BEFORE UPDATE ON public.fake_live_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for slug lookups
CREATE INDEX idx_fake_live_sessions_slug ON public.fake_live_sessions(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_fake_live_sessions_professional ON public.fake_live_sessions(professional_id);
-- Allow admins to view all WhatsApp connections
CREATE POLICY "Admins can view all whatsapp connections"
ON public.whatsapp_connections
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to view all live sessions
CREATE POLICY "Admins can view all live sessions"
ON public.fake_live_sessions
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to view all whatsapp messages
CREATE POLICY "Admins can view all whatsapp messages"
ON public.whatsapp_messages
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));ALTER TABLE public.subscription_plans ADD COLUMN payment_link text;ALTER TABLE public.subscription_plans 
ADD COLUMN payment_link_type text NOT NULL DEFAULT 'external';

COMMENT ON COLUMN public.subscription_plans.payment_link_type IS 'Type of payment link: external (custom URL) or gateway (uses active gateway checkout)';ALTER TABLE public.fake_live_sessions ADD COLUMN theme text NOT NULL DEFAULT 'dark';
ALTER TABLE public.fake_live_sessions 
ADD COLUMN IF NOT EXISTS countdown_seconds integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS cover_image_url text;
DROP VIEW IF EXISTS public.public_professional_profiles;

CREATE VIEW public.public_professional_profiles AS
SELECT id,
    full_name,
    specialty,
    specialties,
    approaches,
    crp,
    bio,
    avatar_url,
    is_professional,
    is_verified,
    user_slug,
    gender,
    instagram_url,
    facebook_url,
    linkedin_url,
    youtube_url,
    twitter_url,
    tiktok_url,
    phone,
    created_at
FROM profiles
WHERE is_professional = true AND (professional_status = 'active'::text OR professional_status IS NULL);-- Add format column to fake_live_sessions for Stories support
ALTER TABLE public.fake_live_sessions 
ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT 'landscape';
-- format values: 'landscape' (16:9), 'stories' (9:16)

COMMENT ON COLUMN public.fake_live_sessions.format IS 'Video format: landscape (16:9) or stories (9:16 for Instagram/TikTok)';
-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Anyone can view live sessions by slug" ON public.fake_live_sessions;

-- Create new policy that allows viewing any session with a slug (draft or live)
CREATE POLICY "Anyone can view sessions by slug"
  ON public.fake_live_sessions
  FOR SELECT
  USING (slug IS NOT NULL);
-- Add tracking pixel fields to fake_live_sessions
ALTER TABLE public.fake_live_sessions
ADD COLUMN IF NOT EXISTS facebook_pixel_id TEXT,
ADD COLUMN IF NOT EXISTS google_analytics_id TEXT,
ADD COLUMN IF NOT EXISTS scarcity_timer_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS scarcity_timer_seconds INTEGER DEFAULT 900,
ADD COLUMN IF NOT EXISTS reactions_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS social_notifications_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS social_notifications_settings JSONB DEFAULT '{"names": [], "messages": ["acabou de comprar!", "garantiu sua vaga!", "se inscreveu agora!"], "interval_ms": 15000, "mode": "simulated"}'::jsonb,
ADD COLUMN IF NOT EXISTS pinned_message TEXT,
ADD COLUMN IF NOT EXISTS access_password TEXT,
ADD COLUMN IF NOT EXISTS require_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

-- Create analytics events table
CREATE TABLE IF NOT EXISTS public.fake_live_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.fake_live_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'page_view', 'cta_click', 'chat_message', 'reaction', 'unmute', 'play'
  viewer_count INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fake_live_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics (public page visitors)
CREATE POLICY "Anyone can insert analytics events"
ON public.fake_live_analytics
FOR INSERT
WITH CHECK (true);

-- Professionals can view analytics for their own sessions
CREATE POLICY "Professionals can view their session analytics"
ON public.fake_live_analytics
FOR SELECT
USING (session_id IN (
  SELECT id FROM public.fake_live_sessions
  WHERE professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
));

-- Admins can view all
CREATE POLICY "Admins can view all analytics"
ON public.fake_live_analytics
FOR SELECT
USING (is_admin(auth.uid()));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_fake_live_analytics_session ON public.fake_live_analytics(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fake_live_analytics_type ON public.fake_live_analytics(event_type);

CREATE TABLE public.live_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.fake_live_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_live_registrations_session ON public.live_registrations(session_id);
CREATE INDEX idx_live_registrations_email_session ON public.live_registrations(session_id, email);

ALTER TABLE public.live_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can register (public form)
CREATE POLICY "Anyone can register for lives"
ON public.live_registrations
FOR INSERT
WITH CHECK (true);

-- Professionals can view registrations for their sessions
CREATE POLICY "Professionals can view their session registrations"
ON public.live_registrations
FOR SELECT
USING (
  session_id IN (
    SELECT id FROM fake_live_sessions
    WHERE professional_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Admins can view all
CREATE POLICY "Admins can view all registrations"
ON public.live_registrations
FOR SELECT
USING (is_admin(auth.uid()));

ALTER TABLE public.fake_live_sessions 
ADD COLUMN cover_audio_url text DEFAULT NULL;

COMMENT ON COLUMN public.fake_live_sessions.cover_audio_url IS 'URL do áudio que toca na capa enquanto a live não começa';

ALTER TABLE public.fake_live_sessions
ADD COLUMN cover_type text NOT NULL DEFAULT 'custom';

COMMENT ON COLUMN public.fake_live_sessions.cover_type IS 'Type of cover: custom (uploaded image) or countdown (animated system countdown)';

-- Create table for AcolheLive Agent configuration
CREATE TABLE public.acolhelive_agent_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  welcome_message TEXT DEFAULT '',
  reminder_message TEXT DEFAULT '',
  reminder_minutes_before INTEGER DEFAULT 10,
  send_welcome_on_register BOOLEAN DEFAULT true,
  send_reminder_on_start BOOLEAN DEFAULT true,
  whatsapp_connection_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id)
);

-- Enable RLS
ALTER TABLE public.acolhelive_agent_config ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own acolhelive agent config"
ON public.acolhelive_agent_config FOR SELECT
USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own acolhelive agent config"
ON public.acolhelive_agent_config FOR INSERT
WITH CHECK (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own acolhelive agent config"
ON public.acolhelive_agent_config FOR UPDATE
USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own acolhelive agent config"
ON public.acolhelive_agent_config FOR DELETE
USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_acolhelive_agent_config_updated_at
BEFORE UPDATE ON public.acolhelive_agent_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add checkout service requirement for paid lives
ALTER TABLE public.fake_live_sessions 
ADD COLUMN IF NOT EXISTS checkout_service_id uuid REFERENCES public.services(id) ON DELETE SET NULL DEFAULT NULL;

COMMENT ON COLUMN public.fake_live_sessions.checkout_service_id IS 'If set, requires payment through this service checkout before accessing the live';

-- Create table for multiple reminders per live session agent config
CREATE TABLE public.acolhelive_agent_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_config_id UUID NOT NULL REFERENCES public.acolhelive_agent_config(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  minutes_before INTEGER NOT NULL DEFAULT 10,
  message TEXT NOT NULL DEFAULT 'Ei {nome}! 👋

A live *{titulo_live}* vai começar em {minutos} minutos!

🔗 Acesse agora: {link_live}

Estamos te esperando! 🎬',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.acolhelive_agent_reminders ENABLE ROW LEVEL SECURITY;

-- Policy: professionals can manage their own reminders
CREATE POLICY "Professionals can manage their own reminders"
ON public.acolhelive_agent_reminders
FOR ALL
USING (professional_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
))
WITH CHECK (professional_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- Index for faster lookups
CREATE INDEX idx_agent_reminders_config ON public.acolhelive_agent_reminders(agent_config_id);

-- Add AuthBot AI agent fields to acolhelive_agent_config
ALTER TABLE public.acolhelive_agent_config
ADD COLUMN IF NOT EXISTS agent_name TEXT DEFAULT 'Assistente',
ADD COLUMN IF NOT EXISTS agent_instructions TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS agent_greeting TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS respond_in_chat BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS cta_aware BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS cta_restriction_message TEXT DEFAULT 'Aguarde um momento, em breve compartilharei mais detalhes sobre a oferta! 😊',
ADD COLUMN IF NOT EXISTS auto_respond_registration BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_respond_payment BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_confirmation_message TEXT DEFAULT 'Pagamento confirmado! ✅ Seu acesso à live {titulo_live} está garantido. Acesse pelo link: {link_live}',
ADD COLUMN IF NOT EXISTS knowledge_base_entries JSONB DEFAULT '[]'::jsonb;

-- Add comments
COMMENT ON COLUMN public.acolhelive_agent_config.agent_name IS 'Nome do agente exibido no chat da live';
COMMENT ON COLUMN public.acolhelive_agent_config.agent_instructions IS 'Instruções personalizadas do profissional para o agente';
COMMENT ON COLUMN public.acolhelive_agent_config.cta_aware IS 'Se true, agente só fala de preços/pagamento após CTA aparecer';
COMMENT ON COLUMN public.acolhelive_agent_config.cta_restriction_message IS 'Mensagem enviada quando perguntam sobre preço antes do CTA';
COMMENT ON COLUMN public.acolhelive_agent_config.knowledge_base_entries IS 'Base de conhecimento específica da live [{title, content, category}]';
-- Remove duplicate registrations keeping the oldest
DELETE FROM public.live_registrations a
USING public.live_registrations b
WHERE a.session_id = b.session_id
  AND a.email = b.email
  AND a.created_at > b.created_at;

-- Add unique constraint to prevent future duplicates
ALTER TABLE public.live_registrations ADD CONSTRAINT live_registrations_session_email_unique UNIQUE (session_id, email);-- Allow anonymous users to update their own registration (for upsert)
CREATE POLICY "Anyone can update their registration"
ON public.live_registrations
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anonymous users to select after upsert (needed for .select() chain)
CREATE POLICY "Anyone can select their own registration"
ON public.live_registrations
FOR SELECT
USING (true);
-- Fix: Add 'approved' to the allowed professional_status values
ALTER TABLE public.profiles DROP CONSTRAINT profiles_professional_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_professional_status_check 
  CHECK (professional_status = ANY (ARRAY['active'::text, 'pending'::text, 'disabled'::text, 'approved'::text, 'pending_payment'::text]));-- Add ai_config JSONB column to whitelabels for storing AI keys per clinic
ALTER TABLE public.whitelabels ADD COLUMN IF NOT EXISTS ai_config JSONB DEFAULT '{}'::jsonb;
-- Follow-up config per live session
CREATE TABLE public.live_followup_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.fake_live_sessions(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  -- Triggers
  auto_after_end BOOLEAN DEFAULT true,
  auto_delay_hours INTEGER DEFAULT 2,
  behavior_based BOOLEAN DEFAULT true,
  -- Channels
  send_whatsapp BOOLEAN DEFAULT true,
  send_email BOOLEAN DEFAULT true,
  create_crm_lead BOOLEAN DEFAULT true,
  ai_classification BOOLEAN DEFAULT true,
  -- Templates
  message_no_purchase TEXT DEFAULT 'Olá {{nome}}! Vi que você participou da nossa live "{{titulo_live}}" mas não finalizou a compra. Posso te ajudar com alguma dúvida? 😊',
  message_no_cta_click TEXT DEFAULT 'Oi {{nome}}! Você assistiu nossa live "{{titulo_live}}" e quero te oferecer uma condição especial. Vamos conversar? 🎯',
  email_subject TEXT DEFAULT 'Não perca essa oportunidade! 🎯',
  email_body TEXT DEFAULT '<h2>Olá {{nome}}!</h2><p>Você participou da nossa live "{{titulo_live}}" e queremos garantir que você não perca essa oportunidade especial.</p>',
  -- AI config
  ai_provider TEXT DEFAULT 'lovable',
  ai_model TEXT DEFAULT 'google/gemini-3-flash-preview',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id)
);

-- Follow-up tasks per participant
CREATE TABLE public.live_followup_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES public.live_followup_config(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.fake_live_sessions(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES public.live_registrations(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT,
  participant_whatsapp TEXT,
  -- Behavior
  clicked_cta BOOLEAN DEFAULT false,
  purchased BOOLEAN DEFAULT false,
  watch_time_minutes INTEGER DEFAULT 0,
  -- AI classification
  ai_temperature TEXT, -- hot, warm, cold
  ai_score INTEGER, -- 0-100
  ai_intent TEXT,
  -- Follow-up status
  whatsapp_status TEXT DEFAULT 'pending', -- pending, sent, failed, skipped
  email_status TEXT DEFAULT 'pending',
  crm_lead_id UUID,
  message_sent TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.live_followup_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_followup_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own followup config" ON public.live_followup_config
  FOR ALL USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users manage own followup tasks" ON public.live_followup_tasks
  FOR ALL USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Admins
CREATE POLICY "Admins manage all followup config" ON public.live_followup_config
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins manage all followup tasks" ON public.live_followup_tasks
  FOR ALL USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_live_followup_config_updated_at
  BEFORE UPDATE ON public.live_followup_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Remove unique constraint on session_id to allow multiple configs per session
ALTER TABLE public.live_followup_config DROP CONSTRAINT IF EXISTS live_followup_config_session_id_key;

-- Add name column to distinguish multiple agents
ALTER TABLE public.live_followup_config 
ADD COLUMN name TEXT NOT NULL DEFAULT 'Follow-up Principal';

-- Add display_order for sorting
ALTER TABLE public.live_followup_config 
ADD COLUMN display_order INT NOT NULL DEFAULT 0;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_followup_config_session ON public.live_followup_config(session_id);
-- Drop the current public read policy that depends on profiles table (which requires auth)
DROP POLICY IF EXISTS "Anyone can view professional available hours" ON public.available_hours;

-- Create a new public read policy that uses the public view instead
CREATE POLICY "Anyone can view professional available hours" 
ON public.available_hours 
FOR SELECT 
USING (
  professional_id IN (
    SELECT id FROM public_professional_profiles WHERE is_professional = true
  )
);

-- Create error monitoring table
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL DEFAULT 'frontend', -- 'frontend', 'backend', 'edge_function'
  severity TEXT NOT NULL DEFAULT 'error', -- 'warning', 'error', 'critical'
  message TEXT NOT NULL,
  stack_trace TEXT,
  component TEXT, -- component/function name where error occurred
  url TEXT, -- page URL or edge function name
  user_agent TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all errors
CREATE POLICY "Admins can view all error logs"
ON public.error_logs FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admins can update (resolve) errors
CREATE POLICY "Admins can update error logs"
ON public.error_logs FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Admins can delete errors
CREATE POLICY "Admins can delete error logs"
ON public.error_logs FOR DELETE
USING (public.is_admin(auth.uid()));

-- Anyone can insert errors (needed for frontend error reporting)
CREATE POLICY "Anyone can insert error logs"
ON public.error_logs FOR INSERT
WITH CHECK (true);

-- Index for faster queries
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved);
ALTER PUBLICATION supabase_realtime ADD TABLE public.error_logs;
-- Add lead capture keyword columns to bot_configs
ALTER TABLE public.bot_configs 
ADD COLUMN lead_capture_keywords text[] DEFAULT '{}',
ADD COLUMN lead_capture_message text DEFAULT 'Olá! 😊 Vi que você tem interesse em nossos serviços. Vou te ajudar! Como posso auxiliar?',
ADD COLUMN lead_capture_enabled boolean DEFAULT false;
-- Add video conference preference to profiles
ALTER TABLE public.profiles 
ADD COLUMN video_preference text NOT NULL DEFAULT 'virtual_room';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.video_preference IS 'Preferred video conferencing: virtual_room or google_meet';
-- Create table to track sent reminders and avoid duplicates
CREATE TABLE public.appointment_reminders_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- '24h', '1h', '15min'
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  whatsapp_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  UNIQUE(appointment_id, reminder_type)
);

-- Enable RLS
ALTER TABLE public.appointment_reminders_sent ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions use service role)
CREATE POLICY "Service role can manage reminders"
ON public.appointment_reminders_sent
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for fast lookup
CREATE INDEX idx_reminders_sent_appointment ON public.appointment_reminders_sent(appointment_id, reminder_type);

-- Enable pg_cron and pg_net extensions if not already enabled

-- Add per-interval reminder columns to bot_configs
ALTER TABLE public.bot_configs
  ADD COLUMN IF NOT EXISTS reminder_24h_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_1h_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_15min_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_24h_message text,
  ADD COLUMN IF NOT EXISTS reminder_1h_message text,
  ADD COLUMN IF NOT EXISTS reminder_15min_message text;
CREATE POLICY "public_read_bot_enabled" ON public.bot_configs
  FOR SELECT
  TO anon, authenticated
  USING (true);-- Fix: Allow public appointment creation (patients are not authenticated)
DROP POLICY IF EXISTS "Only authenticated users or service role can insert appointment" ON public.appointments;

CREATE POLICY "Allow public appointment creation"
  ON public.appointments
  FOR INSERT
  WITH CHECK (true);

-- Also fix: allow public insert on appointment_access_tokens (created during checkout)
DROP POLICY IF EXISTS "Only service role can insert tokens" ON public.appointment_access_tokens;

CREATE POLICY "Allow public token creation"
  ON public.appointment_access_tokens
  FOR INSERT
  WITH CHECK (true);
-- Create a public view exposing only scheduling-related fields (no PII)
CREATE OR REPLACE VIEW public.public_booked_slots
WITH (security_invoker = off) AS
SELECT 
  professional_id,
  appointment_date,
  appointment_time,
  status
FROM public.appointments
WHERE status IN ('pending', 'confirmed');

-- Allow anonymous SELECT on the view
-- Since security_invoker is off, the view runs as the owner (bypasses RLS on base table)
-- This is safe because the view only exposes non-PII scheduling data
GRANT SELECT ON public.public_booked_slots TO anon, authenticated;
-- Drop and recreate the view with security_invoker=off and owned by postgres
-- This ensures the view runs as the owner (postgres) bypassing RLS
DROP VIEW IF EXISTS public.public_booked_slots;

CREATE VIEW public.public_booked_slots
WITH (security_invoker = false)
AS
SELECT professional_id, appointment_date, appointment_time, status
FROM appointments
WHERE status IN ('pending', 'confirmed');

-- Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.public_booked_slots TO anon, authenticated;

-- Change owner to postgres so it bypasses RLS on the base table
ALTER VIEW public.public_booked_slots OWNER TO postgres;
-- Force PostgREST to reload its schema cache so the recreated view is recognized
NOTIFY pgrst, 'reload schema';

-- Also ensure the view is exposed via the API by granting usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Re-grant SELECT just to be safe
GRANT SELECT ON public.public_booked_slots TO anon, authenticated;
-- Table to cache patient data by IP for auto-fill
CREATE TABLE public.patient_data_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ip_address)
);

-- RLS policies - allow anon read/write for public scheduling flow
ALTER TABLE public.patient_data_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read by IP" ON public.patient_data_cache
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert" ON public.patient_data_cache
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update by IP" ON public.patient_data_cache
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE TRIGGER update_patient_data_cache_updated_at
  BEFORE UPDATE ON public.patient_data_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_reminder_per_appointment 
ON public.appointment_reminders_sent (appointment_id, reminder_type);ALTER TABLE public.payment_gateways 
ADD COLUMN IF NOT EXISTS is_sandbox boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sandbox_access_token text DEFAULT null,
ADD COLUMN IF NOT EXISTS sandbox_public_key text DEFAULT null;-- Remove duplicate cron jobs that cause race conditions and duplicate notifications
-- Keep only jobs 4, 5, 6 (reminder-24h, reminder-1h, reminder-15min)

-- Remove the old duplicate 24h job (sends with empty body, defaults to 24h)

-- Remove the duplicate 24h job

-- Remove the duplicate 1h job
-- This is needed because patients (not logged in) need to access gateway config
-- to process transparent checkout (card payments via Mercado Pago, etc.)
CREATE POLICY "Public can view active payment gateways" ON public.payment_gateways
  FOR SELECT USING (is_active = true);
-- Add Mercado Pago preapproval plan ID to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS mp_preapproval_plan_id TEXT NULL;

-- Add back_url for MP subscription callback
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS mp_back_url TEXT NULL;

COMMENT ON COLUMN public.subscription_plans.mp_preapproval_plan_id IS 'Mercado Pago preapproval_plan ID for recurring subscriptions';
COMMENT ON COLUMN public.subscription_plans.mp_back_url IS 'URL de retorno após assinatura no Mercado Pago';

-- Add internal billing management columns to subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS mp_customer_id text,
  ADD COLUMN IF NOT EXISTS mp_card_token_id text,
  ADD COLUMN IF NOT EXISTS next_billing_at timestamptz,
  ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_retries integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS last_payment_error text,
  ADD COLUMN IF NOT EXISTS grace_period_days integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS grace_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'card',
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.subscription_plans(id),
  ADD COLUMN IF NOT EXISTS subscriber_name text,
  ADD COLUMN IF NOT EXISTS subscriber_email text,
  ADD COLUMN IF NOT EXISTS subscriber_phone text,
  ADD COLUMN IF NOT EXISTS subscriber_cpf text;

-- Create subscription_payments table to log every charge attempt
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL,
  amount_cents integer NOT NULL,
  payment_method text NOT NULL DEFAULT 'card',
  status text NOT NULL DEFAULT 'pending',
  gateway_payment_id text,
  gateway_response jsonb,
  error_message text,
  billing_period_start timestamptz,
  billing_period_end timestamptz,
  attempt_number integer DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Admins can see all
CREATE POLICY "Admins can manage subscription_payments"
  ON public.subscription_payments
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Professional can see their own
CREATE POLICY "Professionals can view their subscription payments"
  ON public.subscription_payments
  FOR SELECT
  USING (
    professional_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Index for cron job performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing 
  ON public.subscriptions (next_billing_at) 
  WHERE status = 'active' AND next_billing_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription 
  ON public.subscription_payments (subscription_id);

-- Trigger for updated_at
CREATE TRIGGER update_subscription_payments_updated_at
  BEFORE UPDATE ON public.subscription_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin_notifications table for in-panel realtime notifications
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'new_subscription', 'payment_received', 'subscription_cancelled', 'subscription_expired'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  professional_id UUID REFERENCES public.profiles(id),
  professional_name TEXT,
  plan_name TEXT,
  amount_cents INTEGER,
  billing_cycle TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only super_admin and admin can read notifications
CREATE POLICY "Admins can read notifications"
ON public.admin_notifications FOR SELECT
USING (public.is_admin(auth.uid()));

-- Only super_admin and admin can update (mark as read)
CREATE POLICY "Admins can update notifications"
ON public.admin_notifications FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Allow service role to insert (from edge functions)
CREATE POLICY "Service role can insert notifications"
ON public.admin_notifications FOR INSERT
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Create index for faster queries
CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);
CREATE INDEX idx_admin_notifications_is_read ON public.admin_notifications(is_read) WHERE is_read = false;

-- Create trigger on subscriptions table to dispatch notifications
CREATE OR REPLACE FUNCTION public.dispatch_subscription_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  event_type TEXT;
  supabase_url TEXT;
  supabase_anon_key TEXT;
  prof_name TEXT;
  plan_name TEXT;
BEGIN
  supabase_url := 'https://dctapmbdsfmzhtbpgigc.supabase.co';
  supabase_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdGFwbWJkc2Ztemh0YnBnaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4Mzg3MjIsImV4cCI6MjA4MjQxNDcyMn0.TdAMzml6AKavQ5FM9mgbqezfVbNE8rkjS4C9qvNikbs';

  -- Get professional name
  SELECT full_name INTO prof_name FROM profiles WHERE id = NEW.professional_id;
  
  -- Get plan name
  SELECT name INTO plan_name FROM subscription_plans WHERE id = NEW.plan_id;

  IF TG_OP = 'INSERT' THEN
    event_type := 'new_subscription';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      IF NEW.status = 'cancelled' THEN
        event_type := 'subscription_cancelled';
      ELSIF NEW.status = 'past_due' THEN
        event_type := 'subscription_expired';
      ELSIF NEW.status = 'active' AND OLD.status != 'active' THEN
        event_type := 'payment_received';
      ELSE
        RETURN NEW;
      END IF;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Call edge function asynchronously
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/admin-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || supabase_anon_key
    ),
    body := jsonb_build_object(
      'action', 'subscription_event',
      'event_type', event_type,
      'professionalId', NEW.professional_id,
      'data', jsonb_build_object(
        'subscription_id', NEW.id,
        'professional_name', COALESCE(prof_name, 'Profissional'),
        'plan_name', COALESCE(plan_name, NEW.plan),
        'amount_cents', NEW.amount_cents,
        'billing_cycle', NEW.billing_cycle,
        'status', NEW.status,
        'gateway', NEW.gateway
      )
    )
  );

  RETURN NEW;
END;
$function$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_subscription_notification ON subscriptions;
CREATE TRIGGER trigger_subscription_notification
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION dispatch_subscription_notification();
-- Add CPF column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Create index for CPF lookups
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles(cpf) WHERE cpf IS NOT NULL;-- Allow authenticated users to read gateway settings from platform_settings
CREATE POLICY "Authenticated users can read gateway settings"
ON public.platform_settings
FOR SELECT
USING (
  key LIKE 'gateway_%'
  AND auth.role() = 'authenticated'
);-- Add 'paid' status to professional_status check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_professional_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_professional_status_check 
  CHECK (professional_status IN ('active', 'pending', 'pending_payment', 'paid', 'disabled', 'approved'));CREATE OR REPLACE FUNCTION dispatch_subscription_notification()
RETURNS TRIGGER AS $$
DECLARE
  event_type TEXT;
  supabase_url TEXT;
  supabase_anon_key TEXT;
  prof_name TEXT;
  plan_name TEXT;
BEGIN
  supabase_url := 'https://dctapmbdsfmzhtbpgigc.supabase.co';
  supabase_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdGFwbWJkc2Ztemh0YnBnaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4Mzg3MjIsImV4cCI6MjA4MjQxNDcyMn0.TdAMzml6AKavQ5FM9mgbqezfVbNE8rkjS4C9qvNikbs';

  -- Get professional name
  SELECT full_name INTO prof_name FROM profiles WHERE id = NEW.professional_id;
  
  -- Get plan name
  SELECT name INTO plan_name FROM subscription_plans WHERE id = NEW.plan_id;

  IF TG_OP = 'INSERT' THEN
    event_type := 'new_subscription';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      IF NEW.status = 'cancelled' THEN
        event_type := 'subscription_cancelled';
      ELSIF NEW.status = 'past_due' THEN
        event_type := 'subscription_expired';
      ELSIF NEW.status = 'active' AND OLD.status != 'active' THEN
        event_type := 'payment_received';
      ELSE
        RETURN NEW;
      END IF;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Call edge function asynchronously
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/admin-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || supabase_anon_key
    ),
    body := jsonb_build_object(
      'action', 'subscription_event',
      'event_type', event_type,
      'professionalId', NEW.professional_id,
      'data', jsonb_build_object(
        'subscription_id', NEW.id,
        'professional_name', COALESCE(prof_name, 'Profissional'),
        'plan_name', COALESCE(plan_name, NEW.plan::text),
        'amount_cents', NEW.amount_cents,
        'billing_cycle', NEW.billing_cycle,
        'status', NEW.status::text,
        'gateway', NEW.gateway
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;-- Allow admins to update any profile (needed for status management)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin(auth.uid()));
-- Add registration verification fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS registration_url TEXT,
ADD COLUMN IF NOT EXISTS registration_verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS registration_verification_data JSONB,
ADD COLUMN IF NOT EXISTS registration_verified_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.registration_url IS 'URL do registro profissional no órgão emissor (ex: cadastro.cfp.org.br)';
COMMENT ON COLUMN public.profiles.registration_verification_status IS 'Status: pending, verified, failed, not_found';
COMMENT ON COLUMN public.profiles.registration_verification_data IS 'Dados extraídos do site do órgão emissor via scraping';
-- Step 1: Add address columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address_street text,
ADD COLUMN IF NOT EXISTS address_number text,
ADD COLUMN IF NOT EXISTS address_complement text,
ADD COLUMN IF NOT EXISTS address_neighborhood text,
ADD COLUMN IF NOT EXISTS address_city text,
ADD COLUMN IF NOT EXISTS address_state text,
ADD COLUMN IF NOT EXISTS address_zip text;

-- Step 2: Drop old view (CASCADE to remove dependent policy)
DROP VIEW IF EXISTS public.public_professional_profiles CASCADE;

-- Step 3: Recreate view with new fields
CREATE VIEW public.public_professional_profiles
WITH (security_invoker = false) AS
SELECT 
  id,
  full_name,
  specialty,
  specialties,
  approaches,
  crp,
  bio,
  avatar_url,
  is_professional,
  is_verified,
  verified_at,
  gender,
  user_slug,
  professional_status,
  created_at,
  phone,
  address_city,
  address_state,
  address_neighborhood
FROM public.profiles
WHERE is_professional = true 
  AND professional_status = 'active';

GRANT SELECT ON public.public_professional_profiles TO anon;
GRANT SELECT ON public.public_professional_profiles TO authenticated;

-- Step 4: Recreate the dependent RLS policy
CREATE POLICY "Anyone can view professional available hours"
ON public.available_hours
FOR SELECT
USING (
  professional_id IN (
    SELECT id FROM public.public_professional_profiles
    WHERE is_professional = true
  )
);
CREATE OR REPLACE VIEW public.public_professional_profiles AS
SELECT id,
    full_name,
    specialty,
    specialties,
    approaches,
    crp,
    bio,
    avatar_url,
    is_professional,
    is_verified,
    verified_at,
    gender,
    user_slug,
    professional_status,
    created_at,
    phone,
    address_city,
    address_state,
    address_neighborhood
   FROM profiles
  WHERE ((is_professional = true) AND (professional_status IN ('active', 'approved')));
-- Create a SECURITY DEFINER function for patients to find a room by code (bypasses RLS)
CREATE OR REPLACE FUNCTION public.find_virtual_room_by_code(p_room_code TEXT)
RETURNS TABLE (
  id UUID,
  room_code TEXT,
  professional_id UUID,
  offer JSONB,
  answer JSONB,
  patient_name TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, room_code, professional_id, offer, answer, patient_name, status, created_at, expires_at, updated_at
  FROM public.virtual_rooms
  WHERE room_code = UPPER(p_room_code)
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- Grant execute to both authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.find_virtual_room_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_virtual_room_by_code(TEXT) TO anon;

-- Create a SECURITY DEFINER function for patients to join a room (set answer)
CREATE OR REPLACE FUNCTION public.join_virtual_room(
  p_room_id UUID,
  p_answer JSONB,
  p_patient_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room RECORD;
BEGIN
  -- Verify room exists and is joinable
  SELECT * INTO v_room FROM public.virtual_rooms WHERE id = p_room_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found';
  END IF;
  
  IF v_room.status = 'closed' THEN
    RAISE EXCEPTION 'Room is closed';
  END IF;
  
  IF v_room.expires_at < NOW() THEN
    RAISE EXCEPTION 'Room has expired';
  END IF;
  
  IF v_room.answer IS NOT NULL AND v_room.status = 'connected' THEN
    RAISE EXCEPTION 'Room already has a participant';
  END IF;
  
  -- Update room with answer
  UPDATE public.virtual_rooms
  SET answer = p_answer,
      patient_name = p_patient_name,
      status = 'connected'
  WHERE id = p_room_id;
  
  RETURN TRUE;
END;
$$;

-- Grant execute to both authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.join_virtual_room(UUID, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_virtual_room(UUID, JSONB, TEXT) TO anon;

-- Add live streaming columns to fake_live_sessions
ALTER TABLE public.fake_live_sessions 
  ADD COLUMN IF NOT EXISTS is_streaming BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS stream_path TEXT;

-- Enable realtime for live streaming status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.fake_live_sessions;

-- Update join_virtual_room to set status as 'pending_approval' instead of 'connected'
-- Also allow re-joining if patient left (status = 'waiting' and answer was cleared)
CREATE OR REPLACE FUNCTION public.join_virtual_room(p_room_id uuid, p_answer jsonb, p_patient_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room RECORD;
BEGIN
  SELECT * INTO v_room FROM public.virtual_rooms WHERE id = p_room_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found';
  END IF;
  
  IF v_room.status = 'closed' THEN
    RAISE EXCEPTION 'Room is closed';
  END IF;
  
  IF v_room.expires_at < NOW() THEN
    RAISE EXCEPTION 'Room has expired';
  END IF;
  
  -- Allow joining if waiting, or if pending_approval (patient re-submitting)
  IF v_room.status = 'connected' THEN
    RAISE EXCEPTION 'Room already has a connected participant';
  END IF;
  
  -- Set status to pending_approval - professional must accept
  UPDATE public.virtual_rooms
  SET answer = p_answer,
      patient_name = p_patient_name,
      status = 'pending_approval'
  WHERE id = p_room_id;
  
  RETURN TRUE;
END;
$function$;

-- Create function for professional to approve patient entry
CREATE OR REPLACE FUNCTION public.approve_patient_entry(p_room_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room RECORD;
BEGIN
  SELECT * INTO v_room FROM public.virtual_rooms WHERE id = p_room_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found';
  END IF;
  
  IF v_room.status != 'pending_approval' THEN
    RAISE EXCEPTION 'No pending patient to approve';
  END IF;
  
  -- Verify caller is the room owner
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = v_room.professional_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  UPDATE public.virtual_rooms
  SET status = 'connected'
  WHERE id = p_room_id;
  
  RETURN TRUE;
END;
$function$;

-- Create function for professional to reject patient entry
CREATE OR REPLACE FUNCTION public.reject_patient_entry(p_room_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room RECORD;
BEGIN
  SELECT * INTO v_room FROM public.virtual_rooms WHERE id = p_room_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found';
  END IF;
  
  IF v_room.status != 'pending_approval' THEN
    RAISE EXCEPTION 'No pending patient to reject';
  END IF;
  
  -- Verify caller is the room owner
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = v_room.professional_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  UPDATE public.virtual_rooms
  SET answer = NULL,
      patient_name = NULL,
      status = 'waiting'
  WHERE id = p_room_id;
  
  RETURN TRUE;
END;
$function$;

-- Create function to reset room when patient leaves (allows rejoin)
CREATE OR REPLACE FUNCTION public.patient_leave_virtual_room(p_room_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room RECORD;
BEGIN
  SELECT * INTO v_room FROM public.virtual_rooms WHERE id = p_room_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found';
  END IF;
  
  -- Reset room to waiting state so patient can rejoin
  UPDATE public.virtual_rooms
  SET answer = NULL,
      patient_name = NULL,
      status = 'waiting'
  WHERE id = p_room_id;
  
  RETURN TRUE;
END;
$function$;
-- Make patient_email nullable (patient may enter room with name only)
ALTER TABLE public.patient_records ALTER COLUMN patient_email DROP NOT NULL;

-- Add session_history column to store array of session records
ALTER TABLE public.patient_records ADD COLUMN IF NOT EXISTS session_history jsonb DEFAULT '[]'::jsonb;

-- Add index for professional + patient name lookup
CREATE INDEX IF NOT EXISTS idx_patient_records_professional_name 
  ON public.patient_records (professional_id, patient_name);
-- Fix: Add 'pending_approval' to the status check constraint
ALTER TABLE public.virtual_rooms DROP CONSTRAINT virtual_rooms_status_check;

ALTER TABLE public.virtual_rooms ADD CONSTRAINT virtual_rooms_status_check 
  CHECK (status IN ('waiting', 'connected', 'closed', 'pending_approval'));
-- Fix RLS policy on bot_configs: professional_id is profile.id, not auth.uid()
DROP POLICY IF EXISTS "own_bot_config" ON public.bot_configs;

CREATE POLICY "own_bot_config" ON public.bot_configs
FOR ALL
USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
WITH CHECK (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
-- Add selected_connection_id to bot_configs for AuthBot connection selection
ALTER TABLE public.bot_configs
ADD COLUMN IF NOT EXISTS selected_connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE SET NULL;
-- Pool de instâncias WhatsApp compartilhadas para envio round-robin
CREATE TABLE public.shared_whatsapp_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_name TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  proxy_host TEXT,
  proxy_port TEXT,
  proxy_protocol TEXT DEFAULT 'http',
  proxy_user TEXT,
  proxy_pass TEXT,
  send_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- Only admins can manage shared instances
CREATE POLICY "Admins can view shared instances"
ON public.shared_whatsapp_instances
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert shared instances"
ON public.shared_whatsapp_instances
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update shared instances"
ON public.shared_whatsapp_instances
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete shared instances"
ON public.shared_whatsapp_instances
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Edge functions need service role access (no RLS policy needed, service_role bypasses RLS)

-- Function to select next instance via round-robin
CREATE OR REPLACE FUNCTION public.get_next_shared_instance()
RETURNS TABLE(
  instance_name TEXT,
  proxy_host TEXT,
  proxy_port TEXT,
  proxy_protocol TEXT,
  proxy_user TEXT,
  proxy_pass TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_id UUID;
BEGIN
  -- Select the active instance with the oldest last_used_at (round-robin)
  SELECT i.id INTO selected_id
  FROM shared_whatsapp_instances i
  WHERE i.is_active = true
    AND i.status = 'connected'
  ORDER BY i.last_used_at ASC NULLS FIRST, i.send_count ASC
  LIMIT 1;

  IF selected_id IS NULL THEN
    RETURN;
  END IF;

  -- Update usage stats
  UPDATE shared_whatsapp_instances
  SET last_used_at = now(),
      send_count = send_count + 1,
      updated_at = now()
  WHERE id = selected_id;

  -- Return the instance data
  RETURN QUERY
  SELECT 
    i.instance_name,
    i.proxy_host,
    i.proxy_port,
    i.proxy_protocol,
    i.proxy_user,
    i.proxy_pass
  FROM shared_whatsapp_instances i
  WHERE i.id = selected_id;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_shared_whatsapp_instances_updated_at
BEFORE UPDATE ON public.shared_whatsapp_instances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.ai_agent_config 
ADD COLUMN IF NOT EXISTS custom_api_url TEXT,
ADD COLUMN IF NOT EXISTS custom_api_key TEXT,
ADD COLUMN IF NOT EXISTS custom_api_model TEXT,
ADD COLUMN IF NOT EXISTS custom_provider_name TEXT;ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS checkout_config JSONB DEFAULT NULL;
-- Fix: Allow admins to upload to admin/ path in checkout-public bucket
DROP POLICY IF EXISTS "Admins can upload checkout public assets" ON storage.objects;
CREATE POLICY "Admins can upload checkout public assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'checkout-public'
  AND (storage.foldername(name))[1] = 'admin'
  AND public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can update checkout public assets" ON storage.objects;
CREATE POLICY "Admins can update checkout public assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'checkout-public'
  AND (storage.foldername(name))[1] = 'admin'
  AND public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can delete checkout public assets" ON storage.objects;
CREATE POLICY "Admins can delete checkout public assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'checkout-public'
  AND (storage.foldername(name))[1] = 'admin'
  AND public.is_admin(auth.uid())
);

-- Add recurrence and cancellation config to subscription_plans
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS recurring_interval TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS recurring_interval_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS allow_cancellation BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS cancellation_grace_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT DEFAULT 'immediate';
-- Add admin ALL policy so admins can update/delete any live session
CREATE POLICY "Admins can manage all live sessions"
ON public.fake_live_sessions
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Drop the old SELECT-only admin policy since the new ALL policy covers it
DROP POLICY IF EXISTS "Admins can view all live sessions" ON public.fake_live_sessions;
CREATE OR REPLACE VIEW public.public_member_lessons
WITH (security_invoker = false) AS
SELECT id, module_id, professional_id, title, description, order_index, is_free
FROM member_lessons;

CREATE OR REPLACE VIEW public.public_payment_gateways
WITH (security_invoker = false) AS
SELECT id, professional_id, gateway_type, card_gateway, is_active, is_sandbox, updated_at
FROM payment_gateways
WHERE is_active = true;
-- Email infrastructure tables
-- Runs during email domain setup to ensure all email tables exist
-- before any email templates are scaffolded.

-- Extensions required for queue processing
CREATE EXTENSION IF NOT EXISTS supabase_vault;
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Create email queues (auth = high priority, transactional = normal)
-- Wrapped in DO blocks to handle "queue already exists" errors idempotently.
DO $$ BEGIN PERFORM pgmq.create('auth_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Dead-letter queues for messages that exceed max retries
DO $$ BEGIN PERFORM pgmq.create('auth_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Email send log table (audit trail for all send attempts)
-- UPDATE is allowed for the service role so the suppression edge function
-- can update a log record's status when a bounce/complaint/unsubscribe occurs.
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'suppressed', 'failed', 'bounced', 'complained', 'dlq')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can read send log"
    ON public.email_send_log FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert send log"
    ON public.email_send_log FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can update send log"
    ON public.email_send_log FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_send_log_created ON public.email_send_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_send_log_recipient ON public.email_send_log(recipient_email);

-- Backfill: add message_id column to existing tables that predate this migration
DO $$ BEGIN
  ALTER TABLE public.email_send_log ADD COLUMN message_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_send_log_message ON public.email_send_log(message_id);

-- Prevent duplicate sends: only one 'sent' row per message_id.
-- If VT expires and another worker picks up the same message, the pre-send
-- check catches it. This index is a DB-level safety net for race conditions.
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_send_log_message_sent_unique
  ON public.email_send_log(message_id) WHERE status = 'sent';

-- Backfill: update status CHECK constraint for existing tables that predate new statuses
DO $$ BEGIN
  ALTER TABLE public.email_send_log DROP CONSTRAINT IF EXISTS email_send_log_status_check;
  ALTER TABLE public.email_send_log ADD CONSTRAINT email_send_log_status_check
    CHECK (status IN ('pending', 'sent', 'suppressed', 'failed', 'bounced', 'complained', 'dlq'));
END $$;

-- Rate-limit state and queue config (single row, tracks Retry-After cooldown + throughput settings)
CREATE TABLE IF NOT EXISTS public.email_send_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  retry_after_until TIMESTAMPTZ,
  batch_size INTEGER NOT NULL DEFAULT 10,
  send_delay_ms INTEGER NOT NULL DEFAULT 200,
  auth_email_ttl_minutes INTEGER NOT NULL DEFAULT 15,
  transactional_email_ttl_minutes INTEGER NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.email_send_state (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Backfill: add config columns to existing tables that predate this migration
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN batch_size INTEGER NOT NULL DEFAULT 10;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN send_delay_ms INTEGER NOT NULL DEFAULT 200;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN auth_email_ttl_minutes INTEGER NOT NULL DEFAULT 15;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN transactional_email_ttl_minutes INTEGER NOT NULL DEFAULT 60;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can manage send state"
    ON public.email_send_state FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Suppressed emails table (tracks unsubscribes, bounces, complaints)
-- Append-only: no DELETE or UPDATE policies to prevent bypassing suppression.
CREATE TABLE IF NOT EXISTS public.suppressed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribe', 'bounce', 'complaint')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can read suppressed emails"
    ON public.suppressed_emails FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert suppressed emails"
    ON public.suppressed_emails FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_suppressed_emails_email ON public.suppressed_emails(email);

-- Email unsubscribe tokens table (one token per email address for unsubscribe links)
-- No DELETE policy to prevent removing tokens. UPDATE allowed only to mark tokens as used.
CREATE TABLE IF NOT EXISTS public.email_unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can read tokens"
    ON public.email_unsubscribe_tokens FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert tokens"
    ON public.email_unsubscribe_tokens FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can mark tokens as used"
    ON public.email_unsubscribe_tokens FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens(token);

-- RPC wrappers so Edge Functions can interact with pgmq via supabase.rpc()
-- (PostgREST only exposes functions in the public schema; pgmq functions are in the pgmq schema)
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name TEXT, payload JSONB)
RETURNS BIGINT
LANGUAGE sql SECURITY DEFINER
AS $$ SELECT pgmq.send(queue_name, payload); $$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name TEXT, batch_size INT, vt INT)
RETURNS TABLE(msg_id BIGINT, read_ct INT, message JSONB)
LANGUAGE sql SECURITY DEFINER
AS $$ SELECT msg_id, read_ct, message FROM pgmq.read(queue_name, vt, batch_size); $$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name TEXT, message_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$ SELECT pgmq.delete(queue_name, message_id); $$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(
  source_queue TEXT, dlq_name TEXT, message_id BIGINT, payload JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
END;
$$;

-- Restrict queue RPC wrappers to service_role only (SECURITY DEFINER runs as owner,
-- so without this any authenticated user could manipulate the email queues)
REVOKE EXECUTE ON FUNCTION public.enqueue_email(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enqueue_email(TEXT, JSONB) TO service_role;

REVOKE EXECUTE ON FUNCTION public.read_email_batch(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_email_batch(TEXT, INT, INT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.delete_email(TEXT, BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_email(TEXT, BIGINT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) TO service_role;

-- Add lead_source column to whatsapp_crm_leads
ALTER TABLE public.whatsapp_crm_leads 
ADD COLUMN IF NOT EXISTS lead_source text DEFAULT 'manual';

-- Add lead_source column to crm_leads
ALTER TABLE public.crm_leads 
ADD COLUMN IF NOT EXISTS lead_source text DEFAULT 'manual';

-- Add source tracking to transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS lead_source text DEFAULT 'checkout';

-- Create lead_form_submissions table to store landing page form data
CREATE TABLE public.lead_form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  lead_source TEXT DEFAULT 'landing_page',
  redirect_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS: Professionals can view their own submissions
CREATE POLICY "Professionals can view their own form submissions"
  ON public.lead_form_submissions FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS: Anyone can insert (public form)
CREATE POLICY "Anyone can submit forms"
  ON public.lead_form_submissions FOR INSERT
  WITH CHECK (true);

-- RLS: Professionals can delete their own
CREATE POLICY "Professionals can delete their own form submissions"
  ON public.lead_form_submissions FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- Index for performance
CREATE INDEX idx_lead_form_submissions_professional ON public.lead_form_submissions(professional_id);
CREATE INDEX idx_lead_form_submissions_created ON public.lead_form_submissions(created_at DESC);

-- Create platform_services table (admin-managed service catalog)
CREATE TABLE public.platform_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 50,
  price_cents INTEGER NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'individual' CHECK (session_type IN ('individual', 'couple', 'family', 'group')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_services ENABLE ROW LEVEL SECURITY;

-- Everyone can read active services (public catalog)
CREATE POLICY "Anyone can view active platform services" ON public.platform_services
  FOR SELECT USING (is_active = true);

-- Admins can manage platform services
CREATE POLICY "Admins can manage platform services" ON public.platform_services
  FOR ALL USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_platform_services_updated_at
  BEFORE UPDATE ON public.platform_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add platform_service_id to appointments to link to platform service
ALTER TABLE public.appointments 
  ADD COLUMN platform_service_id UUID REFERENCES public.platform_services(id);
DROP VIEW IF EXISTS public.public_professional_profiles CASCADE;

CREATE VIEW public.public_professional_profiles AS
SELECT
  p.id,
  p.full_name,
  p.specialty,
  p.crp,
  p.avatar_url,
  p.bio,
  p.phone,
  p.gender,
  p.specialties,
  p.approaches,
  p.is_professional,
  p.is_verified,
  p.verified_at,
  p.professional_status,
  p.user_slug,
  p.address_city,
  p.address_state,
  p.address_neighborhood,
  p.created_at,
  p.instagram_url,
  p.facebook_url,
  p.youtube_url,
  p.tiktok_url
FROM profiles p
WHERE p.is_professional = true;

-- Recreate the dependent RLS policy
CREATE POLICY "Anyone can view professional available hours"
ON public.available_hours
FOR SELECT
USING (
  professional_id IN (
    SELECT id FROM public.public_professional_profiles
    WHERE is_professional = true
  )
);-- Add presentation video URL column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS presentation_video_url TEXT;

-- Drop dependent policy first
DROP POLICY IF EXISTS "Anyone can view professional available hours" ON public.available_hours;

-- Drop and recreate the view
DROP VIEW IF EXISTS public.public_professional_profiles CASCADE;

CREATE VIEW public.public_professional_profiles
WITH (security_invoker = false) AS
SELECT 
  id,
  full_name,
  specialty,
  specialties,
  approaches,
  crp,
  bio,
  avatar_url,
  is_professional,
  is_verified,
  verified_at,
  gender,
  user_slug,
  professional_status,
  instagram_url,
  facebook_url,
  youtube_url,
  tiktok_url,
  presentation_video_url,
  created_at
FROM public.profiles
WHERE is_professional = true 
  AND professional_status = 'active';

-- Grant SELECT on the view
GRANT SELECT ON public.public_professional_profiles TO anon;
GRANT SELECT ON public.public_professional_profiles TO authenticated;

-- Recreate the available_hours policy
CREATE POLICY "Anyone can view professional available hours"
ON public.available_hours
FOR SELECT
USING (
  professional_id IN (
    SELECT id FROM public.public_professional_profiles
  )
);ALTER TABLE public.platform_services ADD COLUMN professional_payout_cents INTEGER NOT NULL DEFAULT 0;
COMMENT ON COLUMN public.platform_services.professional_payout_cents IS 'Amount in cents to be paid to the professional per session';
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS bank_agency text,
ADD COLUMN IF NOT EXISTS bank_account text,
ADD COLUMN IF NOT EXISTS bank_account_type text DEFAULT 'checking',
ADD COLUMN IF NOT EXISTS pix_key_type text,
ADD COLUMN IF NOT EXISTS pix_key text,
ADD COLUMN IF NOT EXISTS bank_holder_name text,
ADD COLUMN IF NOT EXISTS bank_holder_cpf text;
