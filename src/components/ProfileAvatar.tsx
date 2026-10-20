'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  name: string;
  avatarUrl?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

// Deterministic, tasteful avatar colors
const PALETTE = [
  { from: '#3b82f6', to: '#6366f1' }, // blue → indigo
  { from: '#8b5cf6', to: '#a78bfa' }, // violet shades
  { from: '#06b6d4', to: '#3b82f6' }, // cyan → blue
  { from: '#10b981', to: '#059669' }, // emerald
  { from: '#f59e0b', to: '#d97706' }, // amber
  { from: '#ec4899', to: '#db2777' }, // pink
  { from: '#64748b', to: '#475569' }, // slate
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function ProfileAvatar({
  name,
  avatarUrl,
  className,
  size = 'md',
}: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials =
    name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  const color = getColor(name);

  const sizes = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-13 h-13 text-base',
  };

  const hasImage = Boolean(avatarUrl && !imageError && avatarUrl.startsWith('http'));

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-xl overflow-hidden flex items-center justify-center font-semibold text-white select-none',
        sizes[size],
        className
      )}
      style={
        hasImage
          ? undefined
          : {
              background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.08) inset`,
            }
      }
    >
      {hasImage ? (
        <img
          src={avatarUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="leading-none">{initials}</span>
      )}
    </div>
  );
}
