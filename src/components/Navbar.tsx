'use client';

import React from 'react';
import { Search, Bookmark, Sparkles, User, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  activeTab: 'search' | 'saved' | 'outreach';
  onSelectTab: (tab: 'search' | 'saved' | 'outreach') => void;
  savedCount: number;
  onOpenAuth: () => void;
  userEmail?: string | null;
}

const tabs = [
  { id: 'search' as const, label: 'Discover', icon: Search },
  { id: 'saved' as const, label: 'Pipeline', icon: Bookmark },
  { id: 'outreach' as const, label: 'Outreach', icon: Sparkles },
];

export function Navbar({
  activeTab,
  onSelectTab,
  savedCount,
  onOpenAuth,
  userEmail,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Glass bar */}
      <div className="glass-strong border-b border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-6">
          {/* Brand */}
          <button
            onClick={() => onSelectTab('search')}
            className="flex items-center gap-3 shrink-0 focus:outline-none group cursor-pointer"
            aria-label="TalentScout Home"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-[0.9375rem] font-bold text-[#f0f4ff] tracking-tight hidden sm:block">
              TalentScout
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center" aria-label="Main navigation">
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => onSelectTab(id)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer',
                    isActive
                      ? 'text-[#f0f4ff] bg-white/8'
                      : 'text-[#505870] hover:text-[#8892aa] hover:bg-white/4'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive && id === 'outreach' ? 'text-blue-400' : '')} />
                  <span>{label}</span>
                  {id === 'saved' && savedCount > 0 && (
                    <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-blue-500 text-white flex items-center justify-center">
                      {savedCount > 99 ? '99+' : savedCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-blue-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Auth */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenAuth}
              className="gap-2"
            >
              <User className="w-3.5 h-3.5 text-[#505870]" />
              <span className="hidden sm:inline text-[#8892aa]">
                {userEmail ? userEmail.split('@')[0] : 'Sign In'}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/6"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around py-2 px-4">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onSelectTab(id)}
                className={cn(
                  'flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-all cursor-pointer',
                  isActive ? 'text-blue-400' : 'text-[#505870]'
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {id === 'saved' && savedCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold bg-blue-500 text-white flex items-center justify-center">
                      {savedCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
