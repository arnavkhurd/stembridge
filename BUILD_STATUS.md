# Build status — STEMBridge

Updated during implementation on 28 September 2026. This records actual evidence, not the original feature wish list.

## Delivery state

| Part | Evidence/status |
| --- | --- |
| Stack | Next.js, React, TypeScript, Tailwind, Supabase Auth/Postgres, optional Gemini REST API |
| Typed two-domain catalog, samples and matching | Implemented; all 15 matching/catalog tests pass, including the dual-role regression case. |
| Search and member details | Implemented; four discovery tests and desktop/mobile checks pass, including combined filters, empty results, clearing search and member-profile/sign-in handoff. |
| Workspace persistence and accounts | Preview uses local storage, live mode uses Supabase. Thirteen provider tests and one identity-boundary test pass after fixes to queued writes, repeated membership changes and account draft isolation. |
| Supabase schema and request lifecycle | Local project credentials and schema are now configured; hosted public REST returns both community records. Ten local PostgreSQL tests pass. Hosted account/request verification remains pending. |
| Optional AI endpoint | Implemented; the focused suite now passes 22 mocked tests after fixing four negative-evidence cases. `GEMINI_API_KEY` is currently empty, so live Gemini is not connected. |
| UI integration | Redesigned interface completed with self-hosted Manrope, warm off-white, sage/pastel accents and larger text. Desktop and 390px mobile checks pass, including the latest search/profile additions. |
| Git state | Read-only check: `main` at `5186322` (`first commit`), with local uncommitted changes. Existing `origin` points to `https://github.com/arnavkhurd/stembridge.git`. Push/deployment success is not inferred from this local state. |
| Deployment | Not performed or verified |
| Twist | No announced requirement received by this build |

## Verification record

| Check | Actual outcome at this checkpoint |
| --- | --- |
| `npm run typecheck` | Passed with the final audit changes on 28 September 2026 at approximately 14:08 IST. |
| `npm run test` | Passed 65/65 across six files at approximately 14:08 IST: 15 matching, 10 PostgreSQL/RLS, 22 mocked AI endpoint, four discovery, 13 provider and one identity-boundary test. |
| `git diff --check` | Passed; no whitespace errors. |
| `npm run test -- src/lib/database.test.ts` | Passed: 10/10 tests on 28 September 2026 at approximately 12:41 IST. Executes the real schema, RLS policies, signup trigger and request functions in PostgreSQL WASM. |
| `npm run build` | Passed with the final audit changes at approximately 14:08 IST. |
| Browser walkthrough | Desktop and 390px mobile checks passed for search/filter combinations, empty results/clearing, member details/sign-in handoff, repeated bookmark persistence and skill-dependent plans. No horizontal page overflow; browser error logs were empty. Earlier checks also confirmed Manrope loaded and 16px body text. |
| Hosted Supabase connectivity | Confirmed: `.env.local` contains the project URL/publishable key, public REST returns two communities, and the browser enables account signup. |
| Hosted anonymous access checks | Confirmed: `learner_state`, `community_memberships` and `connection_requests` reject anonymous reads with HTTP 401 / PostgreSQL code 42501. Participant-level hosted checks still require signed-in accounts. |
| Hosted Auth settings | Read-only inspection confirms email/password and signup are enabled, but `mailer_autoconfirm=false`: **Confirm email is currently ON**. No account settings were changed by the agent. |
| Hosted account/request flow | Probe signup attempts using synthetic `.invalid` and `example.com` email addresses were rejected with `email_address_invalid`. Zero accounts were created; no cleanup was needed. Auth lifecycle and hosted request/RLS checks have not run and require user-controlled email accounts. |
| SQL execution locally | Passed in PGlite. Only the external Supabase boundary is emulated: Auth users, anon/authenticated roles and `auth.uid()`. No production RLS rule or request function is replaced. This does not verify Supabase JWT/email handling or deployed connectivity. |
| Official learning links | NumPy, pandas, scikit-learn and Arduino pages opened successfully on 28 September 2026. |

Replace incomplete rows only after the corresponding check actually finishes. Do not infer hosted behavior from a passing TypeScript check or production build.

## Completed browser checks through the final audit

- Combined member/opportunity searches and existing filters returned the expected results; no-results states and clearing search worked.
- Member details opened correctly, and sample-profile actions handed off to sign-in without sending a live request.
- Consecutive preview bookmarks survived a reload.
- Confirming NumPy changed coverage from 3/7 to 4/7 and removed its matching gap/resource; restoring the profile returned coverage to 3/7.
- Desktop and 390px mobile pages had no horizontal overflow, and browser error logs were empty.
- Self-hosted Manrope loaded at desktop and mobile sizes; body text was 16px and pages had no horizontal overflow.
- With optional AI/details sections closed, manually selecting NumPy and saving changed coverage from 3/7 to 4/7; removing it restored 3/7.
- The plan opened as a keyboard-operable modal with additional details initially collapsed.
- Internships plus online-only returned the one matching sample data internship.
- Mobile category tabs wrap so every label is visible; the final build passed after that CSS change.

Earlier preview checks also confirmed:

- Bookmarks remained saved after reloading the preview.
- Manually confirming NumPy changed Priya's requirement coverage from 3/7 to 4/7.
- Switching to Aisha showed the different robotics goal and relevant people.
- Missing-AI-key feedback preserved the introduction and manual skill controls.
- At 390×844, the main view had no horizontal overflow; dialog focus, close controls and Escape worked.
- The Internships category combined with online-only showed only the matching data internship.
- Empty saved results and Connections sign-in gates behaved correctly.

These checks exercised the local preview. Supabase is now reachable, but real signup/session restoration, cross-account requests and hosted privacy checks still require accepted user-controlled test accounts. Live Gemini needs a key, and the deployed URL needs separate verification.

The audit fixed queued writes so consecutive changes use the latest state, repeated membership changes, draft isolation when switching accounts, and AI skill evidence that contained negation. Regression checks are included in the passing suite. No SQL change or hosted migration was required.

## Participant actions

1. Work to the participant's updated **16:10 IST (4:10 PM), 28 September 2026** deadline, while following any later organizer instruction. This replaces the earlier provisional 15:10 calculation. Protect time for hosted checks, any announced twist, rehearsal and submission.
2. Supabase project/schema/environment setup is already supplied; do not recreate it. **Confirm email is currently ON.** For immediate signup in this disclosed prototype, manually open **Authentication → Sign In / Providers → Email**, turn **Confirm email OFF**, and save. This is a participant action; the agent has not changed account settings.
3. Using email addresses you control, choose **Join STEMBridge** to create the learner in Chrome and supporter in Edge (or independent browser profiles). In the supporter's **My profile**, choose **Be a mentor** or **Learn and mentor**, relevant skills, and Online. Enable **Show my profile in the public directory** and **Let members send me connection requests**. Synthetic placeholder addresses were rejected by this project.
4. Verify pending → accepted plus refresh across the two accounts. Use a third controlled account for `docs/RLS_CHECKS.sql` privacy checks. Do not claim the hosted lifecycle works before this succeeds.
5. Optionally fill the currently empty `GEMINI_API_KEY`; `GEMINI_MODEL` defaults to `gemini-2.5-flash-lite`. Restart after environment changes. Manual profiles already work without AI.
6. After the final checks, review and commit the current changes on `main`, then push to the existing `origin` (`https://github.com/arnavkhurd/stembridge.git`). The local repository already contains commit `5186322` (`first commit`); do not reinitialize it. Import that repository into Vercel following README, add deployment environment variables, repeat the hosted flow, rehearse and submit through the organizer's actual channel.

## Intentional limits

Fictional catalog listings do not have live applications. Sample preview profiles cannot receive live requests. Accounts and mentor expertise are not verified. There is no external email delivery, live chat, production moderation, account-deletion flow or claim of production readiness. Membership totals reflect visible profiles, not hidden members. The AI rate guard is per server process, not a distributed production quota.

## Commands

`npm install` · `npm run dev` · `npm run test` · `npm run typecheck` · `npm run build` · `npm run start`

Local development defaults to `http://localhost:3000`. The schema, environment example, source data, setup guide and judge notes are included in this repository. No passwords or API-key values belong in this status file.
