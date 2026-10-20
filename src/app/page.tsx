'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSearch } from '@/components/HeroSearch';
import { SearchFiltersBar } from '@/components/SearchFiltersBar';
import { ProfileCard } from '@/components/ProfileCard';
import { ProfileTable } from '@/components/ProfileTable';
import { SavedContactsView } from '@/components/SavedContactsView';
import { OutreachModal } from '@/components/OutreachModal';
import { AuthModal } from '@/components/AuthModal';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import {
  OutreachStatus,
  RecruiterProfile,
  SavedContact,
  SearchFilters,
  SearchResponse,
} from '@/types';
import {
  fetchSavedContacts,
  saveContactToStorage,
  updateContactInStorage,
  deleteContactFromStorage,
} from '@/lib/supabase/db';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  AlertTriangle,
  RefreshCw,
  Users,
  Sparkles,
  KeyRound,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

export default function TalentScoutApp() {
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'outreach'>('search');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [isSerperConfigured, setIsSerperConfigured] = useState<boolean | null>(null);

  const [inResultSearch, setInResultSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'verified' | 'name'>('verified');

  const [savedContacts, setSavedContacts] = useState<SavedContact[]>([]);
  const [storageType, setStorageType] = useState<'supabase' | 'local'>('local');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [activeOutreachProfile, setActiveOutreachProfile] = useState<RecruiterProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Restore session on mount + listen for auth changes
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setCurrentUserEmail(session.user.email);
    });

    // Listen for sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check Serper API key status
  useEffect(() => {
    fetch('/api/search')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data && setIsSerperConfigured(Boolean(data.configured)))
      .catch(() => {});
  }, []);

  // Reload saved contacts whenever auth state changes
  useEffect(() => {
    fetchSavedContacts().then(({ contacts, storageType: st }) => {
      setSavedContacts(contacts);
      setStorageType(st);
    });
  }, [currentUserEmail]);

  const savedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of savedContacts) {
      ids.add(c.profile.id);
      ids.add(c.profile.linkedinUrl.toLowerCase());
    }
    return ids;
  }, [savedContacts]);

  const handleExecuteSearch = async (filters: SearchFilters) => {
    setCurrentFilters(filters);
    setIsSearching(true);
    setSearchError(null);
    setRateLimited(false);
    setInResultSearch('');
    setSelectedRoleFilter('all');
    setSelectedLocationFilter('all');

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429 || data.rateLimited) setRateLimited(true);
        setSearchError(data.error || 'Search failed.');
      } else {
        if (data.error) setSearchError(data.error);
        if (data.rateLimited) setRateLimited(true);
      }
      setSearchResponse(data);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : 'Network error.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleSave = async (profile: RecruiterProfile) => {
    const alreadySaved =
      savedIds.has(profile.id) || savedIds.has(profile.linkedinUrl.toLowerCase());
    if (alreadySaved) {
      const target = savedContacts.find(
        (c) =>
          c.profile.id === profile.id ||
          c.profile.linkedinUrl.toLowerCase() === profile.linkedinUrl.toLowerCase()
      );
      if (target) {
        await deleteContactFromStorage(target.id);
        setSavedContacts((prev) => prev.filter((c) => c.id !== target.id));
      }
    } else {
      const { contact } = await saveContactToStorage(profile);
      setSavedContacts((prev) => [contact, ...prev]);
    }
  };

  const handleUpdateStatus = async (id: string, status: OutreachStatus) => {
    await updateContactInStorage(id, { status });
    setSavedContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    await updateContactInStorage(id, { notes });
    setSavedContacts((prev) => prev.map((c) => (c.id === id ? { ...c, notes } : c)));
  };

  const handleDeleteContact = async (id: string) => {
    await deleteContactFromStorage(id);
    setSavedContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleOpenOutreach = (profile: RecruiterProfile) => {
    setActiveOutreachProfile(profile);
    setOutreachModalOpen(true);
  };

  const filteredAndSortedResults = useMemo(() => {
    if (!searchResponse?.results) return [];
    let list = [...searchResponse.results];

    if (inResultSearch.trim()) {
      const q = inResultSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          (p.snippet && p.snippet.toLowerCase().includes(q))
      );
    }
    if (selectedRoleFilter !== 'all') {
      const r = selectedRoleFilter.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(r));
    }
    if (selectedLocationFilter !== 'all') {
      const l = selectedLocationFilter.toLowerCase();
      list = list.filter((p) => p.location?.toLowerCase().includes(l));
    }

    list.sort((a, b) => {
      if (sortBy === 'verified') {
        const order = { verified: 3, pattern_matched: 2, unverified: 1 };
        const diff = order[b.verificationStatus] - order[a.verificationStatus];
        return diff !== 0 ? diff : b.confidenceScore - a.confidenceScore;
      }
      if (sortBy === 'confidence') return b.confidenceScore - a.confidenceScore;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [searchResponse, inResultSearch, selectedRoleFilter, selectedLocationFilter, sortBy]);

  const availableRolesInResults = useMemo(() => {
    if (!searchResponse?.results) return [];
    const roles = new Set<string>();
    for (const p of searchResponse.results) {
      if (!p.title) continue;
      const t = p.title.toLowerCase();
      if (t.includes('technical recruiter')) roles.add('Technical Recruiter');
      else if (t.includes('lead') || t.includes('manager')) roles.add('Lead / Manager');
      else if (t.includes('sourcer')) roles.add('Sourcer');
      else if (t.includes('university') || t.includes('campus'))
        roles.add('University Recruiter');
      else roles.add('Recruiter');
    }
    return Array.from(roles);
  }, [searchResponse]);

  const availableLocationsInResults = useMemo(() => {
    if (!searchResponse?.results) return [];
    const locs = new Set<string>();
    for (const p of searchResponse.results) {
      if (p.location) locs.add(p.location);
    }
    return Array.from(locs);
  }, [searchResponse]);

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={savedContacts.length}
        onOpenAuth={() => setAuthModalOpen(true)}
        userEmail={currentUserEmail}
      />

      <main className="flex-1">
        {/* ── Saved Contacts Tab ─────────────────────────── */}
        {activeTab === 'saved' ? (
          <SavedContactsView
            contacts={savedContacts}
            onUpdateStatus={handleUpdateStatus}
            onUpdateNotes={handleUpdateNotes}
            onDeleteContact={handleDeleteContact}
            onOpenOutreach={handleOpenOutreach}
            storageType={storageType}
          />

        /* ── Outreach Tab ──────────────────────────────── */
        ) : activeTab === 'outreach' ? (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)' }}
            >
              <Sparkles className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#f0f4ff] tracking-tight mb-3">
              Outreach Assistant
            </h1>
            <p className="text-[#505870] text-base max-w-md mx-auto mb-8 leading-relaxed">
              Craft personalized LinkedIn connection notes that stay within the 300-character limit and drive recruiter responses.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setActiveOutreachProfile(null);
                setOutreachModalOpen(true);
              }}
            >
              <Sparkles className="w-4 h-4" />
              Open Note Generator
            </Button>
          </div>

        /* ── Search / Discover Tab ─────────────────────── */
        ) : (
          <div>
            <HeroSearch
              onSearch={handleExecuteSearch}
              isLoading={isSearching}
              initialFilters={currentFilters || undefined}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

              {/* API Key missing banner */}
              {isSerperConfigured === false && !searchResponse && (
                <div
                  className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl"
                  style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}
                >
                  <div className="flex items-start gap-3">
                    <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[0.8125rem] font-semibold text-amber-300 mb-0.5">
                        Serper API key required
                      </p>
                      <p className="text-[0.8125rem] text-[#8892aa]">
                        Set{' '}
                        <code
                          className="px-1.5 py-0.5 rounded text-[11px] font-mono text-amber-300"
                          style={{ background: 'rgba(251,191,36,0.1)' }}
                        >
                          SERPER_API_KEY
                        </code>{' '}
                        in your environment variables to enable live recruiter searches.
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://serper.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[0.8125rem] font-semibold text-amber-300 shrink-0 transition-all"
                    style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
                  >
                    Get free key
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Rate limit banner */}
              {rateLimited && (
                <div
                  className="mb-6 flex items-start gap-3 p-4 rounded-2xl"
                  style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}
                >
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[0.8125rem] font-semibold text-red-300 mb-0.5">
                      API rate limit reached
                    </p>
                    <p className="text-[0.8125rem] text-[#8892aa]">
                      Your Serper.dev account has exceeded its credit quota. Check your balance at{' '}
                      <a href="https://serper.dev" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">
                        serper.dev
                      </a>
                      .
                    </p>
                  </div>
                </div>
              )}

              {/* Search error banner */}
              {searchError && !rateLimited && (
                <div
                  className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl"
                  style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[0.8125rem] text-red-300">{searchError}</p>
                  </div>
                  {currentFilters && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleExecuteSearch(currentFilters)}
                      className="shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry
                    </Button>
                  )}
                </div>
              )}

              {/* Loading skeletons */}
              {isSearching && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-[0.8125rem] text-blue-400 font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Searching for recruiters…
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-2xl p-5 space-y-4"
                        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.05)' }} />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 rounded-lg shimmer w-2/3" style={{ background: 'rgba(255,255,255,0.05)' }} />
                            <div className="h-2.5 rounded-lg shimmer w-1/3" style={{ background: 'rgba(255,255,255,0.04)' }} />
                          </div>
                        </div>
                        <div className="h-2.5 rounded-lg shimmer w-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <div className="h-2.5 rounded-lg shimmer w-4/5" style={{ background: 'rgba(255,255,255,0.03)' }} />
                        <div className="flex gap-2 pt-1">
                          <div className="h-8 rounded-xl shimmer flex-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
                          <div className="h-8 rounded-xl shimmer flex-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {!isSearching && searchResponse && (
                <div className="fade-up">
                  {searchResponse.results.length === 0 ? (
                    <div
                      className="flex flex-col items-center text-center py-16 px-4 rounded-2xl max-w-md mx-auto"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <Users className="w-7 h-7 text-[#505870]" />
                      </div>
                      <h3 className="text-[0.9375rem] font-semibold text-[#f0f4ff] mb-1.5">
                        No profiles found for &ldquo;{searchResponse.query}&rdquo;
                      </h3>
                      <p className="text-[0.8125rem] text-[#505870] mb-4 leading-relaxed max-w-xs">
                        Try loosening your location or role filters, or double-check the company name spelling.
                      </p>
                      {currentFilters && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleExecuteSearch({ company: currentFilters.company })
                          }
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Clear filters & retry
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <SearchFiltersBar
                        searchQuery={inResultSearch}
                        onSearchChange={setInResultSearch}
                        selectedRole={selectedRoleFilter}
                        onRoleChange={setSelectedRoleFilter}
                        availableRoles={availableRolesInResults}
                        selectedLocation={selectedLocationFilter}
                        onLocationChange={setSelectedLocationFilter}
                        availableLocations={availableLocationsInResults}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        totalCount={searchResponse.results.length}
                        filteredCount={filteredAndSortedResults.length}
                        executionTimeMs={searchResponse.executionTimeMs}
                      />

                      {filteredAndSortedResults.length === 0 ? (
                        <div className="text-center py-12 text-[0.8125rem] text-[#505870]">
                          No profiles match your active filters.
                        </div>
                      ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredAndSortedResults.map((profile) => (
                            <ProfileCard
                              key={profile.id}
                              profile={profile}
                              isSaved={
                                savedIds.has(profile.id) ||
                                savedIds.has(profile.linkedinUrl.toLowerCase())
                              }
                              onToggleSave={handleToggleSave}
                              onOpenOutreach={handleOpenOutreach}
                            />
                          ))}
                        </div>
                      ) : (
                        <ProfileTable
                          profiles={filteredAndSortedResults}
                          savedIds={savedIds}
                          onToggleSave={handleToggleSave}
                          onOpenOutreach={handleOpenOutreach}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Initial state — show how it works */}
              {!searchResponse && !isSearching && (
                <HowItWorks />
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16" />

      <OutreachModal
        isOpen={outreachModalOpen}
        onClose={() => setOutreachModalOpen(false)}
        targetProfile={activeOutreachProfile}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        userEmail={currentUserEmail}
        onSignInSuccess={(email) => setCurrentUserEmail(email)}
        onSignOut={() => setCurrentUserEmail(null)}
      />
    </div>
  );
}
