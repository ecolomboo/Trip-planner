export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      checklist_items: {
        Row: {
          created_at: string;
          done: boolean;
          done_by: string | null;
          id: string;
          position: number;
          title: string;
          trip_id: string;
        };
        Insert: {
          created_at?: string;
          done?: boolean;
          done_by?: string | null;
          id?: string;
          position?: number;
          title: string;
          trip_id: string;
        };
        Update: {
          created_at?: string;
          done?: boolean;
          done_by?: string | null;
          id?: string;
          position?: number;
          title?: string;
          trip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checklist_items_done_by_fkey";
            columns: ["done_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checklist_items_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      days: {
        Row: {
          date: string;
          id: string;
          title: string;
          trip_id: string;
        };
        Insert: {
          date: string;
          id?: string;
          title?: string;
          trip_id: string;
        };
        Update: {
          date?: string;
          id?: string;
          title?: string;
          trip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "days_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      entries: {
        Row: {
          booking_status: Database["public"]["Enums"]["booking_status"];
          cost_per_person: number | null;
          created_at: string;
          date: string;
          id: string;
          notes: string | null;
          position: number;
          stop_id: string | null;
          time: string | null;
          title: string;
          trip_id: string;
          type: Database["public"]["Enums"]["entry_type"];
          updated_at: string;
          url: string | null;
        };
        Insert: {
          booking_status?: Database["public"]["Enums"]["booking_status"];
          cost_per_person?: number | null;
          created_at?: string;
          date: string;
          id?: string;
          notes?: string | null;
          position?: number;
          stop_id?: string | null;
          time?: string | null;
          title: string;
          trip_id: string;
          type: Database["public"]["Enums"]["entry_type"];
          updated_at?: string;
          url?: string | null;
        };
        Update: {
          booking_status?: Database["public"]["Enums"]["booking_status"];
          cost_per_person?: number | null;
          created_at?: string;
          date?: string;
          id?: string;
          notes?: string | null;
          position?: number;
          stop_id?: string | null;
          time?: string | null;
          title?: string;
          trip_id?: string;
          type?: Database["public"]["Enums"]["entry_type"];
          updated_at?: string;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "entries_stop_id_fkey";
            columns: ["stop_id"];
            isOneToOne: false;
            referencedRelation: "stops";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entries_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string;
          id: string;
          locale: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email: string;
          id: string;
          locale?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string;
          id?: string;
          locale?: string;
        };
        Relationships: [];
      };
      stops: {
        Row: {
          id: string;
          lat: number;
          lon: number;
          name: string;
          sort_order: number;
          trip_id: string;
        };
        Insert: {
          id?: string;
          lat: number;
          lon: number;
          name: string;
          sort_order?: number;
          trip_id: string;
        };
        Update: {
          id?: string;
          lat?: number;
          lon?: number;
          name?: string;
          sort_order?: number;
          trip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stops_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      trip_members: {
        Row: {
          role: Database["public"]["Enums"]["member_role"];
          trip_id: string;
          user_id: string;
        };
        Insert: {
          role?: Database["public"]["Enums"]["member_role"];
          trip_id: string;
          user_id: string;
        };
        Update: {
          role?: Database["public"]["Enums"]["member_role"];
          trip_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trips: {
        Row: {
          base_currency: string;
          created_at: string;
          end_date: string;
          exchange_rates: Json;
          id: string;
          name: string;
          start_date: string;
        };
        Insert: {
          base_currency?: string;
          created_at?: string;
          end_date: string;
          exchange_rates?: Json;
          id?: string;
          name: string;
          start_date: string;
        };
        Update: {
          base_currency?: string;
          created_at?: string;
          end_date?: string;
          exchange_rates?: Json;
          id?: string;
          name?: string;
          start_date?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_member: { Args: { p_trip_id: string }; Returns: boolean };
      join_default_trip: { Args: never; Returns: undefined };
    };
    Enums: {
      booking_status: "booked" | "to_book";
      entry_type:
        "flight" | "train" | "road_transfer" | "accommodation" | "tour" | "sight" | "meal" | "note";
      member_role: "owner" | "member";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      booking_status: ["booked", "to_book"],
      entry_type: [
        "flight",
        "train",
        "road_transfer",
        "accommodation",
        "tour",
        "sight",
        "meal",
        "note",
      ],
      member_role: ["owner", "member"],
    },
  },
} as const;
