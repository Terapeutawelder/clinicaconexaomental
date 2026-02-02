-- =====================================================
-- SCRIPT DE MIGRAÇÃO COMPLETO - AcolheAqui
-- Gerado em: 2026-01-17
-- =====================================================
-- Este script contém:
-- 1. Extensões necessárias
-- 2. Tabelas
-- 3. Views
-- 4. Functions
-- 5. Triggers
-- 6. RLS Policies
-- 7. Storage Buckets
-- 8. Dados existentes
-- =====================================================

-- =====================================================
-- PARTE 1: EXTENSÕES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;

-- =====================================================
-- PARTE 2: TABELAS
-- =====================================================

-- Tabela: profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  specialty TEXT,
  crp TEXT,
  bio TEXT,
  avatar_url TEXT,
  user_slug TEXT UNIQUE,
  whatsapp_number TEXT,
  is_professional BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: appointments
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id),
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 50,
  session_type TEXT,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  amount_cents INTEGER,
  notes TEXT,
  virtual_room_code TEXT,
  virtual_room_link TEXT,
  recording_url TEXT,
  transcription JSONB DEFAULT '[]'::jsonb,
  ai_psi_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: available_hours
CREATE TABLE public.available_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id),
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: services
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 50,
  price_cents INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  product_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  checkout_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: transactions
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id),
  service_id UUID REFERENCES public.services(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_cpf TEXT,
  amount_cents INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  gateway TEXT NOT NULL DEFAULT 'mercadopago',
  gateway_payment_id TEXT,
  gateway_response JSONB DEFAULT '{}'::jsonb,
  pix_code TEXT,
  pix_qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: payment_gateways
CREATE TABLE public.payment_gateways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id),
  gateway_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  pix_key TEXT,
  pix_key_type TEXT,
  card_enabled BOOLEAN DEFAULT false,
  card_gateway TEXT,
  card_api_key TEXT,
  installments_enabled BOOLEAN DEFAULT false,
  max_installments INTEGER DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: virtual_rooms
CREATE TABLE public.virtual_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  room_code TEXT NOT NULL,
  patient_name TEXT,
  status TEXT DEFAULT 'waiting',
  offer JSONB,
  answer JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Tabela: webhooks
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id),
  url TEXT NOT NULL,
  secret_token TEXT,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: whatsapp_settings
CREATE TABLE public.whatsapp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id),
  whatsapp_api_type TEXT DEFAULT 'evolution',
  evolution_api_url TEXT,
  evolution_api_key TEXT,
  evolution_instance_name TEXT,
  official_phone_number_id TEXT,
  official_access_token TEXT,
  official_business_account_id TEXT,
  is_active BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,
  confirmation_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: google_calendar_settings
CREATE TABLE public.google_calendar_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL UNIQUE,
  google_email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_connected BOOLEAN DEFAULT false,
  sync_enabled BOOLEAN DEFAULT true,
  auto_create_meet BOOLEAN DEFAULT true,
  sync_direction TEXT DEFAULT 'two_way',
  calendar_id TEXT DEFAULT 'primary',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: ai_agent_config
CREATE TABLE public.ai_agent_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id),
  preferred_ai_provider TEXT DEFAULT 'lovable',
  openai_api_key TEXT,
  openai_preferred_model TEXT DEFAULT 'gpt-4-turbo-preview',
  anthropic_api_key TEXT,
  anthropic_preferred_model TEXT DEFAULT 'claude-3-sonnet-20240229',
  google_api_key TEXT,
  google_preferred_model TEXT DEFAULT 'gemini-pro',
  n8n_webhook_url TEXT DEFAULT '',
  n8n_api_key TEXT DEFAULT '',
  agent_name TEXT DEFAULT 'Assistente Virtual',
  agent_greeting TEXT DEFAULT 'Olá! Sou o assistente virtual. Como posso ajudar você a agendar uma consulta?',
  agent_instructions TEXT DEFAULT 'Você é um assistente virtual de agendamento. Seja educado e profissional. Ajude os clientes a encontrar o melhor horário disponível para suas consultas.',
  is_active BOOLEAN DEFAULT false,
  auto_confirm_appointments BOOLEAN DEFAULT false,
  send_confirmation_message BOOLEAN DEFAULT true,
  working_hours_only BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: custom_domains
CREATE TABLE public.custom_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verification_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  dns_verified BOOLEAN DEFAULT false,
  dns_verified_at TIMESTAMP WITH TIME ZONE,
  ssl_status TEXT DEFAULT 'pending',
  ssl_provisioned_at TIMESTAMP WITH TIME ZONE,
  is_primary BOOLEAN DEFAULT false,
  redirect_to TEXT,
  notification_whatsapp TEXT,
  parent_domain_id UUID REFERENCES public.custom_domains(id),
  cloudflare_zone_id TEXT,
  cloudflare_api_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: appointment_access_tokens
CREATE TABLE public.appointment_access_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id),
  client_email TEXT NOT NULL,
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- PARTE 3: VIEWS
-- =====================================================

-- View: public_professional_profiles
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

-- View: public_services
CREATE OR REPLACE VIEW public.public_services AS
SELECT 
  id,
  professional_id,
  name,
  description,
  duration_minutes,
  price_cents,
  is_active,
  product_config,
  checkout_config,
  created_at
FROM public.services
WHERE is_active = true;

-- View: public_active_domains
CREATE OR REPLACE VIEW public.public_active_domains AS
SELECT 
  id,
  professional_id,
  domain,
  is_primary,
  ssl_status,
  created_at
FROM public.custom_domains
WHERE status = 'active' AND dns_verified = true;

-- =====================================================
-- PARTE 4: FUNCTIONS
-- =====================================================

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: handle_new_user (cria profile automaticamente)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Function: generate_unique_slug
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
  base_slug := lower(
    regexp_replace(
      regexp_replace(
        unaccent(coalesce(base_name, 'user')),
        '[^a-zA-Z0-9]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    )
  );
  
  base_slug := substring(base_slug from 1 for 25);
  
  IF base_slug = '' THEN
    base_slug := 'user';
  END IF;
  
  final_slug := base_slug;
  
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

-- Function: check_slug_available
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
$$;

-- Function: get_professional_contact
CREATE OR REPLACE FUNCTION public.get_professional_contact(professional_id uuid)
RETURNS TABLE(email text, phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN QUERY
    SELECT p.email, p.phone
    FROM profiles p
    WHERE p.id = professional_id AND p.is_professional = true;
  ELSIF auth.uid() = (SELECT user_id FROM profiles WHERE id = professional_id) THEN
    RETURN QUERY
    SELECT p.email, p.phone
    FROM profiles p
    WHERE p.id = professional_id;
  ELSE
    RETURN;
  END IF;
END;
$$;

-- =====================================================
-- PARTE 5: TRIGGERS
-- =====================================================

-- Trigger: create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers: update_updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_virtual_rooms_updated_at
  BEFORE UPDATE ON public.virtual_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_settings_updated_at
  BEFORE UPDATE ON public.whatsapp_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_google_calendar_settings_updated_at
  BEFORE UPDATE ON public.google_calendar_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_agent_config_updated_at
  BEFORE UPDATE ON public.ai_agent_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PARTE 6: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.available_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_access_tokens ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- APPOINTMENTS policies
CREATE POLICY "Professionals can view their own appointments" ON public.appointments
  FOR SELECT USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only authenticated users or service role can insert appointment" ON public.appointments
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL) OR 
    ((current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  );

CREATE POLICY "Professionals can update their own appointments" ON public.appointments
  FOR UPDATE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Block unauthenticated update on appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Block unauthenticated delete on appointments" ON public.appointments
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- AVAILABLE_HOURS policies
CREATE POLICY "Anyone can view professional available hours" ON public.available_hours
  FOR SELECT USING (professional_id IN (SELECT id FROM profiles WHERE is_professional = true));

CREATE POLICY "Professionals can view their own hours" ON public.available_hours
  FOR SELECT USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own hours" ON public.available_hours
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own hours" ON public.available_hours
  FOR UPDATE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own hours" ON public.available_hours
  FOR DELETE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- SERVICES policies
CREATE POLICY "Professionals can view their own services" ON public.services
  FOR SELECT USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own services" ON public.services
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own services" ON public.services
  FOR UPDATE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own services" ON public.services
  FOR DELETE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- TRANSACTIONS policies
CREATE POLICY "Professionals can view their own transactions" ON public.transactions
  FOR SELECT USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users or service role can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL) OR 
    ((current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  );

CREATE POLICY "Professionals can update their own transactions" ON public.transactions
  FOR UPDATE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- PAYMENT_GATEWAYS policies
CREATE POLICY "Professionals can view their own gateways" ON public.payment_gateways
  FOR SELECT USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own gateways" ON public.payment_gateways
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own gateways" ON public.payment_gateways
  FOR UPDATE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own gateways" ON public.payment_gateways
  FOR DELETE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- VIRTUAL_ROOMS policies
CREATE POLICY "Professionals can view their own rooms" ON public.virtual_rooms
  FOR SELECT USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can read rooms by code" ON public.virtual_rooms
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Block unauthenticated access to virtual rooms" ON public.virtual_rooms
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Professionals can insert rooms" ON public.virtual_rooms
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own rooms" ON public.virtual_rooms
  FOR UPDATE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can update room answer" ON public.virtual_rooms
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Block unauthenticated update on virtual rooms" ON public.virtual_rooms
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Professionals can delete their own rooms" ON public.virtual_rooms
  FOR DELETE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- WEBHOOKS policies
CREATE POLICY "Users can view their own webhooks" ON public.webhooks
  FOR SELECT USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own webhooks" ON public.webhooks
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own webhooks" ON public.webhooks
  FOR UPDATE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own webhooks" ON public.webhooks
  FOR DELETE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- WHATSAPP_SETTINGS policies
CREATE POLICY "Professionals can view their own whatsapp settings" ON public.whatsapp_settings
  FOR SELECT USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own whatsapp settings" ON public.whatsapp_settings
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own whatsapp settings" ON public.whatsapp_settings
  FOR UPDATE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own whatsapp settings" ON public.whatsapp_settings
  FOR DELETE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- GOOGLE_CALENDAR_SETTINGS policies
CREATE POLICY "Professionals can view their own google settings" ON public.google_calendar_settings
  FOR SELECT USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own google settings" ON public.google_calendar_settings
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own google settings" ON public.google_calendar_settings
  FOR UPDATE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own google settings" ON public.google_calendar_settings
  FOR DELETE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- AI_AGENT_CONFIG policies
CREATE POLICY "Users can view their own AI agent config" ON public.ai_agent_config
  FOR SELECT USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own AI agent config" ON public.ai_agent_config
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own AI agent config" ON public.ai_agent_config
  FOR UPDATE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own AI agent config" ON public.ai_agent_config
  FOR DELETE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CUSTOM_DOMAINS policies
CREATE POLICY "Professionals can view their own domains" ON public.custom_domains
  FOR SELECT USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own domains" ON public.custom_domains
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own domains" ON public.custom_domains
  FOR UPDATE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own domains" ON public.custom_domains
  FOR DELETE USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- APPOINTMENT_ACCESS_TOKENS policies
CREATE POLICY "Tokens managed by service role only" ON public.appointment_access_tokens
  FOR ALL USING (false) WITH CHECK (false);

-- =====================================================
-- PARTE 7: STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('checkout-public', 'checkout-public', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('checkout-private', 'checkout-private', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('session-recordings', 'session-recordings', false);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for checkout-public
CREATE POLICY "Checkout public images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'checkout-public');

CREATE POLICY "Users can upload checkout public files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'checkout-public' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update checkout public files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'checkout-public' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete checkout public files" ON storage.objects
  FOR DELETE USING (bucket_id = 'checkout-public' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for checkout-private
CREATE POLICY "Users can view their own checkout private files" ON storage.objects
  FOR SELECT USING (bucket_id = 'checkout-private' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload checkout private files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'checkout-private' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update checkout private files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'checkout-private' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete checkout private files" ON storage.objects
  FOR DELETE USING (bucket_id = 'checkout-private' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for session-recordings
CREATE POLICY "Users can view their own recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'session-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload recordings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'session-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own recordings" ON storage.objects
  FOR DELETE USING (bucket_id = 'session-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- PARTE 8: DADOS EXISTENTES
-- =====================================================
-- IMPORTANTE: Execute esta parte APÓS criar os usuários no Auth
-- Os UUIDs abaixo precisam ser atualizados com os novos IDs

-- =====================================================
-- MAPEAMENTO DE IDs (atualize após criar usuários):
-- OLD user_id: 3d99e5d2-1a15-49fd-930c-6e69f2bc14ce
-- OLD profile_id (professional_id): 14d74924-db72-4159-963a-6e79556a4886
-- 
-- Substitua pelos novos IDs gerados no novo Supabase
-- =====================================================

-- 8.1 SERVICES
-- Substitua 'NEW_PROFESSIONAL_ID' pelo novo professional_id
/*
INSERT INTO public.services (id, professional_id, name, description, duration_minutes, price_cents, is_active, product_config, checkout_config, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'NEW_PROFESSIONAL_ID', -- SUBSTITUIR!
  'Sessão online',
  'Sessão de terapia online de 30 minutos
Por Video conferencia',
  30,
  3790,
  true,
  '{"image_url": "", "notifications": {"email": true, "redirect": false, "redirect_url": "", "sms": false, "whatsapp": true}}'::jsonb,
  '{"accentColor": "#5521ea", "backgroundColor": "#f3f4f6", "banners": [], "customDomain": "", "customerFields": {"enable_cpf": true, "enable_phone": true}, "domainType": "default", "paymentMethods": {"boleto": false, "credit_card": true, "pix": true}, "salesNotification": {"enabled": false}, "sideBanners": [], "summary": {"discount_text": "", "preco_anterior": "37,90", "product_name": "Sessão de Terapia Online"}, "timer": {"bgcolor": "#ef4444", "enabled": true, "minutes": 60, "text": "Esta oferta expira em:", "textcolor": "#ffffff"}, "tracking": {"facebookPixelId": "", "googleAnalyticsId": ""}, "userSlug": "welder"}'::jsonb,
  now(),
  now()
);
*/

-- 8.2 AVAILABLE_HOURS
/*
INSERT INTO public.available_hours (professional_id, day_of_week, start_time, end_time, is_active)
VALUES 
  ('NEW_PROFESSIONAL_ID', 1, '09:00:00', '18:00:00', true),
  ('NEW_PROFESSIONAL_ID', 2, '08:00:00', '18:00:00', true);
*/

-- 8.3 PAYMENT_GATEWAYS
/*
INSERT INTO public.payment_gateways (professional_id, gateway_type, is_active, card_enabled, card_gateway, installments_enabled, max_installments)
VALUES 
  ('NEW_PROFESSIONAL_ID', 'asaas', false, false, 'asaas', false, 12),
  ('NEW_PROFESSIONAL_ID', 'pushinpay', false, false, 'pushinpay', false, 12),
  ('NEW_PROFESSIONAL_ID', 'mercadopago', false, false, 'mercadopago', false, 12),
  ('NEW_PROFESSIONAL_ID', 'stripe', false, false, 'stripe', false, 12),
  ('NEW_PROFESSIONAL_ID', 'pagarme', false, false, 'pagarme', false, 12),
  ('NEW_PROFESSIONAL_ID', 'pagseguro', true, false, 'pagseguro', false, 12);
*/

-- 8.4 GOOGLE_CALENDAR_SETTINGS
-- NOTA: Tokens expiram! Reconecte o Google Calendar após migração
/*
INSERT INTO public.google_calendar_settings (professional_id, google_email, is_connected, sync_enabled, auto_create_meet, sync_direction, calendar_id)
VALUES (
  'NEW_PROFESSIONAL_ID',
  'plataformaconexaomental@gmail.com',
  false, -- Definir como false, reconectar manualmente
  true,
  true,
  'two_way',
  'primary'
);
*/

-- 8.5 CUSTOM_DOMAINS
/*
INSERT INTO public.custom_domains (professional_id, domain, status, dns_verified, is_primary, notification_whatsapp)
VALUES (
  'NEW_PROFESSIONAL_ID',
  'supertutor.online',
  'pending',
  false,
  true,
  '5527998703988'
);
*/

-- =====================================================
-- FIM DO SCRIPT DE MIGRAÇÃO
-- =====================================================
-- 
-- PRÓXIMOS PASSOS:
-- 1. Crie um novo projeto Supabase
-- 2. Execute este script no SQL Editor
-- 3. Crie os usuários no Auth (Authentication > Users)
-- 4. Obtenha os novos user_id e profile_id
-- 5. Descomente e atualize os INSERTs da Parte 8
-- 6. Execute os INSERTs atualizados
-- 7. Faça upload das imagens para o Storage
-- 8. Atualize as URLs de imagem nos services
-- 9. Configure os Secrets das Edge Functions
-- 10. Copie as Edge Functions de supabase/functions/
-- 11. Reconecte o Google Calendar
-- 12. Atualize as variáveis de ambiente (.env)
-- =====================================================
