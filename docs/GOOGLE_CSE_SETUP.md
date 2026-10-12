# Google Programmable Search Engine Setup Guide for Kaye

To enable live search capabilities for the Kaye AlumniFinder agent, follow these setup steps to obtain your `GOOGLE_API_KEY` and `GOOGLE_CSE_ID`.

---

### Step 1: Create a Google Cloud Project & Enable API
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `kaye-alumnifinder-prod`).
3. In the APIs & Services library, search for **Custom Search API**.
4. Click **Enable**.
5. Navigate to **Credentials** -> **Create Credentials** -> **API Key**.
6. (Recommended) Restrict the API key to only call the "Custom Search API".
7. Copy this value as `GOOGLE_API_KEY`.

---

### Step 2: Configure the Programmable Search Engine (Restricted to LinkedIn)
1. Go to [Google Programmable Search Engine Console](https://programmablesearchengine.google.com/controlpanel/all).
2. Click **Add** to create a new search engine.
3. Name your search engine (e.g., `Kaye LinkedIn Alumni Search`).
4. Under **What to search?**:
   - Select **Search specific sites or pages**.
   - Add the pattern: `www.linkedin.com/in/*`
   - Ensure the search pattern is strictly restricted to individual profiles (`/in/*`), not job posts or company boards.
5. Click **Create**.
6. In the search engine overview, copy the **Search engine ID** (cx).
7. Copy this value as `GOOGLE_CSE_ID`.

---

### Step 3: Estimated API Costs
- **Free Tier**: Google provides 100 free search queries per day.
- **Paid Tier**: $5 per 1,000 queries thereafter.
- **Anthropic Claude 3.5 Sonnet**: ~$0.003 per batch parse (10 snippets).
- **Average Cost per Search**:
  - Repeat searches (Cache Hit): **$0.00**
  - Fresh search (3 Google queries + 1 Claude batch parse): **~$0.018**.
- With Kaye's 7-day query cache, 60–80% of student queries on popular campuses hit the cache, lowering monthly operational costs significantly.
