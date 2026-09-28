# Connect the real community

STEMBridge uses Supabase accounts and a shared database for profiles, community membership, saved learner information, and connection requests. The sample catalog contains fictional opportunities and explicitly labelled demonstration content. A request can reach only a registered, discoverable member who has chosen to receive requests.

**Current workspace:** the Supabase project, schema and environment values are already supplied. Public community reads return two rows; anonymous reads of learner state, memberships and requests are denied. A read-only Auth check found signup/email-password enabled but **Confirm email ON** (`mailer_autoconfirm=false`). For immediate prototype signup, the participant must turn this setting off manually as described in step 4. The agent has not changed account settings. The Gemini key is now configured locally. A synthetic live-provider/actual-route check passed at 3:45 PM with `gemini-3.5-flash-lite`; Supabase/Auth was mocked, so the authenticated browser and Vercel flow remain unverified.

## One-time setup

1. Sign in to [Supabase](https://supabase.com/dashboard) and create/open a project you control on the Free plan. Give it a name, choose a region, set a private database password, and wait until the project is ready. This database password is not an application environment variable.
2. Open **SQL Editor**, paste the complete `supabase/schema.sql`, and run it. It creates five tables, access policies, signup initialization, and three request functions. It does not create test users or send email.
3. Copy `.env.example` to a file named exactly `.env.local` in the project root (beside `package.json`), unless `.env.local` already exists. In **Project Settings → API**, copy the project URL to `NEXT_PUBLIC_SUPABASE_URL` and the **publishable** key to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The publishable key is intended for the browser; never substitute a secret or `service_role` key. Save the file, stop the development server with Ctrl+C, and restart `npm run dev`. For deployment, add the same variables to the host and rebuild.
4. In **Authentication → Sign In / Providers → Email** (labelled **Providers → Email** in some dashboard layouts), keep email/password enabled. The current project's **Confirm email** switch is ON. Manually turn it **OFF** and save before creating the immediate-signup demonstration accounts. These accounts are unverified; the app must not call them verified. Use unique test passwords, never a password used elsewhere. Do not add credentials to source code, screenshots, or judge notes.
5. Set **Authentication → URL Configuration → Site URL** to the actual application origin. Add the local/deployed origin to allowed redirect URLs if you later enable confirmation flows.
6. Open the app in two independent browser sessions (for example, Chrome and Edge). Use **Join STEMBridge** with email addresses you control to sign up a learner in one and a supporter in the other. Open the supporter's **My profile**: choose **Data & AI Circle**, **Be a mentor** or **Learn and mentor**, relevant skills such as NumPy/pandas/ML foundations, and **Online** support. Enable **Show my profile in the public directory** and **Let members send me connection requests**, then save. Join the circle when demonstrating memberships. Different ordinary tabs in one browser share the same login; use separate browsers or browser profiles.
7. The learner should find the supporter, send a specific request, and see it pending. In the supporter session, refresh/open Connections and accept with a next step. Refresh the learner's Connections view to verify the shared accepted state. This is a real database transition, not a role switch or email notification.

The signup trigger creates a private profile and empty learner state. Users choose whether to publish a profile. No password or email is copied into the public profile table. The starter script also initializes accounts that existed before the schema was installed.

## Email limitation

Supabase's default Auth mail sender is intended for testing: it sends only to project-team email addresses and currently allows two messages per hour. Hosted projects require confirmation by default, so leaving that default on can block an ordinary test signup. Email/password with confirmation off avoids email delivery for the disclosed prototype. Email addresses are not verified in this mode. Do not show a working password-reset feature or claim delivery without configuring and testing SMTP.

For a public release, configure custom SMTP, enable confirmation, implement/test confirmation and reset flows, and review abuse controls. Sources checked 28 September 2026: [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [password authentication](https://supabase.com/docs/guides/auth/passwords).

## Optional AI profile assistance

1. Open [Google AI Studio's API Keys page](https://aistudio.google.com/apikey) and sign in. Complete the provider's initial terms/setup if prompted.
2. Use an existing key for your project or choose **Create API key**. Select the default/existing project or create a project through the dialog. Keep the project on the **Free** plan for this optional prototype; billing is not a prerequisite for using available free-tier models. Account, region, model availability and quota still apply.
3. Copy the key privately into `.env.local` as `GEMINI_API_KEY`. Do not prefix it with `NEXT_PUBLIC_`. Set `GEMINI_MODEL=gemini-3.5-flash-lite`. This model passed the current live diagnostic; the previous model returned 404 for this key.
4. Save and restart `npm run dev`. Sign in to STEMBridge when Supabase is configured. Edit the profile, enter a short experience description, tick the explicit Gemini consent box, and request a suggestion.
5. Review the quoted evidence and proposed skills, confirm the fields you accept, and save the profile. If the account has no free quota or the provider fails, keep using manual skill selection; do not claim a live response or silently substitute a sample.

The endpoint returns suggestions for review, never a saved or verified skill profile. It accepts `{ "text": "...", "consent": true }`; a configured Supabase project requires a valid signed-in session. Without an AI key, manual entry remains available. Timeouts, provider quota errors and malformed responses do not save a profile. On Vercel, add server-only `GEMINI_API_KEY` and set `GEMINI_MODEL=gemini-3.5-flash-lite`. Replace any older model override already present, then redeploy separately; `.env.local` is not uploaded from Git.

Official references checked 28 September 2026: [Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key), [free and paid tier information](https://ai.google.dev/gemini-api/docs/billing/). The automated AI tests mock provider responses. Separately, at 3:45 PM the actual profile POST handler returned HTTP 200 against live `gemini-3.5-flash-lite` using synthetic text: Python/Git were suggested; negated NumPy and aspiration-only ML were excluded. Only Supabase/Auth was mocked in that diagnostic. The authenticated browser and deployed Vercel AI flow still require their own walkthrough.

## Permissions and request contract

- Anyone may read opted-in directory profiles and the two community descriptions. Members edit only their own profile; the demo flag and creation time are not client-editable.
- Learner state is private to its owner. Signed-in members can read their own memberships and the memberships of people who made their profiles discoverable; memberships of other hidden profiles stay private. Circle counts represent visible members, not the complete private community roster.
- Connection requests are readable only by their two participants. Direct request inserts/updates/deletes are not granted to browser users.
- `create_connection_request(p_recipient_id, p_opportunity_id, p_help_type, p_message)` records a pending request with immutable names and participant IDs.
- `respond_to_request(p_request_id, p_status, p_next_step)` allows only the recipient to accept/decline a pending request; next-step text is optional and retained for acceptance only.
- `cancel_connection_request(p_request_id)` allows only the sender to cancel a pending request.
- Each function returns one JSON object matching `ConnectionRequest`, not an array. Duplicate pending/accepted requests for the same people, goal and help type are rejected.

Use `docs/RLS_CHECKS.sql` for an independent third-account privacy check. Run the full two-browser flow before describing the backend as verified. The SQL and client build passing alone do not prove a hosted project was configured correctly.

The local `src/lib/database.test.ts` suite executes the same schema in PGlite PostgreSQL, including its real policies and request functions. It emulates only Supabase's external Auth boundary. Its passing tests check SQL behavior; your hosted project still needs the account, cookie, connection and browser walkthrough above.

## Recovery

- **Invalid API key / failed fetch:** verify the project URL and publishable key, project availability, and restart the app after changes.
- **Signup email error:** check the confirmation setting described above. Do not repeatedly retry the default mail sender.
- **Database error saving new user:** check that the complete schema ran successfully; inspect the Supabase Auth/database logs privately. Do not publish credentials or profile descriptions from logs.
- **Member missing from directory:** ensure the supporter saved an opted-in profile in the same Supabase project.
- **Request permission error:** confirm the recipient accepts requests, the sender is a different account, and a mentorship recipient chose mentor/both.
- **Missing server configuration:** the app can display its honest preview, but real account/network features require Supabase setup. Do not describe preview requests as delivered.
