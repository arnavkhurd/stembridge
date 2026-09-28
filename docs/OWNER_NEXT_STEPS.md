# Your remaining steps before submission

> **Twist update, 3:01 PM IST:** offline support and English/Marathi learning are implemented. Read [OFFLINE_TWIST_GUIDE](OFFLINE_TWIST_GUIDE.md) first for production port 3001 setup, exact judging-URL preparation and the real browser Offline/reload test. At the 3:01 PM checkpoint, 115 tests, TypeScript and the production build passed; the cached website also worked after its server was stopped, including notes, Marathi and export. Hosted accounts and full browser networking-disabled checks remain separate. This base guide and its original PDF predate the twist; use the new addendum alongside them. No new SQL or Gemini key is needed.

Prepared at approximately **2:14 PM IST on 28 September 2026** for the **4:10 PM IST deadline**. Start with the two real accounts. The code is built; the remaining uncertainty is whether your hosted accounts, requests and deployment work together.

## What is already done

- The website, two STEM circles, goal plans, search, member profiles, saved opportunities and request flow are implemented.
- Supabase is connected. The schema is already installed, and the two community records are readable. **Do not recreate the project or rerun the schema as a routine setup step.**
- At 2:28 PM, all **72 tests**, TypeScript and the production build passed. Desktop and 390px mobile checks passed. Full details are in [BUILD_STATUS](../BUILD_STATUS.md).
- Last verified: **Confirm email is ON**, the **Gemini key is empty**, and the **real-account walkthrough and deployment are still unverified**. These are facts from the last check, not claims about changes you may make afterward.

## Who does what

| Person | Their job |
| --- | --- |
| You, as account owner | Choose the email-confirmation setting, access your own email, sign into Supabase/GitHub/Vercel, add credentials privately, approve the final presentation claims and submit. |
| A teammate | Operate the supporter account in another browser, check the learner's request, rehearse the handoff and time the presentation. Use an address they control. |
| The coding agent | Diagnose the exact failure, fix code, run checks, help inspect database permissions and prepare the release. It does not need your account passwords in chat. |

If working alone, Chrome can be the learner and Edge the supporter. Two ordinary tabs in one browser share the same login.

## 1. Get two accounts working first

- [ ] Open the existing Supabase project in [the dashboard](https://supabase.com/dashboard).
- [ ] Open **Authentication → Sign In / Providers → Email**. Some dashboard layouts shorten this to **Providers → Email**.
- [ ] Make your email-confirmation choice below, then use email addresses you or your teammate actually control. Earlier placeholder `.invalid` and `example.com` addresses were rejected.

| Choice | What you personally do | What you can honestly say |
| --- | --- | --- |
| Immediate signup for this controlled prototype | Turn **Confirm email OFF** and save, then create the demonstration accounts. Keep email/password enabled. | Accounts sign in without email verification. They are unverified test accounts. |
| Keep email verification | Leave it ON, check **Authentication → URL Configuration → Site URL** points to the app you are using, and ensure email delivery is available. Follow the received confirmation link, then return to the app and sign in. | Say confirmation works only after receiving and completing a real confirmation email. |

The default Supabase sender only delivers to addresses on the project's team and has a small sending limit; ordinary users need configured custom SMTP. Do not spend the whole buffer repeatedly requesting emails. The owner decides the prototype setting; the agent has not changed it. [Supabase's email-delivery documentation](https://supabase.com/docs/guides/auth/auth-smtp).

- [ ] Open the running app at [localhost:3000](http://localhost:3000) in Chrome. If the development server is stopped, run `npm run dev` in the project folder and leave that terminal running.
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

### Check the new first-step panel once it is ready

The agreed addition is **My Hub → Find my first step**, with **I'm starting out**, **I'm returning to STEM** and **I want a project partner** choices. It passed the final local tests and desktop/mobile browser checks at 2:28 PM IST. Its real-account handoff still belongs in your hosted walkthrough.

- [ ] Try one choice. Check it offers a practical next action, suitable resource and relevant mentor or peer.
- [ ] For **I'm returning to STEM**, check the profile's existing skills stay intact. This choice should not assume the learner is a beginner.
- [ ] Review and edit the proposed outreach, then follow it into the existing request-review form. Nothing should be sent automatically.
- [ ] Treat the choices as temporary panel preferences, not a new public profile field. This addition needs no Gemini key or database migration.

The fallback links to [Women in Machine Learning](https://www.wiml.org/) and [Women in Robotics chapters](https://www.womeninrobotics.org/chapters/) point to independent communities. They do not establish a partnership, register you there or guarantee a mentor. Show only one first-step choice in the short pitch; the same real request/acceptance test remains the priority.

## 4. Publish the tested version

The existing repository is [arnavkhurd/stembridge](https://github.com/arnavkhurd/stembridge). At this guide's inspection, branch `main` contained commit `40e2f37` and local changes. Reuse this repository.

- [ ] Have the agent finish the agreed code changes and rerun `npm run test`, `npm run typecheck` and `npm run build`. The 2:28 PM result is a checkpoint; changed code needs its own final check.
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

| Variable | Needed? |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes, for the same existing project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes; use the publishable key, never a secret/service-role key |
| `GEMINI_API_KEY` | Only if you have connected and checked Gemini |
| `GEMINI_MODEL` | Optional; current default is `gemini-2.5-flash-lite` |

- [ ] Click **Deploy**. After success, open the resulting production URL. Environment changes require another deployment.
- [ ] In Supabase **Authentication → URL Configuration**, set **Site URL** to the deployed origin. If using email confirmation, check its allowed redirect configuration and test a real confirmation on that URL.
- [ ] Repeat the two-browser sign-in/request/refresh check on the deployed URL. Local browser sessions do not transfer to the new website origin.
- [ ] Open the URL in a signed-out browser and on a phone to confirm judges can reach it without your Vercel account. Resolve any deployment-access gate before submitting.

Vercel can deploy updates from the connected GitHub repository; verify the deployment corresponds to the commit you intend to present. [Vercel's GitHub guide](https://vercel.com/docs/git/vercel-for-github).

## 5. Add Gemini only if the core walkthrough is working

Give this a short time box of about ten minutes. Manual skill entry is already usable.

- [ ] Open [Google AI Studio API Keys](https://aistudio.google.com/apikey), sign in, and create/select an API key for your project.
- [ ] Add it privately as `GEMINI_API_KEY` in `.env.local`, restart the local server, and add the same server-only variable to Vercel before redeploying.
- [ ] Sign into STEMBridge, open **My profile → Suggest skills with AI (optional)**, enter an experience description and check **Send this introduction to Google Gemini for skill suggestions**.
- [ ] Click **Suggest skills**, review the evidence and suggested fields, and confirm only accurate skills before saving.
- [ ] If a key, quota or provider problem prevents a live response, continue with manual skills and describe AI as optional and unverified. Do not show sample output as a live response.

Account/model access and quota depend on Google. Keep the key server-side. [Google's API-key documentation](https://ai.google.dev/gemini-api/docs/api-key).

## Time plan and final checklist

Adjust these times to the actual clock, preserving the final buffer:

| Time, IST | Finish this |
| --- | --- |
| 2:14–2:35 | Email choice, learner/supporter accounts and saved profiles |
| 2:35–2:50 | Hosted request acceptance, refresh and privacy checks |
| 2:50–3:00 | Fix observed blockers; optional Gemini only if time remains |
| **3:00** | **Feature freeze**; only fix bugs affecting the demonstration |
| 3:00–3:25 | Final checks, commit/push, Vercel deployment |
| 3:25–3:45 | Test the deployed URL and rehearse the three-minute presentation |
| 3:45–4:00 | Complete the submission form and verify all links/files |
| 4:00–4:10 | Buffer for upload, access or organizer issues |

- [ ] Read [LIVE_JUDGING_GUIDE](LIVE_JUDGING_GUIDE.md) with your teammate and run it once with a timer.
- [ ] Prepare the actual deployment URL and repository URL, and any pitch/video required by the organizer. Check the organizer's instructions; this guide does not assume a submission portal or file format.
- [ ] Submit before the deadline and keep the confirmation. A deployed site is not automatically a submitted entry.
- [ ] Make sure your final claims match what actually passed: test accounts, sample catalog, self-reported skills, and live AI only if you observed it work.
