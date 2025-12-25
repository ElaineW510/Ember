import { JournalEntry } from '../types';
import { supabase } from './supabaseClient';
import { encryptText, decryptText, isEncryptionSupported } from './encryptionService';

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

// Helper function to decrypt a field with backward compatibility
const decryptField = async (encryptedValue: string | null, userId: string): Promise<string> => {
  if (!encryptedValue) return '';
  
  try {
    return await decryptText(encryptedValue, userId);
  } catch (e) {
    // Decryption failed - likely plain text (backward compatibility with old entries)
    if (e instanceof Error && !e.message.includes('corrupted') && !e.message.includes('Invalid base64')) {
      console.debug('Field appears to be unencrypted, using as-is');
    }
    return encryptedValue;
  }
};

// Convert database entry to app format (with decryption)
const dbToAppEntry = async (dbEntry: DatabaseJournalEntry, userId: string): Promise<JournalEntry> => {
  let content = dbEntry.content;
  let title = dbEntry.title;
  let insights: string[] = dbEntry.insights || [];
  let transcript = dbEntry.transcript || undefined;
  
  // Decrypt sensitive fields if encryption is supported
  if (isEncryptionSupported()) {
    try {
      // Decrypt content
      content = await decryptField(dbEntry.content, userId);
      
      // Decrypt title
      title = await decryptField(dbEntry.title, userId);
      
      // Decrypt insights array (each insight is encrypted individually)
      if (dbEntry.insights && dbEntry.insights.length > 0) {
        insights = await Promise.all(
          dbEntry.insights.map(insight => decryptField(insight, userId))
        );
      }
      
      // Decrypt transcript if present
      if (dbEntry.transcript) {
        transcript = await decryptField(dbEntry.transcript, userId);
      }
    } catch (error) {
      console.error('Decryption error:', error);
      // Fall back to plain text if decryption fails
    }
  }
  
  return {
    id: dbEntry.id,
    date: dbEntry.date,
    title,
    content,
    insights,
    duration: dbEntry.duration || '',
    moodTags: dbEntry.mood_tags || [],
    transcript,
  };
};

// Convert app entry to database format (with encryption)
const appToDbEntry = async (entry: JournalEntry, userId: string): Promise<Omit<DatabaseJournalEntry, 'created_at' | 'updated_at'>> => {
  let content = entry.content;
  let title = entry.title;
  let insights: string[] = entry.insights || [];
  let transcript = entry.transcript || null;
  
  // Encrypt sensitive fields if encryption is supported
  if (isEncryptionSupported()) {
    try {
      // Encrypt content
      content = await encryptText(entry.content, userId);
      
      // Encrypt title
      title = await encryptText(entry.title, userId);
      
      // Encrypt insights array (encrypt each insight individually)
      if (entry.insights && entry.insights.length > 0) {
        insights = await Promise.all(
          entry.insights.map(insight => encryptText(insight, userId))
        );
      }
      
      // Encrypt transcript if present
      if (entry.transcript) {
        transcript = await encryptText(entry.transcript, userId);
      }
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt journal entry');
    }
  }
  
  return {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    title,
    content,
    insights,
    duration: entry.duration || null,
    mood_tags: entry.moodTags || [],
    transcript,
  };
};

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

      // Decrypt all entries
      const decryptedEntries = await Promise.all(
        (data || []).map(entry => dbToAppEntry(entry, user.id))
      );
      return decryptedEntries;
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

      const dbEntry = await appToDbEntry(entry, user.id);
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

      return data ? await dbToAppEntry(data, user.id) : undefined;
    } catch (e) {
      console.error('Failed to get entry', e);
      return undefined;
    }
  },
};
