-- Add unique constraint to line_url column in scraped_bus_lines table
ALTER TABLE public.scraped_bus_lines 
ADD CONSTRAINT scraped_bus_lines_line_url_unique UNIQUE (line_url);