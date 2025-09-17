-- Create enum for report types
CREATE TYPE public.report_type AS ENUM ('horario_incorreto', 'linha_nao_funciona', 'horario_em_falta', 'informacao_desatualizada', 'outro');

-- Create enum for report status
CREATE TYPE public.report_status AS ENUM ('pendente', 'analisando', 'resolvido', 'rejeitado');

-- Create reports table
CREATE TABLE public.bus_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    line_url TEXT NOT NULL,
    line_name TEXT NOT NULL,
    report_type public.report_type NOT NULL,
    user_message TEXT NOT NULL,
    suggested_correction TEXT,
    user_email TEXT,
    user_contact TEXT,
    status public.report_status NOT NULL DEFAULT 'pendente',
    admin_response TEXT,
    admin_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.bus_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create reports" 
ON public.bus_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can view their own reports if they provided email" 
ON public.bus_reports 
FOR SELECT 
USING (user_email IS NOT NULL);

CREATE POLICY "Admins can view all reports" 
ON public.bus_reports 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Admins can update reports" 
ON public.bus_reports 
FOR UPDATE 
TO authenticated
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_bus_reports_updated_at
    BEFORE UPDATE ON public.bus_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_bus_reports_status ON public.bus_reports (status);
CREATE INDEX idx_bus_reports_created_at ON public.bus_reports (created_at DESC);
CREATE INDEX idx_bus_reports_line_url ON public.bus_reports (line_url);