-- Inserir linha de ônibus 5140 - São José da Lapa - Terminal Vilarinho
INSERT INTO public.scraped_bus_lines (
  line_code,
  line_name, 
  line_url,
  route_description,
  scraping_status,
  schedule_data,
  metadata,
  last_scraped_at
) VALUES (
  '5140',
  '5140/5150 - São José da Lapa - Terminal Vilarinho',
  'https://expressounir.com.br/5140-sao-jose-da-lapa-terminal-vilarinho/',
  'São José da Lapa - Terminal Vilarinho',
  'success',
  '{
    "schedules": [
      {
        "tipo": "dias_uteis",
        "horarios": ["04:20", "04:35", "05:20", "06:15", "06:35", "08:40", "09:15", "10:45", "11:00", "13:10", "14:00", "15:00", "15:55", "16:15", "16:50", "18:10", "18:20", "19:45", "20:45", "22:30"]
      },
      {
        "tipo": "sabado",
        "horarios": ["05:10", "06:30", "07:40", "10:45", "11:00", "12:10", "13:40", "15:40", "17:50", "18:40", "19:00", "21:00", "23:00"]
      },
      {
        "tipo": "domingo_feriado",
        "horarios": ["06:10", "07:50", "10:15", "16:25", "19:00"]
      }
    ]
  }'::jsonb,
  '{
    "fare": "R$ 8,85",
    "boarding_location": "Rua São José 3302 (próximo a entrada BELOCAL)",
    "destination": "Terminal Vilarinho",
    "duration": "35 minutos (5140) e 70 minutos (5150)",
    "notes": "Linha 5150 via Inácia de Carvalho. Horários com diferentes origens/destinos conforme legenda."
  }'::jsonb,
  NOW()
) ON CONFLICT (line_code) 
DO UPDATE SET
  schedule_data = EXCLUDED.schedule_data,
  metadata = EXCLUDED.metadata,
  last_scraped_at = EXCLUDED.last_scraped_at,
  scraping_status = EXCLUDED.scraping_status;