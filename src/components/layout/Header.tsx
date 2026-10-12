import React from 'react';
import { KayeLogo } from '../logo/KayeLogo';
import { Sun, Moon, Bookmark, Search, UserCheck, Shield, Lock, ShieldCheck, MessageSquareHeart } from 'lucide-react';
import { UserSession } from '../../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  userSession: UserSession;
  onSwitchRole: (role: 'student' | 'alumni') => void;
  onOpenAdminAuth: () => void;
  isAdminUnlocked: boolean;
  savedCount: number;
  onGoogleSignIn?: () => void;
  onGoogleSignOut?: () => void;
  isFirebaseUser?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  userSession,
  onSwitchRole,
  onOpenAdminAuth,
  isAdminUnlocked,
  savedCount,
  onGoogleSignIn,
  onGoogleSignOut,
  isFirebaseUser,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#eaf0f6]/85 dark:bg-[#141720]/85 border-b border-white/60 dark:border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark with same Kaye Logo */}
        <button
          onClick={() => setActiveTab('search')}
          className="flex items-center gap-2.5 text-left group outline-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl neu-flat flex items-center justify-center p-1.5 text-black dark:text-white group-hover:scale-105 transition-transform">
            <KayeLogo size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
              KAYE
            </span>
            <span className="text-[10px] font-medium tracking-wider text-slate-500 dark:text-slate-400 uppercase leading-tight mt-0.5">
              AlumniFinder
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (public links only, NO public admin) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('search')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
              activeTab === 'search'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search size={15} />
            <span>Search</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
              activeTab === 'saved'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark size={15} />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                ({savedCount})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('alumni-dashboard')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
              activeTab === 'alumni-dashboard' || activeTab === 'register-alumni'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck size={15} />
            <span>Alumni Portal</span>
          </button>

          <button
            onClick={() => setActiveTab('opt-out')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
              activeTab === 'opt-out'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield size={15} />
            <span>Opt-Out</span>
          </button>

          <a
            href="#feedback-section"
            className="whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <MessageSquareHeart size={15} />
            <span>Feedback</span>
          </a>

          {/* If owner has unlocked admin, show the private admin panel link */}
          {isAdminUnlocked && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 text-amber-600 dark:text-amber-400 font-semibold ${
                activeTab === 'admin' ? 'border-b-2 border-amber-500' : ''
              }`}
            >
              <ShieldCheck size={15} />
              <span>Owner Panel (@nothing)</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Tactile Controls & Role Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Public Student / Alumni Role Toggle */}
          <div className="hidden sm:flex items-center p-1 rounded-xl neu-inset text-xs font-medium">
            <button
              onClick={() => onSwitchRole('student')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                userSession.role === 'student'
                  ? 'neu-flat font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => onSwitchRole('alumni')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                userSession.role === 'alumni'
                  ? 'neu-flat font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Alumni
            </button>
          </div>

          {/* Firebase Google Auth Button */}
          {onGoogleSignIn && (
            isFirebaseUser ? (
              <button
                onClick={onGoogleSignOut}
                title={`Signed in as ${userSession.email}. Click to sign out.`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-inset text-xs font-semibold text-slate-800 dark:text-slate-100 hover:text-rose-500"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="truncate max-w-[100px]">{userSession.display_name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-btn text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:scale-105"
              >
                <span>Google Sign-In</span>
              </button>
            )
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light and dark mode"
            className="w-10 h-10 rounded-xl neu-btn flex items-center justify-center text-slate-700 dark:text-slate-200"
          >
            {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-700" />}
          </button>

          {/* Private Owner Admin Lock/Unlock Button */}
          <button
            onClick={() => {
              if (isAdminUnlocked) {
                setActiveTab('admin');
              } else {
                onOpenAdminAuth();
              }
            }}
            title={isAdminUnlocked ? "Owner Admin Active (@nothing)" : "Admin Access (Restricted to @nothing)"}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isAdminUnlocked
                ? 'neu-inset text-amber-500 dark:text-amber-400'
                : 'neu-btn text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Lock size={15} />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-white/40 dark:border-white/5 text-xs">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${
            activeTab === 'search' ? 'neu-inset text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Search size={14} />
          Search
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${
            activeTab === 'saved' ? 'neu-inset text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Bookmark size={14} />
          Saved {savedCount > 0 && `(${savedCount})`}
        </button>
        <button
          onClick={() => setActiveTab('alumni-dashboard')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${
            activeTab === 'alumni-dashboard' ? 'neu-inset text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <UserCheck size={14} />
          Alumni
        </button>
        <button
          onClick={() => setActiveTab('opt-out')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${
            activeTab === 'opt-out' ? 'neu-inset text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Shield size={14} />
          Opt-Out
        </button>
        {isAdminUnlocked && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${
              activeTab === 'admin' ? 'neu-inset text-amber-500 font-semibold' : 'text-amber-600'
            }`}
          >
            <ShieldCheck size={14} />
            Owner
          </button>
        )}
      </div>
    </header>
  );
};

