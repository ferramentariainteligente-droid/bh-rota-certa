-- Inserir nova linha de ônibus 5130 Dom Pedro - São José da Lapa
INSERT INTO public.bus_lines (
  line_number, 
  route_name, 
  full_title, 
  official_url
) VALUES (
  '5130',
  'Dom Pedro',
  '5130 Dom Pedro - São José da Lapa',
  'https://bhbus.com.br/linha/5130-dom-pedro-sao-jose-da-lapa'
)
ON CONFLICT (line_number) DO UPDATE SET
  route_name = EXCLUDED.route_name,
  full_title = EXCLUDED.full_title,
  official_url = EXCLUDED.official_url,
  updated_at = now();