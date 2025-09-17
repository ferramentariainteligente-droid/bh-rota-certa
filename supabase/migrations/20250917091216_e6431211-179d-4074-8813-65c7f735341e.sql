-- Create bus_lines table to store bus line information
CREATE TABLE public.bus_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_number TEXT NOT NULL,
  route_name TEXT NOT NULL,
  full_title TEXT NOT NULL,
  official_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bus_schedules table to store individual schedule times
CREATE TABLE public.bus_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_line_id UUID NOT NULL REFERENCES public.bus_lines(id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bus_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no authentication needed for bus data)
CREATE POLICY "Bus lines are viewable by everyone" 
ON public.bus_lines 
FOR SELECT 
USING (true);

CREATE POLICY "Bus schedules are viewable by everyone" 
ON public.bus_schedules 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_bus_lines_line_number ON public.bus_lines(line_number);
CREATE INDEX idx_bus_lines_route_name ON public.bus_lines USING GIN(to_tsvector('portuguese', route_name));
CREATE INDEX idx_bus_schedules_line_id ON public.bus_schedules(bus_line_id);
CREATE INDEX idx_bus_schedules_time ON public.bus_schedules(departure_time);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bus_lines_updated_at
BEFORE UPDATE ON public.bus_lines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();