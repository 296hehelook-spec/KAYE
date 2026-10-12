import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SearchForm } from './components/search/SearchForm';
import { LoadingSkeleton } from './components/search/LoadingSkeleton';
import { ResultsSummaryBar } from './components/results/ResultsSummaryBar';
import { AlumniCard } from './components/results/AlumniCard';
import { EmptyState } from './components/search/EmptyState';
import { ConnectModal } from './components/results/ConnectModal';
import { SavedPage } from './components/pages/SavedPage';
import { RegisterAlumniPage } from './components/pages/RegisterAlumniPage';
import { AlumniDashboardPage } from './components/pages/AlumniDashboardPage';
import { OptOutPage } from './components/pages/OptOutPage';
import { AdminDashboardPage } from './components/pages/AdminDashboardPage';
import { StaticPages } from './components/pages/StaticPages';
import { FeedbackSection } from './components/feedback/FeedbackSection';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { searchService } from './services/searchService';
import { storageService } from './services/storageService';
import { AlumniProfile, SearchFilters, SearchResponse, Bookmark } from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>('search');
  const [staticPage, setStaticPage] = useState<'privacy' | 'terms' | 'about' | 'contact' | 'faq' | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => storageService.isAdminUnlocked());

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => storageService.getTheme());

  // User Session & Role
  const [userSession, setUserSession] = useState(() => storageService.getUserSession());

  // Search State
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    college: 'Indian Institute of Technology Jodhpur',
    passout_year: 2020,
    branch: 'Computer Science',
    count: 10,
  });
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Client-side result filters & sorting
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'company' | 'name'>('relevance');

  // Modals & Flows
  const [connectAlumni, setConnectAlumni] = useState<AlumniProfile | null>(null);
  const [optOutTargetUrl, setOptOutTargetUrl] = useState<string | undefined>(undefined);

  // Bookmarks & Requests State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => storageService.getBookmarks());
  const [connectionRequests, setConnectionRequests] = useState(() => storageService.getConnectionRequests());

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Synchronize theme on load
  useEffect(() => {
    storageService.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    storageService.setTheme(next);
  };

  const handleSwitchRole = (role: 'student' | 'alumni') => {
    const updated = storageService.switchRole(role);
    setUserSession(updated);
    if (role === 'alumni') {
      setActiveTab('alumni-dashboard');
    } else {
      setActiveTab('search');
    }
    showToast(`Switched view to ${role.toUpperCase()} mode`, 'info');
  };

  const handleLockAdmin = () => {
    storageService.lockAdmin();
    setIsAdminUnlocked(false);
    storageService.switchRole('student');
    setUserSession(storageService.getUserSession());
    setActiveTab('search');
    showToast('Admin Console locked successfully', 'info');
  };

  // Perform Search
  const handleExecuteSearch = async (filters: SearchFilters, forceFresh: boolean = false) => {
    setCurrentFilters(filters);
    setIsLoading(true);
    setSearchError(null);
    setCompanyFilter('');
    setHasSearched(true);
    setStaticPage(null);

    try {
      const response = await searchService.search(filters, { forceFresh });
      setSearchResponse(response);
    } catch (err: any) {
      setSearchError(err?.message || 'An unexpected error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Bookmarking
  const handleToggleBookmark = (alumni: AlumniProfile) => {
    const isCurrentlySaved = storageService.isBookmarked(alumni.id);
    if (isCurrentlySaved) {
      storageService.removeBookmark(alumni.id);
      showToast(`Removed ${alumni.name} from saved alumni`, 'info');
    } else {
      storageService.saveBookmark(alumni);
      showToast(`Saved ${alumni.name} to bookmarks!`);
    }
    setBookmarks(storageService.getBookmarks());
  };

  // Trigger Connect Modal
  const handleOpenConnect = (alumni: AlumniProfile) => {
    setConnectAlumni(alumni);
  };

  // Trigger Opt-Out prefilled
  const handleOpenOptOut = (linkedinUrl: string) => {
    setOptOutTargetUrl(linkedinUrl);
    setActiveTab('opt-out');
  };

  // Client-side filtering & sorting of current alumni results
  const filteredAndSortedAlumni = useMemo(() => {
    if (!searchResponse) return [];

    let list = [...searchResponse.alumni];

    // Exclude any opted-out profile immediately in real-time
    list = list.filter((a) => !storageService.isOptedOut(a.linkedin_url));

    // Company filter chip
    if (companyFilter) {
      list = list.filter((a) => a.company?.toLowerCase() === companyFilter.toLowerCase());
    }

    // Sort
    if (sortBy === 'company') {
      list.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Relevance / Match confidence
      list.sort((a, b) => {
        const score = (p: AlumniProfile) => (p.confidence === 'high' ? 3 : p.confidence === 'medium' ? 2 : 1);
        return score(b) - score(a);
      });
    }

    return list;
  }, [searchResponse, companyFilter, sortBy]);

  // Unique companies available in current search results for quick chips
  const availableCompanies = useMemo(() => {
    if (!searchResponse) return [];
    const companies = searchResponse.alumni
      .map((a) => a.company)
      .filter((c): c is string => Boolean(c));
    return Array.from(new Set(companies));
  }, [searchResponse]);

  // Export current search results to CSV (name, role, company, profile URL only)
  const handleExportSearchResultsCSV = () => {
    if (filteredAndSortedAlumni.length === 0) return;

    const headers = ['Name', 'Current Role', 'Company', 'Profile URL', 'College', 'Passout Year', 'Branch'];
    const rows = filteredAndSortedAlumni.map((a) => [
      `"${a.name.replace(/"/g, '""')}"`,
      `"${(a.current_role || '').replace(/"/g, '""')}"`,
      `"${(a.company || '').replace(/"/g, '""')}"`,
      `"${a.linkedin_url.replace(/"/g, '""')}"`,
      `"${a.college.replace(/"/g, '""')}"`,
      a.passout_year,
      `"${a.branch.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kaye_alumni_search_${currentFilters.passout_year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported search results to CSV');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-600">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="rounded-2xl neu-flat px-4 py-3 flex items-center gap-2.5 text-xs font-semibold shadow-lg text-slate-800 dark:text-slate-100">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <AlertCircle size={16} className="text-indigo-500" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={staticPage ? '' : activeTab}
        setActiveTab={(tab) => {
          if (tab === 'admin' && !isAdminUnlocked) {
            setIsAdminModalOpen(true);
            return;
          }
          setActiveTab(tab);
          setStaticPage(null);
        }}
        theme={theme}
        toggleTheme={toggleTheme}
        userSession={userSession}
        onSwitchRole={handleSwitchRole}
        onOpenAdminAuth={() => setIsAdminModalOpen(true)}
        isAdminUnlocked={isAdminUnlocked}
        savedCount={bookmarks.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Static Legal / FAQ Pages */}
        {staticPage ? (
          <StaticPages page={staticPage} onBack={() => setStaticPage(null)} />
        ) : activeTab === 'search' ? (
          /* Search & Results View */
          <div className="flex flex-col gap-8">
            {/* Search Input Card */}
            <SearchForm
              onSearch={(filters) => handleExecuteSearch(filters, false)}
              isLoading={isLoading}
              initialFilters={currentFilters}
            />

            {/* Friendly Error Message */}
            {searchError && (
              <div
                className={`max-w-3xl mx-auto w-full p-5 rounded-2xl neu-inset text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 ${
                  searchError.includes('429') || searchError.toLowerCase().includes('quota')
                    ? 'border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <AlertCircle
                    size={22}
                    className={`shrink-0 mt-0.5 sm:mt-0 ${
                      searchError.includes('429') || searchError.toLowerCase().includes('quota')
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }`}
                  />
                  <div>
                    <p className="font-semibold">{searchError}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {searchError.includes('429') || searchError.toLowerCase().includes('quota') ? (
                        <span>
                          Search grounding with Google Search is rate-limited on free-tier keys. Wait ~60s or configure billing in{' '}
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                            Settings &gt; Secrets
                          </span>
                          .
                        </span>
                      ) : (
                        'Verify your search parameters or click Retry below to query again.'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => handleExecuteSearch(currentFilters, true)}
                    className="px-3.5 py-1.5 rounded-xl neu-flat text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors"
                  >
                    Retry Search
                  </button>
                </div>
              </div>
            )}

            {/* Step-by-Step Loading Progress Bar */}
            {isLoading && <LoadingSkeleton filters={currentFilters} />}

            {/* Search Results Display */}
            {!isLoading && hasSearched && searchResponse && (
              <div className="w-full">
                {filteredAndSortedAlumni.length > 0 ? (
                  <div>
                    {/* Summary Bar */}
                    <ResultsSummaryBar
                      filters={currentFilters}
                      resultCount={filteredAndSortedAlumni.length}
                      fromCache={searchResponse.from_cache}
                      executionTimeMs={searchResponse.execution_time_ms}
                      onRefine={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      onExportCSV={handleExportSearchResultsCSV}
                      companyFilter={companyFilter}
                      setCompanyFilter={setCompanyFilter}
                      availableCompanies={availableCompanies}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                    />

                    {/* Results Grid (1 col mobile, 2 col tablet, 3 col desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredAndSortedAlumni.map((alum) => (
                        <AlumniCard
                          key={alum.id}
                          alumni={alum}
                          isBookmarked={storageService.isBookmarked(alum.id)}
                          onToggleBookmark={handleToggleBookmark}
                          onConnect={handleOpenConnect}
                          onOptOut={handleOpenOptOut}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    filters={currentFilters}
                    onModifySearch={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    onResetFilters={() => {
                      setCompanyFilter('');
                      handleExecuteSearch({ ...currentFilters, company: undefined, city: undefined, role: undefined });
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ) : activeTab === 'saved' ? (
          /* Saved Alumni Bookmarks */
          <SavedPage
            bookmarks={bookmarks}
            onRefresh={() => setBookmarks(storageService.getBookmarks())}
            onConnect={handleOpenConnect}
          />
        ) : activeTab === 'register-alumni' ? (
          /* Alumni Registration */
          <RegisterAlumniPage
            onSuccess={(profile) => {
              showToast(`Welcome ${profile.name}! Your mentorship profile is live.`);
              setActiveTab('alumni-dashboard');
            }}
            onCancel={() => setActiveTab('search')}
          />
        ) : activeTab === 'alumni-dashboard' ? (
          /* Alumni Dashboard */
          <AlumniDashboardPage
            requests={connectionRequests}
            onRefresh={() => {
              setConnectionRequests(storageService.getConnectionRequests());
            }}
            onOpenRegister={() => setActiveTab('register-alumni')}
          />
        ) : activeTab === 'opt-out' ? (
          /* Public Opt-Out */
          <OptOutPage
            initialUrl={optOutTargetUrl}
            onBackToSearch={() => {
              setOptOutTargetUrl(undefined);
              setActiveTab('search');
            }}
          />
        ) : activeTab === 'admin' ? (
          /* Admin Dashboard (Protected for owner only) */
          isAdminUnlocked ? (
            <AdminDashboardPage
              onRefresh={() => {
                setBookmarks(storageService.getBookmarks());
              }}
              onLockAdmin={handleLockAdmin}
            />
          ) : (
            <div className="max-w-md mx-auto py-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl neu-inset flex items-center justify-center text-amber-500 mb-4">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Admin Console Restricted
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
                This panel is reserved exclusively for the platform owner (<strong className="text-slate-700 dark:text-slate-300">@nothing</strong>).
              </p>
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="px-4 py-2 rounded-xl neu-btn-primary text-xs font-semibold"
              >
                Enter Owner Passkey
              </button>
            </div>
          )
        ) : null}

        {/* Tactile Feedback Section in last (for all users & students) */}
        {activeTab !== 'admin' && (
          <FeedbackSection onFeedbackSubmitted={() => showToast('Feedback submitted to @nothing!')} />
        )}
      </main>

      {/* Connect Modal */}
      {connectAlumni && (
        <ConnectModal
          alumni={connectAlumni}
          onClose={() => setConnectAlumni(null)}
          onSuccess={() => {
            setConnectAlumni(null);
            showToast('Connection request delivered to alumnus dashboard!');
            setConnectionRequests(storageService.getConnectionRequests());
          }}
        />
      )}

      {/* Owner Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={() => {
          setIsAdminUnlocked(true);
          setActiveTab('admin');
          showToast('Welcome, @nothing! Owner console unlocked.');
        }}
      />

      {/* Footer */}
      <Footer
        onOpenPage={(page) => {
          if (page === 'opt-out') {
            setActiveTab('opt-out');
            setStaticPage(null);
          } else {
            setStaticPage(page as any);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdminAuth={() => {
          if (isAdminUnlocked) {
            setActiveTab('admin');
          } else {
            setIsAdminModalOpen(true);
          }
        }}
        isAdminUnlocked={isAdminUnlocked}
      />
    </div>
  );
}
