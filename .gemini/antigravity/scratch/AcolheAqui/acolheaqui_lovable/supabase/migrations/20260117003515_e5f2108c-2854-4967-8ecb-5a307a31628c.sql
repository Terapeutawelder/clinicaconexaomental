-- Add OpenAI API key field to ai_agent_config for per-professional AI customization
ALTER TABLE public.ai_agent_config 
ADD COLUMN openai_api_key TEXT;

-- Add WhatsApp API type field to whatsapp_settings (evolution or official)
ALTER TABLE public.whatsapp_settings 
ADD COLUMN whatsapp_api_type TEXT DEFAULT 'evolution';

-- Add official WhatsApp API credentials
ALTER TABLE public.whatsapp_settings 
ADD COLUMN official_phone_number_id TEXT,
ADD COLUMN official_access_token TEXT,
ADD COLUMN official_business_account_id TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.ai_agent_config.openai_api_key IS 'OpenAI API key for this professional - if null, uses system default';
COMMENT ON COLUMN public.whatsapp_settings.whatsapp_api_type IS 'Type of WhatsApp API: evolution or official';