import { OutreachStatus, RecruiterProfile, SavedContact } from '@/types';
import { getSupabaseClient, isSupabaseConfigured } from './client';

const LOCAL_STORAGE_KEY = 'talentscout_saved_contacts_v1';

export async function fetchSavedContacts(userId?: string): Promise<{
  contacts: SavedContact[];
  storageType: 'supabase' | 'local';
}> {
  const supabase = getSupabaseClient();

  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('saved_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, falling back to local storage:', error.message);
      } else if (data) {
        const formatted: SavedContact[] = data.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          profile: {
            id: row.profile_id,
            name: row.name,
            title: row.title,
            company: row.company,
            location: row.location,
            linkedinUrl: row.linkedin_url,
            sourceUrl: row.source_url,
            snippet: row.snippet,
            verificationStatus: row.verification_status,
            confidenceScore: row.confidence_score,
            department: row.department,
          },
          status: row.status as OutreachStatus,
          notes: row.notes || '',
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        return { contacts: formatted, storageType: 'supabase' };
      }
    } catch (e) {
      console.warn('Supabase request failed:', e);
    }
  }

  // Fallback to client-side localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { contacts: Array.isArray(parsed) ? parsed : [], storageType: 'local' };
      }
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
    }
  }

  return { contacts: [], storageType: 'local' };
}

export async function saveContactToStorage(
  profile: RecruiterProfile,
  userId?: string,
  initialNotes: string = '',
  initialStatus: OutreachStatus = 'not_contacted'
): Promise<{ success: boolean; contact: SavedContact; error?: string }> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  // Try Supabase if authenticated
  if (supabase && userId) {
    try {
      const row = {
        user_id: userId,
        profile_id: profile.id,
        name: profile.name,
        title: profile.title,
        company: profile.company,
        location: profile.location || null,
        linkedin_url: profile.linkedinUrl,
        source_url: profile.sourceUrl || profile.linkedinUrl,
        snippet: profile.snippet || null,
        verification_status: profile.verificationStatus,
        confidence_score: profile.confidenceScore,
        department: profile.department || null,
        status: initialStatus,
        notes: initialNotes,
      };

      const { data, error } = await supabase
        .from('saved_contacts')
        .upsert(row, { onConflict: 'user_id, linkedin_url' })
        .select()
        .single();

      if (error) {
        console.warn('Supabase save error:', error.message);
      } else if (data) {
        const contact: SavedContact = {
          id: data.id,
          user_id: data.user_id,
          profile,
          status: data.status,
          notes: data.notes,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        return { success: true, contact };
      }
    } catch (e: unknown) {
      console.warn('Supabase save exception:', e);
    }
  }

  // Local storage save
  const newContact: SavedContact = {
    id: `loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    profile,
    status: initialStatus,
    notes: initialNotes,
    created_at: now,
    updated_at: now,
  };

  if (typeof window !== 'undefined') {
    try {
      const current = await fetchSavedContacts();
      const existing = current.contacts.filter(
        (c) => c.profile.linkedinUrl.toLowerCase() !== profile.linkedinUrl.toLowerCase()
      );
      const updated = [newContact, ...existing];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  }

  return { success: true, contact: newContact };
}

export async function updateContactInStorage(
  contactId: string,
  updates: Partial<Pick<SavedContact, 'status' | 'notes'>>,
  userId?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  if (supabase && userId && !contactId.startsWith('loc_')) {
    try {
      const { error } = await supabase
        .from('saved_contacts')
        .update({
          ...(updates.status && { status: updates.status }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
          updated_at: now,
        })
        .eq('id', contactId);

      if (!error) return true;
    } catch (e) {
      console.warn('Supabase update failed:', e);
    }
  }

  // Local storage update
  if (typeof window !== 'undefined') {
    try {
      const { contacts } = await fetchSavedContacts();
      const updated = contacts.map((c) =>
        c.id === contactId
          ? {
              ...c,
              ...updates,
              updated_at: now,
            }
          : c
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error('Failed to update localStorage:', e);
    }
  }

  return false;
}

export async function deleteContactFromStorage(
  contactId: string,
  userId?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase && userId && !contactId.startsWith('loc_')) {
    try {
      const { error } = await supabase
        .from('saved_contacts')
        .delete()
        .eq('id', contactId);

      if (!error) return true;
    } catch (e) {
      console.warn('Supabase delete failed:', e);
    }
  }

  // Local storage delete
  if (typeof window !== 'undefined') {
    try {
      const { contacts } = await fetchSavedContacts();
      const filtered = contacts.filter((c) => c.id !== contactId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Failed to delete from localStorage:', e);
    }
  }

  return false;
}

export function exportContactsToCSV(contacts: SavedContact[]) {
  const headers = [
    'Name',
    'Title',
    'Company',
    'Location',
    'LinkedIn URL',
    'Status',
    'Notes',
    'Saved At',
  ];

  const rows = contacts.map((c) => [
    `"${c.profile.name.replace(/"/g, '""')}"`,
    `"${c.profile.title.replace(/"/g, '""')}"`,
    `"${c.profile.company.replace(/"/g, '""')}"`,
    `"${(c.profile.location || '').replace(/"/g, '""')}"`,
    `"${c.profile.linkedinUrl}"`,
    `"${c.status}"`,
    `"${c.notes.replace(/"/g, '""')}"`,
    `"${c.created_at}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `talentscout_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
