import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

export interface CommunityFinding {
  id: string;
  author_id: string;
  title: string;
  content: string;
  status: 'visible' | 'hidden_by_community';
  upvotes: number;
  downvotes: number;
  share_data: boolean;
  chart_config: any | null;
  experiment_id: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    first_name: string | null;
    last_name: string | null;
  };
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

export async function getCommunityFindings(): Promise<CommunityFinding[]> {
  // First, fetch the findings (only visible ones)
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
    .eq('status', 'visible')
    .order('created_at', { ascending: false });

  if (findingsError) {
    throw new Error(`Failed to fetch community findings: ${findingsError.message}`);
  }

  if (!findings || findings.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = Array.from(new Set(findings.map(finding => finding.author_id)));
  
  // Fetch user details
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .in('id', userIds);

  if (usersError) {
    // Don't throw here, just continue without author details
  }

  // Create a map of user details for quick lookup
  const userMap = new Map();
  if (users) {
    users.forEach(user => {
      userMap.set(user.id, {
        first_name: user.first_name,
        last_name: user.last_name
      });
    });
  }

  // Merge findings with author details
  const transformedData = findings.map(finding => ({
    ...finding,
    author: userMap.get(finding.author_id) || undefined
  }));

  return transformedData;
}

export async function getCommunityFindingById(findingId: string): Promise<CommunityFinding | null> {
  // Validate input
  if (!findingId || typeof findingId !== 'string' || findingId.trim() === '') {
    return null;
  }

  const trimmedFindingId = findingId.trim();

  try {
    // Fetch the finding
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
        updated_at
      `)
      .eq('id', trimmedFindingId)
      .eq('status', 'visible')
      .single();

    if (findingError) {
      if (findingError.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch finding: ${findingError.message}`);
    }

    if (!finding) {
      return null;
    }

    // Fetch author details separately
    const { data: author, error: authorError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('id', finding.author_id)
      .single();

    if (authorError) {
      if (authorError.code === 'PGRST116') {
        // Author not found - continue without author details
      } else {
        // Continue without author details instead of throwing
      }
    }

    const transformedData = {
      ...finding,
      author: author ? {
        first_name: author.first_name,
        last_name: author.last_name
      } : undefined
    };

    return transformedData;

  } catch (error) {
    throw error;
  }
}

export async function getUserFindings(userId: string): Promise<CommunityFinding[]> {
  // Validate input
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return [];
  }

  const trimmedUserId = userId.trim();

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
      // Return empty array instead of throwing to prevent notFound() from being called
      return [];
    }

    if (!findings) {
      return [];
    }

    if (findings.length === 0) {
      return [];
    }

    // For user's findings, we don't need to fetch author details since it's the same user
    const transformedData = findings.map((finding) => {
      return {
        ...finding,
        author: undefined // We don't need author details for user's own findings
      };
    });

    return transformedData;

  } catch (error) {
    // Return empty array instead of throwing to prevent notFound() from being called
    return [];
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // Validate input
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return null;
  }

  const trimmedUserId = userId.trim();

  try {
    // First try to get from users table
    const { data: user, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, created_at')
      .eq('id', trimmedUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Create admin client with service role key for auth operations
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !serviceRoleKey) {
          return null;
        }
        
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        // If not found in users table, check if they exist in auth.users
        // This handles cases where a user exists but doesn't have a profile yet
        const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(trimmedUserId);
        
        if (authError || !authUser.user) {
          return null;
        }
        
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
          // Return a basic profile even if creation fails
          const fallbackProfile = {
            id: trimmedUserId,
            first_name: authUser.user.user_metadata?.first_name || null,
            last_name: authUser.user.user_metadata?.last_name || null,
            created_at: authUser.user.created_at || new Date().toISOString()
          };
          return fallbackProfile;
        }
        
        return newUser;
      }
      return null;
    }

    return user;
    
  } catch (error) {
    return null;
  }
}

export async function getUserVotes(userId: string, findingIds: string[]): Promise<FindingVote[]> {
  if (findingIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('finding_votes')
    .select('*')
    .eq('user_id', userId)
    .in('finding_id', findingIds);

  if (error) {
    throw new Error(`Failed to fetch user votes: ${error.message}`);
  }

  return data || [];
}

// Note: castVote and reportFinding functions have been moved to Server Actions
// They are no longer needed in this client-side library file
// The Server Actions handle all the database mutations with proper authentication

export async function createFinding(userId: string, title: string, content: string): Promise<CommunityFinding> {
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
    author: undefined // Author details not populated for creation operations
  };
}

export async function createFindingWithContext(findingData: {
  user_id: string;
  title: string;
  content: string;
  share_data: boolean;
  chart_config?: any;
  experiment_id?: string;
}): Promise<CommunityFinding> {
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
    author: undefined // Author details not populated for creation operations
  };
}