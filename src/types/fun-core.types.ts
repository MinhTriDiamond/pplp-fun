// ============================================
// FUN ECOSYSTEM CORE TYPES
// Phase 1: Identity Layer + Social Layer
// ============================================

// Role types
export type AppRole = 'admin' | 'moderator' | 'user' | 'attester';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  platform_id: string | null;
  granted_by: string | null;
  granted_at: string;
}

// Privacy Permissions (5D Trust)
export interface PrivacyPermissions {
  user_id: string;
  allow_social_graph: boolean;
  allow_ai_personalization: boolean;
  allow_ai_memory: boolean;
  allow_cross_platform_data: boolean;
  allow_marketing: boolean;
  allow_analytics: boolean;
  created_at: string;
  updated_at: string;
}

// Extended Profile (with new fields)
export interface FunProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  locale: string;
  timezone: string;
  phone: string | null;
  preferred_wallet: string | null;
  did_address: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Social Graph types
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'canceled';

export interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: FriendRequestStatus;
  created_at: string;
  responded_at: string | null;
}

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason: string | null;
  created_at: string;
}

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporter_id: string;
  target_user_id: string | null;
  target_content_type: string | null;
  target_content_id: string | null;
  reason: string;
  evidence_urls: string[] | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ============================================
// Platform Module Types
// ============================================

export type PlatformId = 
  | 'fun-profile'
  | 'angel-ai'
  | 'fun-academy'
  | 'fun-charity'
  | 'fun-farm'
  | 'fun-play'
  | 'fun-market'
  | 'fun-treasury'
  | 'fun-earth'
  | 'fun-planet'
  | 'fun-legal'
  | 'camly-coin';

export interface PlatformModule {
  id: PlatformId;
  name: string;
  description: string;
  icon: string;
  route: string;
  enabled: boolean;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
