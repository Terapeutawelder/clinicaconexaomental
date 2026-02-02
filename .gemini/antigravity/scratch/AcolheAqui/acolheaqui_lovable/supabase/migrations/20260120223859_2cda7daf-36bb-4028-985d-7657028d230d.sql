-- Add customizable notification templates to whatsapp_settings
ALTER TABLE public.whatsapp_settings
ADD COLUMN template_client_confirmation TEXT DEFAULT NULL,
ADD COLUMN template_client_reminder TEXT DEFAULT NULL,
ADD COLUMN template_professional_notification TEXT DEFAULT NULL,
ADD COLUMN template_email_confirmation TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.whatsapp_settings.template_client_confirmation IS 'Custom WhatsApp message template for client appointment confirmation. Variables: {client_name}, {professional_name}, {service_name}, {date}, {time}, {price}';
COMMENT ON COLUMN public.whatsapp_settings.template_client_reminder IS 'Custom WhatsApp message template for appointment reminder. Variables: {client_name}, {professional_name}, {date}, {time}';
COMMENT ON COLUMN public.whatsapp_settings.template_professional_notification IS 'Custom WhatsApp message template for professional notification. Variables: {client_name}, {client_phone}, {client_email}, {service_name}, {date}, {time}, {price}, {notes}';
COMMENT ON COLUMN public.whatsapp_settings.template_email_confirmation IS 'Custom email HTML template for client confirmation. Variables: {client_name}, {professional_name}, {service_name}, {date}, {time}, {price}';