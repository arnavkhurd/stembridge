# STEMBridge: prepare and present a clear live demonstration

**Updated for the announced offline twist, approximately 3:06 PM IST, 28 September 2026. Submission deadline: 4:10 PM IST.** This guide includes the English/Marathi learning bonus. Freeze new features now and use the remaining time for the submitted website, real-account checks and rehearsal.

STEMBridge is a **website for women exploring STEM**. The story is: **choose a goal, keep learning when the connection drops, save a useful question, and reconnect with someone who can help.** Show that complete journey. You do not need to install a native app.

At the latest completed code checkpoint, **3:01 PM IST**, all **115 tests across 12 files**, TypeScript checks and the production build passed. In the production browser on port 3001, the website was prepared, its server was stopped, and the website reopened from its saved copy. Catalog reading, exercise use, editing notes, another reload, completion, Marathi and a downloaded UTF-8 notes file were checked. Marathi also displayed at a 390-pixel width without missing glyphs or horizontal overflow.

That is evidence of a working saved website. It is **not the same test as disabling every browser network connection**. The available browser automation did not expose that switch. The owner must still run the real browser **Network > Offline** check on the exact presentation URL, and verify the hosted learner-to-mentor flow before presenting that flow as proven.

## 1. Prepare the exact website you will show

Use the [owner's next steps](OWNER_NEXT_STEPS.md) for accounts and deployment, and give independent testers the [teammate testing guide](TEAM_TESTING_GUIDE.md). The judging preparation below is complete on its own.

Write these down before rehearsal:

- Presentation URL: ____________________
- Browser and browser profile: ____________________
- Final network-offline test: Pass / Fail / Not tested
- Real learner-to-mentor acceptance on this URL: Pass / Fail / Not tested
- Presenter and person operating the second account: ____________________

### Prepare the offline proof

1. Open the **production website**, with internet working, in the browser you will use on stage. If demonstrating locally, use the production build and `http://localhost:3001`; normal `next dev` at port 3000 is not the offline-reload demonstration.
2. Open **Offline learning**. On a narrow phone, the navigation label is **Offline**.
3. Wait for **Ready on this device**. Use **Prepare offline** or **Update offline copy** if needed. A registration alone is not readiness; the required website files must finish saving.
4. Open the array exercise, **Make sense of an array**. Enter a short note such as: `My mentor question: why is this array's shape (2, 3)?` Check **I finished this exercise**, then reload and confirm both remain.
5. Switch the learning language to Marathi and back to English. Confirm the exercise changes language, the letters display properly, and the note and completion do not change. The rest of the website remains English.
6. Use **Download my notes** and open the downloaded file. Check that it contains the words you actually entered, including any Marathi text. Keep a backup before deliberately signing out, changing accounts or signing in from preview.
7. Run the real browser network test below. Do it on the **submitted URL**, not only on localhost.
8. Reconnect after testing. Leave the page in English and ready for the timed demonstration. Leave the demonstration exercise unticked so you can mark it complete live. Keep a short note ready to add to. Know where the real network switch is; do not hunt for it during judging.

Preparation belongs to one **origin and browser profile**. Port 3000, port 3001 and a hosted HTTPS address have separate storage. Chrome and Edge have separate storage too. Prepare the exact address in the exact browser you intend to show. A successful localhost test does not prepare the hosted website.

Do not clear site data, unregister the service worker or open a fresh incognito window on stage. That removes or bypasses the prepared copy. A first-ever offline visit cannot work because that browser has not downloaded the website yet.

### Do the real network test before judging

1. With the prepared website open, press **F12** or **Ctrl+Shift+I** in Chrome or Edge.
2. Open **Network**. Change the throttling dropdown from **No throttling** to **Offline**. Use this actual browser control, not a script that only changes an online/offline flag.
3. Use a normal reload, **Ctrl+R**. Do not clear storage or use a force reload that bypasses the service worker.
4. Confirm the interactive website reopens. A browser connection-error page is a failure. A simple “connect once” fallback is not proof that the full website is ready.
5. Open an exercise. Add `Written with browser networking disabled.` to the note and change its completion tick.
6. Reload normally again. Confirm the new sentence and tick remain. Show the explanation, switch English/Marathi and download the note while still offline.
7. Try reading the catalog. An external tutorial may fail offline; it is not part of the saved exercises.
8. If using a signed-in account, confirm only that account's saved plan appears. The live directory and private inbox must not be presented as current offline data. Account writes and connection requests must ask for internet or stay disabled.
9. Restore **No throttling**. Let the live workspace refresh. Confirm reconnecting did not send a request, upload notes or perform any queued account action.

For localhost, turning off Wi-Fi alone is weak evidence: the browser can still reach a server on the same computer. The completed server-stopped test proves the page did not need its website server, but the real browser Offline setting also checks the broader disconnected experience. Keep those claims separate.

### Prepare the human connection, only if it has passed rehearsal

- Use two emails you control. Sign in beforehand: learner in Chrome, supporter in Edge, both on the presentation URL. Do not type passwords during judging.
- The supporter should choose **Learn and mentor**, the relevant domain and skills, Online support, directory visibility and incoming requests.
- Use the learner's **Build your first ML project** goal, or another goal you have rehearsed. Read the account's actual skill count; a real account need not show the sample's 3/7.
- Have one **real pending request** ready from learner to supporter. Open the supporter's **Connections > Received requests** before presenting. Use **Refresh inbox** if necessary.
- Prepare this short next step for acceptance: `Explain your two array totals and write one question. We can review the next exercise together.` The supporter must still explicitly accept.
- Rehearse switching browsers, accepting, then returning to the learner's **Connections > Sent requests > Refresh inbox**. Confirm the accepted result survives reload.
- A rehearsal may consume the pending request. Do not try to send an identical active request twice. Use another relevant goal/help type or another clearly labelled test case. Do not delete records just to pretend the same action is fresh.
- If accounts are not ready, use the honest preview branch below. Prepare its separate browser profile ahead of time. Stay in that preview for the demonstration; signing into an account clears preview notes.

Sign in shortly before the demonstration. A valid existing session can open its own saved account plan offline; a saved snapshot is not a new login. If the session expires automatically, account notes remain on this device but are **locked from preview**. Reconnect and sign into the **same account** to recover them. An explicit sign-out or a different account signing in clears the private device notebook and account copy. Signing in from preview also clears the preview notebook. Download needed work before any deliberate identity change. On a shared computer, sign out when finished.

## 2. The three-minute main demonstration

Use this run only after the exact URL has passed both the network-offline test and the real-account rehearsal. It totals **180 seconds**. The required twist receives **70 seconds of offline proof**, followed by a **10-second Marathi bonus**. Skip extra page tours.

| Time      | What you show                                                                                    | What you say or do                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00-0:20 | Learner's My Hub and chosen goal                                                                 | “STEMBridge helps women exploring STEM turn an interest into a useful next step and find someone who can help. Our two pathways are Data & AI and Robotics & Makers.”                                                                                                                                                                                                                                                                          |
| 0:20-0:45 | **See my plan**, or one **Find my first step** path                                              | “We start with her goal and the skills she already brings. We identify one manageable next action and a relevant kind of support.” Point to one gap and one useful exercise. Use only one panel.                                                                                                                                                                                                                                               |
| 0:45-1:55 | **Offline learning**, readiness, real Offline setting, reload, exercise, note and another reload | “Our assigned twist was offline support. This browser has prepared the website. I am now disabling networking and reloading.” Show the real setting, reload, open the exercise, reveal its explanation, add a short mentor question, tick completion, then reload again. Point to the saved text and tick: “She can keep practising and prepare a useful question without internet. Completion records practice; it does not certify a skill.” |
| 1:55-2:05 | Switch to Marathi while still offline                                                            | “We also added English and Marathi to this learning area. It works offline, and her own notes stay exactly as written.” Show the changed lesson and unchanged note. Switch back to English if convenient.                                                                                                                                                                                                                                      |
| 2:05-2:45 | Reconnect; supporter accepts the prepared real request; learner refreshes                        | Restore the actual network setting. “Connecting with people needs internet. This is a separate account receiving her request.” In the supporter browser, accept the pending request with the prepared next step. Return to the learner, refresh sent requests and show the accepted action.                                                                                                                                                    |
| 2:45-3:00 | Accepted next step and closing sentence                                                          | “The learning continues between connections, and the conversation starts from a specific task. Next we would test usefulness with women learners and mentors in a small community pilot.”                                                                                                                                                                                                                                                      |

The request should be specific: `Could you review my array exercise and explain why its shape is (2, 3)?` If the demonstrated type is collaboration, call it peer collaboration. Do not describe every request as mentorship.

The request is prepared beforehand to fit the time limit; say so if asked. Notes are not silently sent to the supporter. The learner chooses what to include in a request. There is no automatic offline request queue.

If reconnecting or accepting does not work promptly, use the failure wording below. Do not spend the last minute repeatedly clicking. A previously verified accepted record or recording may support the explanation if clearly labelled as earlier evidence.

## 3. The 90-second short demonstration or account fallback

This totals **90 seconds**. Use it when the judging slot is shorter, or when real accounts have not passed the hosted walkthrough. The offline proof still has to be prepared and tested on the URL shown.

| Time      | What you show                                                  | What you say or do                                                                                                                                                                                                                                                                                |
| --------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00-0:15 | Goal and labelled sample preview                               | “STEMBridge connects a STEM goal with useful learning and support. This is a fictional sample profile. Our required twist is offline support.”                                                                                                                                                    |
| 0:15-0:25 | Offline learning and **Ready on this device**                  | “The browser has saved the website and its original practice exercises.”                                                                                                                                                                                                                          |
| 0:25-0:45 | Set real networking to Offline and reload normally             | “The website reopens even without a connection.” Show that it is interactive, not just a screenshot or a fallback notice.                                                                                                                                                                         |
| 0:45-1:05 | One exercise, explanation, note, completion and another reload | Add a brief question, tick completion, reload and show that the work remains. “Learning can continue before the next mentor conversation.”                                                                                                                                                        |
| 1:05-1:15 | Marathi, with the same note still visible                      | “This learning area also supports Marathi offline. User notes are never translated automatically.”                                                                                                                                                                                                |
| 1:15-1:30 | Reconnect and explain the online continuation                  | “Requests and acceptance use separate online accounts. That flow is implemented, but we have not completed the hosted account demonstration.” If it was verified but omitted for time, say instead: “We verified the two-account flow separately; I can show that evidence after this short run.” |

Never act as though a sample profile received a message. Do not substitute a local mocked test for a hosted account demonstration. A clear boundary is more credible than an invented success.

## 4. Optional details for questions, not extra minutes

Use these only if a judge asks or invites a longer demonstration:

- **Different needs:** **Find my first step** offers starting out, returning to STEM and finding a project partner. Returning support preserves existing skills. The introduction is editable and reviewed before sending.
- **Clear matching:** show why a person fits the goal and confirmed skills, plus their support preferences. Visibility and willingness to receive requests are explicit choices.
- **Two pathways:** Aisha's labelled robotics sample has different needs and exercises from Priya's Data & AI sample.
- **Self-reported progress:** confirming NumPy changes Priya's sample from 3/7 to 4/7. That changes her self-report; a click does not teach or certify a skill. An offline exercise-completion tick does not make this change.
- **Useful export:** open the text file produced by **Download my notes** and show the learner's actual words. Keep any private notes out of the projected view.
- **Optional Gemini:** spend at most ten seconds on it, and only after a live response has been tested. It is not needed for offline exercises, Marathi, matching or requests.

External links to [Women in Machine Learning](https://www.wiml.org/) and [Women in Robotics chapters](https://www.womeninrobotics.org/chapters/) are independent community resources. They are not partnerships, automatic memberships or guaranteed mentor access. They require internet.

## 5. Explain the implementation in plain language

“Next.js runs the website. Supabase manages sign-in and shared records. Ordinary matching rules compare confirmed skills with the goal. A service worker saves the anonymous public website and the files it needs to reopen. Our eight practice exercises and both reading languages are bundled with those files. Notes and completion stay in this browser. A separate saved account copy contains only the current account's own plan information.”

“Before showing offline readiness, we check that the required HTML, JavaScript, styles and fonts were saved. API calls, sign-in responses, Supabase responses, the private inbox and external websites are not put in that service-worker cache. A new website version is prepared completely before replacing the last usable copy. If an update fails, the last complete copy can still work.”

“The account snapshot does not copy authentication tokens into itself and does not grant permission to sign in. The normal Supabase browser session remains separate. A missing or expired session cannot unlock another account's plan or notes. We do not queue cloud writes; reconnecting does not send anything on the user's behalf.”

For database detail, profiles, learner state, circles, memberships and requests are separate tables. Row policies restrict private records; restricted database functions control request creation, acceptance, decline and cancellation. The local PostgreSQL tests exercise the actual schema with the external Auth boundary emulated. That is useful permission evidence, not a security certification or proof of the deployed configuration.

## 6. Questions judges are likely to ask

### Why women in STEM? Is it just the branding?

“The challenge concerns access to mentors, peers and opportunities for women exploring STEM. Our paths distinguish starting, returning and collaboration needs. We preserve existing skills, help compose a specific first request, make visibility opt-in and point to women-in-STEM communities. Offline practice and Marathi add ways to keep preparing between online conversations. These choices can help other people too; we do not infer ability from gender. A pilot with women learners and mentors would tell us which barriers we actually reduce. We have not measured impact yet.”

### What did you do for the announced twist?

“Our assigned requirement was offline support. After one successful preparation, the website reopens with its catalog and eight original exercises. Learners can read instructions, reveal explanations, write notes, mark practice complete and export their notes without internet. A valid current account can also read its own saved plan. We added English and Marathi to the learning area as a bonus.”

### Is the whole social network offline?

“No. Live people, the connection inbox, sign-in, account changes, membership changes, requests and replies require internet. We do not present stale messages or availability as live. The offline value is continued learning and preparation for the next conversation.”

### What happens on the first visit, or when the website changes?

“This browser needs one online visit and a completed preparation. We show readiness after checking the files, not merely after installing a worker. Updates are committed only after the new bundle is complete; failed updates preserve the last complete bundle. Browser storage can be cleared or evicted, so offline availability is not a permanent guarantee.”

### Where are the notes and account data? What happens on sign-out?

“Notes are local to this browser and do not sync across devices. They can be exported. The saved account copy contains only the owner's own profile and plan information, not other members or the private inbox. Explicit sign-out or a different account signing in clears the private device notebook and snapshot. Signing into an account from preview also clears preview notes. Automatic session expiry instead locks account notes from preview; the same account can recover them after signing in online. On a shared device, export needed work and sign out.”

Do not claim local browser storage is encrypted against someone who controls the computer. The project provides account boundaries within the website; it is not a substitute for a trusted device.

### Does reconnecting upload the notes or send pending requests?

“No. There is no background send queue. Notes remain on the device. The learner reviews a message and explicitly sends it while online. This avoids duplicate or accidental outreach.”

### Are you caching external courses?

“No. The eight short exercises are original STEMBridge material, included in the website. The full official tutorials are separate links and still need internet. We are not claiming to download entire external courses.”

### Is the entire website multilingual?

“The bonus covers the offline learning area in English and Marathi: authored lessons, instructions, explanations, prompts and controls. Account screens, catalog listings and other users' messages are not fully translated. The language choice is saved locally, and changing it never rewrites a learner's notes.”

### How does matching work? What does 3/7 mean?

“Matching uses understandable rules: domain, directory visibility, willingness to receive requests, support preferences and relevant confirmed skills. Three of seven means three of this sample goal's seven listed requirements match the learner's self-reported skill IDs. It is not a hiring score, qualification or certificate. Neither matching nor exercise completion decides who deserves help.”

### What does Gemini do? Do you need an API key for this demonstration?

“Gemini is optional profile assistance. With the learner's consent, it can suggest supported skills from her own description. The learner reviews and confirms them. The offline pack, Marathi, matching and connection workflow need no Gemini key.”

If live Gemini has not been verified, add: “Its endpoint is implemented and tested with mocked responses; we are not claiming a verified live Gemini demonstration.” Do not improvise an API-key setup on stage.

### Are the people, opportunities and connections real?

“Preview people and opportunity listings are fictional or illustrative and labelled accordingly. Our live demonstration uses controlled test accounts. Official documentation links are real sources. We do not claim a populated mentor network, verified expertise, current internship openings or real applications.”

After a successful hosted account rehearsal: “These two separate accounts share a real saved Supabase request and acceptance; we checked refresh persistence.” Before that success: “The flow is implemented and locally tested; the hosted account demonstration is still unverified.” There is no chat, call or email-notification feature.

### What did you test, and what remains?

“At 3:01 PM, 115 tests across 12 files, TypeScript and the production build passed. The checks include matching, database permissions, account boundaries, request lifecycle, offline caching, snapshots, notes and language behavior. The production browser also reopened the website with its server stopped, preserved edited notes and completion, displayed Marathi and exported the actual UTF-8 notes. The 390-pixel layout was checked.”

Then state the owner's actual final results: “On this submitted URL, we also passed the real browser Offline test and the two-account flow” **only if both were performed successfully**. Otherwise name the missing check. Tests, server-stopped evidence and a deployed network-offline walkthrough are different evidence.

### Why no offline messaging, chat or calls? What would you add next?

“We prioritized a complete learning-to-support journey within the deadline. Offline message queues introduce stale-recipient, duplicate-send and conflict problems. Calls add technical complexity without proving that a learner receives useful help. Next we would pilot the workflow, improve reporting and blocking, verify mentor availability, curate real opportunities and measure completion of agreed next steps. We would add cloud notebook sync only with clear consent and conflict handling.”

### What is your impact or business model?

“Neither is validated yet. A practical next experiment is a small college or community pilot, with consent, measuring whether learners find useful help and complete an agreed next action. That is our proposed evaluation, not an outcome we have already achieved.”

## 7. If something fails during judging

| Problem                                              | Honest response and next action                                                                                                                                                                                                         |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Offline preparation is incomplete                    | Stay online and retry preparation before the demonstration. Do not call a fallback page a working offline website. If stage time has started, state the failure and show only earlier successful evidence clearly labelled as recorded. |
| Full offline reload fails on the submitted URL       | Name the URL-specific failure. You may show the verified local production run if the rules allow, but state that it is local. Do not imply the hosted offline requirement passed.                                                       |
| Account session expires offline                      | Explain that the account view is locked. Reconnect and sign into the same account to recover account notes. Do not create a different account or clear the notebook as a supposed recovery step.                                        |
| Notes cannot be saved                                | Keep the visible text and download or copy it. Read the storage warning. Do not claim reload persistence without checking it.                                                                                                           |
| An update cannot be checked but the saved copy works | Explain the displayed saved-copy message and continue with the prepared version. Retry the update after reconnecting.                                                                                                                   |
| A request is missing or acceptance fails             | Refresh the correct inbox once. If it still fails, use a previously verified accepted record or labelled recording, or state that the live account handoff is unavailable. Never show a sample as the recipient of a real request.      |
| The network does not return promptly                 | Finish with the offline work and explain the intended online continuation. Do not promise that a request was queued or sent.                                                                                                            |
| Marathi glyphs fail on the presentation device       | Switch to English, acknowledge the device-specific rendering issue and keep the required offline demonstration. Do not spend the slot debugging fonts.                                                                                  |
| Gemini has no key or errors                          | Use manual skills. Offline and Marathi do not need Gemini.                                                                                                                                                                              |
| The hosted site is unavailable                       | Use a prepared local production website only if event rules allow, and call it local. Give judges only links that have actually been checked.                                                                                           |

Do not fake offline mode by changing a label or an online flag. Do not describe a screenshot as an interactive reload, a plan as an implemented feature, or a sample mentor as a verified person.

## 8. Final rehearsal and submission

From approximately **3:06 PM**, use the remaining time in this order: final submitted-URL preparation and tests, one timed rehearsal, fixes only for actual blockers, then submission. Aim to submit by **4:00 PM** so the **4:10 PM** deadline has a buffer. If setup takes longer, drop optional demonstration details instead of adding new features.

- [ ] The exact submitted URL opens for someone outside the owner's account.
- [ ] That URL is prepared in the presentation browser and shows readiness.
- [ ] The real browser Offline setting, normal reload, note edit and second reload passed on that URL.
- [ ] The notebook download opens and contains the actual latest text.
- [ ] Marathi displays correctly; switching language preserves notes and completion.
- [ ] Any live two-account claim is backed by a successful rehearsal on that URL.
- [ ] The pending request, supporter browser and next-step text are ready if using the three-minute main run.
- [ ] A fresh or recently refreshed session avoids expiry during the short demonstration.
- [ ] The presenter rehearsed the full run in 180 seconds, or the short branch in 90 seconds.
- [ ] The actual network setting is restored to online after rehearsal.
- [ ] No passwords, API keys, admin dashboards or private messages are visible in the presentation.
- [ ] Sample content, test accounts and any recorded evidence are clearly labelled.
- [ ] Website, repository and any required video or presentation links are correct and accessible.
- [ ] The team submits through the organizer's required channel before **4:10 PM IST**.

The strongest finish is the evidence: the learner's work survives losing a connection, her question becomes more specific, and a real supporter can agree on the next step when they are online again.
