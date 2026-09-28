# STEMBridge

**Know your next step. Find the people who can help.**

STEMBridge is a Women in STEM community website built for problem statement PS7. It connects a learner's project goal to relevant skills, resources, mentors and peers. The prototype focuses on **Data & AI** and **Robotics & Makers**.

[Open the live website](https://stembridge-ivory.vercel.app)

## Features

- **Personal next steps:** choose a goal, list current skills, and see the requirements covered and what to learn next.
- **Mentors and peers:** discover opted-in members, view profiles and send a focused request. Recipients can accept or decline; senders can cancel pending requests.
- **Community circles:** join communities and find their visible members. A member can learn and mentor at the same time.
- **Discovery:** search and filter resources, projects, competitions and internships; bookmark useful items.
- **Different starting points:** find a first step for starting out, returning to STEM or seeking a project partner.
- **English and Marathi:** switch the interface and authored content, retain the language choice and search translated catalog text. Personal writing stays unchanged.
- **Offline continuity:** prepare once, then revisit public content and eight original exercises. Save device notes and completion, and export a text notebook.
- **Optional Gemini:** suggest profile skills from an introduction, with supporting quotes. Users review the suggestions before saving.

## Prototype boundaries

The sample preview contains **fictional people and illustrative opportunities**. Competition and internship cards are not current openings. Official resources link to their publishers. See [data sources and limits](DATA_SOURCES.md).

Matching uses transparent rules based on goals, listed skills, interests and connection preferences. Skill coverage is **self-reported**, not a proficiency or employability score. AI assists profile entry; it does not generate the community or make matching decisions.

Real networking requires Supabase and registered accounts. Profiles start hidden and closed to requests until members opt in. Requests use an in-app inbox. Ongoing chat, calls, email notifications, verified mentors and production moderation are outside this prototype.

Offline mode does not send requests or update cloud accounts. Prepared public content and device notes work offline; saved account snapshots require the matching unexpired session. Directory and inbox data are not cached. Notes do not sync to the cloud; export important work before signing out. External websites need internet.

## Technology

Next.js App Router, React, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL with row-level security, Google Gemini REST API, and a service worker. Tests use Vitest, Happy DOM and PGlite.

## Run locally

Use Node.js 24 LTS and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

On PowerShell use `Copy-Item .env.example .env.local` for the copy step. Do not overwrite an existing environment file. Open [localhost:3000](http://localhost:3000).

Without Supabase, the labelled sample preview remains usable. For accounts:

1. Create a Supabase project and run [supabase/schema.sql](supabase/schema.sql).
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Never expose a service-role key.
3. Configure email/password authentication and the Site URL. See [Supabase setup](docs/SUPABASE_SETUP.md) for confirmation and testing.
4. Restart. Create test accounts in independent browser sessions; enable directory visibility and incoming requests on the recipient.

For optional AI add server-only `GEMINI_API_KEY`. The default is `gemini-3.5-flash-lite`; `GEMINI_MODEL` overrides it. Manual skill entry works without AI. Never commit `.env.local` or keys.

## Test and build

```sh
npm test
npm run typecheck
npm run build
npm run start -- --port 3001
```

Use the production build for offline checks. Open **Offline learning**, wait for **Ready on this device**, and test a reload with the network disabled. Prepare each browser and deployment separately.

Tests cover matching, AI evidence, translations, profile state, member discovery, offline storage and account isolation. PGlite executes the schema to test permissions and request transitions. Local tests do not replace a real two-account walkthrough on the deployed site. See [RLS checks](docs/RLS_CHECKS.sql).

## Deploy on Vercel

Import this repository with the Next.js preset. Set the two Supabase variables and, for AI, `GEMINI_API_KEY` and `GEMINI_MODEL=gemini-3.5-flash-lite`. **Redeploy after environment changes.** Update an older model override even if the source default changed.

Set Supabase's Site URL and allowed redirects for the deployed origin. Verify sign-in, profile saving, visibility and requests with separate accounts on the deployed URL before presenting the live account flow.

## Code map

- `src/components/`: interface, workspace state and offline learning.
- `src/lib/data.ts`, `matching.ts`, `support-plan.ts`: catalog, matching and first-step planning.
- `src/lib/i18n*.ts`: English/Marathi content.
- `src/app/api/profile/route.ts`: consent-based Gemini suggestions, requiring sign-in when Supabase is configured.
- `supabase/schema.sql`: database schema, permissions and request functions.
- `public/sw.js`: offline public website cache.

Internal rehearsal notes and generated handoff PDFs are kept locally and excluded from this repository.
