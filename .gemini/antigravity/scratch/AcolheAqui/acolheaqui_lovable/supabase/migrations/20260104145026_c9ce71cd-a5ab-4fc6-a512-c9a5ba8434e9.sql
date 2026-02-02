-- Remove the insecure public read policy
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
COMMENT ON VIEW public.public_services IS 'Public view of services that excludes sensitive checkout_config and product_config fields containing payment credentials';