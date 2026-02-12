export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          module: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          module?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          module?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_memory: {
        Row: {
          category: string | null
          created_at: string
          id: string
          key: string
          source_module: string | null
          updated_at: string
          user_id: string
          value: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          key: string
          source_module?: string | null
          updated_at?: string
          user_id: string
          value: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          key?: string
          source_module?: string | null
          updated_at?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          module: string | null
          role: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          module?: string | null
          role: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          module?: string | null
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          anon_id: string | null
          app_version: string | null
          created_at: string
          event_name: string
          fun_user_id: string | null
          id: string
          module: string | null
          platform: string | null
          properties: Json
          timestamp: string
          trace_id: string | null
        }
        Insert: {
          anon_id?: string | null
          app_version?: string | null
          created_at?: string
          event_name: string
          fun_user_id?: string | null
          id?: string
          module?: string | null
          platform?: string | null
          properties?: Json
          timestamp?: string
          trace_id?: string | null
        }
        Update: {
          anon_id?: string | null
          app_version?: string | null
          created_at?: string
          event_name?: string
          fun_user_id?: string | null
          id?: string
          module?: string | null
          platform?: string | null
          properties?: Json
          timestamp?: string
          trace_id?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string | null
          from_user_id: string
          id: string
          responded_at: string | null
          status: string
          to_user_id: string
        }
        Insert: {
          created_at?: string | null
          from_user_id: string
          id?: string
          responded_at?: string | null
          status?: string
          to_user_id: string
        }
        Update: {
          created_at?: string | null
          from_user_id?: string
          id?: string
          responded_at?: string | null
          status?: string
          to_user_id?: string
        }
        Relationships: []
      }
      idempotency_keys: {
        Row: {
          created_at: string
          key: string
          response: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          key: string
          response: Json
          user_id: string
        }
        Update: {
          created_at?: string
          key?: string
          response?: Json
          user_id?: string
        }
        Relationships: []
      }
      ledger_transactions: {
        Row: {
          amount: number
          asset: Database["public"]["Enums"]["wallet_asset"]
          created_at: string
          from_user_id: string | null
          id: string
          idempotency_key: string | null
          memo: string | null
          metadata: Json | null
          module: string | null
          order_id: string | null
          payment_id: string | null
          status: Database["public"]["Enums"]["tx_status"]
          to_user_id: string | null
          trace_id: string
          tx_type: Database["public"]["Enums"]["tx_type"]
        }
        Insert: {
          amount: number
          asset?: Database["public"]["Enums"]["wallet_asset"]
          created_at?: string
          from_user_id?: string | null
          id?: string
          idempotency_key?: string | null
          memo?: string | null
          metadata?: Json | null
          module?: string | null
          order_id?: string | null
          payment_id?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          to_user_id?: string | null
          trace_id?: string
          tx_type: Database["public"]["Enums"]["tx_type"]
        }
        Update: {
          amount?: number
          asset?: Database["public"]["Enums"]["wallet_asset"]
          created_at?: string
          from_user_id?: string | null
          id?: string
          idempotency_key?: string | null
          memo?: string | null
          metadata?: Json | null
          module?: string | null
          order_id?: string | null
          payment_id?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          to_user_id?: string | null
          trace_id?: string
          tx_type?: Database["public"]["Enums"]["tx_type"]
        }
        Relationships: [
          {
            foreignKeyName: "ledger_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "ledger_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      mint_history: {
        Row: {
          action_type: string
          amount_atomic: string
          amount_formatted: string
          block_number: number | null
          chain_id: number | null
          contract_address: string
          evidence_hash: string | null
          id: string
          integrity_k: number | null
          light_score: number | null
          minted_at: string | null
          multiplier_i: number | null
          multiplier_k: number | null
          multiplier_q: number | null
          multiplier_ux: number | null
          platform_id: string
          recipient_address: string
          status: string | null
          tx_hash: string
          unity_score: number | null
          user_id: string
        }
        Insert: {
          action_type: string
          amount_atomic: string
          amount_formatted: string
          block_number?: number | null
          chain_id?: number | null
          contract_address: string
          evidence_hash?: string | null
          id?: string
          integrity_k?: number | null
          light_score?: number | null
          minted_at?: string | null
          multiplier_i?: number | null
          multiplier_k?: number | null
          multiplier_q?: number | null
          multiplier_ux?: number | null
          platform_id: string
          recipient_address: string
          status?: string | null
          tx_hash: string
          unity_score?: number | null
          user_id: string
        }
        Update: {
          action_type?: string
          amount_atomic?: string
          amount_formatted?: string
          block_number?: number | null
          chain_id?: number | null
          contract_address?: string
          evidence_hash?: string | null
          id?: string
          integrity_k?: number | null
          light_score?: number | null
          minted_at?: string | null
          multiplier_i?: number | null
          multiplier_k?: number | null
          multiplier_q?: number | null
          multiplier_ux?: number | null
          platform_id?: string
          recipient_address?: string
          status?: string | null
          tx_hash?: string
          unity_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mint_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_permissions: {
        Row: {
          allow_ai_memory: boolean | null
          allow_ai_personalization: boolean | null
          allow_analytics: boolean | null
          allow_cross_platform_data: boolean | null
          allow_marketing: boolean | null
          allow_social_graph: boolean | null
          created_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_ai_memory?: boolean | null
          allow_ai_personalization?: boolean | null
          allow_analytics?: boolean | null
          allow_cross_platform_data?: boolean | null
          allow_marketing?: boolean | null
          allow_social_graph?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_ai_memory?: boolean | null
          allow_ai_personalization?: boolean | null
          allow_analytics?: boolean | null
          allow_cross_platform_data?: boolean | null
          allow_marketing?: boolean | null
          allow_social_graph?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          did_address: string | null
          display_name: string | null
          email: string | null
          id: string
          locale: string | null
          phone: string | null
          preferred_wallet: string | null
          timezone: string | null
          updated_at: string | null
          username: string | null
          verified_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          did_address?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          locale?: string | null
          phone?: string | null
          preferred_wallet?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
          verified_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          did_address?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          locale?: string | null
          phone?: string | null
          preferred_wallet?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          evidence_urls: string[] | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          target_content_id: string | null
          target_content_type: string | null
          target_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          evidence_urls?: string[] | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_content_id?: string | null
          target_content_type?: string | null
          target_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          evidence_urls?: string[] | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_content_id?: string | null
          target_content_type?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          started_at: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          started_at?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          started_at?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          platform_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          platform_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          platform_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_accounts: {
        Row: {
          asset: Database["public"]["Enums"]["wallet_asset"]
          available: number
          created_at: string
          id: string
          locked: number
          updated_at: string
          user_id: string
        }
        Insert: {
          asset?: Database["public"]["Enums"]["wallet_asset"]
          available?: number
          created_at?: string
          id?: string
          locked?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          asset?: Database["public"]["Enums"]["wallet_asset"]
          available?: number
          created_at?: string
          id?: string
          locked?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      treasury_daily_summary: {
        Row: {
          asset: Database["public"]["Enums"]["wallet_asset"] | null
          day: string | null
          total_amount: number | null
          tx_count: number | null
          tx_type: Database["public"]["Enums"]["tx_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_platform_role: {
        Args: {
          _platform_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_blocked: {
        Args: { _blocked_id: string; _blocker_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "attester"
      subscription_tier: "free" | "basic" | "pro" | "enterprise"
      tx_status: "pending" | "completed" | "failed" | "reversed"
      tx_type: "transfer" | "pay" | "reward" | "refund" | "mint" | "burn"
      wallet_asset: "FUN" | "CAMLY"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "attester"],
      subscription_tier: ["free", "basic", "pro", "enterprise"],
      tx_status: ["pending", "completed", "failed", "reversed"],
      tx_type: ["transfer", "pay", "reward", "refund", "mint", "burn"],
      wallet_asset: ["FUN", "CAMLY"],
    },
  },
} as const
