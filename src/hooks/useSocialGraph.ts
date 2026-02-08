import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Follow, FriendRequest, Block } from '@/types/fun-core.types';

interface SocialStats {
  followersCount: number;
  followingCount: number;
  friendsCount: number;
}

interface UseSocialGraphResult {
  // Follow operations
  follow: (userId: string) => Promise<boolean>;
  unfollow: (userId: string) => Promise<boolean>;
  isFollowing: (userId: string) => Promise<boolean>;
  getFollowers: (userId?: string) => Promise<Follow[]>;
  getFollowing: (userId?: string) => Promise<Follow[]>;
  
  // Friend operations
  sendFriendRequest: (userId: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  rejectFriendRequest: (requestId: string) => Promise<boolean>;
  cancelFriendRequest: (requestId: string) => Promise<boolean>;
  getPendingRequests: () => Promise<FriendRequest[]>;
  getSentRequests: () => Promise<FriendRequest[]>;
  
  // Block operations
  blockUser: (userId: string, reason?: string) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  getBlockedUsers: () => Promise<Block[]>;
  
  // Stats
  getStats: (userId?: string) => Promise<SocialStats>;
  
  // State
  loading: boolean;
  error: string | null;
}

export function useSocialGraph(): UseSocialGraphResult {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // FOLLOW OPERATIONS
  // ============================================

  const follow = useCallback(async (userId: string): Promise<boolean> => {
    if (!user?.id || user.id === userId) return false;
    
    try {
      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: userId });

      if (insertError) throw insertError;
      return true;
    } catch (err) {
      console.error('Error following user:', err);
      setError(err instanceof Error ? err.message : 'Failed to follow user');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const unfollow = useCallback(async (userId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setError(err instanceof Error ? err.message : 'Failed to unfollow user');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const isFollowing = useCallback(async (userId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { data, error: fetchError } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      return !!data;
    } catch (err) {
      console.error('Error checking follow status:', err);
      return false;
    }
  }, [user?.id]);

  const getFollowers = useCallback(async (userId?: string): Promise<Follow[]> => {
    const targetId = userId || user?.id;
    if (!targetId) return [];

    try {
      const { data, error: fetchError } = await supabase
        .from('follows')
        .select('*')
        .eq('following_id', targetId);

      if (fetchError) throw fetchError;
      return (data as Follow[]) || [];
    } catch (err) {
      console.error('Error fetching followers:', err);
      return [];
    }
  }, [user?.id]);

  const getFollowing = useCallback(async (userId?: string): Promise<Follow[]> => {
    const targetId = userId || user?.id;
    if (!targetId) return [];

    try {
      const { data, error: fetchError } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', targetId);

      if (fetchError) throw fetchError;
      return (data as Follow[]) || [];
    } catch (err) {
      console.error('Error fetching following:', err);
      return [];
    }
  }, [user?.id]);

  // ============================================
  // FRIEND REQUEST OPERATIONS
  // ============================================

  const sendFriendRequest = useCallback(async (userId: string): Promise<boolean> => {
    if (!user?.id || user.id === userId) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase
        .from('friend_requests')
        .insert({ from_user_id: user.id, to_user_id: userId });

      if (insertError) throw insertError;
      return true;
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError(err instanceof Error ? err.message : 'Failed to send friend request');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const acceptFriendRequest = useCallback(async (requestId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('to_user_id', user.id);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError(err instanceof Error ? err.message : 'Failed to accept friend request');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const rejectFriendRequest = useCallback(async (requestId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected', responded_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('to_user_id', user.id);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject friend request');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const cancelFriendRequest = useCallback(async (requestId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'canceled', responded_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('from_user_id', user.id);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error canceling friend request:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel friend request');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getPendingRequests = useCallback(async (): Promise<FriendRequest[]> => {
    if (!user?.id) return [];

    try {
      const { data, error: fetchError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('to_user_id', user.id)
        .eq('status', 'pending');

      if (fetchError) throw fetchError;
      return (data as FriendRequest[]) || [];
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      return [];
    }
  }, [user?.id]);

  const getSentRequests = useCallback(async (): Promise<FriendRequest[]> => {
    if (!user?.id) return [];

    try {
      const { data, error: fetchError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('from_user_id', user.id)
        .eq('status', 'pending');

      if (fetchError) throw fetchError;
      return (data as FriendRequest[]) || [];
    } catch (err) {
      console.error('Error fetching sent requests:', err);
      return [];
    }
  }, [user?.id]);

  // ============================================
  // BLOCK OPERATIONS
  // ============================================

  const blockUser = useCallback(async (userId: string, reason?: string): Promise<boolean> => {
    if (!user?.id || user.id === userId) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase
        .from('blocks')
        .insert({ blocker_id: user.id, blocked_id: userId, reason });

      if (insertError) throw insertError;

      // Also unfollow the blocked user
      await supabase
        .from('follows')
        .delete()
        .or(`and(follower_id.eq.${user.id},following_id.eq.${userId}),and(follower_id.eq.${userId},following_id.eq.${user.id})`);

      return true;
    } catch (err) {
      console.error('Error blocking user:', err);
      setError(err instanceof Error ? err.message : 'Failed to block user');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const unblockUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error('Error unblocking user:', err);
      setError(err instanceof Error ? err.message : 'Failed to unblock user');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getBlockedUsers = useCallback(async (): Promise<Block[]> => {
    if (!user?.id) return [];

    try {
      const { data, error: fetchError } = await supabase
        .from('blocks')
        .select('*')
        .eq('blocker_id', user.id);

      if (fetchError) throw fetchError;
      return (data as Block[]) || [];
    } catch (err) {
      console.error('Error fetching blocked users:', err);
      return [];
    }
  }, [user?.id]);

  // ============================================
  // STATS
  // ============================================

  const getStats = useCallback(async (userId?: string): Promise<SocialStats> => {
    const targetId = userId || user?.id;
    if (!targetId) return { followersCount: 0, followingCount: 0, friendsCount: 0 };

    try {
      const [followers, following, friends] = await Promise.all([
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', targetId),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', targetId),
        supabase.from('friend_requests').select('id', { count: 'exact', head: true })
          .eq('status', 'accepted')
          .or(`from_user_id.eq.${targetId},to_user_id.eq.${targetId}`),
      ]);

      return {
        followersCount: followers.count || 0,
        followingCount: following.count || 0,
        friendsCount: friends.count || 0,
      };
    } catch (err) {
      console.error('Error fetching social stats:', err);
      return { followersCount: 0, followingCount: 0, friendsCount: 0 };
    }
  }, [user?.id]);

  return {
    follow,
    unfollow,
    isFollowing,
    getFollowers,
    getFollowing,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    getPendingRequests,
    getSentRequests,
    blockUser,
    unblockUser,
    getBlockedUsers,
    getStats,
    loading,
    error,
  };
}
