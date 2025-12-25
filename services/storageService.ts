import { JournalEntry } from '../types';
import { supabase } from './supabaseClient';

// Database schema mapping:
// - moodTags -> mood_tags (array)
// - insights -> insights (array)
interface DatabaseJournalEntry {
  id: string;
  user_id: string;
  date: string;
  title: string;
  content: string;
  insights: string[];
  duration: string | null;
  mood_tags: string[];
  transcript: string | null;
  created_at: string;
  updated_at: string;
}

// Convert database entry to app format
const dbToAppEntry = (dbEntry: DatabaseJournalEntry): JournalEntry => ({
  id: dbEntry.id,
  date: dbEntry.date,
  title: dbEntry.title,
  content: dbEntry.content,
  insights: dbEntry.insights || [],
  duration: dbEntry.duration || '',
  moodTags: dbEntry.mood_tags || [],
  transcript: dbEntry.transcript || undefined,
});

// Convert app entry to database format
const appToDbEntry = (entry: JournalEntry, userId: string): Omit<DatabaseJournalEntry, 'created_at' | 'updated_at'> => ({
  id: entry.id,
  user_id: userId,
  date: entry.date,
  title: entry.title,
  content: entry.content,
  insights: entry.insights || [],
  duration: entry.duration || null,
  mood_tags: entry.moodTags || [],
  transcript: entry.transcript || null,
});

export const storageService = {
  /**
   * Get all journal entries for the current user
   */
  getAllEntries: async (): Promise<JournalEntry[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Failed to load entries', error);
        throw error;
      }

      return (data || []).map(dbToAppEntry);
    } catch (e) {
      console.error('Failed to load entries', e);
      return [];
    }
  },

  /**
   * Save a new journal entry
   */
  saveEntry: async (entry: JournalEntry): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const dbEntry = appToDbEntry(entry, user.id);
      const { error } = await supabase
        .from('journal_entries')
        .insert(dbEntry);

      if (error) {
        console.error('Failed to save entry', error);
        throw error;
      }
    } catch (e) {
      console.error('Failed to save entry', e);
      throw e;
    }
  },

  /**
   * Get a journal entry by ID
   */
  getEntryById: async (id: string): Promise<JournalEntry | undefined> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return undefined;
        }
        console.error('Failed to get entry', error);
        throw error;
      }

      return data ? dbToAppEntry(data) : undefined;
    } catch (e) {
      console.error('Failed to get entry', e);
      return undefined;
    }
  },
};
