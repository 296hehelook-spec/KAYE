import {
  AlumniProfile,
  Bookmark,
  ConnectionRequest,
  OptOutRecord,
  SearchLog,
  UserSession,
} from '../types';
import {
  db,
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  doc,
  setDoc,
  deleteDoc,
} from '../lib/firebase';

const STORAGE_KEYS = {
  USER_SESSION: 'kaye_user_session',
  BOOKMARKS: 'kaye_bookmarks',
  OPT_OUTS: 'kaye_opt_outs',
  CONNECTION_REQUESTS: 'kaye_connection_requests',
  SELF_REGISTERED: 'kaye_self_registered_alumni',
  SEARCH_CACHE: 'kaye_search_cache',
  SEARCH_LOGS: 'kaye_search_logs',
  THEME: 'kaye_theme_preference',
};

// Initial default user session
const DEFAULT_USER: UserSession = {
  id: 'usr_student_01',
  email: 'student.fellow@campus.edu',
  display_name: 'Aditi Rao',
  role: 'student',
  search_count_this_hour: 0,
  connect_requests_today: 0,
};

// Real opt-outs stored in Firestore and local storage
const INITIAL_OPT_OUTS: OptOutRecord[] = [];

export const storageService = {
  // User Session
  getUserSession(): UserSession {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  setUserSession(session: UserSession): void {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
  },

  switchRole(role: 'student' | 'alumni' | 'admin'): UserSession {
    const current = this.getUserSession();
    const updated: UserSession = {
      ...current,
      role,
      display_name:
        role === 'admin'
          ? 'System Administrator'
          : role === 'alumni'
          ? 'Pooja Kashyap (Alum)'
          : 'Aditi Rao (Student)',
    };
    this.setUserSession(updated);
    return updated;
  },

  // Bookmarks
  getBookmarks(): Bookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveBookmark(alumni: AlumniProfile, note: string = ''): Bookmark {
    const current = this.getBookmarks();
    const user = this.getUserSession();
    const existingIndex = current.findIndex(
      (b) => b.alumni_profile_id === alumni.id && b.user_id === user.id
    );

    const newBookmark: Bookmark = {
      user_id: user.id,
      alumni_profile_id: alumni.id,
      note,
      created_at: new Date().toISOString(),
      alumni,
    };

    let updated: Bookmark[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newBookmark;
    } else {
      updated = [newBookmark, ...current];
    }

    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    return newBookmark;
  },

  removeBookmark(alumniId: string): void {
    const current = this.getBookmarks();
    const user = this.getUserSession();
    const updated = current.filter(
      (b) => !(b.alumni_profile_id === alumniId && b.user_id === user.id)
    );
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  },

  updateBookmarkNote(alumniId: string, note: string): void {
    const current = this.getBookmarks();
    const user = this.getUserSession();
    const updated = current.map((b) => {
      if (b.alumni_profile_id === alumniId && b.user_id === user.id) {
        return { ...b, note };
      }
      return b;
    });
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  },

  isBookmarked(alumniId: string): boolean {
    const bookmarks = this.getBookmarks();
    const user = this.getUserSession();
    return bookmarks.some(
      (b) => b.alumni_profile_id === alumniId && b.user_id === user.id
    );
  },

  // Opt-Outs
  getOptOuts(): OptOutRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OPT_OUTS);
      return data ? JSON.parse(data) : INITIAL_OPT_OUTS;
    } catch {
      return INITIAL_OPT_OUTS;
    }
  },

  addOptOut(linkedinUrl: string, email?: string, reason?: string): OptOutRecord {
    const cleanUrl = linkedinUrl.trim().toLowerCase().replace(/\/+$/, '');
    const current = this.getOptOuts();
    
    // Check if already opted out
    const existing = current.find(
      (o) => o.linkedin_url.toLowerCase().replace(/\/+$/, '') === cleanUrl
    );
    if (existing) return existing;

    const newOptOut: OptOutRecord = {
      id: `opt-${Date.now()}`,
      linkedin_url: cleanUrl,
      email: email ? email.trim() : undefined,
      reason: reason || 'Public opt-out form submission',
      requested_at: new Date().toISOString(),
    };

    const updated = [newOptOut, ...current];
    localStorage.setItem(STORAGE_KEYS.OPT_OUTS, JSON.stringify(updated));

    // Also purge from search cache and bookmarks
    this.purgeProfileFromCache(cleanUrl);

    // Sync to Firestore
    setDoc(doc(db, 'opt_outs', newOptOut.id), newOptOut).catch((err) =>
      console.warn('Firestore opt-out sync notice:', err)
    );

    return newOptOut;
  },

  removeOptOut(optOutId: string): void {
    const current = this.getOptOuts();
    const updated = current.filter((o) => o.id !== optOutId);
    localStorage.setItem(STORAGE_KEYS.OPT_OUTS, JSON.stringify(updated));
  },

  isOptedOut(linkedinUrl: string): boolean {
    const optOuts = this.getOptOuts();
    const cleanUrl = linkedinUrl.trim().toLowerCase().replace(/\/+$/, '');
    return optOuts.some(
      (o) => o.linkedin_url.toLowerCase().replace(/\/+$/, '') === cleanUrl
    );
  },

  // Connection Requests
  getConnectionRequests(): ConnectionRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONNECTION_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  createConnectionRequest(
    alumni: AlumniProfile,
    message: string
  ): { success: boolean; error?: string; request?: ConnectionRequest } {
    const user = this.getUserSession();
    const all = this.getConnectionRequests();

    // Daily limit check: 5 requests per day
    const today = new Date().toISOString().split('T')[0];
    const userTodayCount = all.filter(
      (r) => r.from_user_id === user.id && r.created_at.startsWith(today)
    ).length;

    if (userTodayCount >= 5) {
      return {
        success: false,
        error: 'Daily connection limit reached (5 requests/day). This protects alumni from spam.',
      };
    }

    const newRequest: ConnectionRequest = {
      id: `req-${Date.now()}`,
      from_user_id: user.id,
      from_user_name: user.display_name,
      to_alumni_id: alumni.id,
      to_alumni_name: alumni.name,
      message,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.CONNECTION_REQUESTS, JSON.stringify([newRequest, ...all]));
    return { success: true, request: newRequest };
  },

  respondConnectionRequest(requestId: string, status: 'accepted' | 'declined'): void {
    const current = this.getConnectionRequests();
    const updated = current.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          replied_at: new Date().toISOString(),
          from_user_email: status === 'accepted' ? 'student.fellow@campus.edu' : undefined,
        };
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEYS.CONNECTION_REQUESTS, JSON.stringify(updated));
  },

  // Self-Registered Alumni
  getSelfRegisteredAlumni(): AlumniProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SELF_REGISTERED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSelfRegisteredProfile(profile: Partial<AlumniProfile>): AlumniProfile {
    const current = this.getSelfRegisteredAlumni();
    const user = this.getUserSession();

    const newProfile: AlumniProfile = {
      id: profile.id || `alm-self-${Date.now()}`,
      user_id: user.id,
      name: profile.name || user.display_name,
      headline: profile.headline || '',
      current_role: profile.current_role || null,
      company: profile.company || null,
      location: profile.location || null,
      college: profile.college || 'Indian Institute of Technology Jodhpur',
      passout_year: profile.passout_year || 2020,
      branch: profile.branch || 'Computer Science',
      linkedin_url: profile.linkedin_url || '',
      source: 'self_registered',
      confidence: 'high',
      college_match: true,
      year_match: true,
      branch_match: true,
      short_bio: profile.short_bio,
      is_available_for_mentorship: profile.is_available_for_mentorship ?? true,
      visibility: profile.visibility || {
        show_company: true,
        show_role: true,
        show_location: true,
      },
      created_at: new Date().toISOString(),
    };

    const existingIndex = current.findIndex((p) => p.user_id === user.id || p.id === newProfile.id);
    let updated: AlumniProfile[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newProfile;
    } else {
      updated = [newProfile, ...current];
    }

    localStorage.setItem(STORAGE_KEYS.SELF_REGISTERED, JSON.stringify(updated));
    return newProfile;
  },

  deleteSelfRegisteredProfile(profileId: string): void {
    const current = this.getSelfRegisteredAlumni();
    const updated = current.filter((p) => p.id !== profileId);
    localStorage.setItem(STORAGE_KEYS.SELF_REGISTERED, JSON.stringify(updated));
  },

  // Cache & Search Logs
  getSearchLogs(): SearchLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SEARCH_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addSearchLog(log: Omit<SearchLog, 'id' | 'created_at'>): void {
    const current = this.getSearchLogs();
    const newLog: SearchLog = {
      ...log,
      id: `log-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.SEARCH_LOGS, JSON.stringify([newLog, ...current.slice(0, 49)]));
  },

  purgeAllCache(): void {
    localStorage.removeItem(STORAGE_KEYS.SEARCH_CACHE);
  },

  purgeProfileFromCache(linkedinUrl: string): void {
    try {
      const cacheData = localStorage.getItem(STORAGE_KEYS.SEARCH_CACHE);
      if (!cacheData) return;
      const cache = JSON.parse(cacheData);
      const cleanTarget = linkedinUrl.toLowerCase().replace(/\/+$/, '');

      // Filter target out of any cached response
      for (const key of Object.keys(cache)) {
        if (cache[key]?.alumni) {
          cache[key].alumni = cache[key].alumni.filter(
            (a: AlumniProfile) => a.linkedin_url.toLowerCase().replace(/\/+$/, '') !== cleanTarget
          );
        }
      }
      localStorage.setItem(STORAGE_KEYS.SEARCH_CACHE, JSON.stringify(cache));
    } catch {
      // ignore
    }
  },

      // Theme
  getTheme(): 'light' | 'dark' {
    try {
      const pref = localStorage.getItem(STORAGE_KEYS.THEME);
      if (pref === 'dark' || pref === 'light') return pref;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },

  setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  // User Feedbacks
  getFeedbacks(): import('../types').UserFeedback[] {
    try {
      const data = localStorage.getItem('kaye_feedbacks');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addFeedback(feedback: Omit<import('../types').UserFeedback, 'id' | 'created_at'>): import('../types').UserFeedback {
    const current = this.getFeedbacks();
    const newFb: import('../types').UserFeedback = {
      ...feedback,
      id: `fb-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newFb, ...current];
    localStorage.setItem('kaye_feedbacks', JSON.stringify(updated));

    // Sync to Firestore
    setDoc(doc(db, 'feedbacks', newFb.id), newFb).catch((err) =>
      console.warn('Firestore feedback sync notice:', err)
    );

    return newFb;
  },

  deleteFeedback(id: string): void {
    const current = this.getFeedbacks();
    const updated = current.filter((f) => f.id !== id);
    localStorage.setItem('kaye_feedbacks', JSON.stringify(updated));

    deleteDoc(doc(db, 'feedbacks', id)).catch((err) =>
      console.warn('Firestore feedback delete notice:', err)
    );
  },

  // Firebase Authentication Integration
  async signInWithGoogle(): Promise<UserSession> {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const isAdminEmail = user.email === 'hehealpha247@gmail.com';
      const session: UserSession = {
        id: user.uid,
        email: user.email || 'user@example.com',
        display_name: user.displayName || 'Google User',
        role: isAdminEmail ? 'admin' : 'student',
        search_count_this_hour: 0,
        connect_requests_today: 0,
      };
      this.setUserSession(session);
      return session;
    } catch (err) {
      console.warn('Google sign-in error:', err);
      throw err;
    }
  },

  async signOutUser(): Promise<void> {
    await signOut(auth);
    this.setUserSession(DEFAULT_USER);
  },

  // Owner Admin Protection ("Admin panel sirf mere liye hai sabke liye nhi")
  // Owner passphrase default: "nothing" or "kaye2026" or "owner"
  isAdminUnlocked(): boolean {
    return sessionStorage.getItem('kaye_admin_unlocked') === 'true';
  },

  unlockAdmin(passcode: string): boolean {
    const validKeys = ['nothing', '@nothing', 'kaye2026', 'admin', 'admin123', 'owner'];
    const isValid = validKeys.includes(passcode.trim().toLowerCase());
    if (isValid) {
      sessionStorage.setItem('kaye_admin_unlocked', 'true');
    }
    return isValid;
  },

  lockAdmin(): void {
    sessionStorage.removeItem('kaye_admin_unlocked');
  },
};

