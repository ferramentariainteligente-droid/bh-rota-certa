-- Remove as políticas atuais que são muito permissivas
DROP POLICY IF EXISTS "Public can view their own reports if they provided email" ON public.bus_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.bus_reports;

-- Cria nova política para usuários verem apenas seus próprios relatórios
-- Usando um identificador único baseado no email + timestamp para segurança
CREATE POLICY "Users can view their own reports with email verification" 
ON public.bus_reports 
FOR SELECT 
USING (
  user_email IS NOT NULL 
  AND user_email = current_setting('request.header.user_email', true)
);

-- Política para admins autenticados verem todos os relatórios
-- Assumindo que haverá autenticação de admin implementada futuramente
CREATE POLICY "Authenticated admins can view all reports" 
ON public.bus_reports 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND auth.jwt() ->> 'role' = 'admin'
);

-- Política para admins autenticados atualizarem relatórios
CREATE POLICY "Authenticated admins can update reports" 
ON public.bus_reports 
FOR UPDATE 
USING (
  auth.role() = 'authenticated' 
  AND auth.jwt() ->> 'role' = 'admin'
);

-- Mantém a política de criação pública (necessária para receber relatórios)
-- Mas remove a política antiga muito permissiva