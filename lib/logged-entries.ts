import { supabase } from './supabase';
import { LoggedEntry, LoggedEntryWithItem } from './types';

export async function getLoggedEntriesForDate(userId: string, date: string): Promise<LoggedEntryWithItem[]> {
  console.log('Fetching logged entries for user:', userId, 'date:', date);
  
  if (!userId || !date) {
    console.error('Missing userId or date in getLoggedEntriesForDate');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('logged_entries')
      .select(`
        *,
        trackable_item:trackable_items(*)
      `)
      .eq('user_id', userId)
      .eq('entry_date', date);

    if (error) {
      console.error('Error fetching logged entries:', error);
      throw new Error(`Failed to fetch logged entries: ${error.message}`);
    }

    console.log('Fetched logged entries:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getLoggedEntriesForDate:', error);
    throw error;
  }
}

export async function upsertLoggedEntry(entry: Omit<LoggedEntry, 'id' | 'created_at'>): Promise<LoggedEntry> {
  console.log('Upserting logged entry:', entry);
  
  if (!entry.user_id || !entry.trackable_item_id || !entry.entry_date) {
    throw new Error('user_id, trackable_item_id, and entry_date are required');
  }

  try {
    const { data, error } = await supabase
      .from('logged_entries')
      .upsert(entry, {
        onConflict: 'user_id,trackable_item_id,entry_date'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting logged entry:', error);
      throw new Error(`Failed to save logged entry: ${error.message}`);
    }

    console.log('Upserted logged entry:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in upsertLoggedEntry:', error);
    throw error;
  }
}

export async function deleteLoggedEntry(id: string): Promise<void> {
  console.log('Deleting logged entry:', id);
  
  if (!id) {
    throw new Error('id is required to delete logged entry');
  }

  try {
    const { error } = await supabase
      .from('logged_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting logged entry:', error);
      throw new Error(`Failed to delete logged entry: ${error.message}`);
    }

    console.log('Deleted logged entry:', id);
  } catch (error) {
    console.error('Unexpected error in deleteLoggedEntry:', error);
    throw error;
  }
}