# DSA Tracker — Project Audit

**Stack confirmed:** React 19 + TypeScript + Vite frontend (deployed on Vercel), Supabase (Postgres + Auth + 1 Edge Function), OpenRouter (free Gemma model) for AI — not OpenAI directly, despite the branding.

---

## 1. The core architectural problem

There are **two completely disconnected data systems** in this app, and almost nothing tells you which one you're looking at:

| System | Storage | Used by |
|---|---|---|
| **Real backend** | Supabase `problems` table (per-user, via `user_id`) | Questions page (table + add/edit/delete), Patterns page, Pattern Details page, AI pattern summary |
| **Fake local demo data** | Hardcoded array in `lib/seedData.ts`, persisted to `localStorage` only | Dashboard (Hero, AI Memory Coach, Stats, Pattern Mastery, Heatmap, Memory Score Trend, Predictions, Recent Activity), entire Revision page, AI Chat page |

So the Dashboard, Revision Center, and "AI Coach" chat all look fully built and polished in the UI, but **they never read the questions you actually log**. They run entirely off 8 hardcoded demo questions seeded into `localStorage`, the same for every browser/user. This is almost certainly the biggest thing to fix — it's not a small bug, it's a wiring gap between two halves of the app that were built separately.

**Also:** the "AI Coach" on the AI Chat page is **not AI at all** — `ChatWorkspace.tsx` uses a hardcoded `buildCoachResponse()` function that pattern-matches keywords like "weakest", "quiz", "revise today" and returns canned template strings built from the local demo data. The only real LLM call in the entire app is the "Generate Summary" button on the Pattern Details page, which hits a Supabase Edge Function → OpenRouter (free `google/gemma-4-31b-it:free` model).

---

## 2. What's actually done and working

- **Auth**: Supabase email/password sign up + sign in (`services/auth.ts`, `Login.tsx`) — functional.
- **Questions CRUD**: `ReflectionPanel.tsx` does real Supabase insert/update/delete against the `problems` table, tied to `user_id` on insert. This is genuinely complete — title, difficulty, pattern, confidence, reflection, mistakes, memory trigger, time taken.
- **Patterns page & Pattern Details page**: correctly fetch the logged-in user's own problems (`.eq("user_id", user.id)`), group by topic, compute average confidence, and show status badges.
- **AI Pattern Summary**: real end-to-end feature — click "Generate Summary" → Edge Function builds a prompt from the user's solved questions/reflections for that pattern → OpenRouter → parses JSON → saves to a `pattern_summaries` table → renders. This one is legitimately complete and clever.
- **Theming**: dark/light mode toggle works via `ThemeContext`.
- Build config, TypeScript, Tailwind, Vercel deployment pipeline are all in place and building successfully (per your recent commits fixing TS/router build errors).

---

## 3. Likely causes of your post-deploy crashes

1. **Vercel environment variables.** `frontend/.env` (with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) is git-ignored — correctly not committed — but that means it **only works locally** unless you've separately added those two variables in the Vercel project's Environment Variables settings. If they're missing in Vercel, `createClient(undefined, undefined)` throws immediately on module load in `lib/supabase.ts`, which is imported almost everywhere — this would produce a **white-screen crash on every page**, not just AI features. This is my top suspect. Worth double-checking in the Vercel dashboard.
2. **Missing `OPENROUTER_API_KEY` Edge Function secret.** If that's not set as a secret on the Supabase project (separate from anything in git), "Generate Summary" returns a 500 and the UI does `alert(JSON.stringify(err))` — an ugly crash-looking popup, but scoped to that one feature.
3. **No error boundary anywhere in the app.** A single failed/undefined data access in any one component (e.g. Supabase returning null because RLS blocked a query) takes down the entire React tree to a blank page instead of failing gracefully.
4. **Supabase email confirmation.** If "Confirm email" is enabled on your Supabase Auth settings (it is by default), signup succeeds but login will fail with an alert until the user clicks the confirmation email — easy to misread as a broken signup flow.

---

## 4. Bugs worth fixing regardless

- **`questionservice.ts` (`getQuestions`) and `statsService.ts` (`getQuestionStats`) query `problems` with no `user_id` filter at all** — unlike Patterns/PDetails, which correctly filter by the logged-in user. Depending on whether Row Level Security is actually enabled on the `problems` table in Supabase, this either (a) is silently saved by RLS, or (b) **leaks every user's questions to every other logged-in user** on the main Questions table and stats pills. This needs verifying in the Supabase dashboard — it's a real data-isolation risk, not just a display bug.
- **Two separate, conflicting router definitions.** `main.tsx` renders `App.tsx`, which has its own inline `<Routes>` (paths: `/dashboard`, `/questions`, `/aichat`, `/revision`). But `router/AppRouter.tsx` is a second, entirely unused file with *different* paths (`/ai-chat`, `/revision-center`) and its own `<BrowserRouter>`. It's dead code that will mislead anyone (including future-you) who edits it expecting it to take effect.
- **No route protection.** Any URL (`/dashboard`, `/questions`, etc.) renders regardless of auth state — the only auth gate is `if (pathname === "/") return <Login />`. There's no redirect-to-login for unauthenticated users hitting other paths, and no redirect-to-dashboard for already-logged-in users hitting `/`.
- **`QDetails.tsx` is an empty stub file** (literally blank) and isn't wired into either router. Clicking a question row currently opens the `ReflectionPanel` modal instead — so this may be a vestigial/abandoned page, worth deciding whether to delete or build out as a real detail view.
- **Dashboard.tsx has dead code**: a bare `<button onClick={testSupabase}>Test Supabase</button>;` JSX statement sitting at module scope, never rendered — leftover debug code.
- **No DB schema/migrations in the repo** (`supabase/` has no `migrations/` folder) — the `problems` and `pattern_summaries` tables and their RLS policies exist only in the live Supabase project, not as version-controlled code. If the project database ever needs to be recreated, or if you want to confirm RLS is actually protecting user data, there's currently no source of truth in git for it.
- Heavy leftover **`console.log` debugging** throughout `Questions.tsx`, `QuestionTable.tsx`, `QuestionStats.tsx`, `ReflectionPanel.tsx` — harmless but unprofessional for production and worth cleaning up.

---

## 5. Feature completeness summary

| Feature | Status |
|---|---|
| Landing page (`Landing.tsx`, `components/landing/*`) | Built but **not routed anywhere** — dead code, never reachable |
| Login / Signup | Working, but no email-confirmation messaging, no session-check redirect |
| Questions log (add/edit/delete/list) | Working, real backend, minor user-filter bug |
| Patterns list + Pattern Details + AI summary | Working, real backend, genuinely complete feature |
| Dashboard (all widgets) | UI complete, **data is 100% fake/local**, not connected to your real questions |
| Revision Center (queue, quizzes, reflection recall, pattern challenge) | UI complete, **data is 100% fake/local** |
| AI Chat "coach" | UI complete, **no real AI** — scripted keyword responses over fake local data |
| Question Details page | Stub, unbuilt, unrouted |
| Auth route protection | Missing |

---

## 6. Suggested order of attack

1. Confirm Vercel env vars + Supabase Edge Function secret are set (fixes the deploy crash first).
2. Verify/fix RLS policies on `problems`, and add the missing `user_id` filters in `questionservice.ts` / `statsService.ts`.
3. Decide: wire Dashboard/Revision/AI Chat to the real Supabase `problems` data (replacing `seedData.ts`/localStorage), since this is the biggest gap between "looks done" and "is done."
4. Add basic route protection (redirect unauthenticated users away from app pages).
5. Clean up dead code: unused `AppRouter.tsx`, unrouted `Landing.tsx`/`QDetails.tsx`, debug `console.log`s, the orphaned `testSupabase` button.
6. Decide on real AI in the chat coach (reuse the OpenRouter Edge Function pattern already proven in Pattern Details) vs. keeping it as a scripted assistant.
