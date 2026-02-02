-- Create table for AI Agent configuration
CREATE TABLE public.ai_agent_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  n8n_webhook_url TEXT DEFAULT '',
  n8n_api_key TEXT DEFAULT '',
  agent_name TEXT DEFAULT 'Assistente Virtual',
  agent_greeting TEXT DEFAULT 'Olá! Sou o assistente virtual. Como posso ajudar você a agendar uma consulta?',
  agent_instructions TEXT DEFAULT 'Você é um assistente virtual de agendamento. Seja educado e profissional. Ajude os clientes a encontrar o melhor horário disponível para suas consultas.',
  auto_confirm_appointments BOOLEAN DEFAULT false,
  send_confirmation_message BOOLEAN DEFAULT true,
  working_hours_only BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id)
);

-- Enable Row Level Security
ALTER TABLE public.ai_agent_config ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own AI agent config" 
ON public.ai_agent_config 
FOR SELECT 
USING (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own AI agent config" 
ON public.ai_agent_config 
FOR INSERT 
WITH CHECK (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own AI agent config" 
ON public.ai_agent_config 
FOR UPDATE 
USING (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own AI agent config" 
ON public.ai_agent_config 
FOR DELETE 
USING (
  professional_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_agent_config_updated_at
BEFORE UPDATE ON public.ai_agent_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();