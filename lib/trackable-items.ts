import { createClient } from './supabase/client';
import { TrackableItem } from './types';

export async function getTrackableItems(userId: string): Promise<TrackableItem[]> {
  console.log('Fetching trackable items for user:', userId);
  
  if (!userId) {
    console.error('No userId provided to getTrackableItems');
    return [];
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('trackable_items')
      .select('id, user_id, name, category, type, is_active, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching trackable items:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to fetch trackable items: ${error.message}`);
    }

    console.log('Fetched trackable items:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getTrackableItems:', error);
    throw error;
  }
}

export async function getArchivedTrackableItems(userId: string): Promise<TrackableItem[]> {
  console.log('Fetching archived trackable items for user:', userId);
  
  if (!userId) {
    console.error('No userId provided to getArchivedTrackableItems');
    return [];
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('trackable_items')
      .select('id, user_id, name, category, type, is_active, created_at')
      .eq('user_id', userId)
      .eq('is_active', false)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching archived trackable items:', error);
      throw new Error(`Failed to fetch archived trackable items: ${error.message}`);
    }

    console.log('Fetched archived trackable items:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getArchivedTrackableItems:', error);
    throw error;
  }
}

export async function getAllTrackableItems(userId: string): Promise<TrackableItem[]> {
  console.log('Fetching all trackable items for user:', userId);
  
  if (!userId) {
    console.error('No userId provided to getAllTrackableItems');
    return [];
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('trackable_items')
      .select('id, user_id, name, category, type, is_active, created_at')
      .eq('user_id', userId)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching all trackable items:', error);
      throw new Error(`Failed to fetch all trackable items: ${error.message}`);
    }

    console.log('Fetched all trackable items:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getAllTrackableItems:', error);
    throw error;
  }
}

export async function findExistingMetricByName(userId: string, name: string): Promise<TrackableItem | null> {
  console.log('Searching for existing metric by name:', name, 'for user:', userId);
  
  if (!userId || !name) {
    console.error('Missing userId or name in findExistingMetricByName');
    return null;
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('trackable_items')
      .select('id, user_id, name, category, type, is_active, created_at')
      .eq('user_id', userId)
      .ilike('name', name.trim()) // Case-insensitive search
      .maybeSingle(); // FIXED: Use maybeSingle() instead of single() to handle no results gracefully

    if (error) {
      console.error('Error searching for existing metric:', error);
      throw new Error(`Failed to search for existing metric: ${error.message}`);
    }

    if (data) {
      console.log('Found existing metric:', data);
    } else {
      console.log('No existing metric found with name:', name);
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error in findExistingMetricByName:', error);
    throw error;
  }
}

export async function createTrackableItem(item: Omit<TrackableItem, 'id' | 'created_at'>): Promise<TrackableItem> {
  console.log('Creating trackable item:', item);
  
  if (!item.user_id) {
    throw new Error('user_id is required to create trackable item');
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('trackable_items')
      .insert(item)
      .select('id, user_id, name, category, type, is_active, created_at')
      .single();

    if (error) {
      console.error('Error creating trackable item:', error);
      throw new Error(`Failed to create trackable item: ${error.message}`);
    }

    console.log('Created trackable item:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in createTrackableItem:', error);
    throw error;
  }
}

export async function updateTrackableItem(id: string, updates: Partial<TrackableItem>): Promise<TrackableItem> {
  console.log('Updating trackable item:', id, 'with updates:', updates);
  
  if (!id) {
    throw new Error('id is required to update trackable item');
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('trackable_items')
      .update(updates)
      .eq('id', id)
      .select('id, user_id, name, category, type, is_active, created_at')
      .single();

    if (error) {
      console.error('Error updating trackable item:', error);
      throw new Error(`Failed to update trackable item: ${error.message}`);
    }

    console.log('Updated trackable item:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in updateTrackableItem:', error);
    throw error;
  }
}

export async function reactivateTrackableItem(id: string): Promise<TrackableItem> {
  console.log('Reactivating trackable item:', id);
  
  if (!id) {
    throw new Error('id is required to reactivate trackable item');
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('trackable_items')
      .update({ is_active: true })
      .eq('id', id)
      .select('id, user_id, name, category, type, is_active, created_at')
      .single();

    if (error) {
      console.error('Error reactivating trackable item:', error);
      throw new Error(`Failed to reactivate trackable item: ${error.message}`);
    }

    console.log('Reactivated trackable item:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in reactivateTrackableItem:', error);
    throw error;
  }
}

export async function deleteTrackableItem(id: string): Promise<void> {
  console.log('Archiving trackable item:', id);
  
  if (!id) {
    throw new Error('id is required to archive trackable item');
  }

  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('trackable_items')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error archiving trackable item:', error);
      throw new Error(`Failed to delete trackable item: ${error.message}`);
    }

    console.log('Archived trackable item:', id);
  } catch (error) {
    console.error('Unexpected error in deleteTrackableItem:', error);
    throw error;
  }
}

export async function permanentlyDeleteTrackableItem(id: string): Promise<void> {
  console.log('1. Attempting to permanently delete trackable item with ID:', id);
  
  if (!id) {
    throw new Error('id is required to permanently delete trackable item');
  }

  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('trackable_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('2. Permanent deletion failed with error:', error);
      throw new Error(`Failed to permanently delete trackable item: ${error.message}`);
    }

    console.log('2. Permanent deletion completed successfully');
  } catch (error) {
    console.error('Unexpected error in permanentlyDeleteTrackableItem:', error);
    throw error;
  }
}