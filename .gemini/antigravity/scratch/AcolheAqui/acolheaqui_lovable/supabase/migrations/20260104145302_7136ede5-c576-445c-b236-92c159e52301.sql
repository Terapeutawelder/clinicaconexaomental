-- Update the public view to include checkout_config and product_config
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

COMMENT ON VIEW public.public_services IS 'Public view of active services. checkout_config and product_config contain UI settings only (colors, banners, enabled payment methods). Actual payment credentials are stored securely in payment_gateways table with RLS protection.';