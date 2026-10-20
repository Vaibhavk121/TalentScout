'use client';

import React, { useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  Trash2,
  Edit3,
  Check,
  Download,
  Search,
  Building2,
  MapPin,
  Sparkles,
  Inbox,
  X,
} from 'lucide-react';
import { OutreachStatus, RecruiterProfile, SavedContact } from '@/types';
import { VerificationBadge, OutreachStatusBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { ProfileAvatar } from './ProfileAvatar';
import { exportContactsToCSV } from '@/lib/supabase/db';
import { cn } from '@/lib/utils';

interface SavedContactsViewProps {
  contacts: SavedContact[];
  onUpdateStatus: (id: string, status: OutreachStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDeleteContact: (id: string) => void;
  onOpenOutreach: (profile: RecruiterProfile) => void;
  storageType: 'supabase' | 'local';
}

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'not_contacted', label: 'Not Contacted' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'replied', label: 'Replied' },
  { key: 'follow_up', label: 'Follow-up' },
] as const;

export function SavedContactsView({
  contacts,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteContact,
  onOpenOutreach,
  storageType,
}: SavedContactsViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState('');

  const companies = Array.from(new Set(contacts.map((c) => c.profile.company))).sort();

  const filtered = contacts.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterCompany !== 'all' && c.profile.company !== filterCompany) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !c.profile.name.toLowerCase().includes(q) &&
        !c.profile.title.toLowerCase().includes(q) &&
        !c.notes.toLowerCase().includes(q) &&
        !c.profile.company.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const handleStartEditNotes = (contact: SavedContact) => {
    setEditingNotesId(contact.id);
    setDraftNotes(contact.notes || '');
  };

  const handleSaveNotes = (id: string) => {
    onUpdateNotes(id, draftNotes);
    setEditingNotesId(null);
  };

  const statusCounts: Record<string, number> = {
    all: contacts.length,
    not_contacted: contacts.filter((c) => c.status === 'not_contacted').length,
    contacted: contacts.filter((c) => c.status === 'contacted').length,
    replied: contacts.filter((c) => c.status === 'replied').length,
    follow_up: contacts.filter((c) => c.status === 'follow_up').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-[#f0f4ff] tracking-tight">
              Pipeline
            </h1>
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-blue-400"
              style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)' }}
            >
              {contacts.length}
            </span>
          </div>
          <p className="text-[0.8125rem] text-[#505870]">
            Track your recruiter outreach and manage follow-ups.
            {storageType === 'supabase' ? (
              <span className="text-emerald-400 ml-2">· Cloud synced</span>
            ) : (
              <span className="ml-2">· Local storage</span>
            )}
          </p>
        </div>

        {contacts.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportContactsToCSV(filtered.length > 0 ? filtered : contacts)}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {STATUS_TABS.map((tab) => {
          const isActive = filterStatus === tab.key;
          const count = statusCounts[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[0.8125rem] font-medium transition-all cursor-pointer',
                isActive
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'text-[#505870] hover:text-[#8892aa]'
              )}
              style={
                !isActive
                  ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }
                  : undefined
              }
            >
              {tab.label}
              <span
                className={cn(
                  'min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center',
                  isActive ? 'bg-white/20 text-white' : 'text-[#505870]'
                )}
                style={!isActive ? { background: 'rgba(255,255,255,0.06)' } : undefined}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + company filter */}
      {contacts.length > 0 && (
        <div
          className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl mb-6"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-[#505870] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts, notes, titles…"
              className="w-full pl-8 pr-8 py-2 rounded-xl text-[0.8125rem] text-[#f0f4ff] placeholder-[#505870] focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#505870] hover:text-[#f0f4ff] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {companies.length > 1 && (
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="input-base w-auto py-2 text-[0.8125rem] shrink-0"
            >
              <option value="all">All Companies</option>
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div
          className="mt-8 flex flex-col items-center text-center py-16 px-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Inbox className="w-7 h-7 text-[#505870]" />
          </div>
          <h3 className="text-[0.9375rem] font-semibold text-[#f0f4ff] mb-1.5">
            {contacts.length === 0 ? 'No contacts saved yet' : 'No contacts match your filters'}
          </h3>
          <p className="text-[0.8125rem] text-[#505870] max-w-xs leading-relaxed">
            {contacts.length === 0
              ? 'Search for recruiters and click the bookmark icon to add them to your pipeline.'
              : 'Try clearing your search or switching the status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isEditing = editingNotesId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl p-5 transition-all"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
                }}
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Left: Profile info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <ProfileAvatar
                      name={item.profile.name}
                      avatarUrl={item.profile.avatarUrl}
                      size="md"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-[0.9375rem] font-bold text-[#f0f4ff] tracking-tight">
                          {item.profile.name}
                        </h3>
                        <VerificationBadge
                          status={item.profile.verificationStatus}
                          confidence={item.profile.confidenceScore}
                        />
                        <OutreachStatusBadge status={item.status} />
                      </div>

                      <p className="text-[0.8125rem] text-[#8892aa] mb-2">{item.profile.title}</p>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#505870] bg-white/4 border border-white/7 px-2 py-0.5 rounded-full">
                          <Building2 className="w-2.5 h-2.5" />
                          {item.profile.company}
                        </span>
                        {item.profile.location && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#505870] bg-white/4 border border-white/7 px-2 py-0.5 rounded-full">
                            <MapPin className="w-2.5 h-2.5" />
                            {item.profile.location}
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      <div
                        className="mt-3 p-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#505870] uppercase tracking-wider">
                            <Edit3 className="w-2.5 h-2.5" />
                            Notes
                          </span>
                          {!isEditing && (
                            <button
                              onClick={() => handleStartEditNotes(item)}
                              className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer font-medium"
                            >
                              {item.notes ? 'Edit' : '+ Add note'}
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={draftNotes}
                              onChange={(e) => setDraftNotes(e.target.value)}
                              placeholder="Add conversation notes, referral context, or target opening details…"
                              rows={2}
                              className="w-full p-2.5 rounded-lg text-[0.8125rem] text-[#f0f4ff] leading-relaxed resize-none focus:outline-none"
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(79,142,247,0.3)',
                                boxShadow: '0 0 0 3px rgba(79,142,247,0.08)',
                              }}
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingNotesId(null)}
                                className="text-xs h-7"
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSaveNotes(item.id)}
                                className="text-xs h-7"
                              >
                                <Check className="w-3 h-3" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[0.8125rem] text-[#8892aa] leading-relaxed">
                            {item.notes || (
                              <span className="text-[#505870] italic">No notes added.</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Controls */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0">
                    {/* Status selector */}
                    <div className="flex items-center gap-2">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          onUpdateStatus(item.id, e.target.value as OutreachStatus)
                        }
                        className="input-base w-auto text-[0.8125rem] py-1.5 px-3 font-medium"
                      >
                        <option value="not_contacted">Not Contacted</option>
                        <option value="contacted">Contacted</option>
                        <option value="replied">Replied</option>
                        <option value="follow_up">Follow-up</option>
                      </select>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <a
                        href={item.profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open LinkedIn profile"
                        className="p-2 rounded-xl transition-colors text-[#505870] hover:text-blue-400"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenOutreach(item.profile)}
                        className="gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Draft
                      </Button>

                      <button
                        onClick={() => onDeleteContact(item.id)}
                        aria-label="Delete contact"
                        className="p-2 rounded-xl text-[#505870] hover:text-red-400 transition-colors cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Spacer for mobile nav */}
      <div className="md:hidden h-20" />
    </div>
  );
}
