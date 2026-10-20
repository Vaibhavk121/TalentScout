# TalentScout — Recruiter Discovery Platform

> **Find the people who can help you get hired.**  
> A production recruiter discovery platform that helps job seekers find verified talent acquisition professionals, recruiters, and hiring managers at target companies using real-time Google search via Serper.dev.

---

## 🌟 Overview

Standard job applications often vanish into applicant tracking system (ATS) black holes. **TalentScout** solves this by empowering job seekers to discover publicly indexable LinkedIn recruiter profiles at specific target companies, view profile photos, verify recruiter affiliations, generate customized connection notes under LinkedIn’s 300-character limit, and manage an active outreach pipeline.

---

## 🚀 Key Features

1. **Live Recruiter Discovery via Serper.dev**
   - Direct Google SERP queries targeting publicly indexed LinkedIn profiles (`site:linkedin.com/in`).
   - Filter by recruiter role (*Technical Recruiter, Lead Recruiter, Head of Talent, Sourcer, University Recruiter*).
   - Filter by specialty/department (*Engineering & Tech, Product & Design, Sales & Marketing, Infrastructure, People & HR*) and location (*San Francisco, New York, Seattle, Austin, Remote, London*).
   - Real-world extraction: candidate names, job titles, companies, locations, search snippets, and LinkedIn profile URLs.

2. **LinkedIn Profile Pictures & Fallback Avatars**
   - Renders actual LinkedIn profile pictures when indexed in search results.
   - Built-in `referrerPolicy="no-referrer"` to prevent CDN 403 hotlink rejections.
   - Seamless fallback to high-contrast, deterministic initials avatars on load errors or missing pictures.

3. **Verification & Confidence Scoring**
   - Automatically cross-checks company names, recruiter titles, and profile URL structures.
   - Computes a confidence score (0–100%) and sorts verified recruiters to the top.
   - Deduplicates identical profiles across search result pages.

4. **Results Dashboard (Dual Views)**
   - **Grid Card View**: High-context profile cards with company badges, location tags, snippet previews, and one-click LinkedIn actions.
   - **Table View**: Compact, high-density row layout for rapid scanning and bulk review.
   - Real-time in-result text filtering, role/location selectors, and multi-criteria sorting.

5. **Saved Contacts Pipeline**
   - Bookmark key contacts with one click.
   - Track outreach status across 4 stages: `Not Contacted`, `Contacted`, `Replied`, and `Follow-up Needed`.
   - Add and update inline private notes for each recruiter.
   - Export saved contacts to CSV for spreadsheet workflows.
   - Dual-mode persistence: Browser `localStorage` for instant use, with cloud synchronization when connected to Supabase.

6. **Outreach Assistant**
   - Crafts concise, natural LinkedIn connection notes tailored to your target role and personal hook.
   - Multiple tones: *Concise & Direct*, *Warm & Value*, *Role & Skills Focused*, and *Full InMail Pitch*.
   - Live character counter with warning indicators to keep notes under LinkedIn’s strict **300-character limit**.
   - One-click copy to clipboard.
   - 100% compliant: messages are drafted for personal review and never sent automatically.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router, Turbopack)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Search Engine**: [Serper.dev](https://serper.dev) (Google Search API)
- **Persistence & Auth**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`) with client-side localStorage fallback
- **API Routes**: Next.js Serverless Route Handlers (`/api/search`)

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root:

```env
# Required: Serper.dev API Key (Get 2,500 free queries at https://serper.dev)
SERPER_API_KEY=your_serper_api_key_here

# Optional: Supabase Database & Auth (for multi-device cloud sync)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **Security Note**: `SERPER_API_KEY` is strictly accessed on the server in Next.js API routes (`src/app/api/search/route.ts`) and is never exposed in client bundles or network requests.

---

## 📦 Local Development

### 1. Installation

```bash
git clone <repo-url>
cd my-app
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add your `SERPER_API_KEY` obtained from [serper.dev](https://serper.dev) (sign up with email for 2,500 free searches, no credit card required).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build Verification

```bash
npm run build
npm run start
```

---

## 🚀 Deploying to Vercel

### Step 1: Push Code to GitHub / GitLab / Bitbucket
Ensure your repository is up to date:
```bash
git add .
git commit -m "Production release: TalentScout recruiter discovery platform"
git push origin main
```

### Step 2: Import into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." > "Project"**.
2. Select your repository and click **"Import"**.
3. Framework Preset will be automatically detected as **Next.js**.

### Step 3: Configure Environment Variables in Vercel
In the **Environment Variables** section of the deployment configuration, add:

| Key | Value | Notes |
|---|---|---|
| `SERPER_API_KEY` | `your_serper_api_key` | **Required**: API key from [serper.dev](https://serper.dev) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyz.supabase.co` | *Optional*: For Supabase cloud sync |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_anon_key` | *Optional*: For Supabase cloud sync |

### Step 4: Deploy
Click **"Deploy"**. Vercel will build and deploy the application with zero additional configuration required.

---

## 🗄️ Supabase Database Schema (Optional)

If you connect Supabase for cross-device cloud persistence, run this in your **Supabase SQL Editor**:

```sql
CREATE TABLE IF NOT EXISTS public.saved_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    linkedin_url TEXT NOT NULL,
    source_url TEXT,
    snippet TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pattern_matched',
    confidence_score INTEGER NOT NULL DEFAULT 85,
    department TEXT,
    status TEXT NOT NULL DEFAULT 'not_contacted',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_linkedin UNIQUE (user_id, linkedin_url)
);

ALTER TABLE public.saved_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contacts" ON public.saved_contacts
    FOR ALL USING (auth.uid() = user_id);
```

---

## 🛡️ Privacy & Compliance Notice

- TalentScout strictly queries public search engine indexes (`site:linkedin.com/in`).
- It does **not** scrape authenticated LinkedIn pages, access user sessions, or bypass login barriers.
- All outreach messages generated by the Outreach Assistant are client-side drafts for personal review and must be sent manually by the user.
