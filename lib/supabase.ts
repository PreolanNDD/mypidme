import { createClient } from './supabase/client';

// Export the Database type and add complete schema
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
      users: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_findings: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          status: string;
          upvotes: number;
          downvotes: number;
          share_data: Json | null;
          chart_config: Json | null;
          experiment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          content: string;
          status?: string;
          upvotes?: number;
          downvotes?: number;
          share_data?: Json | null;
          chart_config?: Json | null;
          experiment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          content?: string;
          status?: string;
          upvotes?: number;
          downvotes?: number;
          share_data?: Json | null;
          chart_config?: Json | null;
          experiment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};