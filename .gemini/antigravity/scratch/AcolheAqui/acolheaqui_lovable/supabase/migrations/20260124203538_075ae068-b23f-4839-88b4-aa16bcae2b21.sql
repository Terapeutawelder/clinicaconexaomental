-- Create whatsapp_connections table for managing multiple connections (Baileys or Official API)
CREATE TABLE public.whatsapp_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT,
  driver_type TEXT NOT NULL DEFAULT 'baileys' CHECK (driver_type IN ('baileys', 'official')),
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting')),
  avatar_url TEXT,
  -- Baileys specific fields
  qr_code TEXT,
  session_data JSONB,
  -- Official API specific fields
  access_token TEXT,
  waba_id TEXT,
  phone_number_id TEXT,
  -- Metadata
  last_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create whatsapp_crm_stages table (Kanban columns)
CREATE TABLE public.whatsapp_crm_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#10b981',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create whatsapp_crm_leads table (Kanban cards)
CREATE TABLE public.whatsapp_crm_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.whatsapp_crm_stages(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  value_cents INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  last_interaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create whatsapp_ai_agents table
CREATE TABLE public.whatsapp_ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  avatar_color TEXT DEFAULT '#10b981',
  avatar_icon TEXT DEFAULT 'bot',
  system_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  knowledge_base JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create whatsapp_dispatch_config table (anti-ban settings)
CREATE TABLE public.whatsapp_dispatch_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  -- Scheduling
  schedule_enabled BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMPTZ,
  -- Interval settings (anti-ban)
  delay_min_seconds INTEGER DEFAULT 30,
  delay_max_seconds INTEGER DEFAULT 60,
  -- Auto pause
  pause_after_messages INTEGER DEFAULT 50,
  pause_minutes INTEGER DEFAULT 10,
  -- Time window
  start_time TIME DEFAULT '08:00',
  end_time TIME DEFAULT '18:00',
  active_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- 0=Sunday, 1=Monday, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(professional_id, connection_id)
);

-- Create whatsapp_dispatches table (broadcast campaigns)
CREATE TABLE public.whatsapp_dispatches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message_content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  recipients JSONB DEFAULT '[]', -- Array of phone numbers
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create whatsapp_messages table for chat history
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.whatsapp_crm_leads(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_crm_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_dispatch_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_connections
CREATE POLICY "Professionals can view their own connections" ON public.whatsapp_connections FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own connections" ON public.whatsapp_connections FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can update their own connections" ON public.whatsapp_connections FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can delete their own connections" ON public.whatsapp_connections FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS Policies for whatsapp_crm_stages
CREATE POLICY "Professionals can view their own stages" ON public.whatsapp_crm_stages FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own stages" ON public.whatsapp_crm_stages FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can update their own stages" ON public.whatsapp_crm_stages FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can delete their own stages" ON public.whatsapp_crm_stages FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS Policies for whatsapp_crm_leads
CREATE POLICY "Professionals can view their own leads" ON public.whatsapp_crm_leads FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own leads" ON public.whatsapp_crm_leads FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can update their own leads" ON public.whatsapp_crm_leads FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can delete their own leads" ON public.whatsapp_crm_leads FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS Policies for whatsapp_ai_agents
CREATE POLICY "Professionals can view their own agents" ON public.whatsapp_ai_agents FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own agents" ON public.whatsapp_ai_agents FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can update their own agents" ON public.whatsapp_ai_agents FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can delete their own agents" ON public.whatsapp_ai_agents FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS Policies for whatsapp_dispatch_config
CREATE POLICY "Professionals can view their own config" ON public.whatsapp_dispatch_config FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own config" ON public.whatsapp_dispatch_config FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can update their own config" ON public.whatsapp_dispatch_config FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can delete their own config" ON public.whatsapp_dispatch_config FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS Policies for whatsapp_dispatches
CREATE POLICY "Professionals can view their own dispatches" ON public.whatsapp_dispatches FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own dispatches" ON public.whatsapp_dispatches FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can update their own dispatches" ON public.whatsapp_dispatches FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can delete their own dispatches" ON public.whatsapp_dispatches FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- RLS Policies for whatsapp_messages
CREATE POLICY "Professionals can view their own messages" ON public.whatsapp_messages FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));
CREATE POLICY "Professionals can insert their own messages" ON public.whatsapp_messages FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professional_id));

-- Create indexes for performance
CREATE INDEX idx_whatsapp_connections_professional ON public.whatsapp_connections(professional_id);
CREATE INDEX idx_whatsapp_crm_stages_professional ON public.whatsapp_crm_stages(professional_id);
CREATE INDEX idx_whatsapp_crm_leads_professional ON public.whatsapp_crm_leads(professional_id);
CREATE INDEX idx_whatsapp_crm_leads_stage ON public.whatsapp_crm_leads(stage_id);
CREATE INDEX idx_whatsapp_ai_agents_professional ON public.whatsapp_ai_agents(professional_id);
CREATE INDEX idx_whatsapp_dispatches_professional ON public.whatsapp_dispatches(professional_id);
CREATE INDEX idx_whatsapp_messages_professional ON public.whatsapp_messages(professional_id);
CREATE INDEX idx_whatsapp_messages_lead ON public.whatsapp_messages(lead_id);

-- Triggers for updated_at
CREATE TRIGGER update_whatsapp_connections_updated_at BEFORE UPDATE ON public.whatsapp_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_crm_stages_updated_at BEFORE UPDATE ON public.whatsapp_crm_stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_crm_leads_updated_at BEFORE UPDATE ON public.whatsapp_crm_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_ai_agents_updated_at BEFORE UPDATE ON public.whatsapp_ai_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_dispatch_config_updated_at BEFORE UPDATE ON public.whatsapp_dispatch_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_dispatches_updated_at BEFORE UPDATE ON public.whatsapp_dispatches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();