-- Create a public view for active domains
CREATE OR REPLACE VIEW public.public_active_domains AS
SELECT 
  id,
  domain,
  professional_id,
  is_primary,
  ssl_status,
  created_at
FROM public.custom_domains
WHERE status = 'active' AND dns_verified = true;

-- Add comment to the view
COMMENT ON VIEW public.public_active_domains IS 'Public view of active and verified custom domains for checkout selection';