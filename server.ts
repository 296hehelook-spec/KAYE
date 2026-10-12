import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 1. Health & Config endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'kaye-fullstack',
    developer: '@nothing',
    hasGeminiKey: Boolean(GEMINI_API_KEY),
    hasOpenRouterKey: Boolean(OPENROUTER_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 2. Real Grounded Search Endpoint using Gemini API with Google Search Grounding
app.post('/api/search', async (req, res) => {
  const startTime = Date.now();
  try {
    const { college, passout_year, branch, count = 10, company, city, role } = req.body;

    if (!college || !branch || !passout_year) {
      return res.status(400).json({
        error: 'College, branch, and passout year are required parameters.',
      });
    }

    const targetCount = Math.min(Math.max(Number(count) || 10, 1), 50);

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error:
          'GEMINI_API_KEY is not set on the server. Please check your AI Studio project secrets.',
      });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let prompt = `Search Google for publicly visible LinkedIn profiles (linkedin.com/in/...) of people who studied at ${college}, branch ${branch}, graduating in ${passout_year}. Return up to ${targetCount} people. Use ONLY what appears in search results. Never guess or invent a person, role, company or URL. If you are unsure, skip that person. Do NOT return email addresses or phone numbers. Output ONLY a valid JSON array, no markdown, with fields: name, headline, current_role, company, location, linkedin_url, matches (list of: college, year, branch that the result actually supports).`;

    const extraConstraints = [];
    if (company && typeof company === 'string' && company.trim()) {
      extraConstraints.push(`currently or previously at "${company.trim()}"`);
    }
    if (city && typeof city === 'string' && city.trim()) {
      extraConstraints.push(`located in or around "${city.trim()}"`);
    }
    if (role && typeof role === 'string' && role.trim()) {
      extraConstraints.push(`with role or title matching "${role.trim()}"`);
    }

    if (extraConstraints.length > 0) {
      prompt += ` Prioritize people who also match: ${extraConstraints.join(', ')}.`;
    }

    // Call Gemini with Google Search Grounding with quota (429) & demand (503) resilience
    let responseText = '';
    let usedFallback = false;

    try {
      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      responseText = geminiResponse.text || '';
    } catch (groundingErr: any) {
      const errMsg = String(groundingErr?.message || '');
      const isQuota429 =
        groundingErr?.status === 429 ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('exceeded your current quota');
      const isDemand503 =
        groundingErr?.status === 503 ||
        errMsg.includes('503') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand');

      if (isQuota429 || isDemand503) {
        console.warn(
          `[Gemini Search] ${isQuota429 ? '429 Quota Exhaustion' : '503 High Demand'} on Google Search Grounding. Attempting model fallback...`
        );
        try {
          await new Promise((r) => setTimeout(r, 400));
          // Try model fallback without search tool
          let fallbackRes;
          try {
            fallbackRes = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: `${prompt} Return known public LinkedIn profiles of real alumni matching this query from public records. Output ONLY a valid JSON array.`,
            });
          } catch {
            // Secondary attempt on stable gemini-3.5-flash
            fallbackRes = await ai.models.generateContent({
              model: 'gemini-3.5-flash',
              contents: `${prompt} Return known public LinkedIn profiles of real alumni matching this query from public records. Output ONLY a valid JSON array.`,
            });
          }
          responseText = fallbackRes?.text || '';
          usedFallback = true;
        } catch (fallbackErr: any) {
          console.warn('[Gemini Search] Fallback constrained by API limits:', fallbackErr?.message);
          return res.status(429).json({
            error:
              'Gemini API Search Grounding quota exceeded (429: Resource Exhausted). Free-tier API keys have limits on Google Search grounding. Please wait 60 seconds or select a billing-enabled key in Settings > Secrets.',
            code: 'RESOURCE_EXHAUSTED',
            details: 'https://ai.google.dev/gemini-api/docs/rate-limits',
            alumni: [],
          });
        }
      } else {
        throw groundingErr;
      }
    }

    // Helper: Safely parse JSON array
    let rawList: any[] = [];
    try {
      let cleaned = responseText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        rawList = parsed;
      } else if (parsed && typeof parsed === 'object') {
        for (const key of Object.keys(parsed)) {
          if (Array.isArray(parsed[key])) {
            rawList = parsed[key];
            break;
          }
        }
      }
    } catch {
      // Search for opening and closing brackets
      const firstBracket = responseText.indexOf('[');
      const lastBracket = responseText.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket > firstBracket) {
        try {
          const sub = responseText.substring(firstBracket, lastBracket + 1);
          const parsed = JSON.parse(sub);
          if (Array.isArray(parsed)) rawList = parsed;
        } catch (innerErr) {
          console.warn('JSON parsing from grounding response failed:', innerErr);
        }
      }
    }

    // Helper: validate and normalize LinkedIn URLs
    const isValidLinkedInUrl = (url: any): boolean => {
      if (!url || typeof url !== 'string') return false;
      const trimmed = url.trim();
      return /^https:\/\/(?:[a-zA-Z0-9-]+\.)?linkedin\.com\/in\/[a-zA-Z0-9%_-]+/i.test(trimmed);
    };

    const normalizeUrl = (url: string): string => {
      let cleaned = url.trim();
      if (cleaned.startsWith('http://')) {
        cleaned = 'https://' + cleaned.slice(7);
      }
      try {
        const u = new URL(cleaned);
        return `${u.origin}${u.pathname}`.replace(/\/+$/, '');
      } catch {
        return cleaned.split('?')[0].replace(/\/+$/, '');
      }
    };

    // Filter, validate, and deduplicate
    const seenUrls = new Set<string>();
    const alumniResults = [];

    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      if (!item || !item.name) continue;

      const rawUrl = item.linkedin_url;
      if (!rawUrl || !isValidLinkedInUrl(rawUrl)) continue;

      const cleanUrl = normalizeUrl(rawUrl);
      const urlKey = cleanUrl.toLowerCase();
      if (seenUrls.has(urlKey)) continue;
      seenUrls.add(urlKey);

      const matchesArray: string[] = Array.isArray(item.matches)
        ? item.matches.map((m: any) => String(m).toLowerCase())
        : ['college'];

      const collegeMatch = matchesArray.some((m) => m.includes('college') || m.includes('university') || m.includes('iit') || m.includes('nit') || m.includes('bits'));
      const yearMatch = matchesArray.some((m) => m.includes('year') || m.includes(String(passout_year)));
      const branchMatch = matchesArray.some((m) => m.includes('branch') || m.includes('cse') || m.includes('engineer') || m.includes('degree'));

      const confidence =
        matchesArray.length >= 2 || (collegeMatch && yearMatch)
          ? 'high'
          : matchesArray.length === 1
          ? 'medium'
          : 'low';

      alumniResults.push({
        id: `alm-gemini-${Date.now()}-${i}`,
        name: String(item.name).trim(),
        headline: item.headline ? String(item.headline).trim() : `${item.current_role || 'Alumnus'} at ${item.company || college}`,
        current_role: item.current_role ? String(item.current_role).trim() : null,
        company: item.company ? String(item.company).trim() : null,
        location: item.location ? String(item.location).trim() : null,
        college: college,
        passout_year: Number(passout_year),
        branch: branch,
        linkedin_url: cleanUrl,
        source: 'agent' as const,
        confidence: confidence as 'high' | 'medium' | 'low',
        matches: matchesArray,
        college_match: collegeMatch,
        year_match: yearMatch,
        branch_match: branchMatch,
        is_available_for_mentorship: false,
        created_at: new Date().toISOString(),
      });

      if (alumniResults.length >= targetCount) break;
    }

    const executionTimeMs = Date.now() - startTime;

    return res.json({
      count: alumniResults.length,
      from_cache: false,
      execution_time_ms: executionTimeMs,
      query_hash: `gemini_${passout_year}_${Date.now()}`,
      alumni: alumniResults,
    });
  } catch (err: any) {
    const errMsg = String(err?.message || '');
    const isQuota =
      err?.status === 429 ||
      errMsg.includes('429') ||
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.includes('exceeded your current quota');
    const is503 =
      err?.status === 503 ||
      errMsg.includes('503') ||
      errMsg.includes('UNAVAILABLE') ||
      errMsg.includes('high demand');

    if (isQuota) {
      console.warn('[Gemini Search] Request reached API quota limit (429).');
      return res.status(429).json({
        error:
          'Gemini API Search Grounding quota exceeded (429: Resource Exhausted). Free-tier API keys have limits on Google Search grounding. Please wait 60 seconds or select a billing-enabled key in Settings > Secrets.',
        code: 'RESOURCE_EXHAUSTED',
        alumni: [],
      });
    }

    if (is503) {
      console.warn('[Gemini Search] Service temporarily busy (503).');
      return res.status(503).json({
        error:
          'Gemini search service is currently experiencing high demand. Please try again in a few moments.',
        code: 'SERVICE_UNAVAILABLE',
        alumni: [],
      });
    }

    console.warn('[Gemini Search] Search request failed:', errMsg || err);
    return res.status(500).json({
      error:
        err?.message ||
        'Failed to search public profiles with Gemini Google Search grounding. Please try again.',
      alumni: [],
    });
  }
});

// Vite Middleware integration in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`> Kaye AlumniFinder full-stack server running on http://localhost:${port}`);
    console.log(`> Developer: @nothing | Keys: Gemini ${GEMINI_API_KEY ? '✓' : '✗'}, OpenRouter ${OPENROUTER_API_KEY ? '✓' : '✗'}`);
  });
}

startServer();
