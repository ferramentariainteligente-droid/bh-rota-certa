-- Corrigir status da linha 5142 de 'completed' para 'success'
UPDATE public.scraped_bus_lines 
SET scraping_status = 'success' 
WHERE line_code = '5142' AND scraping_status = 'completed';