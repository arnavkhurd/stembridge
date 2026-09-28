# STEMBridge — what exists and what to add next

Working deadline supplied by the participant: **4:10 PM IST, 28 September 2026**. This feature review keeps additions small enough to preserve time for real-account testing, the announced twist if any, deployment and rehearsal.

## Built

| Feature | What it does | Current limit |
| --- | --- | --- |
| Two STEM circles | Data & AI and Robotics & Makers have distinct people, goals and learning resources. | Preview people and opportunity listings are fictional. |
| Editable starting point | Learners confirm skills, interests, preferred connection mode and what support they can offer. | Skills and mentor expertise are self-reported. |
| Goal-to-action plan | Compares confirmed skills with a selected goal's requirements and connects gaps to learning resources and people. | A curated learning sequence; no eligibility or employability prediction. |
| Real preference filtering | Online-only, catalog categories, domain and saved-item filters change visible results. | Filters use the small current dataset. |
| Saved opportunities | Bookmarks persist locally in preview and use private learner state for connected accounts. | Live persistence still requires the hosted account walkthrough. |
| Opt-in community profiles | Registered users choose directory visibility, mentor/learner participation, support modes and request availability. | Identity and credentials are not verified. |
| Circle membership | Signed-in users can join/leave circles; counts include only visible membership records. | Membership records of hidden profiles are not exposed to other members. |
| Connection lifecycle | A learner sends a specific request; only its recipient accepts/declines and only its sender cancels a pending request. | Hosted cross-account behavior remains unverified until controlled accounts are available. |
| Optional AI assistance | Gemini proposes fields with quoted evidence after consent; users review and confirm. Missing-key and failure paths preserve manual editing. | The Gemini key is currently absent; live parsing is not demonstrated. |
| Responsive interface | Local Manrope font, readable text, keyboard-operable dialogs, mobile layouts and explicit empty states. | Keep checking new views at desktop and mobile sizes. |

The actual PostgreSQL schema and permissions have passed local database tests, and hosted anonymous reads of private tables are denied. Public Supabase connectivity is verified. These facts do not substitute for a successful real-account request/response demonstration.

## Worth adding before submission

1. **Catalog search.** Search titles, providers, descriptions and tags while preserving the chosen category, domain, saved-only and online filters. Include a clear-search action and a useful no-results state. The existing catalog is small enough for simple client-side filtering; no new service or database table is required.
2. **Member profile details.** Let a card open a readable profile with the person's bio, skills, support preferences, help topics and reasons they fit the selected goal. Keep mentor/peer request actions inside that context. Use the existing profile data and dialog component; preserve sample disclosures and request eligibility.
3. **Clearer account completion feedback, if the live test reveals a problem.** Help a newly signed-in member reach My profile, turn on the visibility choices they want, and understand why no matching members appear yet. Implement only the specific friction observed in the real two-account walkthrough.

The first two additions improve finding and evaluating people/opportunities without expanding the backend. They are recommendations at this review checkpoint, not claims that the code already includes them. Mark each implemented only after its interaction and filters have been checked.

## First priority: finish the real-account demonstration

Supabase is configured, but its current **Confirm email** setting is ON. For immediate prototype signup, the participant can manually switch it OFF in Authentication → Sign In / Providers → Email. No account setting should be changed silently by the agent. If confirmation remains ON, mail delivery and the allowed redirect URL must be configured and exercised.

The current interface already handles a confirmation-required signup result and tells the user to confirm and return to sign in. The installed browser Supabase client detects same-browser PKCE return codes automatically; the absence of a custom callback route is not, by itself, evidence that this supported flow is broken. Do not add a new confirmation-template migration without demonstrating a need.

Use addresses controlled by the participant for learner and supporter accounts in independent browsers. Save the supporter's relevant skills, mentor role, visibility and request preferences. Demonstrate pending → accepted with a next step, refresh the learner's view, and check that an unrelated third account cannot read the request. Synthetic placeholder addresses were rejected previously; no test accounts were created by those probes.

## Leave out before submission

- Live chat, email notifications, calendar booking and video calls: each adds delivery, authorization and recovery work beyond the useful request loop.
- Social feeds, endorsements, ratings and follower counts: the prototype has no real community evidence to support them.
- Live internship scraping or a large directory: sample provenance and a coherent workflow matter more than unreliable volume.
- Resume uploads, AI scoring, vector search and automatic skill upgrades: these expand parsing and privacy requirements without improving the confirmed-profile flow.
- Payments, credential verification and production moderation systems: document these as future work instead of presenting incomplete controls as finished features.
- Another design rewrite or an additional backend: use the remaining time to validate the current product and rehearse it.

## Audit findings from this pass

The backend review found no new demonstrated authorization defect in the current RLS policies or request functions. No SQL change or hosted migration was made.

One concrete AI-validation defect was reproduced: negated evidence with typographic apostrophes, such as “I don’t know Python,” and explicit “no experience” phrases could survive the extra evidence check. The endpoint now normalizes those apostrophes for the negative-language check and rejects the unsupported skills. All four regression cases failed before the fix and pass afterward; the focused endpoint suite now passes 22 tests and TypeScript checking passes. The learner still confirms suggestions, and this bounded check is not a general natural-language competence assessment.

Feature freeze should leave enough time for the complete hosted journey and submission. If accounts or deployment are still unresolved, spend the remaining effort there before beginning another optional feature.
