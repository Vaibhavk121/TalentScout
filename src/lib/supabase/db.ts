import { OutreachStatus, RecruiterProfile, SavedContact } from '@/types';
import { getSupabaseClient } from './client';

// All operations go through Supabase.
// Row-Level Security on the saved_contacts table ensures each user only
// sees and modifies their own rows — no userId param needed here.

export async function fetchSavedContacts(): Promise<{
  contacts: SavedContact[];
  storageType: 'supabase' | 'local';
}> {
  const supabase = getSupabaseClient();
  if (!supabase) return { contacts: [], storageType: 'local' };

  const { data, error } = await supabase
    .from('saved_contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchSavedContacts error:', error.message);
    return { contacts: [], storageType: 'supabase' };
  }

  const contacts: SavedContact[] = (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    profile: {
      id: row.profile_id,
      name: row.name,
      title: row.title,
      company: row.company,
      location: row.location ?? undefined,
      linkedinUrl: row.linkedin_url,
      sourceUrl: row.source_url ?? undefined,
      snippet: row.snippet ?? undefined,
      verificationStatus: row.verification_status,
      confidenceScore: row.confidence_score,
      department: row.department ?? undefined,
    },
    status: row.status as OutreachStatus,
    notes: row.notes ?? '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return { contacts, storageType: 'supabase' };
}

export async function saveContactToStorage(
  profile: RecruiterProfile,
  initialNotes = '',
  initialStatus: OutreachStatus = 'not_contacted'
): Promise<{ success: boolean; contact: SavedContact; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, contact: {} as SavedContact, error: 'Not authenticated' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, contact: {} as SavedContact, error: 'No active session' };
  }

  const row = {
    user_id: user.id,
    profile_id: profile.id,
    name: profile.name,
    title: profile.title,
    company: profile.company,
    location: profile.location ?? null,
    linkedin_url: profile.linkedinUrl,
    source_url: profile.sourceUrl ?? profile.linkedinUrl,
    snippet: profile.snippet ?? null,
    verification_status: profile.verificationStatus,
    confidence_score: profile.confidenceScore,
    department: profile.department ?? null,
    status: initialStatus,
    notes: initialNotes,
  };

  const { data, error } = await supabase
    .from('saved_contacts')
    .upsert(row, { onConflict: 'user_id,linkedin_url' })
    .select()
    .single();

  if (error || !data) {
    console.error('saveContactToStorage error:', error?.message);
    return { success: false, contact: {} as SavedContact, error: error?.message };
  }

  const contact: SavedContact = {
    id: data.id,
    user_id: data.user_id,
    profile,
    status: data.status as OutreachStatus,
    notes: data.notes ?? '',
    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  return { success: true, contact };
}

export async function updateContactInStorage(
  contactId: string,
  updates: Partial<Pick<SavedContact, 'status' | 'notes'>>
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('saved_contacts')
    .update({
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId);

  if (error) console.error('updateContactInStorage error:', error.message);
  return !error;
}

export async function deleteContactFromStorage(contactId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('saved_contacts')
    .delete()
    .eq('id', contactId);

  if (error) console.error('deleteContactFromStorage error:', error.message);
  return !error;
}

export function exportContactsToCSV(contacts: SavedContact[]) {
  const headers = ['Name', 'Title', 'Company', 'Location', 'LinkedIn URL', 'Status', 'Notes', 'Saved At'];
  const rows = contacts.map((c) => [
    `"${c.profile.name.replace(/"/g, '""')}"`,
    `"${c.profile.title.replace(/"/g, '""')}"`,
    `"${c.profile.company.replace(/"/g, '""')}"`,
    `"${(c.profile.location ?? '').replace(/"/g, '""')}"`,
    `"${c.profile.linkedinUrl}"`,
    `"${c.status}"`,
    `"${c.notes.replace(/"/g, '""')}"`,
    `"${c.created_at}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `talentscout_contacts_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
