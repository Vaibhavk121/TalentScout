'use client';

import React from 'react';
import { Search, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  availableRoles: string[];
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  availableLocations: string[];
  sortBy: 'confidence' | 'verified' | 'name';
  onSortChange: (sort: 'confidence' | 'verified' | 'name') => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalCount: number;
  filteredCount: number;
  executionTimeMs?: number;
}

export function SearchFiltersBar({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  availableRoles,
  selectedLocation,
  onLocationChange,
  availableLocations,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  executionTimeMs,
}: SearchFiltersBarProps) {
  return (
    <div
      className="rounded-2xl p-3 mb-6"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search within results */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#505870] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by name, title, location…"
            className="w-full pl-8 pr-3 py-2 rounded-xl text-[0.8125rem] text-[#f0f4ff] placeholder-[#505870] focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.08)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Filters + Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {availableRoles.length > 0 && (
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="input-base text-[0.8125rem] w-auto py-2 px-3"
            >
              <option value="all">All Roles ({totalCount})</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          )}

          {availableLocations.length > 0 && (
            <select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="input-base text-[0.8125rem] w-auto py-2 px-3"
            >
              <option value="all">All Locations</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[0.8125rem]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#505870]" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'confidence' | 'verified' | 'name')}
              className="bg-transparent text-[#8892aa] text-[0.8125rem] focus:outline-none cursor-pointer"
              style={{ appearance: 'none', WebkitAppearance: 'none' }}
            >
              <option value="verified">Verified First</option>
              <option value="confidence">Highest Confidence</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        {/* Stats + View Toggle */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 lg:ml-auto">
          <span className="text-[0.8125rem] text-[#505870]">
            <span className="text-[#f0f4ff] font-medium">{filteredCount}</span>
            {filteredCount !== totalCount && (
              <>
                {' '}of{' '}
                <span className="text-[#f0f4ff] font-medium">{totalCount}</span>
              </>
            )}{' '}
            results
            {executionTimeMs !== undefined && (
              <span className="ml-1 text-[#505870]">· {executionTimeMs}ms</span>
            )}
          </span>

          <div
            className="flex items-center rounded-xl p-0.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {(['grid', 'table'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                aria-label={mode === 'grid' ? 'Grid view' : 'Table view'}
                className={cn(
                  'p-2 rounded-lg transition-all cursor-pointer',
                  viewMode === mode
                    ? 'bg-white/8 text-[#f0f4ff]'
                    : 'text-[#505870] hover:text-[#8892aa]'
                )}
              >
                {mode === 'grid' ? (
                  <LayoutGrid className="w-3.5 h-3.5" />
                ) : (
                  <List className="w-3.5 h-3.5" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
