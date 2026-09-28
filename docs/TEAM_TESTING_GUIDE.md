# STEMBridge — teammate testing guide

**Updated at approximately 3:06 PM IST, 28 September 2026. Deadline: 4:10 PM IST.** This complete guide includes the announced offline twist, English/Marathi learning, and recovery of locked notes after a session expires. You do not need another guide to follow these tests.

**You do not need to know how to code.** Follow the steps, compare what happens with the expected result, and record any difference.

**Builder/owner: fill this in before handing the guide to teammates.**

| Handoff item                                                                 | Owner fills in |
| ---------------------------------------------------------------------------- | -------------- |
| **TEST_URL** — the exact address everyone should test                        |                |
| Build/version or Git commit                                                  |                |
| Time this version was last checked, including timezone                       |                |
| Person to contact if setup blocks testing                                    |                |
| Controlled A/B/C accounts ready, or instructions for creating them privately |                |
| Email confirmation ON or OFF, and how testers should complete signup         |                |
| Optional live AI ready?                                                      | Yes / No       |

Use the **actual deployed HTTPS address** or the local **production** website at `http://localhost:3001`. The builder must first run `npm run build`, then `npm run start -- -p 3001`. The normal development website at port 3000 is not the offline-reload test target. `localhost` works only on the computer running the server; teammates on other devices need the deployed address. Testers do not need Supabase admin access, API keys, passwords belonging to other people, or service keys.

This guide covers sample preview, accounts, profiles, communities, search, saved items, plans, **Find my first step**, member details, requests, optional AI, and **Offline learning**. Offline learning includes eight original exercises, device notes, completion, text download, English/Marathi reading and a read-only saved account plan. It also checks privacy, expired sessions, phones, keyboards and the judge demonstration.

There are now **five** main pages: My Hub, Communities, Explore, Connections and Offline learning. On a narrow phone the shorter labels are **Circles**, **Connect** and **Offline**. They mean Communities, Connections and Offline learning. The larger desktop labels and accessible control names remain descriptive.

**Evidence from the builder, not a pass for your run:** at 3:01 PM, 115 tests across 12 files, TypeScript and the production build passed. A prepared production browser reopened and worked after its website server was stopped; notes, Marathi choice, completion and a downloaded text file were checked. That proves a server-unavailable case. Full browser **Network → Offline** testing and the hosted account journey still need the teammate checks below. Unit tests separately cover offline account guards, privacy and session expiry.

**This is a checklist, not a record of successful testing. Every result starts as Not tested.** A working preview does not prove that real accounts or requests work. A successful local test does not prove that the deployed website works.

The participant's stated deadline is **4:10 PM IST on 28 September 2026**. Finish critical tests first, with a target of 3:35 PM for reporting blockers. Preserve the remaining time for fixes, the final working version, rehearsal and submission. If time runs short, complete the 30-minute route and report what remains untested.

## 1. First: a five-minute test without hints

Give one teammate the website address and the task below. They should not read the rest of this guide yet. The builder should watch without explaining where to click.

> You are a student who knows some Python and wants to try machine learning. Find something useful to learn, find someone who could help, and work out how you would contact them. Save something you want to return to. Tell us which people and opportunities you think are real.

1. Start a five-minute timer.
2. Let the tester explore. They may use the sample preview; do not contact anyone outside the controlled test team.
3. Write down where they hesitate, click the wrong thing, or ask what a word means.
4. At the end, ask them to explain the website in one sentence.
5. Ask: “What would you do next?” and “What does 3 of 7 mean?” Do not correct them until you record their answers.

Record:

| Question                                               | Tester answer |
| ------------------------------------------------------ | ------------- |
| What does this website help you do?                    |               |
| What was your first useful action?                     |               |
| Could you find a learning resource?                    |               |
| Could you find a person and understand how to connect? |               |
| Could you save something and find it again?            |               |
| Did you distinguish samples from real members?         |               |
| What did you think 3 of 7 meant?                       |               |
| Which label or screen was confusing?                   |               |
| Where did you need help?                               |               |

Do not count a task as easy if the builder had to point out the answer. This test is about understanding, not blame.

## 2. Before the main tests

### Record the run

| Item                                          | Fill in            |
| --------------------------------------------- | ------------------ |
| Website address                               |                    |
| Local or deployed website?                    |                    |
| Date and start time                           |                    |
| Version/commit, if the builder provides it    |                    |
| Tester names                                  |                    |
| Browser and device for each tester            |                    |
| Supabase accounts ready?                      | Yes / No / Unknown |
| Email confirmation required? Ask the builder. | Yes / No / Unknown |
| Live AI connected? Ask the builder.           | Yes / No / Unknown |
| Announced twist, if any                       |                    |

Use the same website address and backend project across the team. Each browser, browser profile and website origin has its own offline preparation and device notes. An origin includes the protocol, host and port: ports 3000 and 3001 are separate, and the deployed address is separate again. Wait for **Ready on this device** on the exact browser and URL you will test. Preparing Chrome does not prepare Edge or a teammate's phone.

### How to record each result

- **Pass:** you performed the steps and saw the expected result.
- **Fail:** you performed the steps and something was wrong. Add a bug report.
- **Not tested (NT):** you did not complete the test. Write why: no account, no AI key, setup blocked, no device, or no time.

If a step is blocked, stop that test and mark it NT. Continue independent tests. Do not repeatedly click signup or AI buttons hoping a service restriction will disappear.

Keep a simple result log:

| Test ID | Pass / Fail / NT | What you actually saw | Tester | Screenshot or bug ID |
| ------- | ---------------- | --------------------- | ------ | -------------------- |
|         | NT               |                       |        |                      |

Use screenshots of the website, but do not include passwords, email inboxes, API keys, tokens, or private account setup screens. Use the account nicknames below in reports.

### Know which mode you are testing

| What you see                                               | What it means                                                                       | What must not be claimed                                                               |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Demo · Sample data**, Priya or Aisha, **Switch profile** | You are using a local sample workspace. Changes and bookmarks stay in that browser. | Sample people do not receive real requests. This is not a signed-in community account. |
| **Signed in** and your test account's name                 | You are using a real registered account in the configured project.                  | A real account is not a verified identity or verified mentor credential.               |
| **Sample listing** on a competition or internship          | The listing demonstrates the workflow.                                              | There is no live employer, deadline, event registration, or application.               |
| **Practice brief** or **Practice exercise**                | STEMBridge authored a learning exercise.                                            | It is not an external course, certification, or promised job.                          |
| **Official resource**                                      | The link leads to the named publisher's documentation.                              | Reading or saving it does not prove you acquired the skill.                            |

Requests appear in the **Connections** inbox. There is no email notification, live chat, or automatic agreement. **Refresh inbox** or reload the other account's page after a change; live push updates are not required.

**Offline modes matter.** In a prepared sample preview, exercises, local notes and preview edits can work without internet. In a real account, its own saved plan is read-only while the matching Supabase session remains valid; other members and inbox records are not copied into that offline view. Account edits and requests require a connection and are never queued to send later. Completing an exercise does not add a skill. Language changes translate the learning area only and leave your written notes exactly as entered.

Explicit sign-out or signing into a different account clears device notes. Automatic session expiry is different: it keeps notes locked and hidden from preview. The same account can recover them after reconnecting and signing in again. Download important work before an intentional sign-out. Use harmless QA notes for destructive-clear tests.

### Set up three controlled accounts

Use accounts and email addresses your team controls. Never test by contacting an unrelated real person. Choose unique test passwords and keep them out of this document.

Use **three independent browser sessions**. For example: Chrome profile A, Edge profile B, and a separate Chrome profile C. Two ordinary tabs share a login. Two private windows in the same browser may also share a private session. Confirm the displayed name in each window before every cross-account action.

| Account | Display name    | Purpose                                                                                    | Initial profile                                                                                                              |
| ------- | --------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| A       | **QA Learner**  | Sends requests and saves a plan.                                                           | Data & AI; **Learn with others**; Python basics, Git basics, Technical communication; Online.                                |
| B       | **QA Mentor**   | Receives requests and responds.                                                            | Data & AI; **Be a mentor**; Python basics, NumPy basics, pandas basics, ML foundations, Small ML project; Online.            |
| C       | **QA Observer** | Checks that A/B's private information is hidden. Later becomes a peer for a separate test. | Data & AI; **Learn with others**; Python basics and Git basics; Online. Keep visibility and incoming requests off initially. |

For each account:

1. Open the website in its assigned browser session.
2. Click **Join STEMBridge**. If the account already exists, choose **Sign in** inside the account window.
3. For a new account, fill **Your name**, **Email address**, and **Password**, then click **Create my account**. The password must be at least eight characters.
4. If asked to confirm email, use only your controlled inbox and follow the displayed instructions. If confirmation mail does not arrive, tell the builder and mark account tests NT. Do not silently change project settings. The builder can follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md).
5. Open **My profile**. A new account may open this automatically.
6. Set the values in the table. Under **More about you (optional)**, give A the introduction “Learning ML with a small project” and B “Helping beginners with ML projects.” This makes accounts easy to recognise.
7. For A and B, enable **Show my profile in the public directory** and **Let members send me connection requests**. Leave both off for C for now.
8. Click **Save profile**. For A and B, open **Communities** and click **Join community** on **Data & AI Circle**.
9. Reload A's page. B should be findable in the Data & AI community after B saves and joins.

If B is missing, check these in order: same website/project, correct account, saved profile, Data & AI interest, relevant skills, mentor role, public visibility, incoming requests enabled, Online support, joined Data & AI, no leftover search, and the correct role filter. Reload A after fixing B.

## 3. The 30-minute critical route

Use this when time is tight. Two teammates should operate A and B; a third can prepare C at the same time. Account setup delays are real blockers—record them instead of declaring a pass.

| Time      | Numbered task                                                                                                                                                                                                                                                                                            | Expected result                                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–5 min   | 1. Run the blind test in section 1.                                                                                                                                                                                                                                                                      | The tester can describe the purpose and identify sample content without coaching.                                                                   |
| 5–10 min  | 2. In preview, use Priya. Open **See my plan**. Confirm **3/7**. Save a resource, reload, and find it with **Saved only**.                                                                                                                                                                               | Correct count; bookmark survives; no claim of live networking.                                                                                      |
| 10–16 min | 3. Sign in as A and B using the setup above. A chooses **Build your first ML project**. Open B's **View profile**.                                                                                                                                                                                       | A sees a real, available mentor with the correct public details.                                                                                    |
| 16–23 min | 4. A opens **Find my first step**, edits **Your introduction**, then clicks **Review request** and **Send request**. Confirm B is the recipient first. B opens **Connections → Received requests → Refresh inbox** and accepts with “Write a short project outline and choose one dataset.” A refreshes. | A sees one useful action and reviews before sending. One request moves from Pending to Accepted. Both accounts see the same next step after reload. |
| 23–27 min | 5. C checks both request tabs. A signs out. Reload A's old page and sign in as C in that session.                                                                                                                                                                                                        | C cannot see A/B's request. A's private request text and drafts do not remain after the account change.                                             |
| 27–30 min | 6. Open the site on a phone or narrow window. Use the four navigation buttons, open and close a plan, and use Tab/Enter on one dialog.                                                                                                                                                                   | No clipped main button, sideways page scrolling, or keyboard trap. Record the release decision from section 17.                                     |

After the route, report: “Critical route: X passed, Y failed, Z not tested.” List the actual blockers. Do not turn an NT into a Pass because the code looks correct.

## 4. Split the full checklist between teammates

| Tester                                       | Main job                                                       | Sections  |
| -------------------------------------------- | -------------------------------------------------------------- | --------- |
| 1 — learner                                  | Preview, profile, plan, catalogue, bookmarks, first-step guide | 5–8, 18   |
| 2 — supporter                                | Community, profile details, and requests with tester 1         | 9–10      |
| 3 — outsider/usability                       | Third-account privacy, account changes, phone, keyboard        | 11–13     |
| 4, if available — builder/technical teammate | Optional AI, failures, developer checks, judge run             | 14–17, 19 |

With two teammates, do requests together first. Split the remaining work. Before changing B's role, visibility, or online mode, tell the teammate using A. Restore the starting values after each test so the next result is meaningful.

## 5. Preview and navigation

Use a signed-out browser for this section. If someone edited the preview earlier, click **Switch profile** until Priya appears again; loading a sample replaces the current preview with that sample's starting values. It is not a second authenticated account.

| ID  | Steps                                                                                                                  | Expected result                                                                                                                                 | Result |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| P01 | 1. Open the site while signed out. 2. Read the banner and top account area.                                            | Demo/sample wording is visible. You are not shown as a signed-in user.                                                                          | NT     |
| P02 | 1. Click **My Hub**, **Communities**, **Explore**, and **Connections**. 2. Use browser Back and Forward.               | Each opens the right section. Back/Forward follows the visited sections without a broken page.                                                  | NT     |
| P03 | 1. Open **Explore**. 2. Reload the page.                                                                               | Explore remains the selected page. Temporary search/filter choices need not survive reload; account data and saved items must.                  | NT     |
| P04 | 1. From My Hub click **All communities**, **See all people**, and **View all** under opportunities.                    | They open Communities, the **Everyone** people filter, and Explore respectively.                                                                | NT     |
| P05 | 1. Click a community's name. 2. Select the other community.                                                            | The community heading, people, and related opportunities change to the selected circle.                                                         | NT     |
| P06 | 1. Click **Switch profile**. 2. Compare Priya and Aisha.                                                               | Name, skills, goal, people, and resources change meaningfully between ML and robotics. Aisha starts with C basics and Arduino basics.           | NT     |
| P07 | 1. Edit a preview skill and save. 2. Save an opportunity. 3. Reload the same browser.                                  | Both changes remain in that browser. Saving says preview/browser rather than publishing a real profile.                                         | NT     |
| P08 | 1. Open a sample person's **View profile**. 2. Read the sample note. 3. Try **Meet real members** or a sign-in prompt. | The person is labelled fictional and cannot receive a live request. The next action opens account access; it does not show “request delivered.” | NT     |
| P09 | 1. While signed out, try **Join community** and **Sign in to connect** in Connections.                                 | Account access is requested. No real membership or request is created.                                                                          | NT     |
| P10 | 1. If using a deliberately unconfigured build, open account access. 2. Click **Keep exploring**.                       | It explains that accounts are not connected and returns to a working preview. Do not remove working configuration just for this test.           | NT     |

There is no account-deletion button. **Clear this notebook** exists inside Offline learning and clears only that device notebook, after confirmation; it does not delete a registered account, profile, request or catalog bookmark. **Switch profile** reloads a sample, not another authenticated account.

## 6. Accounts and sign-in

Use only controlled accounts. Avoid repeated failed signup attempts that can trigger a provider limit.

| ID  | Steps                                                                                                                    | Expected result                                                                                                                                   | Result |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| A01 | Complete a valid signup following section 2.                                                                             | A usable account or a clear confirmation-required message appears. It does not falsely say you are signed in when confirmation is still required. | NT     |
| A02 | 1. Open account access. 2. Switch between **Sign in** and **Create an account**.                                         | Signup includes Your name; sign-in does not. Button labels and password rules fit the selected form.                                              | NT     |
| A03 | Try submitting blank required fields, an obviously malformed email, and a signup password shorter than eight characters. | Clear validation prevents submission. No page crash or false success. Do not record the password in the report.                                   | NT     |
| A04 | Use A's real test email with a wrong test password once. Then correct it.                                                | Wrong credentials show an error and leave the form usable. Correct credentials sign in as A.                                                      | NT     |
| A05 | If time permits, try creating an account with A's existing email once.                                                   | No second distinct account with the same email is created. Record the provider's actual response; it may avoid revealing whether an email exists. | NT     |
| A06 | 1. Sign in. 2. Reload. 3. Close and reopen the same browser session.                                                     | The expected account is restored where the browser keeps sessions. No different user's profile appears.                                           | NT     |
| A07 | Click the **Sign out** icon, then reload.                                                                                | The website returns to sample preview. Private requests and account-only controls are no longer shown.                                            | NT     |
| A08 | Close account access using X and Escape before submitting. Reopen it.                                                    | It closes cleanly. Abandoned password fields are not left visible elsewhere on the page.                                                          | NT     |
| A09 | Open account access on a phone/narrow window.                                                                            | Name/email/password and submit/switch controls fit and remain usable.                                                                             | NT     |

Password reset, password change, and email notifications are not implemented as website features. A tester should not expect those buttons. Email confirmation, if enabled by the owner, must be tested separately rather than assumed to work.

## 7. Profile editing and learning plan

Use preview for experiments, then repeat the save/reload checks in A's real account.

### Profile controls

| ID  | Steps                                                                                                                                                                           | Expected result                                                                                                                                       | Result |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F01 | Open **My profile**, the pencil icon, and the profile icon in turn.                                                                                                             | Each opens the correct current profile, not a stale other-account form.                                                                               | NT     |
| F02 | Edit Your name and Main interest. Save and reload.                                                                                                                              | The changes remain. Selecting a main interest also keeps that interest available for recommendations.                                                 | NT     |
| F03 | Change **I want to…** through **Learn with others**, **Be a mentor**, and **Learn and mentor**. Save each test.                                                                 | Roles are saved. Another account sees the correct role and allowed connection choices. Restore the intended role afterward.                           | NT     |
| F04 | Tick and untick skills. Save and reopen.                                                                                                                                        | The exact selection persists. Merely mentioning a skill in a bio does not automatically tick it.                                                      | NT     |
| F05 | Leave AI assistance and More about you collapsed. Change a visible skill and save.                                                                                              | Saving works without AI, extra text, or opening optional sections.                                                                                    | NT     |
| F06 | Open **More about you (optional)**. Edit A short introduction, A little more about you, and Topics you can help with. Save and view the profile from another account if public. | The correct public text appears. It is plain text, with no accidental markup or clipped important content.                                            | NT     |
| F07 | Enter comma-separated topics such as `Project feedback, Study buddy, Python practice`.                                                                                          | Topics save as separate items; empty spaces do not create meaningless blank chips.                                                                    | NT     |
| F08 | Paste `t01,t02,t03,t04,t05,t06,t07,t08,t09,t10,t11,t12,t13,t14,t15,t16,t17,t18,t19,t20,t21` into topics. Collapse the optional section and save.                                | Saving is blocked with a useful error; the optional section opens and the topic input receives focus. Remove the extra topic afterward.               | NT     |
| F09 | Clear the name or enter only spaces; try saving. Then restore it.                                                                                                               | A clear validation message prevents an unusable blank name.                                                                                           | NT     |
| F10 | Untick both **Online** and **In person** under **I can connect…**; save.                                                                                                        | A message asks for at least one way to connect. Restore Online.                                                                                       | NT     |
| F11 | Change fields, then click **Cancel**, X, or Escape without saving. Reopen.                                                                                                      | Unsaved changes are discarded; stored values remain.                                                                                                  | NT     |
| F12 | Change interests and the online-only preference; save and reload.                                                                                                               | Changes persist and affect relevant recommendations. The “online only” preference is distinct from the ways this member personally offers to connect. | NT     |
| F13 | Save two different kinds of changes one after another, such as a bookmark followed by an online preference. Reload.                                                             | The second change does not erase the first.                                                                                                           | NT     |

### Exact plan checks

For G01–G06, start with Priya or give A exactly **Python basics**, **Git basics**, and **Technical communication**, and choose **Build your first ML project**.

| ID  | Steps                                                                                                                                  | Expected result                                                                                                                                                                             | Result |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| G01 | Open **See my plan**.                                                                                                                  | **3/7** means three of this listing's seven skills are in the confirmed profile. It is not a score of employability, qualification, or tested ability.                                      | NT     |
| G02 | Open **Skills you already listed (3)** and read **Skills to learn**.                                                                   | Existing: Python basics, Git basics, Technical communication. Missing: NumPy basics, pandas basics, ML foundations, Small ML project. No duplicates.                                        | NT     |
| G03 | Open the foundation links and expand the small practice exercise.                                                                      | The plan links gaps to relevant material; the practice instructions are readable. Official links and local exercises are distinguishable.                                                   | NT     |
| G04 | Save a resource, open its external link, close it, and reopen the plan.                                                                | Coverage stays **3/7**. Opening or saving a link does not add a skill.                                                                                                                      | NT     |
| G05 | In My profile, deliberately tick **NumPy basics**, save, and reopen the plan.                                                          | Coverage becomes **4/7**. NumPy disappears from missing skills and its now-unneeded foundation recommendation. Untick it to restore **3/7**.                                                | NT     |
| G06 | Remove Python basics as well, save, and reopen.                                                                                        | The count decreases honestly. Any gap without a listed resource is shown as unresolved rather than being hidden or filled with a made-up link. Restore the starting profile.                | NT     |
| G07 | In preview, switch to Aisha and open the sensor project.                                                                               | The goal is **Make a sensor-powered prototype**; the initial count is **2/7**. Robotics skills/resources and relevant people replace ML suggestions.                                        | NT     |
| G08 | Open **Arduino built-in examples**, which has no listed starting requirements.                                                         | The website explains that no starting skills are listed. It does not display a false 100% or 0/0 readiness claim.                                                                           | NT     |
| G09 | In Explore, open another project, competition, or internship and click **Choose this goal**. Close the panel and go to My Hub. Reload. | The selected goal and plan update and persist. In the panel its action becomes **Current goal**.                                                                                            | NT     |
| G10 | Toggle **Online only** in the plan, then visit My Hub and Explore.                                                                     | The same saved preference is reflected across surfaces; unsupported in-person matches disappear. Constraints are not silently ignored.                                                      | NT     |
| G11 | In Priya preview, turn Online only off and on. Inspect Data & AI mentors.                                                              | In-person-only Meera can appear when off and must disappear when on. Online Ananya remains eligible. Use Communities → Mentors if a smaller home recommendation list hides the alternative. | NT     |
| G12 | Inspect a robotics project that requires equipment.                                                                                    | **Hardware required** remains visible. Free documentation is not presented as a guarantee that a physical build has no cost.                                                                | NT     |

## 8. Explore, search, links, and bookmarks

For catalogue counts, clear the search, choose **All**, set **All STEM fields**, turn **Saved only** off, and turn **Online only** off. The current catalogue has two projects, two competitions, two internships, and eight resources. If the builder intentionally changes the catalogue, update this fixture before judging counts.

| ID  | Steps                                                                                           | Expected result                                                                                                                                                                               | Result |
| --- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| D01 | Click **All**, **Resources**, **Competitions**, **Internships**, and **Projects**.              | Each tab shows its own category and a matching result count. Competitions and internships are explicitly samples.                                                                             | NT     |
| D02 | Change **All STEM fields** to Data & AI, then Robotics & Makers.                                | Results match the selected field. Changing field does not silently clear another active filter.                                                                                               | NT     |
| D03 | Search `pandas`, then `PANDAS`, then `pandas`.                                                  | Case and outer spaces do not change the matching set. Results may match a listed skill/requirement, not only the card title.                                                                  | NT     |
| D04 | Compare searches `ML` and `machine learning`.                                                   | The equivalent topic finds the same matching set with the same filters.                                                                                                                       | NT     |
| D05 | Combine Resources + Data & AI + a search + Online only. Then add Saved only.                    | All active filters apply together. Results are not unrelated filler cards. Zero results is acceptable when nothing satisfies the combination.                                                 | NT     |
| D06 | Search `zzzz-no-such-topic`. Use the search field's X or the empty-state **Browse all** button. | An understandable empty state appears. Clearing search restores eligible results. **Browse all** clears search/category/domain/saved filters but preserves the user's Online only preference. | NT     |
| D07 | Click a card title and **View plan** or **View resource** in turn.                              | Both open that card's detail panel, not a different item.                                                                                                                                     | NT     |
| D08 | Click **Open resource** for NumPy, pandas, scikit-learn, and Arduino.                           | A new tab opens on the correct official publisher's page. The original app stays available. Record a network/provider outage separately from a wrong link.                                    | NT     |
| D09 | Expand an authored practice brief.                                                              | The exercise instructions are visible without a fake external link. No Apply/Register button pretends a sample listing is live.                                                               | NT     |
| D10 | Click a card's bookmark icon. Open its detail panel.                                            | Both surfaces agree that it is saved. The icon's accessible label changes from Save to Unsave; the detail action changes to **Saved**.                                                        | NT     |
| D11 | Save two different items consecutively. Reload and turn on **Saved only**.                      | Both items remain saved. One save does not overwrite the other.                                                                                                                               | NT     |
| D12 | Click **Saved** or the filled bookmark to remove one. Reload.                                   | Only that item is removed. Other bookmarks remain.                                                                                                                                            | NT     |
| D13 | With no saved items, enable Saved only.                                                         | **Nothing saved yet** explains how to add one; **Browse all** returns to browsing.                                                                                                            | NT     |
| D14 | Save different items in A and B. Reload both.                                                   | Saved lists belong to their respective accounts. A's private saved list is not shown as B's list.                                                                                             | NT     |
| D15 | Edit/save preview data, then sign in to a real account.                                         | Sample skills and bookmarks do not silently become that account's data. Signing out returns to the browser's preview, clearly labelled.                                                       | NT     |

## 9. Communities, people search, and member profiles

Use A to observe B. Refresh A after B changes something. Community counts describe **visible members**, while the person list additionally applies availability, role, skills, search, and online filters. A visible count can therefore be larger than the recommendation list; this is not automatically a bug.

| ID  | Steps                                                                                          | Expected result                                                                                                                                                                                | Result |
| --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| C01 | B clicks **Join community** in Data & AI; reload B. Refresh A.                                 | B sees **Joined** after reload. A can see B's membership if B is public. No duplicate membership is created.                                                                                   | NT     |
| C02 | B clicks **Joined** to leave; reload both. Rejoin afterward.                                   | B's membership and the relevant visible count update. The action does not delete B's account or old requests.                                                                                  | NT     |
| C03 | Join both circles, then leave only one.                                                        | Each membership is independent. Membership alone does not invent expertise in another field.                                                                                                   | NT     |
| C04 | Switch **Everyone**, **Mentors**, and **Peers**.                                               | Mentor-only B appears as a mentor; learner-only people appear as peers. A dual-role person can qualify for either filter. The home section should not duplicate the same person unnecessarily. | NT     |
| C05 | Search B's exact name, a listed skill such as NumPy, and a help topic B saved.                 | B is findable through those public fields while still meeting the current filters.                                                                                                             | NT     |
| C06 | Search a nonsense name; use **Clear search** and the search X.                                 | An empty state appears and both clearing controls work. Neither changes another person's profile.                                                                                              | NT     |
| C07 | Search B while selecting Peers when B is mentor-only. Then choose Mentors.                     | Search does not bypass the role filter. B appears only when the role fits.                                                                                                                     | NT     |
| C08 | B chooses only In person under I can connect. A turns Online only on/off. Restore B to Online. | B disappears with Online only on and can reappear when off. Relevance and visibility still apply.                                                                                              | NT     |
| C09 | Click B's name and **View profile**.                                                           | Both open B's full headline, bio, skills, help topics, role and connection formats. No email, password, private saved list or private introduction text is exposed.                            | NT     |
| C10 | Compare the displayed member details with what B saved.                                        | Full text is accurate; skills are described as self-reported. Missing optional content has a sensible empty state.                                                                             | NT     |
| C11 | In B's member view, click **Ask for guidance**.                                                | The member panel closes and the request form opens for B with the expected goal. Nothing is sent yet.                                                                                          | NT     |
| C12 | Change B to Learn and mentor, save and refresh A. Open B's profile.                            | Both **Ask for guidance** and **Ask to collaborate** are available. Each opens the correct request type. Restore Be a mentor.                                                                  | NT     |
| C13 | For a learner-only person, open the profile.                                                   | Collaboration is available; mentor guidance is not falsely offered.                                                                                                                            | NT     |
| C14 | B turns off **Let members send me connection requests**, saves; refresh A.                     | B stops being an available recommendation. New requests are blocked. B's public membership may still contribute to visible counts; old requests remain. Restore the setting.                   | NT     |
| C15 | B turns off **Show my profile in the public directory**, saves; refresh A and C.               | B's profile and circle memberships are no longer exposed to those accounts. B still sees their own membership. Turning public visibility back on may require enabling incoming requests again. | NT     |

## 10. Real requests: send, accept, decline, cancel

Use different goals for different outcomes so an existing accepted connection does not block a new test. Keep the main accepted request intact for the demonstration.

| Test request | Sender → recipient   | Goal                          | Planned outcome              |
| ------------ | -------------------- | ----------------------------- | ---------------------------- |
| Main         | A → B, mentorship    | Build your first ML project   | Accept                       |
| Decline      | A → B, mentorship    | Data for Good: mini challenge | Decline                      |
| Cancel       | A → B, mentorship    | Data exploration internship   | Cancel                       |
| Peer         | A → C, collaboration | Build your first ML project   | Accept or decline, as agreed |

Use clearly recognisable messages, such as: “QA Main: Could you review the scope of my first ML project?” Do not put real personal or sensitive details into test requests.

### Main successful route

1. In A, find B and open **View profile → Ask for guidance**.
2. In **Your goal**, select **Build your first ML project**.
3. Check **How would you like to connect?** says **Ask a mentor**.
4. Read the suggested **Your message**. Replace it with the QA Main message above.
5. Click **Send request** once. A should land in **Connections → Sent requests** with a Pending request.
6. In B, open **Connections → Received requests** and click **Refresh inbox**.
7. Confirm the sender, goal, type and message. Click **Accept request**.
8. In **What should you work on next?**, enter: “Write a short project outline and choose one dataset.” Click **Accept request**.
9. In A, click **Refresh inbox**. Both accounts must now show Accepted and the same next step.
10. Reload both browsers and repeat the check. No email notification is expected.

### Lifecycle and negative tests

| ID  | Steps                                                                                                                                                 | Expected result                                                                                                                                                                      | Result |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| R01 | Perform the ten-step main route above.                                                                                                                | One real request is shared between A and B, with the correct accepted state and next step after reload.                                                                              | NT     |
| R02 | Open a request form, edit it, then click **Cancel**, X or Escape.                                                                                     | No request is created. Merely opening a member profile or form sends nothing.                                                                                                        | NT     |
| R03 | With the initial suggested message still unedited, change the goal and request type.                                                                  | The draft updates to the new context. If you edited the message yourself, it is preserved; review it before sending with a different goal.                                           | NT     |
| R04 | Enter fewer than ten non-space characters; try sending.                                                                                               | Validation prevents sending and explains the problem. Correcting the message works.                                                                                                  | NT     |
| R05 | Click Send request twice quickly, then refresh both inboxes.                                                                                          | Only one active request exists for the same sender, recipient, goal and help type. The second click may be disabled/ignored while sending; a later duplicate submission is rejected. | NT     |
| R06 | After the main request is Pending or Accepted, try the same pair/goal/help type again.                                                                | A clear duplicate/active-request error appears; no second active row is created.                                                                                                     | NT     |
| R07 | Create the Decline request. B clicks **Decline**, then A refreshes.                                                                                   | Both see Declined. There is no acceptance note and no still-active Accept/Cancel action.                                                                                             | NT     |
| R08 | Create the Cancel request. A clicks **Cancel request**, then B refreshes.                                                                             | Both see Cancelled. B cannot accept that cancelled request.                                                                                                                          | NT     |
| R09 | After the declined test, send the same declined pair/goal/type again once. Agree to decline or cancel the new request.                                | A new request may be created because there is no Pending/Accepted request for that combination. History is retained.                                                                 | NT     |
| R10 | On B's acceptance form, leave the next step empty or under five non-space characters.                                                                 | Accept is unavailable until there is a meaningful next step. **Go back** closes without accepting.                                                                                   | NT     |
| R11 | Accept once, then refresh. Inspect the old request.                                                                                                   | It remains Accepted. Accept and Decline are no longer offered for the completed transition.                                                                                          | NT     |
| R12 | Check A's sent request and B's received request while Pending.                                                                                        | A can cancel; B can accept/decline. A cannot accept its own sent request and B cannot cancel as the sender.                                                                          | NT     |
| R13 | Open a request to B in A. In B, disable incoming requests and save. Then A attempts to send the already-open draft.                                   | The backend rejects the stale attempt. No false success or new request appears. Restore B's settings.                                                                                | NT     |
| R14 | Repeat R13 but make B learner-only while A's draft asks for mentorship.                                                                               | The mentorship request is rejected. A can use collaboration only if appropriate. Restore B's mentor role.                                                                            | NT     |
| R15 | Temporarily make C public, open to requests, joined to Data & AI and learner-only. A opens C's profile and clicks **Ask to collaborate**. C responds. | A real peer flow works independently of the A/B mentor flow. C still cannot see A/B's private request.                                                                               | NT     |
| R16 | Click a goal title inside a request card.                                                                                                             | The correct plan opens without changing the request's status or recipient.                                                                                                           | NT     |
| R17 | Compare Pending, Accepted and Total requests with the actual records for the account. Switch Sent/Received tabs.                                      | Counts cover that account's own participation. Declined/cancelled requests remain in Total. No third-party rows appear.                                                              | NT     |
| R18 | Refresh the inbox repeatedly, including when empty.                                                                                                   | No duplicate rows, fabricated messages or infinite spinner. The refresh notice is understandable.                                                                                    | NT     |

## 11. Privacy and account switching — do not skip

These tests use A, B, and C. An “outsider” is anyone who is not a participant in the particular request; C may have a separate legitimate connection with A and still must not see A/B's request.

| ID  | Steps                                                                                                                                                                                                  | Expected result                                                                                                                                                                              | Result |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I01 | In C, inspect Sent requests and Received requests after A and B complete the main request.                                                                                                             | A/B's message, status, and next step are absent. C sees only requests involving C.                                                                                                           | NT     |
| I02 | Save a distinctive item and goal in A. Sign in as C in an independent browser and open C's profile/saved items.                                                                                        | A's private saved list, goal preferences and AI introduction are not copied into C.                                                                                                          | NT     |
| I03 | In A, sign out and reload the old Connections page.                                                                                                                                                    | Sample preview replaces the account view. No A request, private message, next step or live membership remains displayed.                                                                     | NT     |
| I04 | In A, open two ordinary tabs of the same browser session. In tab 1 open a request draft and type `PRIVATE A DRAFT — discard on account change`. In tab 2 sign out, then sign in as C. Return to tab 1. | The old dialog closes when the account changes. C cannot read or send A's draft. If the browser does not propagate the change, reload tab 1 and report that limitation.                      | NT     |
| I05 | Repeat the two-tab test with B's **Accept request** dialog and a private unsent next-step draft. Switch that session to C in the other tab.                                                            | The acceptance dialog and draft disappear. C cannot accept B's request or see B's draft.                                                                                                     | NT     |
| I06 | Repeat an account change while My profile or a member panel is open.                                                                                                                                   | Old account drafts and targets do not remain as C's editable form. C's own onboarding form may open if its profile is empty.                                                                 | NT     |
| I07 | In one account, make an unsaved draft, then trigger an ordinary same-account refresh/session update without signing out.                                                                               | A normal same-account update should not unexpectedly turn the draft into another user's data. Reloading the whole page can discard unsaved drafts; that is different from losing saved data. | NT     |
| I08 | Keep C hidden and joined to a circle. A and B reload Communities. Then make C public and reload again.                                                                                                 | Hidden C and its membership are absent to others; public C can become visible. C can see its own membership in either state.                                                                 | NT     |
| I09 | Search for A's email in B's people search and inspect A's member details.                                                                                                                              | No email field, password, private AI introduction or request history is exposed by member details/search. Public profile text remains visible if opted in.                                   | NT     |
| I10 | Ask the developer to complete the read-only permission checks in section 19.                                                                                                                           | Database rules also block unrelated reads/actions. The absence of a UI button alone is not proof of server-side privacy.                                                                     | NT     |

If someone else's private draft or request is visible after an account change, stop the release and report it as a blocker. Do not take a screenshot containing real private information; reproduce with the harmless QA text above.

## 12. Every-button sweep

Use this short sweep after the main cases. An icon can be tested by hovering, focusing it with Tab, or reading its accessible name with a screen reader.

| Area         | Controls to click at least once                                                                                                                                              | What to check                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Navigation   | My Hub, Communities, Explore, Connections; browser Back/Forward; **Skip to content** with keyboard                                                                           | Correct destination; visible focus; main content reachable.                              |
| Account      | Join STEMBridge, Sign in, Create an account, Create my account, Sign out icon                                                                                                | Correct form/action; no unexplained dead control.                                        |
| Preview      | Switch profile; Keep exploring when unconfigured                                                                                                                             | Correct sample; no live-action claim.                                                    |
| Home         | My profile, edit pencil, profile icon, See my plan, All communities, See all people, View all                                                                                | Correct panel/page; See all people does not silently select mentors only.                |
| First step   | Find my first step, three support choices, Online support only, Open the guide/Read the exercise, Your introduction, Review request, Sign in to connect, Visit their website | One relevant action; editable message; review before sending; honest sample/empty state. |
| Community    | Circle title, Join community, Joined, Everyone, Mentors, Peers, Online only                                                                                                  | Selection, membership and filtering work. Joined is also the leave action.               |
| Search       | Both search fields, their X controls, Clear search, Browse all                                                                                                               | Results/counts update; clear behavior is understandable.                                 |
| Cards        | Person name, View profile, catalogue title, View plan, View resource, bookmark                                                                                               | The selected person/item opens; bookmark toggles only that item.                         |
| Profile      | Skill/interest/mode checkboxes, role/domain selects, privacy and request checkboxes, optional summaries, Save profile/Save preview profile, Cancel                           | State changes as labelled; optional fields do not block normal saving.                   |
| Member panel | Close/X/Escape; Ask for guidance, Ask to collaborate, Meet real members or Sign in to connect where shown                                                                    | Correct role and recipient; samples cannot be messaged.                                  |
| Plan         | Choose this goal/Current goal, Open resource, Save for later/Saved, existing-skills summary, practice summaries, Online only, Ask for help/Connect                           | Correct goal/state/link; expanded content remains readable.                              |
| Requests     | Your goal, connection-type select, Your message, Send request, Cancel                                                                                                        | Review before sending; correct recipient/type/context.                                   |
| Inbox        | Refresh inbox, Sent requests, Received requests, goal title, Accept request, Decline, Cancel request                                                                         | Correct lifecycle and permissions.                                                       |
| Acceptance   | Next-step field, Go back, Accept request                                                                                                                                     | Only intentional acceptance saves the note.                                              |
| Feedback     | Dialog X/Escape, notification X, error-banner X                                                                                                                              | They dismiss the intended thing; errors do not vanish before they can be read.           |

Decorative initials, icons, badges, and static headings do not need to act like buttons. A control that looks clickable but does nothing should be reported with its exact label and screen.

## 13. Phone, keyboard, and readability

Use a real phone if possible. Otherwise narrow the browser to about 390 pixels using its device preview. Also check a small laptop window and 200% browser zoom.

| ID  | Steps                                                                                                                                 | Expected result                                                                                                       | Result |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------ |
| U01 | Visit all four pages at narrow width. Scroll to the bottom.                                                                           | No sideways page scrolling; headings, navigation and primary actions stay usable.                                     | NT     |
| U02 | Open profile, member, plan, request, and acceptance dialogs on the phone.                                                             | You can reach Save/Send/Accept/Cancel and the close button without content being trapped below the screen.            | NT     |
| U03 | Type in search and request fields with the phone keyboard open.                                                                       | The active field and the way to finish/cancel remain reachable; text does not overlap buttons.                        | NT     |
| U04 | At 200% zoom, repeat a form and a catalogue filter.                                                                                   | Content reflows; essential labels and actions remain visible.                                                         | NT     |
| U05 | Put the mouse aside. Use Tab, Shift+Tab, Enter, Space, and Escape to open a plan, expand a section, save an item, and close a dialog. | Focus is visible. Buttons and checkboxes work. Focus stays in an open dialog and returns somewhere sensible on close. | NT     |
| U06 | On a fresh page, press Tab to reach **Skip to content** and activate it.                                                              | It moves the user to the main page content instead of forcing repeated navigation steps.                              | NT     |
| U07 | Use only the keyboard to open/close AI and More about you sections. Trigger the invalid-topic test F08.                               | Disclosure controls work; validation reveals the field rather than leaving focus on a hidden control.                 | NT     |
| U08 | Inspect error text, sample labels, request statuses, counts and selected filters.                                                     | Meaning is readable without relying only on colour, a tiny icon, or hover. Text is comfortably readable.              | NT     |
| U09 | If a teammate uses a screen reader, inspect modal titles, input labels, bookmark/clear/close icons and result counts.                 | Controls have understandable names; announced changes are useful. Mark NT if no one can perform this check.           | NT     |
| U10 | Check long public names, a multi-line bio, and a long but valid message using controlled accounts.                                    | Text wraps without hiding actions or breaking cards. Do not use offensive or real sensitive text.                     | NT     |

Passing these checks is useful evidence, not a claim of complete accessibility certification.

## 14. Optional AI assistance

AI is optional. Manual profile editing must work whether AI is connected or not. Ask the builder whether live Gemini is enabled. Do not add keys, change billing, or repeatedly send paid/provider requests just to force a failure.

1. Use a signed-in controlled account when the site is connected to Supabase.
2. Open **My profile → Suggest skills with AI (optional)**.
3. Read the consent wording. It names Google Gemini.
4. Use only the harmless test descriptions below.

| ID   | Steps                                                                                                                                                                   | Expected result                                                                                                                                                              | Result |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| AI01 | Enter a description but leave the Gemini consent box unticked.                                                                                                          | **Suggest skills** remains disabled. Manual checkboxes remain usable.                                                                                                        | NT     |
| AI02 | Tick consent with fewer than ten non-space characters in the description.                                                                                               | Suggest skills remains unavailable until the minimum input is present.                                                                                                       | NT     |
| AI03 | If no key is configured, try one valid consented request.                                                                                                               | An honest unavailable/not-connected message appears. The text remains and you can continue manually. No fake AI result appears.                                              | NT     |
| AI04 | If live AI is available, submit: “I can write beginner Python and commit code with Git. I want to learn pandas and build my first ML project. I have never used NumPy.” | Suggestions may include supported Python/Git with exact evidence. pandas, NumPy and a completed ML project must not be claimed as existing skills. Record the actual result. | NT     |
| AI05 | Inspect the evidence, interests and goal before clicking **Use these suggestions**.                                                                                     | The profile has not silently changed or saved. The learner can decide whether suggestions are correct.                                                                       | NT     |
| AI06 | Click Use these suggestions. Check the manual skills, then Cancel without saving. Reopen the profile.                                                                   | Suggestions were a draft; cancelled changes do not persist. Existing previously confirmed skills were not silently erased.                                                   | NT     |
| AI07 | Repeat and deliberately correct a suggested skill, then Save profile and reload.                                                                                        | The saved manual confirmation is the source of truth. Counts follow the saved skills, not the model's unconfirmed output.                                                    | NT     |
| AI08 | Submit once, if quota/time allow: “I don’t know Python. I have no experience with pandas. I want to learn machine learning.”                                            | Negations and aspirations do not become existing skills. Empty skill suggestions are acceptable.                                                                             | NT     |
| AI09 | Close the profile while a suggestion is loading; reopen it.                                                                                                             | No later result from the abandoned form overwrites the new form or another account's profile.                                                                                | NT     |
| AI10 | If a timeout, quota limit, or provider failure occurs naturally, wait for the error and continue manually.                                                              | The spinner ends, typed text is preserved and Save remains recoverable. Never treat a provider failure as a successful AI demonstration.                                     | NT     |
| AI11 | In signed-out preview with Supabase configured, try AI once if needed.                                                                                                  | A sign-in requirement is acceptable; manual preview editing still works.                                                                                                     | NT     |

Do not expect identical wording from live AI every time. Judge whether existing skills are justified, whether the learner reviews them, and whether failure leaves the core task usable. The developer tests cover malformed responses without needing testers to manufacture a provider outage.

## 15. Errors, slow connections, and recovery

Coordinate network tests so you do not interrupt another teammate's live request. Use only your own device/browser. Reconnect promptly.

| ID  | Steps                                                                                                                                       | Expected result                                                                                                                                                       | Result |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| E01 | Load the app, then temporarily disconnect that device from the internet.                                                                    | An offline notice appears. Already displayed content remains understandable; the app does not pretend disconnected live writes succeeded.                             | NT     |
| E02 | While offline, try one account save or inbox refresh. Wait, then reconnect and reload.                                                      | A bounded failure/recovery message appears rather than an endless spinner. The server's last confirmed state is shown after reconnecting. Record what actually saved. | NT     |
| E03 | After an error, dismiss the error banner and retry a valid action online.                                                                   | The error can be dismissed; the app is usable again and the successful result is visible.                                                                             | NT     |
| E04 | Save several different bookmarks quickly; change a preference after them; reload.                                                           | Successful actions are retained without the last action erasing earlier ones.                                                                                         | NT     |
| E05 | Click Join/Joined more than once in sequence, waiting for each action to finish.                                                            | The final membership matches the final action; no duplicate membership or stuck state.                                                                                | NT     |
| E06 | Change a skill and an optional profile field in one save. If a network error is deliberately encountered, reconnect and reopen the profile. | The app does not claim the whole profile saved if only part did. It explains partial failure and allows review/retry. Mark NT if no partial failure was encountered.  | NT     |
| E07 | Reload a direct page URL such as the address ending `?view=connections`; open it in a second session.                                       | The page loads without a route error. Private content still depends on that session's account.                                                                        | NT     |
| E08 | If a developer provides a disposable preview with corrupt local storage, reload it.                                                         | It recovers to a usable sample instead of a blank/crashed page. Ordinary testers should not clear another teammate's account/browser data to force this.              | NT     |

Do not close the dev server, edit `.env.local`, delete accounts, disable database protection, or run random console code to simulate failures. Ask the builder to arrange a controlled setup when needed.

## 16. Judge and ordinary-user review

Give a teammate three minutes to demonstrate the site. Then answer the questions below without opening the code.

1. Which problem does STEMBridge solve for women interested in STEM?
2. Where can a user find mentors, peers, communities, resources, competitions, internships and projects?
3. What useful action can a beginner take after selecting a goal?
4. Why is a particular person suggested?
5. What changes when Online only changes?
6. Which people and listings are samples? Which account interaction actually reached another test account?
7. What does 3/7 mean, and what does it not mean?
8. Does saving a resource or accepting a connection claim that a skill was learned?
9. Where is AI used, and can the website work without it?
10. How would the user know a request was accepted? Is an email promised?
11. What information becomes public when a user opts in? What remains private?
12. If a twist was announced, can the teammate show the actual adaptation and explain its limit?

Rate each item from **1 (poor) to 5 (clear/easy)**, with one example. These are teammate feedback scores, not official judging marks.

| Item                                            | Rating 1–5 | Example or suggested improvement |
| ----------------------------------------------- | ---------- | -------------------------------- |
| Purpose is understandable                       |            |                                  |
| First useful action is obvious                  |            |                                  |
| Navigation and labels are simple                |            |                                  |
| Text is readable and screens feel uncluttered   |            |                                  |
| Profile/consent/visibility choices make sense   |            |                                  |
| Recommendations are explained                   |            |                                  |
| Requests feel complete and trustworthy          |            |                                  |
| Sample and real information are distinguishable |            |                                  |
| Phone and keyboard experience                   |            |                                  |
| Three-minute demonstration is convincing        |            |                                  |

For the official rubric, collect evidence rather than guessing a score:

| Judging area              | Evidence to look for                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| Understanding the problem | A beginner can find support and a next action, not just a wall of cards.                            |
| Innovation and creativity | Goal, missing skills, resources and relevant people connect in a useful way.                        |
| Technical implementation  | Real input changes the output; account permissions and request transitions work.                    |
| Working prototype         | Separate accounts complete the request loop and saved state survives refresh.                       |
| Twist                     | The actual announced requirement has a demonstrated, tested response. If none was supplied, say so. |
| Time strategy             | A known-working version, clear limits and a rehearsed submission exist before the deadline.         |
| Presentation              | A teammate can explain what is real, what is sample, and how the product works in plain language.   |

Do not pitch verified mentors, guaranteed internships, an employability percentage, a live event feed, production security certification, or live AI unless the relevant claim has actual evidence.

## 17. Bug reports and the release decision

### Copy this bug template

```text
Bug ID / test ID:
Short title:
Severity: Blocker / Major / Minor
Website address and version:
Browser/device:
Mode/account nickname: Preview / A / B / C

Steps:
1.
2.
3.

Expected:
Actually happened:
Repeatable? Always / Sometimes / Once
Did it still happen after reload?
Harmless screenshot/video, if useful:
Workaround, if any:
Tester and time:
```

### Decide what must be fixed

- **Blocker / P0:** another account's private data or draft is exposed; a user can change another user's record; a request is sent as the wrong account; the core app cannot open; normal real signup/sign-in or the main request journey is unusable on the intended demo setup; the UI falsely claims a failed action succeeded. Stop release until fixed or make the missing live capability explicit and get the team's decision.
- **Major / P1:** a main filter, save, plan, membership, request transition, or mobile action is broken; saved changes disappear; an essential control is unreachable; the demo repeatedly gets stuck.
- **Minor / P2:** a typo, spacing issue, awkward wording, or nonblocking visual inconsistency. Record it, but do not risk the working submission for cosmetic changes near the deadline.

### Final release gate

The test lead fills this in. A row is not Passed merely because an automated test passed earlier on a different version.

| Gate                                                                         | Pass / Fail / NT | Evidence/owner |
| ---------------------------------------------------------------------------- | ---------------- | -------------- |
| Site opens at the exact address to be submitted                              | NT               |                |
| Sample content is clearly labelled; no fake delivery/application claims      | NT               |                |
| Priya's 3/7, changed skill, and online preference behave correctly           | NT               |                |
| A and B sign in and complete a real accepted request with a next step        | NT               |                |
| Pending/accepted duplicate protection, decline, and cancellation work        | NT               |                |
| C cannot view A/B's private request; account switching clears drafts         | NT               |                |
| Profile, goal, saved items and membership survive refresh                    | NT               |                |
| Essential phone and keyboard controls work                                   | NT               |                |
| Manual entry works if AI is missing or fails                                 | NT               |                |
| Find my first step preserves skills and goal, and never sends without review | NT               |                |
| Required developer checks pass on the final version                          | NT               |                |
| Actual twist is tested, or its absence/remaining gap is stated honestly      | NT               |                |
| Demo is rehearsed; final known limitations and submission owner are named    | NT               |                |

Before handing back to the builder:

1. List blockers first, with reproduction steps.
2. List untested items separately from bugs.
3. Restore A/B's intended roles, Online mode, visibility and request settings.
4. Keep one clean accepted request for the demo. Leave historical declined/cancelled tests intact; do not delete database records to make screenshots look better.
5. Restore Priya/A's intended skills and chosen goal. Clear temporary search filters.
6. Record the exact final URL/version and who will submit it. This guide does not submit the project.

## 18. Find my first step

This guided panel helps someone choose one manageable action and prepare a first message. It works without AI. It uses the current goal and the skills already on the profile; it does not change them.

Start on **My Hub** and click **Find my first step**. For a real request, use A and B from section 2. Check the named recipient before continuing. If a different real member is suggested, do not contact them: test the guide in preview or have the builder provide an isolated test environment. An empty result is valid when nobody meets the conditions.

### A. Understand and customise the next step

| ID  | Steps                                                                                                                                                                                          | Expected result                                                                                                                                                                                                                                                | Result |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| S01 | In Priya's preview, note the current goal and **3/7**. Open **Find my first step**.                                                                                                            | The goal remains **Build your first ML project**. **I'm starting out** is selected. **Your next action** gives a small task, a relevant resource or an honest explanation of what is missing, and a suggested mentor when one qualifies.                       | NT     |
| S02 | Choose **I'm returning to STEM**. Read the next action and introduction. Close the panel and reopen the plan.                                                                                  | The advice builds on existing experience. Priya still has the same confirmed skills and **3/7**; returning does not erase skills or change the goal.                                                                                                           | NT     |
| S03 | Choose **I want a project partner**.                                                                                                                                                           | The action and message propose working with a peer. A suitable peer or dual-role member may appear; a mentor-only member must not be presented as a project partner. If nobody qualifies, the panel says so.                                                   | NT     |
| S04 | In **Your introduction**, add “I can spend 30 minutes on this.” Switch to another support choice, then back without closing the panel.                                                         | Your edit returns for the original choice and recipient. Each choice has its own message draft. It is not sent or saved as a public profile field.                                                                                                             | NT     |
| S05 | Close with X or Escape. Open **Find my first step** again.                                                                                                                                     | The panel starts fresh with **I'm starting out** and a generated introduction. The abandoned edit is gone. Closing never sends a request.                                                                                                                      | NT     |
| S06 | Note the main website's **Online only** setting. In the panel, toggle **Online support only**, labelled **For this plan**. Close the panel and check the main setting.                         | Only this open panel's suggestions change. Online-only suggestions must support online contact. The main website preference is unchanged; a reopened panel starts from that main preference.                                                                   | NT     |
| S07 | Open the selected resource using **Open the guide** or **Read the exercise**.                                                                                                                  | An official guide opens in another tab and keeps your planner draft available. An authored exercise opens the matching resource panel and closes the first-step panel. A hardware note remains clear when relevant. No skill becomes confirmed just because a link was opened.      | NT     |
| S08 | With an agreed test profile, remove a prerequisite needed by a suggested learning resource, then reopen. Also try a goal whose listed skills are all confirmed. Restore the profile afterward. | The guide does not present an advanced resource as ready if its prerequisites are missing. If no resource is suitable, it explains that. If all skills are listed, it proposes a project outline/work sample or discussion; it does not invent missing skills. | NT     |

For S08, use a controlled account or preview only. Record the exact goal and skills before changing them so you can restore them. Do not treat a different valid resource as a bug merely because its title changed after a profile edit.

### B. Keep contact deliberate and private

| ID  | Steps                                                                                                                                                                                                               | Expected result                                                                                                                                                                                                                                         | Result |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| S09 | In preview, inspect the suggested person and message area. Click **Sign in to connect** if present, then cancel.                                                                                                    | A sample is clearly labelled and cannot receive a request. Sign-in opens; no request is sent. Any sample draft is not secretly delivered after signing in.                                                                                              | NT     |
| S10 | As A, with B available as a relevant mentor, select **I'm starting out** and edit **Your introduction**. Click **Review request**.                                                                                  | **Ask to connect** opens with B as recipient, the same goal, **Ask a mentor**, and A's edited message. No inbox row exists until A deliberately clicks **Send request**. Cancel here and check B's inbox to prove review alone sends nothing.           | NT     |
| S11 | Repeat S10, then click **Send request** once. Have B use **Refresh inbox**.                                                                                                                                         | Exactly one pending request contains the reviewed text and correct goal. Duplicate protection still applies if the same request already exists. Use section 10 for accept/decline/cancel; do not count an intentional duplicate rejection as a failure. | NT     |
| S12 | Make C publicly visible, open to requests, Online, and interested in Data & AI, with the peer setup from section 10. As A, choose **I want a project partner** and inspect the recipient before **Review request**. | If C is the qualifying suggestion, review opens with **Work with a peer** and C as recipient. No mentorship request is silently substituted. If a different member is suggested, stop before sending. Restore C's privacy after testing.                | NT     |
| S13 | In an isolated test setup, make the only suitable recipient unavailable by switching off their incoming requests; reload A and reopen the guide.                                                                    | The panel says no suitable person is available, still offers a useful action/community link, and says no request has been sent. It must not fall back to a fictional recipient in a signed-in account. Restore availability afterward.                  | NT     |
| S14 | With a live eligible recipient, reduce the introduction to fewer than 10 non-space characters, then restore it.                                                                                                     | **Review request** is disabled for the short text and enabled for a valid message. The final request form still permits review and editing. The message field stops at its stated maximum.                                                              | NT     |
| S15 | In two ordinary tabs sharing A's session, leave a unique unsent introduction open in the first tab. In the second, sign out and sign in as C. Return to the first.                                                  | A's first-step panel and private draft are cleared on the account change. C does not inherit A's intention or introduction. Record any brief or lasting leakage as a blocker.                                                                           | NT     |

### C. External communities and usability

| ID  | Steps                                                                                                                                                           | Expected result                                                                                                                                                                                                                | Result |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| S16 | With a Data & AI goal, click **Visit their website** under **Women in Machine Learning**. Repeat with a Robotics goal and **Women in Robotics**.                | The appropriate independent community website opens in another tab. The guide clearly says to check that website for membership/event details. Opening the website does not join a STEMBridge circle or an external programme. | NT     |
| S17 | Use Tab and arrow keys to choose a support option, toggle the online checkbox, edit the introduction, and close the dialog. Repeat on a phone or narrow screen. | Labels are readable, the selected choice is visible, all controls are reachable, and no main action is clipped. The dialog returns focus sensibly when it closes.                                                              | NT     |
| S18 | Run the guide when live AI is unavailable, or ask the builder to confirm it does not call the AI endpoint.                                                      | Actions, resources, people suggestions, and editable introductions still work. There is no AI-consent requirement or AI-provider error for this feature. Optional profile AI remains a separate feature.                       | NT     |

Ask the tester afterward: “Did this make your first action clearer?” and “At what point did you think the message was sent?” A tester who assumes **Review request** sends immediately has identified a usability issue worth reporting even if the code behaves correctly.

## 20. Optional developer appendix

Ordinary testers can skip this section. A technical teammate should handle it and report evidence in the same result log.

### A. Local checks

Open a terminal in the project folder. Run each command separately:

```powershell
npm test
npm run typecheck
npm run build
git diff --check
```

Record the actual output summary and date. Do not copy old test counts from a document and call them today's result. The tests include matching, search, mocked AI responses, workspace behavior, SQL permissions and account-switch draft isolation. Mocked and local SQL tests do not prove the hosted account journey or live AI integration.

To test the production build locally, use a free terminal/port and run:

```powershell
npm run start
```

Do not start a second process on the same port as the existing dev server. Ask the person managing the running server which address/port to use. The final deployed URL needs its own browser smoke test.

### B. Hosted privacy checks without destructive SQL

Use [RLS_CHECKS.sql](RLS_CHECKS.sql) and the permissions section of [SUPABASE_SETUP.md](SUPABASE_SETUP.md). RLS means the database checks which rows an account is allowed to read or change.

1. Confirm you are in the controlled test project, not unrelated data.
2. Find A, B and C's account IDs privately in the project's account list. IDs are not passwords; still avoid posting them unnecessarily.
3. Follow the existing file's read-only queries and its transaction-local role checks. Substitute only the relevant controlled account IDs. Keep each complete `begin`…`rollback` block intact.
4. Confirm C can read only C's learner state and no A/B request. Public profile memberships can be visible; hidden profiles' memberships must not be.
5. Confirm request tables do not allow direct browser-user inserts, updates or deletes, and ordinary users cannot change the administrative demo flag.
6. Confirm anonymous access shows only opted-in public profiles and community descriptions, never private learner/request records.
7. Record only the conclusion and harmless row counts/IDs needed for the test. Do not paste passwords, access tokens, keys, or private descriptions into SQL, logs, reports or screenshots.

**Important:** the SQL Editor normally runs with elevated privileges and may see all rows. That is not a valid third-account test by itself. Use the file's explicit simulated role/identity checks and the real C browser session. Never disable RLS or use a service/secret key to “prove” ordinary-user permissions.

The existing automated SQL suite checks sender/recipient enforcement, self-requests, invalid transitions, protected fields, and duplicate active requests. For any additional hosted direct-call tests, use only A/B/C and the normal client session. Have the developer record the exact attempted operation and denial; do not invent a pass because the UI hides a button.

### C. Browser errors and configuration

1. Inspect the browser Console for errors during the core flow; record the action that caused each error.
2. Inspect failed network requests only if needed. Do not share request headers, bearer tokens, cookies, passwords, full account records, or Gemini input text.
3. Confirm only the publishable Supabase configuration is browser-exposed. `GEMINI_API_KEY` must remain server-side. Never print environment file contents to prove configuration.
4. On the deployed site, repeat signup/sign-in, reload persistence, sender/recipient flow, and C privacy. A local build and a successful deployment build are not enough.
5. Record live AI as NT until an actual consented provider response has been observed and reviewed. Keep the manual path demonstrated either way.

### D. Return a concise testing report

```text
Tested version/address:
Test window:
People/devices:

Critical route: __ Pass / __ Fail / __ NT
Full checklist: __ Pass / __ Fail / __ NT
Blockers:
Major bugs:
Untested or setup-blocked items:
Automated checks actually run:
Hosted A → B request verified? Yes / No
Third-account privacy verified? UI / Database / Both / Not tested
Live AI verified? Yes / No / Not required for this demo
Final demo state restored? Yes / No
Release recommendation and reason:
```

Keep the report factual. “I did not test it” is more useful than a guessed Pass.
