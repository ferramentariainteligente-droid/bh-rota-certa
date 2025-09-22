-- Atualizar dados da linha 5140 com horários completos
UPDATE public.scraped_bus_lines SET
  schedule_data = '{
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
  metadata = '{
    "fare": "R$ 8,85",
    "boarding_location": "Rua São José 3302 (próximo a entrada BELOCAL)",
    "destination": "Terminal Vilarinho",
    "duration": "35 minutos (5140) e 70 minutos (5150)",
    "notes": "Linha 5150 via Inácia de Carvalho. Horários com diferentes origens/destinos conforme legenda."
  }'::jsonb,
  scraping_status = 'success',
  last_scraped_at = NOW()
WHERE line_code = '5140';