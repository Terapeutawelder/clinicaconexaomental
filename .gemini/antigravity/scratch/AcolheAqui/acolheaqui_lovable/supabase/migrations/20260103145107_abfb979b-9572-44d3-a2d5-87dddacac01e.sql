-- Add columns for primary domain and redirect configuration
ALTER TABLE public.custom_domains 
ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS redirect_to text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS parent_domain_id uuid DEFAULT NULL REFERENCES public.custom_domains(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_domains_parent ON public.custom_domains(parent_domain_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_primary ON public.custom_domains(professional_id, is_primary) WHERE is_primary = true;