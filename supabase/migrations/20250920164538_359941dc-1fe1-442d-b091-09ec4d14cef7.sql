-- Fix security issue: Set search_path for generate_share_code function
CREATE OR REPLACE FUNCTION public.generate_share_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
BEGIN
  code := encode(gen_random_bytes(6), 'base64');
  code := replace(replace(code, '/', ''), '+', '');
  code := upper(substring(code, 1, 8));
  RETURN code;
END;
$$;