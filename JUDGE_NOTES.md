# STEMBridge — demonstration notes

## 30-second introduction

“A student may know she wants to explore machine learning but still be unsure what to try next or whom to ask. STEMBridge connects her goal to the skills she already brings, useful learning steps, and people she can approach with a specific request. It focuses on women exploring Data & AI and Robotics & Makers.”

## Demonstration: about three minutes

1. Open the sample learner Priya and review her three stated skills. Choose the first ML project, click **See my plan**, and show the genuine **3 of 7 listed requirements** comparison.
2. Show the foundation resources, practice project and relevant mentor/peer recommendations. Explain one recommendation using its actual skill and domain links.
3. Change online-only and point to an in-person profile disappearing or returning. Switch to Aisha briefly to show a genuinely different robotics pathway.
4. In a configured live workspace, sign in as the learner, open a registered supporter's profile, and send a specific request such as “Could you review my first notebook's train/test explanation?”
5. In a second browser signed in as the supporter, open or refresh Connections, accept, and suggest a next step. Refresh the learner's inbox to show the shared accepted state.

Prepare the two controlled accounts before presenting using **Join STEMBridge**. In the supporter's **My profile** choose **Data & AI Circle**, **Be a mentor** or **Learn and mentor**, relevant skills, and **Online**. Enable **Show my profile in the public directory** and **Let members send me connection requests**, then save. Join the Data & AI circle if demonstrating visible member counts. In the learner account choose the first ML project and refresh to load that supporter. Ordinary tabs share a session, so use separate browsers or browser profiles. Do not attempt to send to fictional preview cards or substitute a hidden role switch for the real-account demonstration.

If Supabase has not been configured and verified, present steps 1–3 as the preview and explicitly say that live requests are implemented but not yet demonstrated. If Gemini is not connected, call profile entry manual; do not describe sample output as live AI.

## What is implemented and what is simulated

| Area | Current status |
| --- | --- |
| Typed profiles, requirement comparison, linked paths and online-only matching | Implemented; all 15 matching/catalog tests pass, including the dual-role regression |
| Two distinct sample learners, sample people and opportunity catalog | Fictional/illustrative content, explicitly labelled |
| Account signup/sign-in, private learner state and circle membership | Supabase configured and hosted public community read verified. Account lifecycle still needs accepted user-controlled email accounts. |
| Pending requests, recipient accept/decline, sender cancellation | Implemented; 10 local PostgreSQL permission/lifecycle tests pass. Hosted two-account verification remains required. |
| Optional AI profile suggestions with consent and confirmation | Implemented; 18 tests pass with mocked Auth/Gemini. Live provider verification remains required. |
| Live internship feed, verified mentors, email notifications, chat | Not built |
| Actual announced twist | Not supplied to this build yet; no adaptation is claimed |

**Verification so far:** all 43 tests, TypeScript and the production build passed after the redesign at approximately 13:54–13:55 IST on 28 September 2026. Desktop/mobile checks confirmed the local font, readable sizing, no page overflow, changing skill coverage, keyboard plan modal and catalog filters. Hosted Supabase returns two community records and denies anonymous reads of private tables. Signup is enabled, but **Confirm email is currently ON** and must be turned off manually for the immediate-signup prototype. Synthetic email addresses were rejected; no test accounts were created and the real two-browser request flow remains unverified. The Gemini key is empty, so live AI is not connected. Update pending results before submission; a mocked provider test is not a live API demonstration.

## Explain the implementation plainly

“Next.js displays the interface. Supabase manages accounts and shared records. Database access rules let a member read only their private learner information and the requests they participate in. Small functions compare confirmed skill IDs and select relevant resources and people. Gemini, when connected, only helps turn a description into a suggested profile; the learner confirms it.”

The product is more than a directory because recommendations attach to a concrete goal and remaining requirement, and a specific support request can move from pending to accepted across two real accounts. We are demonstrating that workflow, not claiming that no other platform offers similar features.

## Likely questions

**Does 3/7 mean qualified?** No. It is coverage of this sample listing's requirements based on confirmed self-report. It is not certification, a hiring prediction or an employability score.

**Why focus on women in STEM?** The challenge concerns access to mentors, peers and learning opportunities. This prototype organizes those connections around a practical next action. It does not infer ability or preferences from gender.

**Where are the people and internships from?** The preview people and listings are fictional. Live profiles belong to accounts in the configured project; expertise remains self-described. Four learning links lead to official documentation.

**Where is AI used?** Only in optional profile suggestions after consent. Matching, requirement counts and request permissions use ordinary code. Manual entry continues when a key is missing or the provider fails.

**Is networking real?** With Supabase configured and the two-browser flow verified, separate accounts share actual request state. There is no chat or email notification. Without that configuration, the preview must not be presented as a live network.

**How is privacy handled?** The directory is opt-in; private learner data is separate. Request records are restricted to their participants. Email identities and mentor credentials are not verified in the hackathon setup. This is not a claim of production security certification.

**What changed for the twist?** No twist has been recorded yet. When announced, state its exact requirement, show the smallest working adaptation and retest the original journey. Record the actual result in BUILD_STATUS before presenting it.
