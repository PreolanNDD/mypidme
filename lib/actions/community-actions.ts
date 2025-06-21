'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface CreateFindingData {
  title: string;
  content: string;
  share_data: boolean;
  chart_config?: any;
  experiment_id?: string;
}

// Updated signature for useFormState compatibility
export async function createFindingAction(
  prevState: { message: string },
  formData: FormData
) {
  const startTime = Date.now();
  console.log('🚀 [createFindingAction] === SERVER ACTION STARTED ===');
  console.log('🚀 [createFindingAction] Timestamp:', new Date().toISOString());
  console.log('🚀 [createFindingAction] Previous state:', prevState);

  try {
    console.log('🔧 [createFindingAction] Step 1: Creating Supabase client...');
    // Create authenticated Supabase client
    const supabase = createClient();
    console.log('✅ [createFindingAction] Supabase client created successfully');
    
    console.log('🔐 [createFindingAction] Step 2: Getting authenticated user...');
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ [createFindingAction] Authentication error:', {
        error: userError,
        code: userError.code,
        message: userError.message
      });
      return { message: 'You must be logged in to create a finding' };
    }

    if (!user) {
      console.error('❌ [createFindingAction] No user found in session');
      return { message: 'You must be logged in to create a finding' };
    }

    console.log('✅ [createFindingAction] User authenticated successfully:', {
      userId: user.id,
      email: user.email,
      lastSignIn: user.last_sign_in_at,
      role: user.role,
      appMetadata: user.app_metadata,
      userMetadata: user.user_metadata
    });

    console.log('📝 [createFindingAction] Step 3: Extracting form data...');
    // Extract data from FormData
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const shareData = formData.get('shareData') === 'on'; // Checkbox value is 'on' when checked
    const chartConfigStr = formData.get('chartConfig') as string;
    const experimentId = formData.get('experimentId') as string;

    console.log('📝 [createFindingAction] Raw form data extracted:', {
      title: title ? `"${title}" (${title.length} chars)` : 'null',
      content: content ? `"${content.substring(0, 100)}${content.length > 100 ? '...' : ''}" (${content.length} chars)` : 'null',
      shareData,
      chartConfigStr: chartConfigStr ? `"${chartConfigStr}" (${chartConfigStr.length} chars)` : 'null',
      experimentId: experimentId || 'null'
    });

    console.log('✅ [createFindingAction] Step 4: Validating required fields...');
    // Validate required fields
    if (!title?.trim()) {
      console.error('❌ [createFindingAction] Validation failed: Title is missing or empty');
      return { message: 'Title is required' };
    }
    if (!content?.trim()) {
      console.error('❌ [createFindingAction] Validation failed: Content is missing or empty');
      return { message: 'Content is required' };
    }

    console.log('✅ [createFindingAction] Required fields validation passed');

    console.log('🔧 [createFindingAction] Step 5: Processing chart config...');
    // Parse chart config if provided
    let chartConfig = null;
    if (chartConfigStr) {
      try {
        chartConfig = JSON.parse(chartConfigStr);
        console.log('✅ [createFindingAction] Chart config parsed successfully:', chartConfig);
      } catch (error) {
        console.error('❌ [createFindingAction] Invalid chart config JSON:', {
          error,
          chartConfigStr,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
        return { message: 'Invalid chart configuration' };
      }
    } else {
      console.log('ℹ️ [createFindingAction] No chart config provided');
    }

    console.log('📊 [createFindingAction] Step 6: Preparing database insert data...');
    const insertData = {
      author_id: user.id, // Associate with the authenticated user
      title: title.trim(),
      content: content.trim(),
      share_data: shareData,
      chart_config: chartConfig,
      experiment_id: experimentId || null
    };

    console.log('📊 [createFindingAction] Insert data prepared:', {
      author_id: insertData.author_id,
      title: `"${insertData.title}" (${insertData.title.length} chars)`,
      content: `"${insertData.content.substring(0, 100)}${insertData.content.length > 100 ? '...' : ''}" (${insertData.content.length} chars)`,
      share_data: insertData.share_data,
      chart_config: insertData.chart_config ? 'Present' : 'null',
      experiment_id: insertData.experiment_id || 'null'
    });

    console.log('💾 [createFindingAction] Step 7: Inserting finding into database...');
    const { data: newFinding, error: insertError } = await supabase
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

    if (insertError) {
      console.error('❌ [createFindingAction] Database insert failed:', {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        insertData
      });
      return { message: `Failed to create finding: ${insertError.message}` };
    }

    if (!newFinding) {
      console.error('❌ [createFindingAction] Database insert succeeded but no data returned');
      return { message: 'Failed to create finding: No data returned from database' };
    }

    console.log('✅ [createFindingAction] Finding created successfully in database:', {
      id: newFinding.id,
      title: newFinding.title,
      status: newFinding.status,
      upvotes: newFinding.upvotes,
      downvotes: newFinding.downvotes,
      share_data: newFinding.share_data,
      created_at: newFinding.created_at
    });

    console.log('🔄 [createFindingAction] Step 8: Revalidating community page cache...');
    try {
      revalidatePath('/community');
      console.log('✅ [createFindingAction] Cache revalidated successfully for /community');
    } catch (revalidateError) {
      console.error('⚠️ [createFindingAction] Cache revalidation failed (non-critical):', revalidateError);
    }

    const executionTime = Date.now() - startTime;
    console.log(`🎯 [createFindingAction] Step 9: Redirecting to finding detail page...`);
    console.log(`✅ [createFindingAction] === SERVER ACTION COMPLETED SUCCESSFULLY ===`);
    console.log(`⏱️ [createFindingAction] Total execution time: ${executionTime}ms`);
    console.log(`🎯 [createFindingAction] Redirecting to: /community/${newFinding.id}`);
    
    // Step 3: Redirect to the new finding's detail page
    // Note: This will throw a NEXT_REDIRECT error, which is expected behavior in Next.js Server Actions
    redirect(`/community/${newFinding.id}`);

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    // Check if this is a Next.js redirect (which is expected)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      console.log('🎯 [createFindingAction] Redirect successful (NEXT_REDIRECT is expected behavior)');
      // Re-throw the redirect to let Next.js handle it
      throw error;
    }
    
    // Only log actual errors, not redirects
    console.error('💥 [createFindingAction] === SERVER ACTION FAILED ===');
    console.error('💥 [createFindingAction] Critical error occurred:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'No stack trace',
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString()
    });
    return { message: 'An unexpected error occurred while creating the finding' };
  }
}

export interface ShareFindingData {
  type: 'chart' | 'experiment';
  title: string;
  content: string;
  share_data: boolean;
  // For chart context
  primaryMetricId?: string;
  comparisonMetricId?: string | null;
  dateRange?: number;
  // For experiment context
  experimentId?: string;
}

export async function shareFindingAction(data: ShareFindingData) {
  console.log('🚀 [shareFindingAction] Starting share finding action with data:', {
    type: data.type,
    title: data.title,
    content_length: data.content.length,
    share_data: data.share_data
  });

  try {
    // Create authenticated Supabase client
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ [shareFindingAction] Authentication failed:', userError);
      throw new Error('You must be logged in to share a finding');
    }

    console.log('✅ [shareFindingAction] User authenticated:', user.id);

    // Prepare the finding data based on context type
    const insertData = {
      author_id: user.id,
      title: data.title,
      content: data.content,
      share_data: data.share_data,
      chart_config: null as any,
      experiment_id: null as string | null
    };

    // Add context-specific data
    if (data.type === 'chart') {
      insertData.chart_config = {
        primaryMetricId: data.primaryMetricId,
        comparisonMetricId: data.comparisonMetricId,
        dateRange: data.dateRange
      };
    } else if (data.type === 'experiment') {
      insertData.experiment_id = data.experimentId || null;
    }

    console.log('📝 [shareFindingAction] Creating finding in database...');

    const { data: newFinding, error: insertError } = await supabase
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

    if (insertError) {
      console.error('❌ [shareFindingAction] Database insert failed:', insertError);
      throw new Error(`Failed to share finding: ${insertError.message}`);
    }

    console.log('✅ [shareFindingAction] Finding shared successfully:', {
      id: newFinding.id,
      title: newFinding.title
    });

    // Revalidate the community page cache
    console.log('🔄 [shareFindingAction] Revalidating community page cache...');
    revalidatePath('/community');
    console.log('✅ [shareFindingAction] Cache revalidated for /community');

    // Return the new finding data instead of redirecting
    // This allows the client to handle the success state
    return {
      success: true,
      finding: newFinding
    };

  } catch (error) {
    console.error('❌ [shareFindingAction] Server action failed:', error);
    throw error; // Re-throw to be handled by the client
  }
}

// --- VOTE ACTION ---
export async function castVoteAction(
  userId: string,
  findingId: string,
  voteType: 'upvote' | 'downvote'
) {
  console.log('🗳️ [castVoteAction] Starting vote action:', { userId, findingId, voteType });

  if (!userId || !findingId) {
    return { error: 'User and Finding ID are required.' };
  }

  try {
    // Create authenticated Supabase client
    const supabase = createClient();
    
    // Get the current user to verify authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user || user.id !== userId) {
      console.error('❌ [castVoteAction] Authentication failed:', userError);
      return { error: 'You must be logged in to vote.' };
    }

    console.log('✅ [castVoteAction] User authenticated:', user.id);

    // First, check if user has already voted
    console.log('🔍 [castVoteAction] Checking for existing vote...');
    const { data: existingVote, error: fetchError } = await supabase
      .from('finding_votes')
      .select('*')
      .eq('user_id', userId)
      .eq('finding_id', findingId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ [castVoteAction] Error checking existing vote:', fetchError);
      return { error: `Failed to check existing vote: ${fetchError.message}` };
    }

    console.log('📊 [castVoteAction] Existing vote check result:', { existingVote, fetchError: fetchError?.code });

    if (existingVote) {
      console.log('🔄 [castVoteAction] User has existing vote:', existingVote.vote_type);
      
      if (existingVote.vote_type === voteType) {
        // User clicked the same vote type - remove the vote
        console.log('🗑️ [castVoteAction] Removing existing vote (same type clicked)');
        const { error: deleteError } = await supabase
          .from('finding_votes')
          .delete()
          .eq('user_id', userId)
          .eq('finding_id', findingId);

        if (deleteError) {
          console.error('❌ [castVoteAction] Error removing vote:', deleteError);
          return { error: `Failed to remove vote: ${deleteError.message}` };
        }
        console.log('✅ [castVoteAction] Vote removed successfully');
      } else {
        // User clicked different vote type - update the vote
        console.log('🔄 [castVoteAction] Updating vote type from', existingVote.vote_type, 'to', voteType);
        const { error: updateError } = await supabase
          .from('finding_votes')
          .update({ vote_type: voteType })
          .eq('user_id', userId)
          .eq('finding_id', findingId);

        if (updateError) {
          console.error('❌ [castVoteAction] Error updating vote:', updateError);
          return { error: `Failed to update vote: ${updateError.message}` };
        }
        console.log('✅ [castVoteAction] Vote updated successfully');
      }
    } else {
      // No existing vote - create new vote
      console.log('➕ [castVoteAction] Creating new vote');
      const { error: insertError } = await supabase
        .from('finding_votes')
        .insert({
          user_id: userId,
          finding_id: findingId,
          vote_type: voteType
        });

      if (insertError) {
        console.error('❌ [castVoteAction] Error creating vote:', insertError);
        return { error: `Failed to create vote: ${insertError.message}` };
      }
      console.log('✅ [castVoteAction] New vote created successfully');
    }

    // Call the vote-processor Edge Function to update cached counts
    console.log('🚀 [castVoteAction] Calling vote-processor Edge Function...');
    try {
      const { data, error } = await supabase.functions.invoke('vote-processor', {
        body: { finding_id: findingId }
      });

      if (error) {
        console.error('❌ [castVoteAction] Edge function error:', error);
        // Don't return error here - the vote was still recorded, just the cache update failed
      } else {
        console.log('✅ [castVoteAction] Vote counts updated successfully via Edge Function:', data);
      }
    } catch (error) {
      console.error('❌ [castVoteAction] Error calling vote-processor Edge Function:', error);
      // Don't return error here - the vote was still recorded
    }

    // Revalidate the cache for the pages
    console.log('🔄 [castVoteAction] Revalidating page cache...');
    revalidatePath(`/community/${findingId}`);
    revalidatePath('/community');
    console.log('✅ [castVoteAction] Cache revalidated');

    console.log('🎉 [castVoteAction] Vote process completed successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ [castVoteAction] Server action failed:', error);
    return { error: 'An unexpected error occurred while voting.' };
  }
}

// --- REPORT ACTION ---
export async function reportFindingAction(
  userId: string,
  findingId: string,
  reason: string
) {
  console.log('🚨 [reportFindingAction] Starting report action:', { userId, findingId, reason });

  if (!userId || !findingId) {
    return { error: 'User and Finding ID are required.' };
  }

  try {
    // Create authenticated Supabase client
    const supabase = createClient();
    
    // Get the current user to verify authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user || user.id !== userId) {
      console.error('❌ [reportFindingAction] Authentication failed:', userError);
      return { error: 'You must be logged in to report a finding.' };
    }

    console.log('✅ [reportFindingAction] User authenticated:', user.id);

    // Insert the report into the database
    console.log('📝 [reportFindingAction] Creating report in database...');
    const { error: insertError } = await supabase
      .from('finding_reports')
      .insert({
        user_id: userId,
        finding_id: findingId,
        reason: reason || null
      });

    if (insertError) {
      console.error('❌ [reportFindingAction] Error creating report:', insertError);
      return { error: `Failed to report finding: ${insertError.message}` };
    }

    console.log('✅ [reportFindingAction] Report created successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ [reportFindingAction] Server action failed:', error);
    return { error: 'An unexpected error occurred while reporting the finding.' };
  }
}