import { AlumniProfile, SearchFilters, SearchResponse } from '../types';
import { COLLEGES, BRANCH_EXPANSIONS } from '../data/colleges';
import { storageService } from './storageService';

export const searchService = {
  // Normalization logic
  normalizeFilters(filters: SearchFilters): SearchFilters {
    const rawCollege = (filters.college || '').trim();
    const rawBranch = (filters.branch || '').trim();

    // Check if college matches a known short_name or id
    const foundCollege = COLLEGES.find(
      (c) =>
        c.name.toLowerCase() === rawCollege.toLowerCase() ||
        c.short_name.toLowerCase() === rawCollege.toLowerCase() ||
        c.id.toLowerCase() === rawCollege.toLowerCase()
    );

    const normalizedCollege = foundCollege ? foundCollege.name : rawCollege;

    // Expand branch acronyms (e.g., "CSE" -> "Computer Science")
    const lowerBranch = rawBranch.toLowerCase();
    const normalizedBranch = BRANCH_EXPANSIONS[lowerBranch] || rawBranch;

    return {
      college: normalizedCollege,
      passout_year: Number(filters.passout_year) || 2020,
      branch: normalizedBranch,
      count: Number(filters.count) || 10,
      company: filters.company?.trim() || undefined,
      city: filters.city?.trim() || undefined,
      role: filters.role?.trim() || undefined,
    };
  },

  // Generates hash key for caching
  generateQueryHash(f: SearchFilters): string {
    const str = `${f.college.toLowerCase()}|${f.passout_year}|${f.branch.toLowerCase()}|${(f.company || '').toLowerCase()}|${(f.city || '').toLowerCase()}|${(f.role || '').toLowerCase()}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return `q_${Math.abs(hash).toString(36)}`;
  },

  // Main search runner calling real Gemini API with Google Search Grounding
  async search(
    rawFilters: SearchFilters,
    options: { forceFresh?: boolean } = {}
  ): Promise<SearchResponse> {
    const startTime = performance.now();
    const filters = this.normalizeFilters(rawFilters);
    const queryHash = this.generateQueryHash(filters);

    // 1. Check client/session rate limits
    const session = storageService.getUserSession();
    if (session.search_count_this_hour >= 20) {
      throw new Error(
        'Rate limit reached: Maximum 20 searches per hour per account. Please wait a moment before trying again.'
      );
    }

    // 2. Check local query cache (unless forceFresh is requested)
    if (!options.forceFresh) {
      try {
        const cacheStore = JSON.parse(
          localStorage.getItem('kaye_search_cache') || '{}'
        );
        const cached = cacheStore[queryHash];
        if (cached && Date.now() - cached.timestamp < 3 * 24 * 60 * 60 * 1000) {
          // Filter out any profiles that have recently opted out
          const nonOptedOut = (cached.alumni || []).filter(
            (a: AlumniProfile) => !storageService.isOptedOut(a.linkedin_url)
          );

          if (nonOptedOut.length > 0) {
            session.search_count_this_hour += 1;
            storageService.setUserSession(session);

            const duration = Math.round(performance.now() - startTime) + 90;
            storageService.addSearchLog({
              user_id: session.id,
              filters,
              result_count: nonOptedOut.length,
              from_cache: true,
            });

            return {
              count: nonOptedOut.slice(0, filters.count).length,
              from_cache: true,
              execution_time_ms: duration,
              query_hash: queryHash,
              alumni: nonOptedOut.slice(0, filters.count),
            };
          }
        }
      } catch {
        // Continue to fresh API call
      }
    }

    // 3. Real server call using Gemini API with Google Search grounding
    let data: any = { alumni: [] };
    let apiError: string | null = null;

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      const json = await response.json();
      if (!response.ok) {
        apiError =
          json?.error || `Search failed with status ${response.status}. Please try again.`;
      } else {
        data = json;
      }
    } catch (fetchErr: any) {
      apiError =
        fetchErr?.message ||
        'Unable to connect to the search service. Please check your network or try again in a few moments.';
    }

    const fetchedAlumni: AlumniProfile[] = data?.alumni || [];

    // 4. Merge any self-registered verified alumni matching this query (never mock data)
    const selfRegistered = storageService.getSelfRegisteredAlumni().filter((item) => {
      if (storageService.isOptedOut(item.linkedin_url)) return false;
      const colMatch =
        item.college.toLowerCase().includes(filters.college.toLowerCase()) ||
        filters.college.toLowerCase().includes(item.college.toLowerCase());
      const yrMatch = item.passout_year === filters.passout_year;
      return colMatch && yrMatch;
    });

    if (apiError && selfRegistered.length === 0) {
      throw new Error(apiError);
    }

    // 5. Combine self-registered and agent-grounded results, then filter opt-outs
    const combined = [...selfRegistered, ...fetchedAlumni];
    const seenUrls = new Set<string>();
    const finalResults: AlumniProfile[] = [];

    for (const alum of combined) {
      const cleanUrl = alum.linkedin_url.toLowerCase().replace(/\/+$/, '');
      if (storageService.isOptedOut(cleanUrl)) continue;
      if (seenUrls.has(cleanUrl)) continue;
      seenUrls.add(cleanUrl);
      finalResults.push(alum);
      if (finalResults.length >= filters.count) break;
    }

    // Sort by confidence: high first
    finalResults.sort((a, b) => {
      const score = (p: AlumniProfile) =>
        p.confidence === 'high' ? 3 : p.confidence === 'medium' ? 2 : 1;
      return score(b) - score(a);
    });

    // 6. Save valid results into cache
    if (finalResults.length > 0) {
      try {
        const cacheStore = JSON.parse(
          localStorage.getItem('kaye_search_cache') || '{}'
        );
        cacheStore[queryHash] = {
          timestamp: Date.now(),
          alumni: finalResults,
          filters,
        };
        localStorage.setItem('kaye_search_cache', JSON.stringify(cacheStore));
      } catch {
        // LocalStorage quota fallback
      }
    }

    // Increment session search counter
    session.search_count_this_hour += 1;
    storageService.setUserSession(session);

    const executionTime =
      data.execution_time_ms || Math.round(performance.now() - startTime);

    storageService.addSearchLog({
      user_id: session.id,
      filters,
      result_count: finalResults.length,
      from_cache: false,
    });

    return {
      count: finalResults.length,
      from_cache: false,
      execution_time_ms: executionTime,
      query_hash: data.query_hash || queryHash,
      alumni: finalResults,
    };
  },
};
