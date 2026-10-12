export type Role = 'student' | 'alumni' | 'admin';

export type MatchConfidence = 'high' | 'medium' | 'low';

export type ProfileSource = 'agent' | 'self_registered';

export interface AlumniProfile {
  id: string;
  name: string;
  headline: string;
  current_role: string | null;
  company: string | null;
  location: string | null;
  college: string;
  passout_year: number;
  branch: string;
  linkedin_url: string;
  source: ProfileSource;
  confidence: MatchConfidence;
  matches?: string[];
  college_match: boolean;
  year_match: boolean;
  branch_match: boolean;
  user_id?: string | null;
  short_bio?: string;
  skills?: string[];
  is_available_for_mentorship?: boolean;
  visibility?: {
    show_company?: boolean;
    show_role?: boolean;
    show_location?: boolean;
  };
  created_at: string;
}

export interface SearchFilters {
  college: string;
  passout_year: number;
  branch: string;
  count: number;
  company?: string;
  city?: string;
  role?: string;
}

export interface College {
  id: string;
  name: string;
  short_name: string;
  city: string;
  state: string;
}

export interface Bookmark {
  user_id: string;
  alumni_profile_id: string;
  note: string;
  created_at: string;
  alumni?: AlumniProfile;
}

export interface ConnectionRequest {
  id: string;
  from_user_id: string;
  from_user_name: string;
  from_user_email?: string; // only revealed after acceptance
  to_alumni_id: string;
  to_alumni_name: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  replied_at?: string;
}

export interface OptOutRecord {
  id: string;
  linkedin_url: string;
  email?: string;
  reason?: string;
  requested_at: string;
}

export interface SearchLog {
  id: string;
  user_id?: string;
  filters: SearchFilters;
  result_count: number;
  from_cache: boolean;
  created_at: string;
}

export interface SearchResponse {
  count: number;
  from_cache: boolean;
  execution_time_ms: number;
  query_hash: string;
  alumni: AlumniProfile[];
  warning?: string;
}

export interface UserSession {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  search_count_this_hour: number;
  connect_requests_today: number;
}

export interface UserFeedback {
  id: string;
  name: string;
  college_or_role?: string;
  rating: number; // 1 to 5
  category: 'feature' | 'bug' | 'mentorship' | 'general';
  message: string;
  created_at: string;
}

