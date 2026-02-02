-- Create profiles table for professionals
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  specialty TEXT,
  crp TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_professional BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create payment_gateways table for professional payment configuration
CREATE TABLE public.payment_gateways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gateway_type TEXT NOT NULL, -- 'pix', 'credit_card', 'boleto'
  is_active BOOLEAN DEFAULT true,
  pix_key TEXT,
  pix_key_type TEXT, -- 'cpf', 'email', 'phone', 'random'
  card_enabled BOOLEAN DEFAULT false,
  card_gateway TEXT, -- 'mercadopago', 'pagarme', 'stripe', etc
  card_api_key TEXT,
  installments_enabled BOOLEAN DEFAULT false,
  max_installments INTEGER DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, gateway_type)
);

-- Enable RLS on payment_gateways
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_gateways
CREATE POLICY "Professionals can view their own gateways" ON public.payment_gateways
  FOR SELECT USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own gateways" ON public.payment_gateways
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own gateways" ON public.payment_gateways
  FOR UPDATE USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own gateways" ON public.payment_gateways
  FOR DELETE USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create available_hours table for professional schedule
CREATE TABLE public.available_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, day_of_week, start_time)
);

-- Enable RLS on available_hours
ALTER TABLE public.available_hours ENABLE ROW LEVEL SECURITY;

-- Create policies for available_hours
CREATE POLICY "Professionals can view their own hours" ON public.available_hours
  FOR SELECT USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own hours" ON public.available_hours
  FOR INSERT WITH CHECK (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own hours" ON public.available_hours
  FOR UPDATE USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own hours" ON public.available_hours
  FOR DELETE USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create appointments table for booking history
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 50,
  session_type TEXT, -- 'individual', 'couple', 'family'
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  payment_method TEXT, -- 'pix', 'credit_card', 'boleto'
  amount_cents INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for appointments
CREATE POLICY "Professionals can view their own appointments" ON public.appointments
  FOR SELECT USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can insert appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Professionals can update their own appointments" ON public.appointments
  FOR UPDATE USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create handle_new_user function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();