export type VerificationStatus = 'verified' | 'pattern_matched' | 'unverified';

export type OutreachStatus = 'not_contacted' | 'contacted' | 'replied' | 'follow_up';

export interface RecruiterProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  location?: string;
  linkedinUrl: string;
  sourceUrl?: string;
  snippet?: string;
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
  confidenceScore: number; // 0 - 100
  department?: string;
}

export interface SavedContact {
  id: string;
  user_id?: string;
  profile: RecruiterProfile;
  status: OutreachStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  company: string;
  location?: string;
  department?: string;
  recruiterRole?: string;
  keywords?: string;
  page?: number;
}

export interface SearchResponse {
  query: string;
  generatedSearchQuery: string;
  results: RecruiterProfile[];
  totalResults: number;
  executionTimeMs: number;
  hasMore: boolean;
  error?: string;
  rateLimited?: boolean;
}

export interface OutreachDraftOptions {
  recruiterName: string;
  company: string;
  recruiterTitle?: string;
  candidateName?: string;
  targetRole: string;
  personalHook: string;
  tone: 'concise' | 'warm' | 'role_focused' | 'inmail';
  format: 'connection_note' | 'inmail';
}
