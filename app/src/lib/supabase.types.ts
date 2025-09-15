export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      education: {
        Row: {
          created_at: string
          degree: string | null
          id: string
          professional_id: string
          school: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          degree?: string | null
          id?: string
          professional_id: string
          school?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          degree?: string | null
          id?: string
          professional_id?: string
          school?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "education_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_profile_id"]
          },
        ]
      }
      links: {
        Row: {
          created_at: string
          id: string
          professional_id: string
          summary: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          professional_id: string
          summary?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          professional_id?: string
          summary?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_profile_id"]
          },
        ]
      }
      professionals: {
        Row: {
          created_at: string
          profile_summary: string | null
          tags: string[] | null
          updated_at: string
          user_profile_id: string
          value_profile: string | null
        }
        Insert: {
          created_at?: string
          profile_summary?: string | null
          tags?: string[] | null
          updated_at?: string
          user_profile_id: string
          value_profile?: string | null
        }
        Update: {
          created_at?: string
          profile_summary?: string | null
          tags?: string[] | null
          updated_at?: string
          user_profile_id?: string
          value_profile?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string
          id: string
          level: Database["public"]["Enums"]["skill_level"] | null
          professional_id: string
          skill: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["skill_level"] | null
          professional_id: string
          skill?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["skill_level"] | null
          professional_id?: string
          skill?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_profile_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          active: boolean
          birth_date: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          photo_url: string | null
          suffix: string | null
          thumb_url: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          birth_date?: string | null
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          photo_url?: string | null
          suffix?: string | null
          thumb_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          birth_date?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          photo_url?: string | null
          suffix?: string | null
          thumb_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      work_history: {
        Row: {
          created_at: string
          id: string
          organization: string | null
          professional_id: string
          role: string | null
          summary: string | null
          updated_at: string
          year_end: number | null
          year_start: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          organization?: string | null
          professional_id: string
          role?: string | null
          summary?: string | null
          updated_at?: string
          year_end?: number | null
          year_start?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          organization?: string | null
          professional_id?: string
          role?: string | null
          summary?: string | null
          updated_at?: string
          year_end?: number | null
          year_start?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "work_history_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_profile_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      refresh_professional_value_profile: {
        Args: { p_professional_id: string }
        Returns: undefined
      }
    }
    Enums: {
      skill_level: "beginner" | "intermediate" | "expert"
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
      skill_level: ["beginner", "intermediate", "expert"],
    },
  },
} as const

