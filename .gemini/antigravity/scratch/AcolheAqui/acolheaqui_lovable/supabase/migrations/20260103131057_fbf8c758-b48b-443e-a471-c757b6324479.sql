-- Create custom_domains table for professional checkout domains
CREATE TABLE public.custom_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verification_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  cloudflare_zone_id TEXT,
  ssl_status TEXT DEFAULT 'pending',
  dns_verified BOOLEAN DEFAULT false,
  dns_verified_at TIMESTAMP WITH TIME ZONE,
  ssl_provisioned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(domain)
);

-- Enable RLS
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view their own domains"
  ON public.custom_domains
  FOR SELECT
  USING (professional_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can insert their own domains"
  ON public.custom_domains
  FOR INSERT
  WITH CHECK (professional_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can update their own domains"
  ON public.custom_domains
  FOR UPDATE
  USING (professional_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can delete their own domains"
  ON public.custom_domains
  FOR DELETE
  USING (professional_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_custom_domains_professional ON public.custom_domains(professional_id);
CREATE INDEX idx_custom_domains_domain ON public.custom_domains(domain);