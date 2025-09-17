-- Insert using the same format as the existing record
INSERT INTO scraping_sources (
  name,
  base_url,
  site_type,
  is_active,
  scraping_config
) VALUES (
  'Move Metropolitano - RMBH',
  'https://movemetropolitano.com.br',
  'move_metropolitano_rmbh',
  true,
  '{
    "description": "Horários metropolitanos da RMBH via Move Metropolitano",
    "selectors": {
      "schedule_container": ".horarios",
      "schedule_sections": ".diasemana",
      "type_selector": ".div-semana",
      "time_selector": ".div-hora"
    },
    "supported_types": ["dias_uteis", "sabado", "domingo_feriado", "dias_uteis_atipico", "dias_uteis_ferias", "sabado_ferias", "quarta_cinzas"]
  }'::jsonb
);