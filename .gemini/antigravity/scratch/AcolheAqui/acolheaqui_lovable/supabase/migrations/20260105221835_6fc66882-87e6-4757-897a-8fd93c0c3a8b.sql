-- Adicionar campo para número de WhatsApp nas notificações de domínio
ALTER TABLE public.custom_domains 
ADD COLUMN IF NOT EXISTS notification_whatsapp TEXT;