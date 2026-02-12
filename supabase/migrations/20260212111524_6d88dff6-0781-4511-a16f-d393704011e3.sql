
-- =============================================
-- FUN CORE MVP: Username + Events Table
-- =============================================

-- 1. Add username column to profiles
ALTER TABLE public.profiles
ADD COLUMN username TEXT UNIQUE;

-- 2. Add CHECK constraint for username format
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_format
CHECK (username ~ '^[a-z0-9_]{4,20}$');

-- 3. Create validation function for reserved keywords
CREATE OR REPLACE FUNCTION public.validate_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  reserved_words TEXT[] := ARRAY[
    'admin', 'support', 'fun', 'wallet', 'treasury',
    'academy', 'play', 'farm', 'charity', 'planet',
    'angel', 'ai', 'greenearth', 'camly'
  ];
BEGIN
  IF NEW.username IS NOT NULL AND NEW.username = ANY(reserved_words) THEN
    RAISE EXCEPTION 'Username "%" is reserved and cannot be used', NEW.username;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Create trigger for username validation
CREATE TRIGGER validate_username_trigger
BEFORE INSERT OR UPDATE OF username ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_username();

-- 5. Index on username for fast lookups
CREATE INDEX idx_profiles_username ON public.profiles (username) WHERE username IS NOT NULL;

-- 6. Add RLS policy: authenticated users can view profiles by username (public lookup)
CREATE POLICY "Authenticated users can view profiles by username"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Drop the old restrictive select policy since we now allow public profile lookup
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 7. Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  fun_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anon_id TEXT,
  module TEXT,
  platform TEXT DEFAULT 'web',
  app_version TEXT,
  trace_id TEXT,
  properties JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 9. RLS policies for events
CREATE POLICY "Users can insert own events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = fun_user_id);

CREATE POLICY "Users can view own events"
ON public.events
FOR SELECT
TO authenticated
USING (auth.uid() = fun_user_id);

CREATE POLICY "Admins can view all events"
ON public.events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 10. Indexes for events
CREATE INDEX idx_events_user_created ON public.events (fun_user_id, created_at DESC);
CREATE INDEX idx_events_name ON public.events (event_name);
CREATE INDEX idx_events_module ON public.events (module);
