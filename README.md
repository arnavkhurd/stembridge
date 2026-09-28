# STEMBridge

**Know your next step. Find the people who can help.**

STEMBridge helps women exploring STEM turn a project goal into a practical next step, relevant learning material, and a specific request for mentor or peer support. The prototype focuses on Data & AI and Robotics & Makers.

Choose a goal, confirm the skills you already bring, and inspect the listed requirements. The app connects the remaining requirements to learning resources and relevant people. An online-only preference changes the recommendations. Signed-in members can join a circle, save opportunities, and send requests that another account can accept or decline.

Search opportunities by topic or skill, search members by their public profile information, and open a member's full profile before choosing guidance or collaboration. Search works alongside the existing filters.

The sample preview uses fictional people and illustrative opportunities. Live networking requires a configured Supabase project and real registered test accounts; sample cards are not a live community. The current verification record is in [BUILD_STATUS.md](BUILD_STATUS.md).

## Run locally

Install a current supported Node.js LTS release and npm, then run these commands from the project folder:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without environment variables, use the labelled sample preview. Preview profile changes and saved items use this browser's local storage; preview cards cannot receive real requests.

**Current local setup:** Supabase's URL and publishable key are already configured. Hosted REST returns two community records and denies anonymous reads of private learner, membership and request tables. Signup is enabled, but **Confirm email is currently ON**; manually turn it off under **Authentication → Sign In / Providers → Email** for immediate prototype signup. Use email addresses you control for the two-account test; placeholder `.invalid` and `example.com` addresses were rejected and created no accounts. `GEMINI_API_KEY` is currently empty.

For a fresh checkout or a different Supabase project (the current workspace has already completed the project/schema/key setup):

1. Create a project on Supabase's Free plan in your own account.
2. Run the complete [supabase/schema.sql](supabase/schema.sql) in that project's SQL Editor.
3. Copy `.env.example` to `.env.local` if the latter does not already exist. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Project Settings → API. Never put a secret/service-role key in the frontend.
4. Enable email/password auth and turn **Confirm email** off for this disclosed, unverified-account prototype. Supabase's default email service is restricted; see the [setup guide](docs/SUPABASE_SETUP.md).
5. Restart the development server. Create separate learner and supporter accounts in two independent browser sessions. Make the supporter discoverable and open to requests.
6. Optionally add server-only `GEMINI_API_KEY` and restart. `GEMINI_MODEL` defaults to `gemini-2.5-flash-lite`. Manual profile editing remains available without AI.

The complete setup, account test and recovery steps are in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## What the numbers and recommendations mean

- Requirement coverage compares confirmed, self-reported skill IDs with this listing's explicit requirements. Priya's sample profile covers three of seven requirements for the sample ML project. This is not an employability score or a verified skills assessment.
- Recommendations use ordinary, readable matching rules. Domain, visibility, request availability and the online-only preference filter people; relevant skills determine the order and explanations.
- AI only suggests profile fields from the learner's description after consent. The learner reviews them. AI does not invent people, rank deservingness, assess hiring eligibility or send requests.
- Saving a resource does not add a skill. No outcome or internship is guaranteed. Some robotics activities require hardware even when their instructions are free to read.

## Accounts and privacy

Profiles start hidden and closed to requests. Members explicitly opt into the directory. A discoverable profile and its joined circles are visible to the community; circle totals describe **visible members**. Private learner state is separate from the public profile.

Database rules restrict private learner records to their owner and requests to their sender/recipient. Request functions enforce who can create, respond or cancel. Requests are delivered to the in-app database inbox; no email notification is sent. The hosted permission checks must be completed before describing the configured backend as verified.

Passwords are handled by Supabase Auth. The proposed hackathon setup disables email confirmation for immediate signup, but that setting is currently still ON and requires the participant's manual change. With confirmation off, account email identities are unverified; mentor credentials are not verified in either mode. Production moderation, abuse controls, email delivery, account deletion and identity verification are outside this prototype.

## Checks and presentation

```powershell
npm run test
npm run typecheck
npm run build
npm run start
```

The test suite covers requirement comparison, data integrity, online-only filtering, matching reasons and distinct pathways. It also executes the actual SQL schema in PGlite PostgreSQL to check row permissions, signup initialization, request transitions and forbidden actions. The external Supabase Auth boundary is emulated in these local tests. The two-account browser flow and third-account hosted privacy checks are documented in [docs/RLS_CHECKS.sql](docs/RLS_CHECKS.sql); local tests do not substitute for those hosted checks.

**Verification:** all 65 tests across six files, TypeScript and the production build passed at approximately 14:08 IST on 28 September 2026; `git diff --check` found no whitespace errors. Desktop and 390px mobile browser checks passed for combined search/filter results, empty results and clearing search, member details and sign-in handoff, consecutive bookmarks surviving reload, and confirmed-skill changes updating coverage and the suggested resources. There was no horizontal page overflow, and browser error logs were empty. The audit also fixed queued state writes, repeated membership changes, account draft isolation and negated AI skill evidence; no SQL migration was needed. Hosted REST connectivity and anonymous-access denial pass; authenticated Supabase/request lifecycle, live Gemini and deployment remain pending verification.

See [JUDGE_NOTES.md](JUDGE_NOTES.md) for the demonstration, [DATA_SOURCES.md](DATA_SOURCES.md) for provenance, and [BUILD_STATUS.md](BUILD_STATUS.md) for actual verification outcomes and remaining setup. [The feature roadmap](docs/FEATURES.md) separates implemented features, useful later additions and work to avoid before the updated **4:10 PM IST** deadline.

## Optional Vercel deployment

1. This workspace already has `origin` configured as [arnavkhurd/stembridge](https://github.com/arnavkhurd/stembridge) and is on `main`, with local commit `5186322` (`first commit`) and uncommitted changes at the latest inspection. Reuse that repository and remote. This local evidence does not confirm that the latest changes were pushed or deployed.
2. In the project terminal, run the following after your final checks. Before committing, confirm `.env.local`, `node_modules` and `.next` are absent from the staged-file list; `.env.example` is safe because it contains no key values.

```powershell
git status --short
git add .
git diff --cached --name-only
git commit -m "Build STEMBridge prototype"
git push -u origin main
```

3. In Vercel, choose **Add New → Project**, connect your GitHub account if needed, and **Import** the `stembridge` repository.
4. Keep **Framework Preset: Next.js** and **Root Directory: `./`**. Use the framework's default build/output settings.
5. Open **Environment Variables** before deploying. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. For AI, also add `GEMINI_API_KEY` and optionally `GEMINI_MODEL=gemini-2.5-flash-lite`. Use the same configured Supabase project as local development. Never add a service-role/secret key to a `NEXT_PUBLIC_` variable.
6. Click **Deploy**. Open the resulting URL when the build completes. If you add or change environment variables later, redeploy; the browser's Supabase settings are built into the client bundle.
7. In Supabase **Authentication → URL Configuration**, set **Site URL** to the deployed origin. Then run the learner/supporter walkthrough at the deployed URL in two independent browser sessions.
8. Confirm a request persists across refresh, can be accepted only by its recipient, and remains invisible to a third account. Only then describe that hosted flow as verified and submit the actual deployment URL.

See [Vercel's GitHub deployment guide](https://vercel.com/docs/git/vercel-for-github). Do not commit `.env.local` or paste credentials into a public issue or screenshot. A successful build alone does not confirm database setup or hosted behavior. Publishing and submission remain participant actions unless separately authorized and completed.

## Small file map

- `src/components/`: interface and workspace state; `src/lib/data.ts` and `matching.ts`: typed catalog and transparent recommendations.
- `src/lib/supabase/`, `src/proxy.ts`, `supabase/schema.sql`: account session handling and database access rules.
- `src/app/api/profile/route.ts`: optional server-side Gemini profile suggestion; `docs/`: setup and permission checks.
