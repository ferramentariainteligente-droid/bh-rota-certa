-- Inserir dados de teste para verificar se o scraping funciona
INSERT INTO scraped_bus_lines (
  source_id,
  line_code,
  line_name, 
  line_url,
  route_description,
  scraping_status,
  schedule_data,
  metadata,
  last_scraped_at
) VALUES (
  (SELECT id FROM scraping_sources WHERE base_url = 'https://movemetropolitano.com.br' LIMIT 1),
  '4211',
  'Terminal São Benedito / Circular Conjunto Cristina',
  'https://movemetropolitano.com.br/4211-terminal-sao-benedito-circular-conjunto-cristina',
  'Linha teste do sistema de scraping',
  'success',
  '{
    "schedules": [
      {
        "tipo": "dias_uteis",
        "horarios": ["05:00", "06:00", "07:00", "08:00", "16:00", "17:30", "19:00", "20:30"]
      },
      {
        "tipo": "sabado", 
        "horarios": ["05:00", "06:00", "07:00"]
      },
      {
        "tipo": "domingo_feriado",
        "horarios": ["05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"]
      }
    ]
  }'::jsonb,
  '{
    "schedules_count": 3,
    "total_times": 30,
    "scraping_method": "test_insertion",
    "test_data": true
  }'::jsonb,
  now()
);