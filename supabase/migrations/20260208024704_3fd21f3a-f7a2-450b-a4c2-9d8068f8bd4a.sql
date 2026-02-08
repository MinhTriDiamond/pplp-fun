-- ============================================
-- FUN ECOSYSTEM PHASE 1: CORE FOUNDATION
-- Identity Layer + Social Layer + Privacy
-- ============================================

-- 1. Create role enum for permission system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'attester');

-- 2. User Roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    platform_id TEXT DEFAULT NULL, -- null = global role, or specific platform
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role, platform_id)
);

-- 3. Privacy Permissions table (5D Trust - User Owns Data)
CREATE TABLE public.privacy_permissions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    allow_social_graph BOOLEAN DEFAULT false,
    allow_ai_personalization BOOLEAN DEFAULT false,
    allow_ai_memory BOOLEAN DEFAULT false,
    allow_cross_platform_data BOOLEAN DEFAULT false,
    allow_marketing BOOLEAN DEFAULT false,
    allow_analytics BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Follows table (Social Graph)
CREATE TABLE public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- 5. Friend Requests table
CREATE TABLE public.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    responded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (from_user_id, to_user_id),
    CONSTRAINT no_self_request CHECK (from_user_id != to_user_id)
);

-- 6. Blocks table
CREATE TABLE public.blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- 7. Reports table (User safety)
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_content_type TEXT, -- 'user', 'post', 'message', etc.
    target_content_id UUID,
    reason TEXT NOT NULL,
    evidence_urls TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Audit Logs table (5D Trust - Audit Trail)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL, -- 'permission_change', 'profile_update', 'role_change', etc.
    resource_type TEXT, -- 'privacy_permissions', 'profile', 'user_roles', etc.
    resource_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- SECURITY DEFINER FUNCTIONS (for RLS)
-- ============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
          AND (platform_id IS NULL OR platform_id = 'global')
    )
$$;

-- Function to check if user has role for specific platform
CREATE OR REPLACE FUNCTION public.has_platform_role(_user_id UUID, _role app_role, _platform_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
          AND (platform_id IS NULL OR platform_id = _platform_id)
    )
$$;

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION public.is_blocked(_blocker_id UUID, _blocked_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.blocks
        WHERE blocker_id = _blocker_id AND blocked_id = _blocked_id
    )
$$;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- User Roles: Users can view their own roles, admins can manage all
CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Privacy Permissions: Users can only manage their own
CREATE POLICY "Users can view own permissions"
    ON public.privacy_permissions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own permissions"
    ON public.privacy_permissions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own permissions"
    ON public.privacy_permissions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Follows: Public read (if social graph allowed), users manage own follows
CREATE POLICY "Users can view follows"
    ON public.follows FOR SELECT
    TO authenticated
    USING (
        follower_id = auth.uid() 
        OR following_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.privacy_permissions 
            WHERE user_id = follower_id AND allow_social_graph = true
        )
    );

CREATE POLICY "Users can manage own follows"
    ON public.follows FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = follower_id AND NOT public.is_blocked(following_id, follower_id));

CREATE POLICY "Users can delete own follows"
    ON public.follows FOR DELETE
    TO authenticated
    USING (auth.uid() = follower_id);

-- Friend Requests: Users can see requests involving them
CREATE POLICY "Users can view own friend requests"
    ON public.friend_requests FOR SELECT
    TO authenticated
    USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send friend requests"
    ON public.friend_requests FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = from_user_id 
        AND NOT public.is_blocked(to_user_id, from_user_id)
    );

CREATE POLICY "Users can update requests they received"
    ON public.friend_requests FOR UPDATE
    TO authenticated
    USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

-- Blocks: Users can only manage their own blocks
CREATE POLICY "Users can view own blocks"
    ON public.blocks FOR SELECT
    TO authenticated
    USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks"
    ON public.blocks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks"
    ON public.blocks FOR DELETE
    TO authenticated
    USING (auth.uid() = blocker_id);

-- Reports: Users can create reports, admins/moderators can view all
CREATE POLICY "Users can create reports"
    ON public.reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
    ON public.reports FOR SELECT
    TO authenticated
    USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
    ON public.reports FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can update reports"
    ON public.reports FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Audit Logs: Users can view their own logs, admins can view all
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at for privacy_permissions
CREATE TRIGGER update_privacy_permissions_updated_at
    BEFORE UPDATE ON public.privacy_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create privacy_permissions when user is created
CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.privacy_permissions (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Also assign default 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role, platform_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_permissions
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_permissions();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_friend_requests_from ON public.friend_requests(from_user_id);
CREATE INDEX idx_friend_requests_to ON public.friend_requests(to_user_id);
CREATE INDEX idx_friend_requests_status ON public.friend_requests(status);
CREATE INDEX idx_blocks_blocker ON public.blocks(blocker_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ============================================
-- UPDATE PROFILES TABLE (Add new fields)
-- ============================================

ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'vi',
    ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS did_address TEXT,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;