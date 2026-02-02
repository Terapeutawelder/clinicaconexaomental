-- Add service_type column to distinguish between session and members_area services
ALTER TABLE public.services 
ADD COLUMN service_type TEXT NOT NULL DEFAULT 'session' 
CHECK (service_type IN ('session', 'members_area'));

-- Add comment for clarity
COMMENT ON COLUMN public.services.service_type IS 'Type of service: session (appointment-based) or members_area (content access)';

-- Add index for filtering by type
CREATE INDEX idx_services_service_type ON public.services(service_type);

-- Add member_access_config column to store access duration settings
ALTER TABLE public.services 
ADD COLUMN member_access_config JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.services.member_access_config IS 'Configuration for members area access: access_type (lifetime, period, subscription), duration_months, etc.';