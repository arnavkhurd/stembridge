# A clear three-minute STEMBridge demonstration

> **Twist update:** the announced requirement is offline support. It is implemented, with English/Marathi in the learning area as a bonus. Use the [OFFLINE_TWIST_GUIDE](OFFLINE_TWIST_GUIDE.md) for the 90-second twist segment, preparation and precise evidence. The production website was reloaded and used with its server stopped; full browser Network → Offline testing and the hosted account flow still need the participant check. The latest completed checkpoint here is 115 tests, TypeScript and build at 3:01 PM. This base script and its original PDF predate the twist; the addendum replaces its older “no twist supplied” answer. Keep the full presentation inside the judge's time allowance.

The main story is: **a woman exploring STEM chooses a goal, sees a useful learning gap, finds someone relevant, and agrees on a next step.** Keep the demonstration focused on that journey.

This guide reflects the build checked at approximately **2:28 PM IST, 28 September 2026**. The deadline is **4:10 PM IST**. Local checks pass; the real-account walkthrough, live Gemini and deployment must be demonstrated successfully before you claim they work.

## Prepare before judges arrive

- [ ] Finish the account and deployment checklist in [OWNER_NEXT_STEPS](OWNER_NEXT_STEPS.md).
- [ ] Open the learner account in Chrome and the supporter in Edge on the actual presentation URL. Sign in beforehand; do not spend judging time typing passwords.
- [ ] Use a supporter who chose **Learn and mentor**, Data & AI, relevant skills and Online, and enabled both directory visibility and requests.
- [ ] Have the learner's **Build your first ML project** goal ready. Know which skills this profile actually lists.
- [ ] Have a fresh pending request ready, or know which fresh request you will send live. The same active request cannot be created twice; use a different relevant goal/help type after a rehearsal.
- [ ] Keep a separate signed-out preview available if you want to show Priya's exact **3/7** example. Call Priya a fictional sample. A real account with different skills may show a different count.
- [ ] Rehearse the browser switch, **Connections → Received requests → Refresh inbox**, **Accept request** and the learner's refreshed result.
- [ ] Keep any fallback screenshots or recording from your own successful run clearly labelled as recorded evidence. Prepare them only after that run has actually succeeded.

## The three-minute run

| Time | What you show | What you say |
| --- | --- | --- |
| 0:00–0:25 | Home and the chosen learner/goal | “STEMBridge helps women exploring STEM turn an interest into a practical next step and find someone who can help. We focused on Data & AI and Robotics & Makers.” |
| 0:25–0:55 | **See my plan** and the listed requirements | “This goal states what it needs. We compare those requirements with the skills the learner has confirmed. The uncovered skills lead to useful resources and practice.” |
| 0:55–1:20 | One learning resource and one relevant member's full profile | “This person is relevant because of these skills and the learner's current goal. The learner can check the bio, support preferences and what help is offered before asking.” |
| 1:20–1:45 | The real registered supporter's profile and request form | “Instead of a vague connection, I can ask for one specific kind of help.” Send the prepared message, or show the already-pending request if time is tight. |
| 1:45–2:25 | Supporter browser: **Connections → Received requests**, **Refresh inbox**, **Accept request** | “This is a separate signed-in account. The recipient decides whether to accept and proposes a practical next action.” Enter the next step and accept. |
| 2:25–2:45 | Learner browser: **Connections → Sent requests → Refresh inbox** | “The learner now sees the accepted request and the agreed next step. It remains after refresh because both accounts share the saved request.” |
| 2:45–3:00 | Stay on the accepted record | “The prototype closes the gap between a goal, a useful person and a next action. Next we would test it with a small real community and improve safety, availability and curated opportunities.” |

Use an example request that names the task: “Could you review my first notebook's train/test explanation and help me choose one next exercise?” A possible reply is: “Write a short project outline and choose one dataset. We can review the scope together.”

If the live demo uses collaboration after a guidance rehearsal, say **peer support** and use **Ask to collaborate**. Do not call the request mentorship if the selected type is collaboration.

## Optional: use the first-step panel for the middle minute

**Implemented and checked locally at 2:28 PM IST.** **My Hub → Find my first step** can replace the 0:25–1:20 plan/profile walkthrough. It is the same story, not a second presentation.

| Time within this minute | Show and explain |
| --- | --- |
| First 15 seconds | Choose one: **I'm starting out**, **I'm returning to STEM** or **I want a project partner**. “Different situations need different kinds of support.” |
| Next 20 seconds | Show the actual next action and one resource. For returning learners: “We keep the skills she already brings and choose a next step from there.” For a beginner: “Start with one manageable action.” For project partners: “Find someone to build with.” |
| Next 15 seconds | Show the suggested mentor or peer. Point out the matching reason and support preference. |
| Final 10 seconds | Show the editable outreach and move to request review. “She controls the message and decides whether to send it.” Continue with the separate-account acceptance. |

These choices need no AI and stay in the panel rather than becoming public profile information. If there is no suitable local match, the panel may point to [Women in Machine Learning](https://www.wiml.org/) or [Women in Robotics chapters](https://www.womeninrobotics.org/chapters/). Describe these as external resources, not partners, automatic memberships or guaranteed access to mentors.

## Small details that strengthen the demonstration

Choose one or two if they fit the time; do not tour every page:

- **The plan changes:** in Priya's sample, confirming NumPy changes 3/7 to 4/7 and removes that gap/resource. Explain that you are demonstrating a changed self-report, not that clicking a checkbox teaches a skill. Restore the sample afterward.
- **Search respects preferences:** search a skill or member name, combine with Online or a catalog category, then clear the search. Explain why the remaining result fits.
- **Two distinct pathways:** switch the sample preview to Aisha to show the robotics goal and different resources. Label this a preview switch; it is not the real-account handoff.
- **Optional AI, at most ten seconds:** only if a live response was tested, show a suggestion and its quoted evidence in **My profile**. Say the learner confirms it. Keep the main story on the goal and human connection.

## Explain the implementation in plain language

“Next.js runs the website. Supabase manages sign-in and shared records. Public profiles are opt-in; private learner information is kept separately. The database allows only the two people involved to read a request, and only the recipient to accept it. Ordinary matching code compares confirmed skills with the goal. Gemini, if connected, helps draft a profile from the learner's own description.”

If asked for more technical detail: there are five tables for profiles, learner state, circles, memberships and connection requests. Database row policies control visibility, and restricted functions control request creation, response and cancellation. A real PostgreSQL test suite runs the actual schema locally with the external Auth boundary emulated.

## Questions you are likely to hear

**Why women in STEM?**

“The challenge is about access to learning support and connections for women exploring STEM. We offer different starting, returning and collaboration paths, preserve existing skills, make the first request editable, keep profiles opt-in, and connect to women-in-STEM communities. These choices can help others too; we do not claim they are exclusive to women. We would validate their usefulness with women learners and mentors in a small pilot. We have not measured impact yet, and we do not infer ability from gender.”

**How is this better than an ordinary directory?**

“A directory starts with browsing people. Our demonstrated journey starts with what the learner wants to do, identifies relevant requirements and resources, and connects that goal to a person and an agreed action. We are showing that workflow, not claiming that no other platform has similar features.”

**How does matching work? Is AI choosing who deserves help?**

“Matching uses visible code rules: domain, directory visibility, willingness to receive requests, Online preference and relevant confirmed skills. We show the reason for the recommendation. It does not decide deservingness, hiring eligibility or admission.”

**What does 3/7 mean?**

“Three of this sample goal's seven listed requirements match the learner's confirmed skill IDs. These are self-reported skills. It is not a qualification, employability score or certificate.”

**What does AI actually do?**

“Only optional profile suggestions from text the learner chooses to send to Gemini. We restrict the skill vocabulary and check quoted evidence, including negative statements. The learner still reviews and confirms the result. Matching and request permissions do not depend on AI.” If the key remains absent, add: “The endpoint is implemented and tested with mocked responses; we have not demonstrated a live Gemini response.”

**Are these real people and opportunities?**

“The preview profiles and opportunity listings are labelled fictional or illustrative. Our demonstration accounts are controlled test accounts. The official learning resources link to real documentation. We do not claim an active mentor network, verified expertise, current internships or real applications.”

**Is the connection real?**

After a successful hosted walkthrough: “Yes, these two separate test accounts share an actual saved request and response in Supabase. We checked refresh persistence.” Before that success: “The request flow is implemented and locally tested, but we have not completed the hosted account demonstration.” There is no chat or email notification.

**What protects privacy?**

“Profiles begin hidden and closed to requests. Members explicitly opt into the directory. Private learner state belongs to its owner; requests belong to their participants. Visible-member counts exclude hidden profiles.” Describe the actual hosted checks you completed. Local SQL tests are evidence of the rules, not a security certification.

**Are emails and mentors verified?**

“Mentor skills and credentials are self-described.” If confirmation was turned off for the prototype, add: “These demonstration emails are unverified too.” If it stayed on and was tested, say that email ownership was confirmed; this does not verify expertise or identity more broadly.

**Why only two domains? What would scale next?**

“Two domains let us show different, coherent pathways within the deadline. We would first test usefulness with a small community, then improve mentor availability, reporting/blocking, curated real opportunities and learning-step progress. Expanding the catalog alone would not prove the recommendations are useful.”

**How did you test it?**

“At the 2:28 PM checkpoint, 72 tests passed: 15 matching, 10 PostgreSQL permissions/lifecycle, 22 mocked AI endpoint, four discovery, 13 workspace-provider, two screen-flow and six first-step planner tests. TypeScript, production build and desktop/mobile checks also passed.” Add any later verified result. State separately whether your deployed two-account and third-account privacy checks passed.

**What changed during debugging?**

“We fixed consecutive saved-state updates, repeated membership changes, drafts crossing account switches, and AI evidence that said the learner did not know a skill. Regression tests cover those cases. No SQL migration was needed for those fixes.”

**What did you do for the twist?**

Only name an actual announced requirement and an implemented, checked response. No twist had been supplied at this guide's checkpoint. If none arrived, say so; do not invent one.

**What is the business model or impact?**

“We have not validated a business model or measured outcomes. A reasonable next experiment is a small college/community pilot measuring whether learners find useful help and complete the agreed next action, with participants' consent.” Present that as a proposed experiment, not a result.

## When a service fails during judging

| Problem | Honest response and next action |
| --- | --- |
| A request does not appear | Click **Refresh inbox** once and check the correct incoming/sent tab. If it still fails, show a previously verified accepted record or labelled recording and explain the live failure. |
| Authentication or network fails | Use the labelled sample preview to show goal → requirements → resources → relevant people. State that the live account handoff is unavailable in this attempt. |
| Gemini errors or has no key | Use manual skill selection. Explain the optional assistance and do not spend the presentation debugging it. |
| Deployment is unavailable | If allowed by the event, present the working local site and state it is local. Give judges only links you have actually checked. |

Avoid describing sample profiles as real members, test expertise as verified, saved resources as learned skills, or a planned feature as built. A useful prototype with clear evidence is a stronger presentation than an unsupported claim.

## Just before submission

- [ ] Time one complete run to three minutes.
- [ ] Confirm the browser shows the intended learner and supporter, not a Supabase admin page.
- [ ] Keep passwords, API keys and private dashboard details out of the screen share.
- [ ] Confirm the submitted website/repository links open for someone outside your accounts.
- [ ] State what works, what uses sample content and what still needs verification.
- [ ] Submit through the organizer's required channel before **4:10 PM IST**, with a buffer for upload problems.
