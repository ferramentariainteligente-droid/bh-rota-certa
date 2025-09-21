-- Inserir nova linha São José da Lapa - Belo Horizonte
INSERT INTO public.bus_lines (official_url, full_title, route_name, line_number) VALUES 
('https://movemetropolitano.com.br/5142-sao-jose-da-lapa-belo-horizonte', 
 '5142 São José da Lapa / Belo Horizonte – Horário de Ônibus Metropolitano | DER MG',
 'São José da Lapa / Belo Horizonte',
 '5142');

-- Inserir dados de scraped_bus_lines para essa nova linha
INSERT INTO public.scraped_bus_lines (
  line_code, 
  line_name, 
  line_url, 
  route_description,
  scraping_status,
  schedule_data
) VALUES (
  '5142',
  'São José da Lapa / Belo Horizonte',
  'https://movemetropolitano.com.br/5142-sao-jose-da-lapa-belo-horizonte',
  'Conecta São José da Lapa ao centro de Belo Horizonte',
  'success',
  '{
    "schedules": [
      {
        "tipo": "dias_uteis",
        "horarios": ["05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"]
      },
      {
        "tipo": "sabado",
        "horarios": ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"]
      },
      {
        "tipo": "domingo_feriado", 
        "horarios": ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]
      }
    ]
  }'::jsonb
);