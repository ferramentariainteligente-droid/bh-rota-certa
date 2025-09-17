-- First, add unique constraint to base_url column
ALTER TABLE scraping_sources ADD CONSTRAINT unique_base_url UNIQUE (base_url);

-- Then insert the initial scraping source
INSERT INTO scraping_sources (
  name,
  base_url,
  site_type,
  is_active,
  scraping_config
) VALUES (
  'Move Metropolitano',
  'https://movemetropolitano.com.br',
  'movemetropolitano',
  true,
  '{
    "schedule_selector": ".horarios .diasemana",
    "type_selector": ".div-semana", 
    "time_selector": ".div-hora",
    "supported_types": ["dias_uteis", "sabado", "domingo_feriado", "dias_uteis_atipico", "dias_uteis_ferias", "sabado_ferias", "quarta_cinzas"]
  }'::jsonb
) ON CONFLICT (base_url) DO UPDATE SET
  name = EXCLUDED.name,
  site_type = EXCLUDED.site_type,
  is_active = EXCLUDED.is_active,
  scraping_config = EXCLUDED.scraping_config,
  updated_at = now();