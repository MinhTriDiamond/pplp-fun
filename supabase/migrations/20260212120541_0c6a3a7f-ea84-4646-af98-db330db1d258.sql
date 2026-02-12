
-- ============================================
-- Module Users: Maps external platform users to FUN IDs
-- ============================================

CREATE TABLE public.module_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fun_user_id UUID NOT NULL,
  platform_id TEXT NOT NULL,
  external_user_id TEXT,
  external_email TEXT,
  display_name TEXT,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(fun_user_id, platform_id)
);

-- Enable RLS
ALTER TABLE public.module_users ENABLE ROW LEVEL SECURITY;

-- Users can view their own module links
CREATE POLICY "Users can view own module links"
  ON public.module_users FOR SELECT
  USING (auth.uid() = fun_user_id);

-- Users can create their own module links
CREATE POLICY "Users can create own module links"
  ON public.module_users FOR INSERT
  WITH CHECK (auth.uid() = fun_user_id);

-- Users can update their own module links
CREATE POLICY "Users can update own module links"
  ON public.module_users FOR UPDATE
  USING (auth.uid() = fun_user_id);

-- Admins can view all module links
CREATE POLICY "Admins can view all module links"
  ON public.module_users FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX idx_module_users_fun_user ON public.module_users(fun_user_id);
CREATE INDEX idx_module_users_platform ON public.module_users(platform_id);
CREATE INDEX idx_module_users_external ON public.module_users(platform_id, external_user_id);

-- Trigger for updated_at
CREATE TRIGGER update_module_users_updated_at
  BEFORE UPDATE ON public.module_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
