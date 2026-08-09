# PrepLoop

[![CI](https://github.com/bhaveshGhanchi/PrepLoop/actions/workflows/ci.yml/badge.svg)](https://github.com/bhaveshGhanchi/PrepLoop/actions/workflows/ci.yml)

A full-stack interview preparation workspace for deliberate coding practice,
system design, and behavioral storytelling.

[Live Demo](https://prep-loop-bhavesh-projects-108.vercel.app) ·
[Source Code](https://github.com/bhaveshGhanchi/PrepLoop)

## Why PrepLoop

Interview preparation is often scattered across coding platforms, documents, and
notes. PrepLoop combines the recurring practice loop in one responsive application
while intentionally leaving job applications to dedicated tools.

## Highlights

- **Approach-first coding:** requires a written strategy before opening a problem.
- **LeetCode metadata:** extracts the problem name, difficulty, and topic tags from
  pasted LeetCode URLs.
- **Solution review:** saves accepted code, language, approach, inferred tags, and
  time/space complexity for later revision.
- **System design practice:** serves randomized HLD and LLD prompts with structured
  answer frameworks.
- **Behavioral coaching:** captures STAR stories and provides concise proofreading
  and delivery feedback.
- **Cross-device history:** synchronizes searchable practice records between desktop
  and mobile while retaining a local-first cache.
- **Secure accounts:** uses Supabase authentication and PostgreSQL row-level security
  so users can only access their own records.
- **Automated delivery:** validates every push with GitHub Actions and deploys the
  production application through Vercel.
- **Privacy-friendly analytics:** measures page usage with Vercel Web Analytics.

## Architecture

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS
- **Backend:** Next.js route handlers
- **Database and auth:** Supabase PostgreSQL and Supabase Auth
- **Security:** per-user row-level security policies
- **External data:** server-side LeetCode metadata lookup with URL fallback
- **Analysis:** optional OpenAI-compatible provider with a deterministic local
  fallback
- **Hosting:** Vercel
- **CI/CD:** GitHub Actions and Vercel Git integration

Practice writes to browser storage first for immediate feedback. Authenticated
sessions then synchronize changes to Supabase, including migration of existing local
history after the first sign-in.

## Run locally

```bash
git clone https://github.com/bhaveshGhanchi/PrepLoop.git
cd PrepLoop
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

Add the Supabase project URL and publishable key to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Run the SQL files in `supabase/migrations/` in timestamp order. The migrations
create the practice schema, indexes, grants, and row-level security policies.

### Optional AI provider

PrepLoop supports OpenAI-compatible chat-completions APIs:

```bash
AI_API_KEY=...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=...
```

These values are read only by the server-side analysis route. Without them, PrepLoop
uses and clearly labels its local analysis fallback.

## Quality checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The same checks run automatically for pull requests and pushes to `main`.

## Resume summary

**PrepLoop — Full-stack Interview Preparation Platform**

- Built and deployed a responsive Next.js and TypeScript application for coding,
  system-design, and behavioral interview practice.
- Designed a local-first synchronization layer backed by Supabase PostgreSQL,
  authenticated accounts, offline caching, and row-level security.
- Integrated LeetCode metadata extraction, complexity analysis, searchable revision
  history, and automated CI/CD with GitHub Actions and Vercel.

## Roadmap

- Chrome extension for approach gating and accepted-code synchronization
- Spaced-repetition reminders and revision queues
- Richer practice analytics and progress trends
