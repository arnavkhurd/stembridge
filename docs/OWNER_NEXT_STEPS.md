# Your remaining steps before submission

Updated for the completed **3:30 PM IST build on 28 September 2026**, including the main-site English/Marathi multilingual twist and retained offline support. The deadline is **4:10 PM IST**. This guide replaces the earlier owner guide; the required language and offline preparation steps are included here.

**Your priority now:** publish the latest version, verify the global English/Marathi journey on the exact judging URL, and complete one real learner-to-mentor request. Keep the offline reload as a prepared extra. Give a teammate the language and offline checks while you handle accounts and deployment. Freeze feature additions; only fix a demonstrated blocker.

## What is already done

- The website, two STEM circles, goal plans, **Find my first step**, search, member profiles, saved opportunities and request flow are implemented.
- **Offline learning is implemented:** the prepared website can reopen from its cache; eight original exercises, device notes, completion tracking and text-file export work without the website server. A previously loaded account's own plan can be read offline while its local session is valid.
- **English and Marathi now cover the main website:** navigation, hub, communities, authored catalog content, account/profile forms, plans, request screens and exercises. One shared switch persists the choice. English and Marathi catalog/skill searches work. Names, bios, messages, notes and user-written next steps stay unchanged. External resources and unknown provider errors retain their source language.
- Supabase is connected. The schema is already installed, and the two community records are readable. **Do not recreate the project or rerun the schema as a routine setup step.**
- At **3:30 PM**, all **124 tests across 14 files**, TypeScript and the production build passed, including the profile-checkbox CSS fix. Production browser checks passed for Marathi navigation, hub, plan, catalog search, signup/profile forms and a 390px layout without horizontal overflow; profile checkboxes were readable at 19 by 19 pixels. Earlier offline browser checks covered cached reloads with the server stopped, saved notes, catalog browsing, Marathi, an actual exported UTF-8 notes file and a readable 390px layout. Full details are in [BUILD_STATUS](../BUILD_STATUS.md).
- The browser's complete **Network → Offline** test and the **hosted real-account journey** remain owner/teammate checks. A server-stopped test, automated tests and a deployed real-account test prove different things.
- Last inspected: **Confirm email was ON**, the **Gemini key was confirmed empty at 3:25 PM**, and the **real-account walkthrough and deployment were unverified**. Check your current settings if you have since changed them. No new SQL, translation API or Gemini key is needed for the twist.

## Who does what

| Person                         | Their job                                                                                                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| You, as account owner          | Choose the email-confirmation setting, access your own email, sign into Supabase/GitHub/Vercel, add credentials privately, approve the final presentation claims and submit. |
| A teammate                     | Operate the supporter account in another browser, check the learner's request, rehearse the handoff and time the presentation. Use an address they control.                  |
| Another teammate, if available | Run the offline and Marathi checks on the same final URL. Record failures without changing account settings or asking for private keys.                                      |
| The coding agent               | Diagnose the exact failure, fix code, run checks, help inspect database permissions and prepare the release. It does not need your account passwords in chat.                |

If working alone, Chrome can be the learner and Edge the supporter. Two ordinary tabs in one browser share the same login.

## 0. Choose the correct website address

The production demo was left running at [localhost:3001](http://localhost:3001/?view=offline). Use that address on this computer, or your actual deployed HTTPS URL. The normal development address at port 3000 is for coding; it does not prepare the production offline website by default.

If port 3001 is already working, do not start another copy. If it is stopped, open a terminal in the project folder and run:

```powershell
npm run build
npm run start -- -p 3001
```

Wait for the successful build before starting the server, and leave the server terminal running. If you change code after this, stop that production server with Ctrl+C, rebuild and start it again. Then update the offline copy in the browser while online.

- [ ] Write the exact **TEST_URL** in the teammate guide. All testers should know which version they are checking.
- [ ] Use one exact origin for the final checks. Port 3000, port 3001 and your deployed address have separate browser storage, sessions and offline copies.
- [ ] Prepare every browser/device you will use. The in-app browser's saved copy does not prepare Chrome, Edge or a phone.
- [ ] Give teammates on other computers the deployed HTTPS address. Their `localhost` does not point to your computer. No website installation is required.
- [ ] Verify the submitted public URL in a signed-out browser, then return to the prepared demonstration browser. Do not use a new private window for the offline stage demonstration.

## 1. Get two accounts working first

- [ ] Open the existing Supabase project in [the dashboard](https://supabase.com/dashboard).
- [ ] Open **Authentication → Sign In / Providers → Email**. Some dashboard layouts shorten this to **Providers → Email**.
- [ ] Make your email-confirmation choice below, then use email addresses you or your teammate actually control. Earlier placeholder `.invalid` and `example.com` addresses were rejected.

| Choice                                         | What you personally do                                                                                                                                                                                                   | What you can honestly say                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Immediate signup for this controlled prototype | Turn **Confirm email OFF** and save, then create the demonstration accounts. Keep email/password enabled.                                                                                                                | Accounts sign in without email verification. They are unverified test accounts.       |
| Keep email verification                        | Leave it ON, check **Authentication → URL Configuration → Site URL** points to the app you are using, and ensure email delivery is available. Follow the received confirmation link, then return to the app and sign in. | Say confirmation works only after receiving and completing a real confirmation email. |

The default Supabase sender only delivers to addresses on the project's team and has a small sending limit; ordinary users need configured custom SMTP. Do not spend the whole buffer repeatedly requesting emails. The owner decides the prototype setting; the agent has not changed it. [Supabase's email-delivery documentation](https://supabase.com/docs/guides/auth/auth-smtp).

- [ ] Open the chosen TEST_URL in Chrome. For the local production demo, use [localhost:3001](http://localhost:3001). If you keep email confirmation, its site/redirect settings must match the address you are testing.
- [ ] Click **Join STEMBridge**, enter a preferred name, your controlled email address and a unique password of at least eight characters, then **Create my account**.
- [ ] If told to confirm your email, complete that step and return to **Sign in**. Do not assume an account is signed in because signup was submitted.
- [ ] Repeat in Edge for the supporter. If using an existing account, use **Sign in** instead of signing up again.
- [ ] Refresh both browsers. Confirm each still shows the correct person's workspace.

The Windows folder name `promi` and your browser account name do not need to match. STEMBridge accounts use the emails entered into STEMBridge.

## 2. Make the supporter findable

In the supporter browser:

- [ ] Open **My profile**.
- [ ] Set **Main interest** to **Data & AI Circle**.
- [ ] Under **I want to…**, choose **Learn and mentor**. This permits guidance and collaboration in the demonstration.
- [ ] Add relevant skills, such as NumPy, pandas and ML foundations, and choose **Online** support. Treat test-profile skills as demonstration data; they do not verify expertise.
- [ ] Enable **Show my profile in the public directory**.
- [ ] Enable **Let members send me connection requests**.
- [ ] Click **Save profile**. Join the Data & AI circle if you will show its visible-member count.

In the learner browser:

- [ ] Open **My profile**, choose Data & AI and confirm the learner's skills. Save.
- [ ] Choose **Build your first ML project** and open **See my plan**.
- [ ] Refresh if necessary. Search the community for the supporter's saved name and open the full profile.
- [ ] Confirm this is your registered account, not a labelled sample person. Sample cards cannot receive requests.

If the supporter is missing, check the saved name, domain, Online preference, both visibility switches and that both browsers use the same app/Supabase project. Do not change the schema to fix a hidden profile.

## 3. Prove one real request works

- [ ] In the learner browser, open the supporter's profile and click **Ask for guidance**.
- [ ] Review the selected goal and enter a specific message, for example: “Could you review my first notebook's train/test explanation and help me choose one next exercise?”
- [ ] Click **Send request**. Open **Connections → Sent requests** and confirm it is **Pending**.
- [ ] In the supporter browser, open **Connections → Received requests** and click **Refresh inbox**.
- [ ] Open **Accept request**. In **What should you work on next?**, enter a practical action, such as: “Write a short project outline and choose one dataset. We can review the scope together.” Click **Accept request**.
- [ ] Return to the learner, click **Refresh inbox**, and verify **Accepted** plus the same next-step text.
- [ ] Reload both browsers. Confirm the accepted record and next step remain.
- [ ] Sign out and sign in again in one browser. Confirm the correct account and private workspace return.

Then create a third controlled account in another browser profile. Ask the agent or a technical teammate to run the read-only checks in [RLS_CHECKS.sql](RLS_CHECKS.sql) using the three account IDs. The third account should not be able to read the learner/supporter request or the learner's private state. An empty inbox alone does not prove database privacy; the supplied checks test the permissions.

Record the result and exact visible error if anything fails. Share the error text with the agent, without passwords or tokens. The existing local tests do not replace this hosted check.

**Prepare a fresh request for judging:** the app blocks duplicate active requests for the same people, goal and help type. After the guidance rehearsal, you can use **Ask to collaborate** with the same supporter who chose **Learn and mentor**, or choose a different relevant goal. Do not delete database rows to reset the demonstration. If you have already accepted the presentation request, show that accepted record and explain what happened.

### Check the implemented first-step panel

**My Hub → Find my first step** has **I'm starting out**, **I'm returning to STEM** and **I want a project partner** choices. It is implemented and included in the passing final checks. Its real-account handoff still belongs in your hosted walkthrough.

- [ ] Try one choice. Check it offers a practical next action, suitable resource and relevant mentor or peer.
- [ ] For **I'm returning to STEM**, check the profile's existing skills stay intact. This choice should not assume the learner is a beginner.
- [ ] Review and edit the proposed outreach, then follow it into the existing request-review form. Nothing should be sent automatically.
- [ ] Treat the choices as temporary panel preferences, not a new public profile field. This addition needs no Gemini key or database migration.

The fallback links to [Women in Machine Learning](https://www.wiml.org/) and [Women in Robotics chapters](https://www.womeninrobotics.org/chapters/) point to independent communities. They do not establish a partnership, register you there or guarantee a mentor. Show only one first-step choice in the short pitch; the same real request/acceptance test remains the priority.

## 4. Prove multilingual support, then the offline extra

### Check the main website in both languages

- [ ] Use the header's **English / Marathi** switch. Marathi is displayed in its own script. Open My Hub, Communities, Explore, Connections and Offline learning; headings, navigation and authored controls should change together.
- [ ] Open **See my plan**, **Find my first step**, a catalog item and **My profile**. Check the titles, requirements, instructions, field labels and buttons in both languages.
- [ ] Choose each language before opening the sign-in/create-account dialog and request form. Check labels and validation messages. Compare a saved profile bio or existing request: its personal wording must remain unchanged. The global switch is outside dialogs, so do not close an unsaved form merely to change language.
- [ ] In Marathi, copy a visible Marathi word from an opportunity title into Explore search. Confirm a relevant result. Also search an English skill such as NumPy. Search members by a translated skill or their unchanged name.
- [ ] Reload the website. The selected language should return without changing the account, selected goal, saved items, notes or completion.
- [ ] Confirm that user-written messages and notes remain exactly as entered. External tutorial pages and unknown service-provider errors may remain in their source language; do not claim they are translated.
- [ ] Check the phone layout, checkbox visibility and keyboard focus in both languages. The latest code includes the checkbox CSS correction; report an actual final-device failure if one remains.

The labels in this written guide are English so they are easy to locate. Switch to English whenever following a setup instruction, then switch back for the language demonstration.

Use the exact presentation URL and browser. On a narrow phone, the bottom labels **Circles**, **Connect** and **Offline** mean Communities, Connections and Offline learning.

### Prepare while online

- [ ] Open **Offline learning**. Wait for **Ready on this device**. If necessary, click **Prepare offline** or **Update offline copy**. Do not disconnect while it says Preparing.
- [ ] Open a Data & AI exercise and a Robotics & Makers exercise. Check **Check your thinking** reveals an explanation.
- [ ] Write a short note, such as “Why does adding a column change the shape?” Tick **I finished this exercise**.
- [ ] Switch to another exercise and back. The first note and completion should remain. Completing practice must not add a confirmed profile skill.
- [ ] Switch the reading language to Marathi and back to English. The instructions and controls change; your own note does not.
- [ ] If showing a real account's saved plan, sign in while online, wait for its workspace to load, choose a goal and save an item. Use this same browser for the offline test.

### Disable networking and reload

For localhost, switching off Wi-Fi alone is not enough: the browser can still reach a server on the same computer. Use the browser's actual network control.

1. Open Chrome or Edge developer tools with **F12** or **Ctrl+Shift+I**.
2. Open **Network** and choose **Offline** in its throttling dropdown, usually labelled **No throttling** beforehand.
3. Return to the page. Look for the offline notice, then use an ordinary **Ctrl+R** reload. Do not clear site data or unregister the service worker.
4. Open an exercise. Add `Written with the network disabled.` to your note, change its completion state, and reload again.
5. Confirm the website returns and the latest note/completion remain. Click **Download my notes**, open the downloaded text file and check its contents. Marathi notes should remain readable too.
6. Switch English/Marathi while still offline. Browse Explore and open a resource's **Try an offline exercise** button.
7. If signed in with a valid session, check My Hub's saved-copy notice and time. Your own goal and saved items should be available; live member information and the private inbox are not cached.
8. Try an account update while disconnected. It must not claim cloud success or queue a request for later.
9. Set the Network dropdown back to **No throttling**. Confirm the live account reloads, or use **Refresh from account** if offered. Notes remain device-only; reconnecting must not send a request by itself.

Repeat this check on the deployed URL after publication. A failure blocks a claim that the offline extra was demonstrated; keep the primary language claim separate. Record the exact step and error for a fix; do not mark it passed just because the automated suite passed.

### Know the limits before judging

| What works after preparation                                               | What still needs internet                                 |
| -------------------------------------------------------------------------- | --------------------------------------------------------- |
| Reopen the cached website; browse its catalog and eight original exercises | First preparation, sign-in and account creation           |
| Save practice notes and completion in this browser; download notes         | Profile/bookmark/membership changes for live accounts     |
| Switch the prepared main website between English and Marathi               | Current member information, inboxes, requests and replies |
| Read a saved own-account plan while its session remains valid              | External tutorial sites and optional Gemini suggestions   |

Notes do not sync to another device. Automatic account-session expiry **locks and preserves** the notes; reconnect and sign into the same account to recover them. Deliberate sign-out, another account signing in, signing in from the demo, or confirmed **Clear this notebook** removes the previous local notebook. Download work before doing those actions. The preview cannot read or export a locked account notebook.

No new Supabase migration or API connection is required. The updated [teammate testing guide](TEAM_TESTING_GUIDE.md) includes the detailed offline and language checklist; the required owner steps are all included above.

## 5. Publish the tested version

The existing repository is [arnavkhurd/stembridge](https://github.com/arnavkhurd/stembridge). At this guide's inspection, branch `main` contained commit `40e2f37` and local changes. Reuse this repository.

- [ ] The code checks passed at **3:30 PM: 124 tests, TypeScript and production build**. If code has changed afterward, rerun those checks. Documentation-only updates do not require rebuilding the application.
- [ ] In the project terminal, review and commit the finished source:

```powershell
git status --short
git add .
git diff --cached --name-only
```

- [ ] Check the staged list contains the intended project files and **does not contain `.env.local`, passwords, `node_modules` or `.next`**. `.env.example` is the template and contains no key values. Then run:

```powershell
git commit -m "Prepare STEMBridge hackathon demo"
git push -u origin main
```

- [ ] Sign into Vercel. Choose **Add New → Project**, connect GitHub if prompted, and import **stembridge**. Keep **Next.js** and root directory **`./`**.
- [ ] Before deploying, copy these from your local configuration into Vercel's environment variables. Never paste their values into the repository or these guides.

| Variable                               | Needed?                                                       |
| -------------------------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes, for the same existing project                            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes; use the publishable key, never a secret/service-role key |
| `GEMINI_API_KEY`                       | Only if you have connected and checked Gemini                 |
| `GEMINI_MODEL`                         | Optional; current default is `gemini-2.5-flash-lite`          |

- [ ] Click **Deploy**. After success, open the resulting production URL. Environment changes require another deployment.
- [ ] In Supabase **Authentication → URL Configuration**, set **Site URL** to the deployed origin. If using email confirmation, check its allowed redirect configuration and test a real confirmation on that URL.
- [ ] Repeat the two-browser sign-in/request/refresh check on the deployed URL. Local browser sessions do not transfer to the new website origin.
- [ ] On that exact deployed URL, prepare Offline learning again and repeat section 4's network-disabled reload, notes and language checks. An old localhost cache does not cover the new URL.
- [ ] After a later redeployment, reopen the site online and use **Update offline copy** before disconnecting. Wait for readiness; do not assume the earlier cached version contains your latest changes.
- [ ] Open the URL in a signed-out browser and on a phone to confirm judges can reach it without your Vercel account. Resolve any deployment-access gate before submitting.

Vercel can deploy updates from the connected GitHub repository; verify the deployment corresponds to the commit you intend to present. [Vercel's GitHub guide](https://vercel.com/docs/git/vercel-for-github).

## 6. Treat Gemini as optional

The main-site language support and retained offline work need no AI key. The Gemini key was still empty at 3:25 PM. With the deadline approaching, skip new Gemini setup if accounts, deployment or offline verification still need work. If it is already configured, give a live check at most five minutes. Manual skill entry is already usable.

- [ ] Open [Google AI Studio API Keys](https://aistudio.google.com/apikey), sign in, and create/select an API key for your project.
- [ ] Add it privately as `GEMINI_API_KEY` in `.env.local`, restart the local server, and add the same server-only variable to Vercel before redeploying.
- [ ] Sign into STEMBridge, open **My profile → Suggest skills with AI (optional)**, enter an experience description and check **Send this introduction to Google Gemini for skill suggestions**.
- [ ] Click **Suggest skills**, review the evidence and suggested fields, and confirm only accurate skills before saving.
- [ ] If a key, quota or provider problem prevents a live response, continue with manual skills and describe AI as optional and unverified. Do not show sample output as a live response.

Account/model access and quota depend on Google. Keep the key server-side. [Google's API-key documentation](https://ai.google.dev/gemini-api/docs/api-key).

## Time plan and final checklist

Adjust these times to the actual clock, preserving the final buffer:

| Time, IST | Finish this                                                                                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Now**   | **Feature freeze.** Split jobs: owner handles accounts/deployment; teammate runs offline and language checks.                                                                 |
| Now–3:38  | Commit/push the finished version and deploy; prepare the two accounts and prove the request loop. Work in parallel where possible.                                            |
| 3:38–3:45 | Check the deployed URL: shared language switch, forms, bilingual search and live request. In parallel, check the prepared offline reload and notes/export. Fix blockers only. |
| 3:45–3:50 | Rehearse the updated three-minute demonstration, leading with multilingual access and showing offline continuity as an extra. Prepare a truthful fallback.                    |
| 3:50–4:00 | Complete the submission form and verify repository/demo links.                                                                                                                |
| 4:00–4:10 | Buffer for upload, access or organizer issues                                                                                                                                 |

- [ ] Read [LIVE_JUDGING_GUIDE](LIVE_JUDGING_GUIDE.md) with your teammate and run it once with a timer.
- [ ] Prepare the actual deployment URL and repository URL, and any pitch/video required by the organizer. Check the organizer's instructions; this guide does not assume a submission portal or file format.
- [ ] Open the repository while signed out to confirm it is public and contains the final code. Open the demo without your Vercel login. URL validation checks link format; it does not prove access or functionality. Never submit localhost as a public demo link.
- [ ] In the twist answer, describe English/Marathi across the main interface and authored content, persistent language choice and bilingual search. Personal writing stays unchanged. Present the offline exercises, notes/export and cached reload as an extra; do not claim translation of external courses or offline messaging.
- [ ] Submit before the deadline and keep the confirmation. A deployed site is not automatically a submitted entry.
- [ ] Make sure your final claims match what actually passed: test accounts, sample catalog, self-reported skills, and live AI only if you observed it work.
