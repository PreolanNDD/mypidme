import { createClient } from './supabase/client';

// Export the Database type and add complete schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
          share_data: boolean | null;
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
          share_data?: boolean | null;
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
          share_data?: boolean | null;
          chart_config?: Json | null;
          experiment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      finding_votes: {
        Row: {
          id: string;
          user_id: string;
          finding_id: string;
          vote_type: 'upvote' | 'downvote';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          finding_id: string;
          vote_type: 'upvote' | 'downvote';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          finding_id?: string;
          vote_type?: 'upvote' | 'downvote';
          created_at?: string;
          updated_at?: string;
        };
      };
      finding_reports: {
        Row: {
          id: string;
          user_id: string;
          finding_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          finding_id: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          finding_id?: string;
          reason?: string | null;
          created_at?: string;
        };
      };
      trackable_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: 'INPUT' | 'OUTPUT';
          type: 'SCALE_1_10' | 'NUMERIC' | 'BOOLEAN' | 'TEXT';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: 'INPUT' | 'OUTPUT';
          type: 'SCALE_1_10' | 'NUMERIC' | 'BOOLEAN' | 'TEXT';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: 'INPUT' | 'OUTPUT';
          type?: 'SCALE_1_10' | 'NUMERIC' | 'BOOLEAN' | 'TEXT';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      logged_entries: {
        Row: {
          id: string;
          user_id: string;
          trackable_item_id: string;
          entry_date: string;
          numeric_value: number | null;
          text_value: string | null;
          boolean_value: boolean | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trackable_item_id: string;
          entry_date: string;
          numeric_value?: number | null;
          text_value?: string | null;
          boolean_value?: boolean | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          trackable_item_id?: string;
          entry_date?: string;
          numeric_value?: number | null;
          text_value?: string | null;
          boolean_value?: boolean | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      experiments: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          hypothesis: string;
          independent_variable_id: string;
          dependent_variable_id: string;
          start_date: string;
          end_date: string;
          status: 'ACTIVE' | 'COMPLETED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          hypothesis: string;
          independent_variable_id: string;
          dependent_variable_id: string;
          start_date: string;
          end_date: string;
          status: 'ACTIVE' | 'COMPLETED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          hypothesis?: string;
          independent_variable_id?: string;
          dependent_variable_id?: string;
          start_date?: string;
          end_date?: string;
          status?: 'ACTIVE' | 'COMPLETED';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}