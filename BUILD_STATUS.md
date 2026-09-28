# Build status — STEMBridge

Updated during implementation on 28 September 2026. This records actual evidence, not the original feature wish list.

## Delivery state

**Twist implemented; final code checks 15:01 IST:** the even-ballot requirement is offline support. The production website now prepares a public offline copy, offers eight original exercises, preserves device notes and practice completion, and exports a text notebook. A matching, unexpired account session can read its own saved profile/plan; directory and inbox data are not cached. The learning area also supports English and Marathi. No new SQL migration or Gemini key is needed. Full suite: **115 tests across 12 files**, TypeScript and production build pass at 15:01. This final code checkpoint includes mobile navigation refinements, failed-notebook-clear handling, expiry-safe note recovery and locked-notebook UI regression checks.

The production browser at port 3001 was prepared, its server process was stopped, and a reload still opened the interactive cached website. Notes edited while the server was stopped survived another reload; catalog/details/exercise navigation, Marathi switching and saved language/notes/completion were verified. Text export produced a Marathi-note file verified on disk at 14:53. At 390px width, Marathi rendered and there was no horizontal overflow. This is direct evidence with the website server unavailable. It is **not** a claim that full browser networking was disabled: that participant check, hosted accounts and deployment remain pending. See [the twist guide](docs/OFFLINE_TWIST_GUIDE.md).

The earlier **Find my first step** addition remains available: starting, returning and partner intentions lead to a specific action, a prerequisite-aware resource, a relevant person and an editable introduction. Its choices do not change confirmed skills and its request still requires explicit review.

| Part                                           | Evidence/status                                                                                                                                                                                                                                                            |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack                                          | Next.js, React, TypeScript, Tailwind, Supabase Auth/Postgres, optional Gemini REST API                                                                                                                                                                                     |
| Typed two-domain catalog, samples and matching | Implemented; all 15 matching/catalog tests pass, including the dual-role regression case.                                                                                                                                                                                  |
| Search and member details                      | Implemented; four discovery tests and desktop/mobile checks pass, including combined filters, empty results, clearing search and member-profile/sign-in handoff.                                                                                                           |
| Workspace persistence and accounts             | Preview uses local storage, live mode uses Supabase. Provider/offline snapshot tests cover queued writes, identity isolation, expired sessions, read-only offline restoration and no queued offline sends. Hosted authenticated flow remains pending.                      |
| Supabase schema and request lifecycle          | Local project credentials and schema are now configured; hosted public REST returns both community records. Ten local PostgreSQL tests pass. Hosted account/request verification remains pending.                                                                          |
| Optional AI endpoint                           | Implemented; the focused suite now passes 22 mocked tests after fixing four negative-evidence cases. `GEMINI_API_KEY` is currently empty, so live Gemini is not connected.                                                                                                 |
| UI integration                                 | Redesigned interface completed with self-hosted Manrope, warm off-white, sage/pastel accents and larger text. Desktop and 390px mobile checks pass, including the latest search/profile additions.                                                                         |
| Git state                                      | Read-only check: `main` at `40e2f37` (`second commit, major features added, prod ready build`), with local uncommitted changes. Existing `origin` points to `https://github.com/arnavkhurd/stembridge.git`. Push/deployment success is not inferred from this local state. |
| Deployment                                     | Not performed or verified                                                                                                                                                                                                                                                  |
| Twist                                          | Offline requirement implemented: prepared public shell/catalog, eight original exercises, local notes/completion/export and read-only own-account snapshot. No offline live communication or automatic upload.                                                             |
| Bonus language support                         | English and Marathi in the offline learning area; preference persists. This does not translate the entire website, account screens or user messages.                                                                                                                       |

## Verification record

| Check                                      | Actual outcome at this checkpoint                                                                                                                                                                                                                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                        | Passed with twist integration on 28 September 2026 at approximately 15:01 IST.                                                                                                                                                                                                                                       |
| `npm run test`                             | Passed 115/115 across 12 files at approximately 15:01 IST. Coverage includes the existing product/database/AI checks plus offline cache, provider boundaries, notebook, service worker and Marathi content.                                                                                                          |
| `git diff --check`                         | Passed; no whitespace errors.                                                                                                                                                                                                                                                                                        |
| `npm run test -- src/lib/database.test.ts` | Passed: 10/10 tests on 28 September 2026 at approximately 12:41 IST. Executes the real schema, RLS policies, signup trigger and request functions in PostgreSQL WASM.                                                                                                                                                |
| `npm run build`                            | Passed with twist integration at approximately 15:01 IST.                                                                                                                                                                                                                                                            |
| Production cache browser proof             | Prepared port 3001, stopped its server process, then reloaded successfully. Catalog/details/exercise navigation worked; edited notes survived another reload. This tests an unavailable website server, not complete network emulation.                                                                              |
| Marathi, export and phone checks           | Marathi preference, notes and completion persisted through server-stopped reload. Exported text file was verified on disk at 14:53, despite the browser download-event listener timing out. Marathi displayed correctly at 390px with no horizontal overflow.                                                        |
| Full browser Offline setting               | Not automated: the available browser-control surface has no network-emulation control. Participant steps are in the twist guide. Tests separately exercise `navigator.onLine === false`.                                                                                                                             |
| Browser walkthrough                        | Desktop and 390px mobile checks passed for search/filter combinations, empty results/clearing, member details/sign-in handoff, repeated bookmark persistence and skill-dependent plans. No horizontal page overflow; browser error logs were empty. Earlier checks also confirmed Manrope loaded and 16px body text. |
| Hosted Supabase connectivity               | Confirmed: `.env.local` contains the project URL/publishable key, public REST returns two communities, and the browser enables account signup.                                                                                                                                                                       |
| Hosted anonymous access checks             | Confirmed: `learner_state`, `community_memberships` and `connection_requests` reject anonymous reads with HTTP 401 / PostgreSQL code 42501. Participant-level hosted checks still require signed-in accounts.                                                                                                        |
| Hosted Auth settings                       | Read-only inspection confirms email/password and signup are enabled, but `mailer_autoconfirm=false`: **Confirm email is currently ON**. No account settings were changed by the agent.                                                                                                                               |
| Hosted account/request flow                | Probe signup attempts using synthetic `.invalid` and `example.com` email addresses were rejected with `email_address_invalid`. Zero accounts were created; no cleanup was needed. Auth lifecycle and hosted request/RLS checks have not run and require user-controlled email accounts.                              |
| SQL execution locally                      | Passed in PGlite. Only the external Supabase boundary is emulated: Auth users, anon/authenticated roles and `auth.uid()`. No production RLS rule or request function is replaced. This does not verify Supabase JWT/email handling or deployed connectivity.                                                         |
| Official learning links                    | NumPy, pandas, scikit-learn and Arduino pages opened successfully on 28 September 2026.                                                                                                                                                                                                                              |

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

1. Work to the participant's updated **16:10 IST (4:10 PM), 28 September 2026** deadline, while following any later organizer instruction. The announced offline twist is implemented. Freeze further features and protect time for the final production/network check, hosted accounts, rehearsal and submission.
2. Supabase project/schema/environment setup is already supplied; do not recreate it. **Confirm email is currently ON.** For immediate signup in this disclosed prototype, manually open **Authentication → Sign In / Providers → Email**, turn **Confirm email OFF**, and save. This is a participant action; the agent has not changed account settings.
3. Using email addresses you control, choose **Join STEMBridge** to create the learner in Chrome and supporter in Edge (or independent browser profiles). In the supporter's **My profile**, choose **Be a mentor** or **Learn and mentor**, relevant skills, and Online. Enable **Show my profile in the public directory** and **Let members send me connection requests**. Synthetic placeholder addresses were rejected by this project.
4. Verify pending → accepted plus refresh across the two accounts. Use a third controlled account for `docs/RLS_CHECKS.sql` privacy checks. Do not claim the hosted lifecycle works before this succeeds.
5. Optionally fill the currently empty `GEMINI_API_KEY`; `GEMINI_MODEL` defaults to `gemini-2.5-flash-lite`. Restart after environment changes. Manual profiles already work without AI.
6. Follow [OFFLINE_TWIST_GUIDE](docs/OFFLINE_TWIST_GUIDE.md): prepare the exact judging URL, wait for readiness, use the browser's real Offline setting, reload, save/export notes and reconnect. The earlier PDFs predate the twist; use the new addendum alongside them.
7. After the final checks, review and commit the current changes on `main`, then push to the existing `origin` (`https://github.com/arnavkhurd/stembridge.git`). The local repository already contains commit `40e2f37` (`second commit, major features added, prod ready build`); do not reinitialize it. Import that repository into Vercel following README, add deployment environment variables, repeat the hosted flow, rehearse and submit through the organizer's actual channel.

## Intentional limits

Fictional catalog listings do not have live applications. Sample preview profiles cannot receive live requests. Accounts and mentor expertise are not verified. There is no external email delivery, live chat, production moderation, account-deletion flow or claim of production readiness. Membership totals reflect visible profiles, not hidden members. The AI rate guard is per server process, not a distributed production quota.

Offline use requires this browser to have prepared the website while online. A saved account copy requires a matching, unexpired Supabase session. Other members and inbox messages are not cached. Live writes fail clearly while offline; they are not sent later. Notes stay on this device and do not automatically sync. Explicit sign-out or a different account signing in clears them. Automatic session expiry preserves but locks the notes: preview cannot read, edit or export them, and the same account can recover them after signing in again. External tutorials remain online websites. Marathi covers the learning area only. Browser storage can be cleared or evicted, so offline availability is not permanent storage.

The expiry review fixed an important recovery defect: an expiring session previously cleared device learning notes. It now removes the account snapshot, returns to preview and keeps the notebook locked. Tests cover same-account recovery, initial session restoration, hidden notes in preview, different-account replacement and explicit sign-out clearing. The targeted provider/snapshot/notebook suite passed 42 tests with TypeScript at 15:00 IST; the final 115-test full-suite checkpoint passed at 15:01 IST, as recorded above.

## Commands

`npm install` · `npm run dev` · `npm run test` · `npm run typecheck` · `npm run build` · `npm run start`

Local development defaults to `http://localhost:3000`. The schema, environment example, source data, setup guide and judge notes are included in this repository. No passwords or API-key values belong in this status file.
