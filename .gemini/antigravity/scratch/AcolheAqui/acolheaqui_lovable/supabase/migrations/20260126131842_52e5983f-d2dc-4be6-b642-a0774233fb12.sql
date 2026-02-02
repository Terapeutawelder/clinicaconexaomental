-- Add whitelabel_admin role to enum
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
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();