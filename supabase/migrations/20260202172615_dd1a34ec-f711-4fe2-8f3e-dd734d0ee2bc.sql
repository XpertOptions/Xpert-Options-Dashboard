-- Create account_settings table to store initial capital
CREATE TABLE public.account_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initial_capital NUMERIC NOT NULL DEFAULT 100000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_pnl table to store daily profit/loss entries
CREATE TABLE public.daily_pnl (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_date DATE NOT NULL UNIQUE,
  pnl NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.account_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_pnl ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this dashboard)
CREATE POLICY "Allow public read access to account_settings" 
ON public.account_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to account_settings" 
ON public.account_settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to account_settings" 
ON public.account_settings 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public read access to daily_pnl" 
ON public.daily_pnl 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to daily_pnl" 
ON public.daily_pnl 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to daily_pnl" 
ON public.daily_pnl 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete to daily_pnl" 
ON public.daily_pnl 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_account_settings_updated_at
BEFORE UPDATE ON public.account_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default account settings
INSERT INTO public.account_settings (initial_capital) VALUES (100000);