-- Create subscription plans table for dynamic pricing
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
  );