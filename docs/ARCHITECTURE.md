# Kaye AlumniFinder - System Architecture & Risk Governance

## 1. High-Level Topology
```
[Client Web Browser (Tactile Neumorphic SPA)]
                    |
                    v (HTTPS / Session Token)
[Next.js / Node.js BFF Gateway] 
   - Rate limiting: 10/hr logged in, 3/hr anonymous
   - Query hash caching (< 2s response)
   - Immediate opt-out suppression check
                    |
                    v (X-Agent-Key header)
[FastAPI Search & Reasoning Agent]
   - Query Builder (4-6 precision queries)
   - Input Normalizer (abbreviation expansion)
                    |
     +--------------+--------------+
     |                             |
     v                             v
[Google Programmable Search]   [Anthropic Claude 3.5 Sonnet / Gemini]
(Strictly site:linkedin.com/in) (Structured JSON parsing, zero-markdown)
```

## 2. Privacy, Legal & Cost Risk Analysis

| Dimension | Risk | Kaye Mitigation |
|---|---|---|
| **LinkedIn Terms / Scraping** | Legal challenge under CFAA or ToS breach | Kaye **NEVER** scrapes LinkedIn, runs headless browsers, or bypasses authentication. Only public search engine snippets provided by Google's official API are processed. |
| **Data Privacy (DPDP / GDPR)** | Unauthorized personal data exposure | Zero collection of private contact data (strictly NO emails, phone numbers, or residential addresses). Public professional info only. Instant unconditional opt-out flow. |
| **Consent & Harassment** | Unsolicited student spam to busy alumni | Outreach requests can ONLY be sent to alumni who actively self-register and consent. Daily cap of 5 requests per user. Respectful pledge enforced. |
| **API Costs & Rate Limits** | Runaway billing on Google/Anthropic | Hard budget caps per request (max 15 Google calls, 6 LLM calls). 7-day query caching in Redis/Postgres ensures repeat searches cost $0. |

## 3. Cache Strategy
- Hash Key: `hash(college, passout_year, branch, company, city, role)`.
- Storage: 7-day TTL with proactive invalidation whenever an individual requests an opt-out.
- Purge: Cache items older than 30 days are automatically discarded for data minimization.
