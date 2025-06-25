import { createClient } from './supabase/client';

// Create the singleton client with enhanced error handling
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
    
    // Add global error interceptor for the singleton instance
    const originalRequest = supabaseInstance.rest.fetch;
    
    supabaseInstance.rest.fetch = async (input, init) => {
      try {
        const response = await originalRequest.call(supabaseInstance!.rest, input, init);
        
        // Check for 401 errors that indicate invalid session
        if (response.status === 401) {
          console.log('🚨 [Supabase Singleton] Detected 401 error, session may be invalid');
          
          // Trigger a sign out to clear invalid session
          try {
            await supabaseInstance!.auth.signOut();
          } catch (signOutError) {
            console.error('❌ [Supabase Singleton] Error during signout:', signOutError);
          }
        }
        
        return response;
      } catch (error) {
        console.error('💥 [Supabase Singleton] Request error:', error);
        throw error;
      }
    };
  }
  return supabaseInstance;
})();

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
    };
  };
};