-- Add JSON configs to services
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
