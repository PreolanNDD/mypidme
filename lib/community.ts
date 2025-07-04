import { createClient } from './supabase/client';
import { Database } from './supabase';

export interface CommunityFinding {
  id: string;
  author_id: string;
  title: string;
  content: string;
  status: 'visible' | 'hidden_by_community';
  upvotes: number;
  downvotes: number;
  share_data: boolean | null;
  chart_config: any | null;
  experiment_id: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export interface FindingVote {
  id: string;
  user_id: string;
  finding_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
  updated_at: string;
}

export interface FindingReport {
  id: string;
  user_id: string;
  finding_id: string;
  reason: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

// Define the exact shape of data returned by Supabase queries with joins
interface CommunityFindingQueryResult {
  id: string;
  author_id: string;
  title: string;
  content: string;
  status: 'visible' | 'hidden_by_community';
  upvotes: number;
  downvotes: number;
  share_data: boolean | null;
  chart_config: any | null;
  experiment_id: string | null;
  created_at: string;
  updated_at: string;
  author: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

type CommunityFindingRow = Database['public']['Tables']['community_findings']['Row'];

export async function getCommunityFindings(): Promise<CommunityFinding[]> {
  console.log('🔍 [getCommunityFindings] Fetching community findings with author details...');
  
  const supabase = createClient();
  
  // Fetch findings with author details in a single query using JOIN
  const { data: findings, error: findingsError } = await supabase
    .from('community_findings')
    .select(`
      id,
      author_id,
      title,
      content,
      status,
      upvotes,
      downvotes,
      share_data,
      chart_config,
      experiment_id,
      created_at,
      updated_at,
      author:users!community_findings_author_id_fkey(
        first_name,
        last_name
      )
    `)
    .eq('status', 'visible')
    .order('created_at', { ascending: false })
    .returns<CommunityFindingQueryResult[]>();

  if (findingsError) {
    console.error('❌ [getCommunityFindings] Error fetching findings:', findingsError);
    throw new Error(`Failed to fetch community findings: ${findingsError.message}`);
  }

  if (!findings || findings.length === 0) {
    console.log('📭 [getCommunityFindings] No findings found');
    return [];
  }

  console.log(`✅ [getCommunityFindings] Successfully fetched ${findings.length} findings with author details`);
  
  // Log sample author data for debugging
  if (findings.length > 0) {
    console.log('📝 [getCommunityFindings] Sample author data:', {
      findingId: findings[0].id,
      authorId: findings[0].author_id,
      authorData: findings[0].author
    });
  }

  return findings as CommunityFinding[];
}

export async function getCommunityFindingById(findingId: string): Promise<CommunityFinding | null> {
  console.log(`🔍 [getCommunityFindingById] Fetching finding: ${findingId}`);
  
  // Validate input
  if (!findingId || typeof findingId !== 'string' || findingId.trim() === '') {
    console.log('❌ [getCommunityFindingById] Invalid findingId provided');
    return null;
  }

  const trimmedFindingId = findingId.trim();
  const supabase = createClient();

  try {
    // Fetch the finding with author details in a single query using JOIN
    const { data: finding, error: findingError } = await supabase
      .from('community_findings')
      .select(`
        id,
        author_id,
        title,
        content,
        status,
        upvotes,
        downvotes,
        share_data,
        chart_config,
        experiment_id,
        created_at,
        updated_at,
        author:users!community_findings_author_id_fkey(
          first_name,
          last_name
        )
      `)
      .eq('id', trimmedFindingId)
      .eq('status', 'visible')
      .single()
      .returns<CommunityFindingQueryResult>();

    if (findingError) {
      if (findingError.code === 'PGRST116') {
        console.log(`📭 [getCommunityFindingById] Finding not found: ${trimmedFindingId}`);
        return null;
      }
      console.error('❌ [getCommunityFindingById] Error fetching finding:', findingError);
      throw new Error(`Failed to fetch finding: ${findingError.message}`);
    }

    if (!finding) {
      console.log(`📭 [getCommunityFindingById] No finding data returned for: ${trimmedFindingId}`);
      return null;
    }

    console.log(`✅ [getCommunityFindingById] Successfully fetched finding with author details:`, {
      findingId: finding.id,
      authorId: finding.author_id,
      authorData: finding.author
    });

    return finding as CommunityFinding;

  } catch (error) {
    console.error('💥 [getCommunityFindingById] Unexpected error:', error);
    throw error;
  }
}

export async function getUserFindings(userId: string): Promise<CommunityFinding[]> {
  console.log(`🔍 [getUserFindings] Fetching findings for user: ${userId}`);
  
  // Validate input
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    console.log('❌ [getUserFindings] Invalid userId provided');
    return [];
  }

  const trimmedUserId = userId.trim();
  const supabase = createClient();

  try {
    // Fetch ALL findings by the user (any status) - this is for their profile page
    // We want to show all their published findings, not just visible ones
    const { data: findings, error: findingsError } = await supabase
      .from('community_findings')
      .select(`
        id,
        author_id,
        title,
        content,
        status,
        upvotes,
        downvotes,
        share_data,
        chart_config,
        experiment_id,
        created_at,
        updated_at
      `)
      .eq('author_id', trimmedUserId)
      .order('created_at', { ascending: false });

    if (findingsError) {
      console.error('❌ [getUserFindings] Error fetching user findings:', findingsError);
      // Return empty array instead of throwing to prevent notFound() from being called
      return [];
    }

    if (!findings) {
      console.log(`📭 [getUserFindings] No findings data returned for user: ${trimmedUserId}`);
      return [];
    }

    if (findings.length === 0) {
      console.log(`📭 [getUserFindings] No findings found for user: ${trimmedUserId}`);
      return [];
    }

    console.log(`✅ [getUserFindings] Successfully fetched ${findings.length} findings for user: ${trimmedUserId}`);

    // Since the author property is optional in CommunityFinding interface,
    // we can directly cast the findings to CommunityFinding[]
    return findings.map(finding => ({
      ...finding,
      share_data: finding.share_data as boolean | null
    })) as CommunityFinding[];

  } catch (error) {
    console.error('💥 [getUserFindings] Unexpected error:', error);
    // Return empty array instead of throwing to prevent notFound() from being called
    return [];
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  console.log(`🔍 [getUserProfile] Fetching profile for user: ${userId}`);
  
  // Validate input
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    console.log('❌ [getUserProfile] Invalid userId provided');
    return null;
  }

  const trimmedUserId = userId.trim();
  const supabase = createClient();

  try {
    // First try to get from users table
    const { data: user, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, created_at')
      .eq('id', trimmedUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`📭 [getUserProfile] User not found in users table: ${trimmedUserId}`);
        
        // Create admin client with service role key for auth operations
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !serviceRoleKey) {
          console.log('❌ [getUserProfile] Missing Supabase environment variables for admin operations');
          return null;
        }
        
        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        // If not found in users table, check if they exist in auth.users
        // This handles cases where a user exists but doesn't have a profile yet
        const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(trimmedUserId);
        
        if (authError || !authUser.user) {
          console.log(`📭 [getUserProfile] User not found in auth.users: ${trimmedUserId}`);
          return null;
        }
        
        console.log(`🔧 [getUserProfile] Creating profile for existing auth user: ${trimmedUserId}`);
        
        // User exists in auth but not in users table - create a basic profile
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: trimmedUserId,
            first_name: authUser.user.user_metadata?.first_name || null,
            last_name: authUser.user.user_metadata?.last_name || null
          })
          .select('id, first_name, last_name, created_at')
          .single();
        
        if (createError) {
          console.error('❌ [getUserProfile] Error creating user profile:', createError);
          // Return a basic profile even if creation fails
          const fallbackProfile = {
            id: trimmedUserId,
            first_name: authUser.user.user_metadata?.first_name || null,
            last_name: authUser.user.user_metadata?.last_name || null,
            created_at: authUser.user.created_at || new Date().toISOString()
          };
          console.log('🔧 [getUserProfile] Returning fallback profile:', fallbackProfile);
          return fallbackProfile as UserProfile;
        }
        
        console.log(`✅ [getUserProfile] Successfully created profile for user: ${trimmedUserId}`, newUser);
        return newUser as UserProfile;
      }
      console.error('❌ [getUserProfile] Error fetching user profile:', error);
      return null;
    }

    console.log(`✅ [getUserProfile] Successfully fetched profile for user: ${trimmedUserId}`, {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name
    });

    return user as UserProfile;
    
  } catch (error) {
    console.error('💥 [getUserProfile] Unexpected error:', error);
    return null;
  }
}

export async function getUserVotes(userId: string, findingIds: string[]): Promise<FindingVote[]> {
  if (findingIds.length === 0) return [];
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('finding_votes')
    .select('*')
    .eq('user_id', userId)
    .in('finding_id', findingIds);

  if (error) {
    throw new Error(`Failed to fetch user votes: ${error.message}`);
  }

  return (data || []) as FindingVote[];
}

// Note: castVote and reportFinding functions have been moved to Server Actions
// They are no longer needed in this client-side library file
// The Server Actions handle all the database mutations with proper authentication

export async function createFinding(userId: string, title: string, content: string): Promise<CommunityFinding> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('community_findings')
    .insert({
      author_id: userId,
      title: title.trim(),
      content: content.trim()
      // No need to set status - database defaults to 'visible'
    })
    .select(`
      id,
      author_id,
      title,
      content,
      status,
      upvotes,
      downvotes,
      share_data,
      chart_config,
      experiment_id,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create finding: ${error.message}`);
  }

  return {
    ...data,
    share_data: data.share_data as boolean | null,
    author: undefined // Author details not populated for creation operations
  } as CommunityFinding;
}

export async function createFindingWithContext(findingData: {
  user_id: string;
  title: string;
  content: string;
  share_data: boolean;
  chart_config?: any;
  experiment_id?: string;
}): Promise<CommunityFinding> {
  const supabase = createClient();
  
  // Map user_id to author_id for the database insert
  const insertData = {
    author_id: findingData.user_id,
    title: findingData.title,
    content: findingData.content,
    share_data: findingData.share_data,
    chart_config: findingData.chart_config,
    experiment_id: findingData.experiment_id
    // No need to set status - database defaults to 'visible'
  };
  
  const { data, error } = await supabase
    .from('community_findings')
    .insert(insertData)
    .select(`
      id,
      author_id,
      title,
      content,
      status,
      upvotes,
      downvotes,
      share_data,
      chart_config,
      experiment_id,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create finding: ${error.message}`);
  }

  return {
    ...data,
    share_data: data.share_data as boolean | null,
    author: undefined // Author details not populated for creation operations
  } as CommunityFinding;
}

export async function deleteFinding(findingId: string): Promise<void> {
  console.log(`🗑️ [deleteFinding] Deleting finding: ${findingId}`);
  
  if (!findingId) {
    throw new Error('Finding ID is required to delete finding');
  }

  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('community_findings')
      .delete()
      .eq('id', findingId);

    if (error) {
      console.error('❌ [deleteFinding] Error deleting finding:', error);
      throw new Error(`Failed to delete finding: ${error.message}`);
    }

    console.log(`✅ [deleteFinding] Successfully deleted finding: ${findingId}`);
  } catch (error) {
    console.error('💥 [deleteFinding] Unexpected error:', error);
    throw error;
  }
}