-- Create table to store sales page configurations for courses/members area services
CREATE TABLE public.sales_page_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_id)
);

-- Enable Row Level Security
ALTER TABLE public.sales_page_config ENABLE ROW LEVEL SECURITY;

-- Create policies for professional access
CREATE POLICY "Professionals can view their own sales page configs" 
ON public.sales_page_config 
FOR SELECT 
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can create their own sales page configs" 
ON public.sales_page_config 
FOR INSERT 
WITH CHECK (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can update their own sales page configs" 
ON public.sales_page_config 
FOR UPDATE 
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can delete their own sales page configs" 
ON public.sales_page_config 
FOR DELETE 
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Public read access for anyone viewing sales pages
CREATE POLICY "Anyone can view published sales page configs" 
ON public.sales_page_config 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sales_page_config_updated_at
BEFORE UPDATE ON public.sales_page_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();