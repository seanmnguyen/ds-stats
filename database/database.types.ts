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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      commanders: {
        Row: {
          display_name: string
          faction: Database["public"]["Enums"]["faction"]
          portrait_url: string | null
          slug: string
        }
        Insert: {
          display_name: string
          faction: Database["public"]["Enums"]["faction"]
          portrait_url?: string | null
          slug: string
        }
        Update: {
          display_name?: string
          faction?: Database["public"]["Enums"]["faction"]
          portrait_url?: string | null
          slug?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string | null
          id: number
          logged_by: number | null
          loser: string
          played_at: string | null
          winner: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          logged_by?: number | null
          loser: string
          played_at?: string | null
          winner: string
        }
        Update: {
          created_at?: string | null
          id?: never
          logged_by?: number | null
          loser?: string
          played_at?: string | null
          winner?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_loser_fkey"
            columns: ["loser"]
            isOneToOne: false
            referencedRelation: "commanders"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "matches_loser_fkey"
            columns: ["loser"]
            isOneToOne: false
            referencedRelation: "matchup_stats"
            referencedColumns: ["opponent"]
          },
          {
            foreignKeyName: "matches_loser_fkey"
            columns: ["loser"]
            isOneToOne: false
            referencedRelation: "matchup_stats"
            referencedColumns: ["player"]
          },
          {
            foreignKeyName: "matches_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "commanders"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "matches_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "matchup_stats"
            referencedColumns: ["opponent"]
          },
          {
            foreignKeyName: "matches_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "matchup_stats"
            referencedColumns: ["player"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          id: number
          role: Database["public"]["Enums"]["user_role"] | null
          username: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          id?: never
          role?: Database["public"]["Enums"]["user_role"] | null
          username?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: never
          role?: Database["public"]["Enums"]["user_role"] | null
          username?: string | null
        }
        Relationships: []
      }
      strategies: {
        Row: {
          author: number | null
          body: string
          created_at: string | null
          downvotes: number | null
          id: number
          last_edit: string | null
          opponent: string
          player: string
          rating: number | null
          title: string | null
          upvotes: number | null
        }
        Insert: {
          author?: number | null
          body: string
          created_at?: string | null
          downvotes?: number | null
          id?: never
          last_edit?: string | null
          opponent: string
          player: string
          rating?: number | null
          title?: string | null
          upvotes?: number | null
        }
        Update: {
          author?: number | null
          body?: string
          created_at?: string | null
          downvotes?: number | null
          id?: never
          last_edit?: string | null
          opponent?: string
          player?: string
          rating?: number | null
          title?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "strategies_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategies_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategies_opponent_fkey"
            columns: ["opponent"]
            isOneToOne: false
            referencedRelation: "commanders"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "strategies_opponent_fkey"
            columns: ["opponent"]
            isOneToOne: false
            referencedRelation: "matchup_stats"
            referencedColumns: ["opponent"]
          },
          {
            foreignKeyName: "strategies_opponent_fkey"
            columns: ["opponent"]
            isOneToOne: false
            referencedRelation: "matchup_stats"
            referencedColumns: ["player"]
          },
          {
            foreignKeyName: "strategies_player_fkey"
            columns: ["player"]
            isOneToOne: false
            referencedRelation: "commanders"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "strategies_player_fkey"
            columns: ["player"]
            isOneToOne: false
            referencedRelation: "matchup_stats"
            referencedColumns: ["opponent"]
          },
          {
            foreignKeyName: "strategies_player_fkey"
            columns: ["player"]
            isOneToOne: false
            referencedRelation: "matchup_stats"
            referencedColumns: ["player"]
          },
        ]
      }
    }
    Views: {
      matchup_stats: {
        Row: {
          losses: number | null
          opponent: string | null
          player: string | null
          total: number | null
          win_rate: number | null
          wins: number | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          id: number | null
          username: string | null
        }
        Insert: {
          id?: number | null
          username?: string | null
        }
        Update: {
          id?: number | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_profile_id: { Args: never; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      vote: {
        Args: { is_upvote: boolean; strategy_id: number }
        Returns: undefined
      }
    }
    Enums: {
      faction: "Terran" | "Zerg" | "Protoss"
      user_role: "admin" | "author"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      faction: ["Terran", "Zerg", "Protoss"],
      user_role: ["admin", "author"],
    },
  },
} as const
