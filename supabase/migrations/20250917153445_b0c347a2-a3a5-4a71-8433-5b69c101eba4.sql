-- Remove a constraint problemática de site_type para permitir valores flexíveis
ALTER TABLE scraping_sources DROP CONSTRAINT IF EXISTS scraping_sources_site_type_check;

-- Criar uma constraint mais flexível que aceita qualquer texto
ALTER TABLE scraping_sources ADD CONSTRAINT scraping_sources_site_type_check CHECK (length(site_type) > 0);