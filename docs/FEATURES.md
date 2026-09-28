# STEMBridge — what exists and what to add next

Working deadline supplied by the participant: **4:10 PM IST, 28 September 2026**. The announced offline twist is implemented, along with scoped Marathi learning support. Freeze further features and use the remaining time for final production checks, real accounts, deployment and rehearsal.

## Built

**New twist response:** prepare this browser once, then keep learning through an unavailable connection. Eight original exercises, device notes, completion and text export are available in the offline learning area, with English and Marathi reading options. A previously loaded account can read its own saved plan while its session remains unexpired. The [twist guide](OFFLINE_TWIST_GUIDE.md) gives the exact demonstration and boundaries.

**Find my first step** responds differently to starting out, returning to STEM and seeking a project partner. It preserves confirmed skills, checks resource prerequisites, suggests a relevant person and carries an edited introduction into explicit request review. Independent WiML/Women in Robotics links provide an external community option. This feature uses ordinary matching code, needs no AI or schema migration, and keeps choices temporary until a reviewed request is sent.

| Feature                             | What it does                                                                                                                                                    | Current limit                                                                                                                                                                       |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two STEM circles                    | Data & AI and Robotics & Makers have distinct people, goals and learning resources.                                                                             | Preview people and opportunity listings are fictional.                                                                                                                              |
| Editable starting point             | Learners confirm skills, interests, preferred connection mode and what support they can offer.                                                                  | Skills and mentor expertise are self-reported.                                                                                                                                      |
| Goal-to-action plan                 | Compares confirmed skills with a selected goal's requirements and connects gaps to learning resources and people.                                               | A curated learning sequence; no eligibility or employability prediction.                                                                                                            |
| Real preference filtering           | Online-only, catalog categories, domain and saved-item filters change visible results.                                                                          | Filters use the small current dataset.                                                                                                                                              |
| Search for opportunities and people | Searches opportunity titles, topics, providers and skill labels; member search uses public names, bios, skills and help topics. Existing filters remain active. | Four discovery tests and desktop/mobile checks pass; results depend on the current catalog and visible profiles.                                                                    |
| Member profile details              | Opens a member's bio, skills, support modes, help topics and relevance to the current goal; eligible users can choose guidance or collaboration.                | Sample profiles remain labelled and cannot receive live requests; skills are self-reported.                                                                                         |
| Saved opportunities                 | Bookmarks persist locally in preview and use private learner state for connected accounts.                                                                      | Live persistence still requires the hosted account walkthrough.                                                                                                                     |
| Opt-in community profiles           | Registered users choose directory visibility, mentor/learner participation, support modes and request availability.                                             | Identity and credentials are not verified.                                                                                                                                          |
| Circle membership                   | Signed-in users can join/leave circles; counts include only visible membership records.                                                                         | Membership records of hidden profiles are not exposed to other members.                                                                                                             |
| Connection lifecycle                | A learner sends a specific request; only its recipient accepts/declines and only its sender cancels a pending request.                                          | Hosted cross-account behavior remains unverified until controlled accounts are available.                                                                                           |
| Optional AI assistance              | Gemini proposes fields with quoted evidence after consent; users review and confirm. Missing-key and failure paths preserve manual editing.                     | The Gemini key is currently absent; live parsing is not demonstrated.                                                                                                               |
| Responsive interface                | Local Manrope font, readable text, keyboard-operable dialogs, mobile layouts and explicit empty states.                                                         | Desktop and 390px mobile checks pass; no horizontal page overflow or browser errors were observed.                                                                                  |
| Prepared offline website            | Saves the public website shell, catalog and original exercises in this browser, with an explicit readiness indicator.                                           | Requires an online preparation first; browser storage can be cleared or evicted. External tutorials and live APIs are not cached.                                                   |
| Eight offline exercises             | Four Data & AI and four Robotics exercises with steps, explanations and mentor-question prompts.                                                                | Original short practice, not a full downloaded external course, code runner or hardware simulator.                                                                                  |
| Device learning notebook            | Notes and completion persist on this device and export as a plain text file.                                                                                    | No cloud sync. Explicit sign-out/different-account sign-in clears notes; automatic expiry locks and preserves them for the same account. Completion does not add a confirmed skill. |
| Own-account offline plan            | Read-only saved profile, goal, confirmed skills and saved catalog items, with a timestamp.                                                                      | Needs a matching, unexpired session. No directory, membership list or inbox; live changes and requests need internet and are never queued for later.                                |
| English and Marathi learning        | Translates the learning area's exercise content and controls; reading preference persists without an API.                                                       | Other pages, account screens and user messages are not translated.                                                                                                                  |

The actual PostgreSQL schema and permissions have passed local database tests, and hosted anonymous reads of private tables are denied. Public Supabase connectivity is verified. These facts do not substitute for a successful real-account request/response demonstration.

## Finish before submission

1. **Complete the final offline check.** Prepare the exact judging URL and follow the twist guide's real browser Network → Offline test. The local production build already reopened and stayed interactive with its server stopped.
2. **Complete the real-account request loop.** Demonstrate a request from learner to supporter, acceptance with a next step, refresh persistence and third-account privacy.
3. **Fix observed friction, deploy and rehearse.** Address actual failures, prepare the published URL for offline use, and protect submission time before 4:10 PM.

At the **15:01 IST checkpoint**, all **115 tests across 12 files**, TypeScript and the production build passed. The production browser at port 3001 was prepared, the server was stopped, and reload, catalog/details/exercise navigation, notes edited between reloads, Marathi preference and completion worked. Text export with the entered Marathi notes was verified on disk at 14:53. At 390px there was no horizontal overflow and the script rendered correctly. This proves operation with the website server unavailable; full browser networking-disabled testing, hosted accounts, live Gemini and deployment remain separate checks. See BUILD_STATUS for the full verification record.

## Useful later additions

- **Optional account-synced learning progress:** the device notebook already tracks practice completion. A later, explicitly chosen sync feature could move progress between devices with clear conflict and privacy handling.
- **Mentor availability:** offer a few self-declared times or a weekly capacity, so a request reflects when someone can help. Calendar integration can follow only if needed.
- **A curated live opportunity list:** let a trusted organizer maintain real openings with source links, dates and review status. Replace fictional listings only with checked information.
- **Community trust controls:** add reporting, blocking and a clear mentor-verification process before inviting a wider public community.
- **Optional notifications:** notify members about a request or response once email delivery, consent and unsubscribe behavior are configured and checked.

These features support sustained use after a working community exists. They are future work, not part of the current prototype.

## First priority: finish the real-account demonstration

Supabase is configured, but its current **Confirm email** setting is ON. For immediate prototype signup, the participant can manually switch it OFF in Authentication → Sign In / Providers → Email. No account setting should be changed silently by the agent. If confirmation remains ON, mail delivery and the allowed redirect URL must be configured and exercised.

The current interface already handles a confirmation-required signup result and tells the user to confirm and return to sign in. The installed browser Supabase client detects same-browser PKCE return codes automatically; the absence of a custom callback route is not, by itself, evidence that this supported flow is broken. Do not add a new confirmation-template migration without demonstrating a need.

Use addresses controlled by the participant for learner and supporter accounts in independent browsers. Save the supporter's relevant skills, mentor role, visibility and request preferences. Demonstrate pending → accepted with a next step, refresh the learner's view, and check that an unrelated third account cannot read the request. Synthetic placeholder addresses were rejected previously; no test accounts were created by those probes.

## Possible to build, but poor choices before submission

- Live chat, email notifications, calendar booking and video calls: each adds delivery, authorization and recovery work beyond the useful request loop.
- Social feeds, endorsements, ratings and follower counts: the prototype has no real community evidence to support them.
- Live internship scraping or a large directory: sample provenance and a coherent workflow matter more than unreliable volume.
- Resume uploads, AI scoring, vector search and automatic skill upgrades: these expand parsing and privacy requirements without improving the confirmed-profile flow.
- Payments, credential verification and production moderation systems: document these as future work instead of presenting incomplete controls as finished features.
- Another design rewrite or an additional backend: use the remaining time to validate the current product and rehearse it.
- Offline communication queues or automatic note uploads: these introduce stale requests, duplicates, consent and conflict questions. The current clear reconnect requirement is a better fit for this deadline.
- Site-wide automatic translation: the focused English/Marathi learning area is complete enough to demonstrate. Expanding every account screen and translating personal messages needs more language and privacy review.

## Audit findings from this pass

The backend review found no new demonstrated authorization defect in the current RLS policies or request functions. No SQL change or hosted migration was made.

One concrete AI-validation defect was reproduced: negated evidence with typographic apostrophes, such as “I don’t know Python,” and explicit “no experience” phrases could survive the extra evidence check. The endpoint now normalizes those apostrophes for the negative-language check and rejects the unsupported skills. All four regression cases failed before the fix and pass afterward; the focused endpoint suite now passes 22 tests and TypeScript checking passes. The learner still confirms suggestions, and this bounded check is not a general natural-language competence assessment.

The workspace audit also fixed queued writes so consecutive edits use the latest state, repeated circle-membership changes, and keeping one account's unsaved profile draft out of another account. Thirteen provider tests and one identity-boundary test cover these behaviors. These fixes required no SQL migration.

Feature freeze should leave enough time for the complete hosted journey and submission. If accounts or deployment are still unresolved, spend the remaining effort there before beginning another optional feature.
