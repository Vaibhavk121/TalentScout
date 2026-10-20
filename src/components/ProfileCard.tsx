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

interface ProfileCardProps {
  profile: RecruiterProfile;
  isSaved: boolean;
  onToggleSave: (profile: RecruiterProfile) => void;
  onOpenOutreach: (profile: RecruiterProfile) => void;
}

export function ProfileCard({
  profile,
  isSaved,
  onToggleSave,
  onOpenOutreach,
}: ProfileCardProps) {
  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200',
        'bg-[#0a0d1a] border hover:-translate-y-0.5',
        isSaved ? 'border-blue-500/25' : 'border-white/7 hover:border-white/12',
        'shadow-[0_2px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.45)]'
      )}
    >
      {/* Top accent line when saved */}
      {isSaved && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header: Avatar + Name + Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <ProfileAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="md" />
            <div className="min-w-0">
              <h3 className="font-semibold text-[#f0f4ff] text-[0.9375rem] truncate group-hover:text-blue-300 transition-colors leading-tight">
                {profile.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-[0.8125rem] text-[#505870] truncate">
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="text-[#8892aa] truncate">{profile.company}</span>
              </div>
            </div>
          </div>

          {/* Bookmark */}
          <button
            onClick={() => onToggleSave(profile)}
            aria-label={isSaved ? 'Remove from saved' : 'Save contact'}
            className={cn(
              'p-2 rounded-xl border transition-all cursor-pointer shrink-0',
              isSaved
                ? 'bg-blue-500/12 border-blue-500/25 text-blue-400 hover:bg-blue-500/18'
                : 'bg-white/4 border-white/7 text-[#505870] hover:text-[#f0f4ff] hover:border-white/14'
            )}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Title */}
        <p className="text-[0.8125rem] text-[#8892aa] leading-snug line-clamp-2 -mt-1">
          {profile.title}
        </p>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5">
          <VerificationBadge
            status={profile.verificationStatus}
            confidence={profile.confidenceScore}
          />
          {profile.location && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#505870] bg-white/4 border border-white/7 px-2 py-0.5 rounded-full">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate max-w-[140px]">{profile.location}</span>
            </span>
          )}
          {profile.department && (
            <span className="inline-flex items-center text-[11px] text-[#505870] bg-white/4 border border-white/7 px-2 py-0.5 rounded-full">
              {profile.department}
            </span>
          )}
        </div>

        {/* Snippet */}
        {profile.snippet && (
          <p
            className="text-[0.75rem] text-[#505870] leading-relaxed line-clamp-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            &ldquo;{profile.snippet}&rdquo;
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div
        className="flex items-center gap-2 px-5 py-3.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <a
          href={profile.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[0.8125rem] font-medium bg-white/4 border border-white/7 text-[#8892aa] hover:text-[#f0f4ff] hover:bg-white/7 hover:border-white/12 transition-all"
          aria-label={`Open ${profile.name}'s LinkedIn profile`}
        >
          <span>LinkedIn</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenOutreach(profile)}
          className="flex-1"
          aria-label={`Draft outreach note for ${profile.name}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Draft Note</span>
        </Button>
      </div>
    </article>
  );
}
