-- Create subscription_coupons table for discount coupons
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
  ('PREMIUM50', 'R$ 50 de desconto no Premium', 'fixed', 5000, 50, now() + interval '3 months', ARRAY['premium'], ARRAY['monthly', 'semiannual', 'annual']);