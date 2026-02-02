-- Criar política para permitir visualização pública de perfis de profissionais
-- Isso permite que qualquer pessoa (autenticada ou não) visualize profissionais

CREATE POLICY "Anyone can view professional profiles" 
ON public.profiles 
FOR SELECT 
USING (is_professional = true);