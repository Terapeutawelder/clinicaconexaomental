-- Incremental Migration: Global Services & Centralized Payments
-- For Conexão Mental (conexaomental.online)
-- Date: 2026-04-08

-- 1. Make professional_id NULLABLE in services (for Global Services)
ALTER TABLE public.services ALTER COLUMN professional_id DROP NOT NULL;

-- 2. Add new columns to services (if not exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'service_type') THEN
    ALTER TABLE public.services ADD COLUMN service_type TEXT DEFAULT 'session';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'product_config') THEN
    ALTER TABLE public.services ADD COLUMN product_config JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'checkout_config') THEN
    ALTER TABLE public.services ADD COLUMN checkout_config JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 3. Add virtual room columns to appointments (if not exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'virtual_room_code') THEN
    ALTER TABLE public.appointments ADD COLUMN virtual_room_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'virtual_room_link') THEN
    ALTER TABLE public.appointments ADD COLUMN virtual_room_link TEXT;
  END IF;
END $$;

-- 4. Make professional_id NULLABLE in payment_gateways (for Clinic Gateway)
ALTER TABLE public.payment_gateways ALTER COLUMN professional_id DROP NOT NULL;

-- 5. Add public read policy for active gateways (checkout needs to read the clinic gateway)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_gateways' AND policyname = 'Public can view active gateways') THEN
    CREATE POLICY "Public can view active gateways" ON public.payment_gateways
      FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- 6. Add RLS policy for services to allow public reads of active global services
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Public can view active services') THEN
    CREATE POLICY "Public can view active services" ON public.services
      FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- Done!
