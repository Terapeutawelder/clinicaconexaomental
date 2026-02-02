-- Add CTA and tracking fields to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT 'Assinar Agora',
ADD COLUMN IF NOT EXISTS cta_color TEXT DEFAULT '#8B5CF6',
ADD COLUMN IF NOT EXISTS cta_text_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS facebook_pixel_id TEXT,
ADD COLUMN IF NOT EXISTS google_analytics_id TEXT,
ADD COLUMN IF NOT EXISTS tracking_events JSONB DEFAULT '{"view_plan": true, "start_checkout": true, "complete_purchase": true}'::jsonb;