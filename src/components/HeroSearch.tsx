'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase,
  Building2,
  X,
  ArrowRight,
} from 'lucide-react';
import { Button } from './ui/Button';
import { SearchFilters } from '@/types';
import { cn } from '@/lib/utils';

const POPULAR_COMPANIES = [
  'Stripe', 'Airbnb', 'Google', 'Datadog', 'Figma', 'OpenAI', 'Snowflake',
];

interface HeroSearchProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
  initialFilters?: SearchFilters;
}

export function HeroSearch({ onSearch, isLoading, initialFilters }: HeroSearchProps) {
  const [company, setCompany] = useState(initialFilters?.company || '');
  const [recruiterRole, setRecruiterRole] = useState(initialFilters?.recruiterRole || 'all');
  const [department, setDepartment] = useState(initialFilters?.department || 'all');
  const [location, setLocation] = useState(initialFilters?.location || 'all');
  const [keywords, setKeywords] = useState(initialFilters?.keywords || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;
    onSearch({
      company: company.trim(),
      recruiterRole: recruiterRole !== 'all' ? recruiterRole : undefined,
      department: department !== 'all' ? department : undefined,
      location: location !== 'all' ? location : undefined,
      keywords: keywords.trim() || undefined,
    });
  };

  const handleQuickSelect = (comp: string) => {
    setCompany(comp);
    onSearch({
      company: comp,
      recruiterRole: recruiterRole !== 'all' ? recruiterRole : undefined,
      department: department !== 'all' ? department : undefined,
      location: location !== 'all' ? location : undefined,
      keywords: keywords.trim() || undefined,
    });
  };

  const hasActiveFilters =
    recruiterRole !== 'all' || department !== 'all' || location !== 'all' || Boolean(keywords.trim());

  const resetFilters = () => {
    setRecruiterRole('all');
    setDepartment('all');
    setLocation('all');
    setKeywords('');
  };

  return (
    <section className="relative overflow-hidden pt-16 pb-14">
      {/* Aurora background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="aurora absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-25"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(79,142,247,0.4) 0%, rgba(99,102,241,0.2) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="aurora-2 absolute top-10 left-1/4 w-[400px] h-[300px] rounded-full opacity-15"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(139,92,246,0.5) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(79,142,247,0.3) 30%, rgba(139,92,246,0.3) 70%, transparent)',
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center z-10">
        {/* Pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-300 mb-8 fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Real-time recruiter discovery · Powered by Google search
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.12] fade-up-delay-1 mb-5">
          <span className="text-[#f0f4ff]">Find the people</span>
          <br />
          <span className="gradient-text">who can hire you</span>
        </h1>

        <p className="text-[#8892aa] text-base sm:text-lg max-w-xl mx-auto leading-relaxed fade-up-delay-2 mb-10">
          Skip the application queue. Discover verified recruiters and hiring managers at your target companies - and reach out directly.
        </p>

        {/* Search Card */}
        <form
          onSubmit={handleSubmit}
          className="fade-up-delay-3"
          aria-label="Company recruiter search"
        >
          <div
            className="rounded-2xl p-1.5 shadow-2xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow:
                '0 0 0 1px rgba(255,255,255,0.03) inset, 0 24px 48px rgba(0,0,0,0.5), 0 0 80px rgba(79,142,247,0.06)',
            }}
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-1.5">
              {/* Company Input */}
              <div className="relative flex-1 flex items-center">
                <Building2 className="w-4.5 h-4.5 text-[#505870] absolute left-4 pointer-events-none shrink-0" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Enter target company  (e.g. Stripe, Airbnb, OpenAI)"
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent text-[#f0f4ff] placeholder-[#505870] text-[0.9375rem] focus:outline-none"
                  required
                  autoComplete="off"
                />
              </div>
              {/* Search Button */}
              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
                {!isLoading && <ArrowRight className="w-4 h-4 ml-0.5" />}
              </Button>
            </div>

            {/* Filter toggle row */}
            <div className="flex items-center justify-between px-3 py-2 mt-0.5">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer py-1',
                  showFilters || hasActiveFilters ? 'text-blue-400' : 'text-[#505870] hover:text-[#8892aa]'
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>
                  {hasActiveFilters
                    ? 'Filters active'
                    : showFilters
                    ? 'Hide filters'
                    : 'Advanced filters'}
                </span>
                {showFilters ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] text-[#505870] hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Clear filters</span>
                </button>
              )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div
                className="rounded-xl mx-1 mb-1 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                {/* Role */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#505870] uppercase tracking-wider mb-1.5">
                    <Briefcase className="w-3 h-3" />
                    Role
                  </label>
                  <select
                    value={recruiterRole}
                    onChange={(e) => setRecruiterRole(e.target.value)}
                    className="input-base text-[0.8125rem]"
                  >
                    <option value="all">All Talent Roles</option>
                    <option value="Technical Recruiter">Technical Recruiter</option>
                    <option value="Lead Recruiter">Lead / Principal Recruiter</option>
                    <option value="Head of Talent">Head of Talent</option>
                    <option value="Sourcer">Technical Sourcer</option>
                    <option value="University Recruiter">University Recruiter</option>
                    <option value="Executive Recruiter">Executive Recruiter</option>
                  </select>
                </div>
                {/* Department */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#505870] uppercase tracking-wider mb-1.5">
                    <Building2 className="w-3 h-3" />
                    Specialty
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="input-base text-[0.8125rem]"
                  >
                    <option value="all">All Departments</option>
                    <option value="Engineering">Engineering & Tech</option>
                    <option value="Product">Product & Design</option>
                    <option value="Sales">Sales & Marketing</option>
                    <option value="Infrastructure">Cloud & Infrastructure</option>
                    <option value="People">People, HR & Talent</option>
                  </select>
                </div>
                {/* Location */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#505870] uppercase tracking-wider mb-1.5">
                    <MapPin className="w-3 h-3" />
                    Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-base text-[0.8125rem]"
                  >
                    <option value="all">Any Location</option>
                    <option value="San Francisco">San Francisco Bay Area</option>
                    <option value="New York">New York, NY</option>
                    <option value="Seattle">Seattle, WA</option>
                    <option value="Austin">Austin, TX</option>
                    <option value="Remote">Remote</option>
                    <option value="London">London, UK</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Quick-select chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-medium text-[#505870]">Try:</span>
          {POPULAR_COMPANIES.map((comp) => (
            <button
              key={comp}
              type="button"
              onClick={() => handleQuickSelect(comp)}
              className="px-3 py-1 rounded-lg text-[0.8125rem] font-medium bg-white/4 border border-white/7 text-[#8892aa] hover:text-[#f0f4ff] hover:bg-white/7 hover:border-white/12 transition-all cursor-pointer"
            >
              {comp}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
