'use client';

import React from 'react';
import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  MapPin,
  Building2,
} from 'lucide-react';
import { RecruiterProfile } from '@/types';
import { VerificationBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { ProfileAvatar } from './ProfileAvatar';
import { cn } from '@/lib/utils';

interface ProfileTableProps {
  profiles: RecruiterProfile[];
  savedIds: Set<string>;
  onToggleSave: (profile: RecruiterProfile) => void;
  onOpenOutreach: (profile: RecruiterProfile) => void;
}

export function ProfileTable({
  profiles,
  savedIds,
  onToggleSave,
  onOpenOutreach,
}: ProfileTableProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[640px]">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              {['Recruiter', 'Company & Location', 'Confidence', 'Actions'].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    'py-3 px-4 text-[11px] font-semibold uppercase tracking-widest text-[#505870]',
                    i === 3 && 'text-right'
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile, idx) => {
              const isSaved =
                savedIds.has(profile.id) ||
                savedIds.has(profile.linkedinUrl.toLowerCase());
              return (
                <tr
                  key={profile.id}
                  className="group transition-colors"
                  style={{
                    borderBottom:
                      idx < profiles.length - 1
                        ? '1px solid rgba(255,255,255,0.04)'
                        : undefined,
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      'rgba(255,255,255,0.025)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      'transparent';
                  }}
                >
                  {/* Recruiter */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        name={profile.name}
                        avatarUrl={profile.avatarUrl}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-[#f0f4ff] text-sm truncate group-hover:text-blue-300 transition-colors">
                          {profile.name}
                        </div>
                        <div className="text-[0.75rem] text-[#505870] truncate max-w-[220px] mt-0.5">
                          {profile.title}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Company & Location */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-[0.8125rem] text-[#8892aa] truncate">
                      <Building2 className="w-3.5 h-3.5 text-[#505870] shrink-0" />
                      <span className="truncate">{profile.company}</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-1 text-[0.75rem] text-[#505870] mt-0.5 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{profile.location}</span>
                      </div>
                    )}
                  </td>

                  {/* Verification */}
                  <td className="py-3.5 px-4">
                    <VerificationBadge
                      status={profile.verificationStatus}
                      confidence={profile.confidenceScore}
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open LinkedIn profile"
                        className="p-1.5 rounded-lg bg-white/4 border border-white/7 text-[#505870] hover:text-blue-400 hover:border-blue-500/20 hover:bg-blue-500/8 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => onToggleSave(profile)}
                        aria-label={isSaved ? 'Unsave' : 'Save'}
                        className={cn(
                          'p-1.5 rounded-lg border transition-all cursor-pointer',
                          isSaved
                            ? 'bg-blue-500/12 border-blue-500/25 text-blue-400'
                            : 'bg-white/4 border-white/7 text-[#505870] hover:text-[#f0f4ff] hover:border-white/14'
                        )}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onOpenOutreach(profile)}
                        className="h-7 px-2.5 text-xs gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Draft</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
