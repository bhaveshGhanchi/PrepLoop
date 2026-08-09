# PrepLoop

Interview prep workspace for **LeetCode**, **HLD**, **LLD**, and **behavioral** stories.

Job apply flow stays in Jobright. PrepLoop is for preparation only.

## Features

1. **LeetCode** — approach required before opening LC; paste accepted code for tags + time/space analysis
2. **HLD** — random high-level system design questions with saved practice notes
3. **LLD** — random low-level / OOP design questions with saved practice notes
4. **Behavioral** — structured STAR stories with proofread / 60-second polish
5. **Today** — a dashboard that tracks the current day’s practice loop
6. **History** — searchable, cross-device practice history

Practice saves locally first and syncs to Supabase after sign-in. Without an AI
provider, analysis uses an instant local heuristic and labels the result accordingly.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase authentication + PostgreSQL
- Optional AI API
- Chrome extension (planned, separate package later)

## Dev

```bash
cd /Users/bhaveshghanchi/Desktop/projects/preploop
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

1. Copy `.env.example` to `.env.local` and add the project URL and publishable key.
2. In the Supabase SQL Editor, run the files in `supabase/migrations/` in
   timestamp order.
3. Restart the app and use **Sign in to sync**.

Row-level security restricts every practice entry to its owner. Existing local
history is uploaded automatically on the first successful sign-in.

## Optional AI provider

PrepLoop can use any OpenAI-compatible chat-completions endpoint:

```bash
AI_API_KEY=...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=...
```

Set these in `.env.local` and restart the dev server. Secrets are only read by the
server-side analysis route.

## Next

The Chrome extension is intentionally a later, separate package. It will enforce
the same approach gate and sync accepted LeetCode code back into PrepLoop.
