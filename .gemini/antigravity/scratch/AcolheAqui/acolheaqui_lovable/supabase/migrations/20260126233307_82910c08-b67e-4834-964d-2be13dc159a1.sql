-- Add scheduling fields to whatsapp_crm_leads
ALTER TABLE public.whatsapp_crm_leads
ADD COLUMN IF NOT EXISTS scheduled_date date,
ADD COLUMN IF NOT EXISTS scheduled_time time without time zone,
ADD COLUMN IF NOT EXISTS is_scheduled boolean DEFAULT false;