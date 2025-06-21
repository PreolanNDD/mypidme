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
  console.log('Fetching community findings');
  
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
    console.error('Error fetching community findings:', findingsError);
    throw new Error(`Failed to fetch community findings: ${findingsError.message}`);
  }

  if (!findings || findings.length === 0) {
    console.log('No community findings found');
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
    console.error('Error fetching users:', usersError);
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

  console.log('Fetched community findings:', transformedData.length);
  return transformedData;
}

export async function getCommunityFindingById(findingId: string): Promise<CommunityFinding | null> {
  console.log('Fetching community finding by ID:', findingId);
  
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
    .eq('id', findingId)
    .eq('status', 'visible')
    .single();

  if (findingError) {
    if (findingError.code === 'PGRST116') {
      console.log('Finding not found:', findingId);
      return null;
    }
    console.error('Error fetching finding:', findingError);
    throw new Error(`Failed to fetch finding: ${findingError.message}`);
  }

  if (!finding) {
    console.log('No finding found with ID:', findingId);
    return null;
  }

  // Fetch author details separately
  const { data: author, error: authorError } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('id', finding.author_id)
    .single();

  if (authorError) {
    console.error('Error fetching author:', authorError);
    // Continue without author details
  }

  const transformedData = {
    ...finding,
    author: author ? {
      first_name: author.first_name,
      last_name: author.last_name
    } : undefined
  };

  console.log('Fetched finding with author:', transformedData);
  return transformedData;
}

export async function getUserFindings(userId: string): Promise<CommunityFinding[]> {
  console.log('🔍 [getUserFindings] === STARTING USER FINDINGS FETCH ===');
  console.log('🔍 [getUserFindings] Input userId:', userId);
  console.log('🔍 [getUserFindings] Timestamp:', new Date().toISOString());
  
  // Validate input
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    console.error('❌ [getUserFindings] Invalid userId provided:', { userId, type: typeof userId });
    return [];
  }

  const trimmedUserId = userId.trim();
  console.log('🔍 [getUserFindings] Trimmed userId:', trimmedUserId);

  try {
    console.log('📊 [getUserFindings] Step 1: Executing Supabase query...');
    console.log('📊 [getUserFindings] Query details:', {
      table: 'community_findings',
      filter: `author_id = ${trimmedUserId}`,
      orderBy: 'created_at DESC'
    });

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

    console.log('📊 [getUserFindings] Step 2: Query completed');
    console.log('📊 [getUserFindings] Raw query result:', {
      hasError: !!findingsError,
      errorCode: findingsError?.code,
      errorMessage: findingsError?.message,
      dataLength: findings?.length || 0,
      dataExists: !!findings
    });

    if (findingsError) {
      console.error('❌ [getUserFindings] Database error occurred:', {
        error: findingsError,
        code: findingsError.code,
        message: findingsError.message,
        details: findingsError.details,
        hint: findingsError.hint
      });
      // Return empty array instead of throwing to prevent notFound() from being called
      return [];
    }

    console.log('📊 [getUserFindings] Step 3: Processing query results...');
    
    if (!findings) {
      console.log('⚠️ [getUserFindings] Query returned null/undefined data');
      return [];
    }

    if (findings.length === 0) {
      console.log('📊 [getUserFindings] No findings found for user');
      console.log('📊 [getUserFindings] This could mean:');
      console.log('  - User has not created any findings yet');
      console.log('  - User ID does not match any author_id in the database');
      console.log('  - Database connection issue');
      return [];
    }

    console.log('✅ [getUserFindings] Found findings for user:', {
      count: findings.length,
      findingIds: findings.map(f => f.id),
      findingTitles: findings.map(f => f.title),
      statuses: findings.map(f => f.status),
      createdDates: findings.map(f => f.created_at)
    });

    // Log each finding in detail
    findings.forEach((finding, index) => {
      console.log(`📄 [getUserFindings] Finding ${index + 1}:`, {
        id: finding.id,
        title: finding.title,
        status: finding.status,
        author_id: finding.author_id,
        upvotes: finding.upvotes,
        downvotes: finding.downvotes,
        share_data: finding.share_data,
        created_at: finding.created_at,
        content_length: finding.content?.length || 0
      });
    });

    console.log('📊 [getUserFindings] Step 4: Transforming data...');
    
    // For user's findings, we don't need to fetch author details since it's the same user
    const transformedData = findings.map((finding, index) => {
      console.log(`🔄 [getUserFindings] Transforming finding ${index + 1}:`, finding.id);
      return {
        ...finding,
        author: undefined // We don't need author details for user's own findings
      };
    });

    console.log('✅ [getUserFindings] Step 5: Transformation complete');
    console.log('✅ [getUserFindings] Final result:', {
      totalFindings: transformedData.length,
      findingIds: transformedData.map(f => f.id),
      allHaveRequiredFields: transformedData.every(f => f.id && f.title && f.content && f.author_id)
    });

    console.log('🎉 [getUserFindings] === USER FINDINGS FETCH COMPLETED SUCCESSFULLY ===');
    return transformedData;

  } catch (error) {
    console.error('💥 [getUserFindings] === UNEXPECTED ERROR OCCURRED ===');
    console.error('💥 [getUserFindings] Error details:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'No stack trace',
      userId: trimmedUserId,
      timestamp: new Date().toISOString()
    });
    
    // Return empty array instead of throwing to prevent notFound() from being called
    return [];
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  console.log('👤 [getUserProfile] === STARTING USER PROFILE FETCH ===');
  console.log('👤 [getUserProfile] Input userId:', userId);
  console.log('👤 [getUserProfile] Timestamp:', new Date().toISOString());
  
  // Validate input
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    console.error('❌ [getUserProfile] Invalid userId provided:', { userId, type: typeof userId });
    return null;
  }

  const trimmedUserId = userId.trim();
  console.log('👤 [getUserProfile] Trimmed userId:', trimmedUserId);

  try {
    console.log('📊 [getUserProfile] Step 1: Querying users table...');
    
    // First try to get from users table
    const { data: user, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, created_at')
      .eq('id', trimmedUserId)
      .single();

    console.log('📊 [getUserProfile] Step 2: Users table query completed');
    console.log('📊 [getUserProfile] Query result:', {
      hasError: !!error,
      errorCode: error?.code,
      errorMessage: error?.message,
      userData: user ? {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at
      } : null
    });

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️ [getUserProfile] User not found in users table, checking auth.users:', trimmedUserId);
        
        // Create admin client with service role key for auth operations
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        console.log('🔑 [getUserProfile] Environment check:', {
          hasSupabaseUrl: !!supabaseUrl,
          hasServiceRoleKey: !!serviceRoleKey,
          supabaseUrlLength: supabaseUrl?.length || 0,
          serviceRoleKeyLength: serviceRoleKey?.length || 0
        });
        
        if (!supabaseUrl || !serviceRoleKey) {
          console.error('❌ [getUserProfile] Missing Supabase configuration for admin operations');
          return null;
        }
        
        console.log('🔧 [getUserProfile] Step 3: Creating admin client...');
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        console.log('🔍 [getUserProfile] Step 4: Checking auth.users table...');
        
        // If not found in users table, check if they exist in auth.users
        // This handles cases where a user exists but doesn't have a profile yet
        const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(trimmedUserId);
        
        console.log('📊 [getUserProfile] Step 5: Auth.users query completed');
        console.log('📊 [getUserProfile] Auth query result:', {
          hasError: !!authError,
          errorMessage: authError?.message,
          hasAuthUser: !!authUser?.user,
          authUserId: authUser?.user?.id,
          authUserEmail: authUser?.user?.email,
          authUserMetadata: authUser?.user?.user_metadata
        });
        
        if (authError || !authUser.user) {
          console.log('❌ [getUserProfile] User not found in auth.users either:', trimmedUserId);
          return null;
        }
        
        // User exists in auth but not in users table - create a basic profile
        console.log('🔧 [getUserProfile] Step 6: Creating basic profile for auth user:', trimmedUserId);
        console.log('🔧 [getUserProfile] Auth user metadata:', authUser.user.user_metadata);
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: trimmedUserId,
            first_name: authUser.user.user_metadata?.first_name || null,
            last_name: authUser.user.user_metadata?.last_name || null
          })
          .select('id, first_name, last_name, created_at')
          .single();
        
        console.log('📊 [getUserProfile] Step 7: Profile creation completed');
        console.log('📊 [getUserProfile] Creation result:', {
          hasError: !!createError,
          errorMessage: createError?.message,
          newUserData: newUser
        });
        
        if (createError) {
          console.error('❌ [getUserProfile] Error creating user profile:', createError);
          // Return a basic profile even if creation fails
          const fallbackProfile = {
            id: trimmedUserId,
            first_name: authUser.user.user_metadata?.first_name || null,
            last_name: authUser.user.user_metadata?.last_name || null,
            created_at: authUser.user.created_at || new Date().toISOString()
          };
          console.log('🔄 [getUserProfile] Returning fallback profile:', fallbackProfile);
          return fallbackProfile;
        }
        
        console.log('✅ [getUserProfile] Profile created successfully:', newUser);
        return newUser;
      }
      console.error('❌ [getUserProfile] Database error fetching user profile:', error);
      return null;
    }

    console.log('✅ [getUserProfile] User profile found:', user);
    console.log('🎉 [getUserProfile] === USER PROFILE FETCH COMPLETED SUCCESSFULLY ===');
    return user;
    
  } catch (error) {
    console.error('💥 [getUserProfile] === UNEXPECTED ERROR OCCURRED ===');
    console.error('💥 [getUserProfile] Error details:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'No stack trace',
      userId: trimmedUserId,
      timestamp: new Date().toISOString()
    });
    return null;
  }
}

export async function getUserVotes(userId: string, findingIds: string[]): Promise<FindingVote[]> {
  if (findingIds.length === 0) return [];
  
  console.log('🗳️ [getUserVotes] Fetching user votes for findings:', { userId, findingIds });
  
  const { data, error } = await supabase
    .from('finding_votes')
    .select('*')
    .eq('user_id', userId)
    .in('finding_id', findingIds);

  if (error) {
    console.error('❌ [getUserVotes] Error fetching user votes:', error);
    throw new Error(`Failed to fetch user votes: ${error.message}`);
  }

  console.log('✅ [getUserVotes] Fetched user votes:', data?.length || 0, 'votes:', data);
  return data || [];
}

// Note: castVote and reportFinding functions have been moved to Server Actions
// They are no longer needed in this client-side library file
// The Server Actions handle all the database mutations with proper authentication

export async function createFinding(userId: string, title: string, content: string): Promise<CommunityFinding> {
  console.log('Creating finding:', { userId, title, content });
  
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
    console.error('Error creating finding:', error);
    throw new Error(`Failed to create finding: ${error.message}`);
  }

  console.log('Finding created successfully:', data);
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
  console.log('Creating finding with context:', findingData);
  
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
    console.error('Error creating finding:', error);
    throw new Error(`Failed to create finding: ${error.message}`);
  }

  console.log('Finding created successfully:', data);
  return {
    ...data,
    author: undefined // Author details not populated for creation operations
  };
}