# Kaye - AlumniFinder

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![UI: Neumorphic](https://img.shields.io/badge/UI-Tactile_Neumorphism-indigo.svg)](#)

Kaye is a tactile neumorphic alumni search engine connecting engineering and college students with alumni of their university for respectful mentorship, career advice, and referral requests.

---

## 🌟 Core Features

- **Tactile Neumorphic Interface**: Dual-shadow convex & concave elevation, responsive light and dark themes, mobile-first design (tested down to 360px).
- **Fast Alumni Search**: Search by College (with autocomplete), Graduation Year (1995–2030), Branch of study, and optional filters (Company, City, Job Title).
- **Consent-First Networking**:
  - Direct connection requests are strictly routed to alumni who have actively self-registered on the platform.
  - Public search matches link out directly to LinkedIn profiles.
  - Strict daily limit of 5 requests per user with a mandatory anti-spam pledge.
  - Zero exposure of email or phone numbers unless an alumnus explicitly accepts a connection.
- **Instant Opt-Out Engine**: Anyone can paste their LinkedIn URL to permanently purge their profile from results and caches.
- **Saved Bookmarks & Notes**: Bookmark alumni with personal guidance notes and export to clean CSV.
- **Admin Governance**: View search traffic, query cache hit rates, API cost metrics, and manage opt-out requests.
- **Zero-Dependency Mock Mode**: Instant out-of-the-box operation with rich realistic alumni databases across top institutions (IITs, BITS, NITs, etc.).

---

## 🚀 Quick Start (Local Setup)

### 1. Install & Run Frontend
```bash
# Clone the repository
git clone https://github.com/your-org/kaye-alumnifinder.git
cd kaye-alumnifinder

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run Python Agent (Optional for Live Production)
```bash
cd services/agent
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:
```env
GOOGLE_API_KEY="your-google-custom-search-api-key"
GOOGLE_CSE_ID="your-programmable-search-engine-id"
ANTHROPIC_API_KEY="your-anthropic-api-key"
AGENT_SECRET="kaye_agent_secure_token"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
VITE_MOCK_MODE="true"
```

---

## 🔒 Privacy & Legal Compliance Note
- **India DPDP Act 2023 & GDPR**: Kaye operates with strict data minimization. It indexes only publicly search-engine-accessible snippets, never scrapes LinkedIn, and never predicts or reveals phone numbers or email addresses.
- **Disclaimer**: Kaye is an independent educational tool and is not affiliated with, sponsored by, or endorsed by LinkedIn Corporation or any listed college. Always seek formal legal review prior to commercial deployment.
