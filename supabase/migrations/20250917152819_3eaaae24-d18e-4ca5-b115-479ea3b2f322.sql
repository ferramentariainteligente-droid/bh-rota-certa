-- Check what site_type values are allowed and insert with a valid one
INSERT INTO scraping_sources (
  name,
  base_url,
  site_type,
  is_active,
  scraping_config
) VALUES (
  'Move Metropolitano',
  'https://movemetropolitano.com.br',
  'government',
  true,
  '{
    "schedule_selector": ".horarios .diasemana",
    "type_selector": ".div-semana", 
    "time_selector": ".div-hora",
    "supported_types": ["dias_uteis", "sabado", "domingo_feriado", "dias_uteis_atipico", "dias_uteis_ferias", "sabado_ferias", "quarta_cinzas"]
  }'::jsonb
);