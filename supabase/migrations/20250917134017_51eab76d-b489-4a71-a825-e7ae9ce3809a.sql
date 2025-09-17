-- Criar tabelas para o sistema de scraping de horários de ônibus

-- Tabela para configurar os sites a serem monitorados
CREATE TABLE public.scraping_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  site_type TEXT NOT NULL CHECK (site_type IN ('move_metropolitano', 'expresso_unir_municipal', 'expresso_unir_intermunicipal')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  scraping_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para logs de execução do scraping
CREATE TABLE public.scraping_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.scraping_sources(id) ON DELETE CASCADE,
  execution_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'processing', 'completed', 'error')),
  lines_found INTEGER DEFAULT 0,
  lines_processed INTEGER DEFAULT 0,
  lines_updated INTEGER DEFAULT 0,
  lines_failed INTEGER DEFAULT 0,
  error_message TEXT,
  execution_details JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para armazenar as linhas descobertas pelo scraping
CREATE TABLE public.scraped_bus_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.scraping_sources(id) ON DELETE CASCADE,
  line_code TEXT NOT NULL,
  line_name TEXT NOT NULL,
  line_url TEXT NOT NULL,
  route_description TEXT,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  scraping_status TEXT NOT NULL DEFAULT 'pending' CHECK (scraping_status IN ('pending', 'success', 'failed', 'skipped')),
  schedule_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_scraping_sources_active ON public.scraping_sources(is_active);
CREATE INDEX idx_scraping_sources_type ON public.scraping_sources(site_type);
CREATE INDEX idx_scraping_logs_source_id ON public.scraping_logs(source_id);
CREATE INDEX idx_scraping_logs_execution_id ON public.scraping_logs(execution_id);
CREATE INDEX idx_scraping_logs_status ON public.scraping_logs(status);
CREATE INDEX idx_scraped_bus_lines_source_id ON public.scraped_bus_lines(source_id);
CREATE INDEX idx_scraped_bus_lines_status ON public.scraped_bus_lines(scraping_status);
CREATE INDEX idx_scraped_bus_lines_url ON public.scraped_bus_lines(line_url);

-- RLS Policies
ALTER TABLE public.scraping_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_bus_lines ENABLE ROW LEVEL SECURITY;

-- Policies para permitir acesso público de leitura (para o admin)
CREATE POLICY "Allow public read access to scraping sources" 
ON public.scraping_sources FOR SELECT USING (true);

CREATE POLICY "Allow public read access to scraping logs" 
ON public.scraping_logs FOR SELECT USING (true);

CREATE POLICY "Allow public read access to scraped bus lines" 
ON public.scraped_bus_lines FOR SELECT USING (true);

-- Policies para inserção/atualização (apenas funções do sistema)
CREATE POLICY "Allow insert to scraping sources" 
ON public.scraping_sources FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to scraping sources" 
ON public.scraping_sources FOR UPDATE USING (true);

CREATE POLICY "Allow insert to scraping logs" 
ON public.scraping_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to scraping logs" 
ON public.scraping_logs FOR UPDATE USING (true);

CREATE POLICY "Allow insert to scraped bus lines" 
ON public.scraped_bus_lines FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to scraped bus lines" 
ON public.scraped_bus_lines FOR UPDATE USING (true);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_scraping_sources_updated_at
BEFORE UPDATE ON public.scraping_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scraped_bus_lines_updated_at
BEFORE UPDATE ON public.scraped_bus_lines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir as fontes iniciais de scraping
INSERT INTO public.scraping_sources (name, base_url, site_type, scraping_config) VALUES
('Move Metropolitano - RMBH', 'https://movemetropolitano.com.br/rmbh/', 'move_metropolitano', '{
  "description": "Site com horários de ônibus metropolitano da Região Metropolitana de BH",
  "selectors": {
    "line_links": "a[href*=\"movemetropolitano.com.br\"]",
    "line_name": "h1, .title, .linha-nome",
    "schedule_sections": ".horarios, .schedule, table"
  }
}'),
('Expresso Unir - Linhas Municipais', 'https://expressounir.com.br/linhas-municipais/', 'expresso_unir_municipal', '{
  "description": "Linhas municipais da Expresso Unir",
  "selectors": {
    "line_links": "a[href*=\"expressounir.com.br\"]",
    "line_name": "h1, .title",
    "schedule_table": "table",
    "schedule_columns": ["DIA ÚTIL", "SÁBADO", "DOMINGO"]
  }
}'),
('Expresso Unir - Linhas Intermunicipais', 'https://expressounir.com.br/linhas-intermunicipais/', 'expresso_unir_intermunicipal', '{
  "description": "Linhas intermunicipais da Expresso Unir",
  "selectors": {
    "line_links": "a[href*=\"expressounir.com.br\"]",
    "line_name": "h1, .title",
    "schedule_table": "table",
    "schedule_columns": ["DIA ÚTIL", "SÁBADO", "DOMINGO"]
  }
}');