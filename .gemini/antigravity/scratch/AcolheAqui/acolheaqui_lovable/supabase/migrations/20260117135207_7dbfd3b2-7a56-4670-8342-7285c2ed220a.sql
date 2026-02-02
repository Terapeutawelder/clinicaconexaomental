-- Add preferred model field to ai_agent_config
ALTER TABLE public.ai_agent_config 
ADD COLUMN IF NOT EXISTS openai_preferred_model TEXT DEFAULT 'gpt-4-turbo-preview';

-- Add support for other AI providers
ALTER TABLE public.ai_agent_config 
ADD COLUMN IF NOT EXISTS anthropic_api_key TEXT,
ADD COLUMN IF NOT EXISTS anthropic_preferred_model TEXT DEFAULT 'claude-3-sonnet-20240229',
ADD COLUMN IF NOT EXISTS google_api_key TEXT,
ADD COLUMN IF NOT EXISTS google_preferred_model TEXT DEFAULT 'gemini-pro',
ADD COLUMN IF NOT EXISTS preferred_ai_provider TEXT DEFAULT 'lovable';