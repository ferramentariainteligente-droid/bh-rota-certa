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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bus_lines: {
        Row: {
          created_at: string
          full_title: string
          id: string
          line_number: string
          official_url: string
          route_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_title: string
          id?: string
          line_number: string
          official_url: string
          route_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_title?: string
          id?: string
          line_number?: string
          official_url?: string
          route_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      bus_schedules: {
        Row: {
          bus_line_id: string
          created_at: string
          departure_time: string
          id: string
        }
        Insert: {
          bus_line_id: string
          created_at?: string
          departure_time: string
          id?: string
        }
        Update: {
          bus_line_id?: string
          created_at?: string
          departure_time?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bus_schedules_bus_line_id_fkey"
            columns: ["bus_line_id"]
            isOneToOne: false
            referencedRelation: "bus_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_bus_lines: {
        Row: {
          created_at: string
          id: string
          last_scraped_at: string | null
          line_code: string
          line_name: string
          line_url: string
          metadata: Json | null
          route_description: string | null
          schedule_data: Json | null
          scraping_status: string
          source_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_scraped_at?: string | null
          line_code: string
          line_name: string
          line_url: string
          metadata?: Json | null
          route_description?: string | null
          schedule_data?: Json | null
          scraping_status?: string
          source_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_scraped_at?: string | null
          line_code?: string
          line_name?: string
          line_url?: string
          metadata?: Json | null
          route_description?: string | null
          schedule_data?: Json | null
          scraping_status?: string
          source_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scraped_bus_lines_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "scraping_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          execution_details: Json | null
          execution_id: string
          id: string
          lines_failed: number | null
          lines_found: number | null
          lines_processed: number | null
          lines_updated: number | null
          source_id: string | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          execution_details?: Json | null
          execution_id: string
          id?: string
          lines_failed?: number | null
          lines_found?: number | null
          lines_processed?: number | null
          lines_updated?: number | null
          source_id?: string | null
          started_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          execution_details?: Json | null
          execution_id?: string
          id?: string
          lines_failed?: number | null
          lines_found?: number | null
          lines_processed?: number | null
          lines_updated?: number | null
          source_id?: string | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scraping_logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "scraping_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_sources: {
        Row: {
          base_url: string
          created_at: string
          id: string
          is_active: boolean
          last_scraped_at: string | null
          name: string
          scraping_config: Json | null
          site_type: string
          updated_at: string
        }
        Insert: {
          base_url: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_scraped_at?: string | null
          name: string
          scraping_config?: Json | null
          site_type: string
          updated_at?: string
        }
        Update: {
          base_url?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_scraped_at?: string | null
          name?: string
          scraping_config?: Json | null
          site_type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
