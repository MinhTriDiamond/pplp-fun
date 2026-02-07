-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  preferred_wallet TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"  
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create mint_history table
CREATE TABLE public.mint_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Transaction info
  tx_hash TEXT NOT NULL,
  chain_id INTEGER DEFAULT 97,
  contract_address TEXT NOT NULL,
  
  -- Mint details
  recipient_address TEXT NOT NULL,
  action_type TEXT NOT NULL,
  platform_id TEXT NOT NULL,
  amount_atomic TEXT NOT NULL,
  amount_formatted TEXT NOT NULL,
  
  -- Scoring data
  light_score INTEGER,
  unity_score INTEGER,
  integrity_k DECIMAL(5,4),
  evidence_hash TEXT,
  
  -- Multipliers
  multiplier_q DECIMAL(5,2),
  multiplier_i DECIMAL(5,2),
  multiplier_k DECIMAL(5,4),
  multiplier_ux DECIMAL(5,2),
  
  -- Timestamps
  minted_at TIMESTAMPTZ DEFAULT NOW(),
  block_number BIGINT,
  
  -- Status
  status TEXT DEFAULT 'confirmed'
);

-- Enable RLS on mint_history
ALTER TABLE public.mint_history ENABLE ROW LEVEL SECURITY;

-- Mint history RLS policies
CREATE POLICY "Users can view own mint history"
  ON public.mint_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mint history"
  ON public.mint_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();