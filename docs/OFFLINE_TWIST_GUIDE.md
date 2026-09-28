# STEMBridge: offline twist guide

This is the checklist for the announced offline requirement and the English/Marathi learning bonus. Use it with the existing owner and teammate guides; their original PDFs predate the twist. The final code checks passed at **3:01 PM IST on 28 September 2026**: **115 tests across 12 files**, TypeScript and the production build. The deadline remains **4:10 PM IST**.

The production browser was also tested after its website server was stopped. It reopened the prepared website, kept notes through reload, displayed Marathi and exported the actual entered notes. This is direct cache evidence. The browser's full **Network → Offline** setting and the hosted account flow still need the participant checks below; they were not silently assumed to pass.

## 1. What we can honestly show

**The idea:** a weak connection should interrupt a conversation, not stop someone's learning. A woman can practise, keep questions for a mentor, and return to her next step when internet access returns.

The website has eight original practice exercises: four for Data & AI and four for Robotics. Their instructions, explanations and prompts are part of STEMBridge itself. They do not depend on an external tutorial opening.

After this browser has prepared the website, it can reopen the public website, catalog and exercises offline. A notebook saves notes and exercise completion on this device. It can download those notes as a text file. Completing an exercise does **not** claim that the person has earned or verified a skill.

For an account that has loaded successfully online, a saved copy of that account's own profile, selected goal, confirmed skills and saved catalog items is available while its local Supabase session remains valid. The copy is read-only. It is clearly labelled with its saved time. If the session expires automatically, account notes are kept but locked: the preview cannot read, edit or download them. Reconnect and sign into the same account to recover them, or explicitly clear the notebook to start again.

**The boundary:** offline support does not make other people available without internet. Sign-in, new accounts, member information, community membership changes, requests, replies, profile changes and account bookmarks need a connection. Nothing is quietly sent later. Notes do not automatically upload when internet returns.

The bonus language work is **English and Marathi in the offline learning area**. The selector, translated exercises and controls are implemented, and language choice, notes and completion persisted in the server-stopped browser check. This is a focused learning feature, not a claim that every page, account screen, catalog listing or user message is translated.

## 2. Current evidence and checks still needed

This table distinguishes completed evidence from checks the owner must still run on the exact presentation URL.

| Feature or risk                                               | Completed evidence                                                                                                           | What remains                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Correct account's saved plan                                  | Automated tests pass for matching owner, missing/expired session and wrong account                                           | Check with a real signed-in account on the judging URL   |
| Keep other members and inbox messages out of the offline copy | Automated allowlist and provider tests pass                                                                                  | Hosted signed-in privacy walkthrough                     |
| Reject offline live writes; never queue them                  | Automated tests pass with `navigator.onLine` false, including a click behind an earlier pending save                         | Real browser Offline setting and reconnect check         |
| Reconnect and reload confirmed account data                   | Automated provider test passes                                                                                               | Real account browser check                               |
| Expire an open offline session safely                         | Automated expiry and same-account note-recovery tests pass                                                                   | Optional browser expiry check                            |
| Eight original exercises                                      | Content tests pass; production exercise and catalog-to-exercise navigation work with the server stopped                      | Read both topic groups on the final judging URL          |
| Notes and completion survive reload                           | Production browser: notes edited with the server stopped survived another reload; completion persisted                       | Repeat on the exact presentation URL                     |
| Download real Unicode notes                                   | A UTF-8 text file containing the Marathi notes entered through the UI was verified on disk at 2:53 PM                        | Repeat download on the presentation device               |
| Storage save/clear failure                                    | Automated tests pass; a failed clear reports the failure and retains the visible notes                                       | Optional restricted-storage browser check                |
| Reopen with website server unavailable                        | Production port 3001 prepared, server process stopped, then successful interactive reload                                    | Completed locally; prepare the hosted address separately |
| Reopen with all browser networking disabled                   | Not automated: available browser controls have no network-emulation switch                                                   | **Use the real Network → Offline test below**            |
| English / Marathi                                             | Server-stopped reload preserved language choice, notes and completion; Marathi rendered at 390px without horizontal overflow | Check on the final presentation device                   |
| Hosted URL, real accounts and request acceptance              | Existing implementation; no successful live credential walkthrough is claimed here                                           | **Required if demonstrating live networking**            |

All **115 tests across 12 files** passed at the final 3:01 PM code checkpoint, including the **35 provider/offline snapshot tests**. TypeScript and production build passed too. Automated tests, a server-unavailable browser run and a real browser-network test answer different questions; keep those claims separate.

## 3. Start the correct version locally

The normal development server at port 3000 is useful for coding. Use a **production build** for the offline reload demonstration.

From the project folder, run:

```powershell
npm run build
```

Wait until the build finishes successfully. Then run:

```powershell
npm run start -- -p 3001
```

Keep that terminal running. Open `http://localhost:3001` in Chrome or Edge. Use one browser consistently for preparation and the offline test.

Important details:

- Port 3001 is a different website address from port 3000 as far as browser storage is concerned. Its notes, sessions and prepared copy are separate. Prepare it again.
- A deployed HTTPS website has its own separate saved copy too. Prepare the exact submitted URL before judging.
- `localhost` works only on the computer running the server. Send teammates the deployed URL when they are using their own devices.
- A normal HTTP address on another device's local network may not allow service workers. Use HTTPS for the hosted demonstration.
- Do not clear the site's browser storage or use a fresh private window after preparing it. Doing so removes the saved copy and device notes.

## 4. Prepare once while online

1. Open the production website with internet working.
2. Choose **Offline learning** in the website navigation.
3. Wait for **Ready on this device**. If it is not ready, use **Prepare offline** and wait. Do not switch off networking while it is still preparing.
4. If there is an error, remain online, use the prepare/update button again, and read the error. Do not describe an unfinished download as ready.
5. Open the **Data & AI** topic. Confirm these four exercises are listed:
   - Make sense of an array.
   - Clean a tiny table.
   - Keep your test data separate.
   - Plan a small, honest ML project.
6. Open **Robotics**. Confirm these four exercises are listed:
   - Trace a blinking light.
   - Sketch before you connect.
   - Question a sensor reading.
   - Explain your prototype clearly.
7. Open the array exercise. Type: `My question for a mentor: why is the shape (2, 3)?`
8. Select **I finished this exercise**. The count should increase by one. Confirm the note says it is saved on this device.
9. Open another exercise, then return. The first note and completion tick should still be there.
10. Use **Download my notes**. Open the downloaded text file. Confirm that it contains your note and completion status, and does not include account IDs, tokens or other people's messages.
11. Use the language selector to switch to Marathi, then English. Your notes and completion should remain the same. Check that Marathi letters display properly; boxes or missing letters are a failure.

On a narrow phone, the short navigation labels are **Circles**, **Connect** and **Offline**. They mean Communities, Connections and Offline learning. Desktop labels remain longer.

You do not have to complete all eight exercises before judging. They are prepared together; one short worked example is enough for the demonstration.

### Optional: prepare your own account plan

Use an email account you control. Sign in on this exact URL while online. Let the workspace finish loading. Choose a goal and save one catalog item, then wait for the confirmed update.

The saved offline view contains your own account data. It does not contain the live directory, community membership list or connection inbox. It does not copy authentication tokens into the offline workspace record.

Sign in shortly before the demonstration so the session is still valid. If it expires while offline, the website returns to preview instead of treating a saved file as permission to enter an account. Existing account notes stay on this device, locked from the preview; they are not erased. Sign back into the same account to resume. The offline exercise feature can be demonstrated without an account.

Download important notebook work before deliberately signing out or signing into a different account. That action clears the device notebook and the saved account copy. Automatic session expiry only locks the notes; it does not erase them. On a shared device, explicitly sign out when finished.

## 5. Prove offline support with a real network test

Do this before judging, and repeat it on the submitted URL if using that URL on stage.

**For a localhost demonstration, merely switching off Wi-Fi is not enough proof.** Your browser may still reach the web server on your own computer. Chrome or Edge's developer tools can disable networking for the page and give a stronger test.

1. Keep the prepared website open.
2. Open browser developer tools with **F12** or **Ctrl+Shift+I**.
3. Open the **Network** tab. Find its network throttling dropdown, normally called **No throttling**.
4. Change that dropdown to **Offline**. This must be the browser's real networking control. Do not fake the website's online flag with JavaScript.
5. Return to the website. It should clearly say you are offline.
6. Use an ordinary page reload, **Ctrl+R**. Do not clear site data or unregister the service worker.
7. The website should reopen. If you see the browser's connection-error page, the test has failed. If you only see the “connect once” fallback page, the full website was not prepared successfully.
8. Open **Offline learning**. If you were already there, confirm the page has loaded fully.
9. Open all eight exercises, including the other topic. Their instructions should be readable. Use **Check your thinking** and **Hide explanation**.
10. Add this to your earlier note: `Written while the network was disabled.` Tick or untick one completion box.
11. Reload normally again. Your latest text and completion state should survive.
12. Download your notes while still offline. Open the text file and find the new sentence.
13. Switch English / Marathi. Check the exercise, explanation, prompt and note controls. Switch back. The written note should remain unchanged.
14. Visit **Explore** and change catalog filters. Catalog reading should still work. External tutorial websites are not part of the saved pack and may fail to open offline.
15. If signed in with a valid session, visit **My Hub**. Confirm the saved-copy notice, selected goal, skills and saved item. It must not invent live members or display a stale inbox as current.
16. Try an account change, bookmark change or connection action if its button is available. Expect a clear reconnect message or a disabled control with an explanation. No cloud success message should appear.
17. Return to developer tools and change **Offline** back to **No throttling**.
18. Wait for the online workspace to refresh. If needed, use the account refresh control. Your live profile should return and the saved-copy notice should go away after a successful load.
19. Confirm that the notes remain on this device. Confirm that no connection request was sent merely because the internet came back.

If a step fails, write down the exact URL, browser, step, expected result and actual result. Do not hide the failure by changing to a different URL without preparing and retesting that URL.

## 6. Short stage demonstration

Keep this part to about **90 seconds**. Have the page prepared before the judges arrive.

1. **Explain the problem, 15 seconds:** “STEMBridge helps women turn a STEM goal into a useful next step and a connection. Reliable internet is not always available, so the learning part continues offline.”
2. **Show readiness, 10 seconds:** Open Offline learning and point to Ready on this device.
3. **Prove it, 15 seconds:** Use the browser's actual Offline setting, then reload normally.
4. **Do something useful, 25 seconds:** Open a short exercise, show its explanation, write a specific question for a mentor, and mark the exercise complete. Say: “This records practice; it does not certify a skill.”
5. **Show the saved work, 10 seconds:** Reload once and show the note is still there. Download it if time allows.
6. **Optional language bonus, 10 seconds:** Switch the learning area to Marathi. Say: “This learning area is available in English and Marathi.” Avoid claiming that every page is translated.
7. **Finish the journey, 15 seconds:** Reconnect. Explain that the learner can review her notes and send a specific mentor question online. If time remains, use the previously tested real-account request and acceptance flow.

Do not spend the stage time completing every exercise, creating an account from scratch, fixing email confirmation or waiting for a language API. The offline practice and translated content do not need Gemini.

## 7. Simple answers to likely judge questions

**“Is the whole social network available offline?”**

No. The public learning experience and a saved copy of the current user's own plan work offline after preparation. Live people, account updates and communication need a connection.

**“Are requests sent automatically when internet returns?”**

No. We deliberately do not queue them. The user must review and send a request online. This avoids accidental or duplicate outreach.

**“Are these copies of external courses?”**

No. The eight short exercises are original STEMBridge material. Linked official tutorials remain separate websites and require internet.

**“Where are the notes stored?”**

In this browser on this device. They do not sync to another phone or laptop. They can be exported as a text file. Explicit sign-out and a different account signing in clear them. If a session expires automatically, the notes stay locked until the same account signs in again; preview cannot show or export them.

**“Does this prove the learner has gained a skill?”**

No. Completion records a practice step. Confirmed profile skills remain under the user's control, and the questions can support a later mentor conversation.

**“What makes this relevant to women in STEM?”**

It supports continuity: a learner can prepare work and a specific question between online sessions, then reconnect with relevant people. The wider platform also provides beginner, return-to-STEM and project-partner paths. We still need user research to measure whether this reduces barriers in practice.

**“Does offline work on the very first visit?”**

No. This browser needs one successful online visit and preparation. Browser storage can also be removed or evicted. We show readiness rather than promising permanent storage.

**“Is everything multilingual?”**

The bonus covers the offline learning area in English and Marathi. It does not translate other users' messages or the entire account system.

## 8. Final sign-off for the owner

Fill this after testing the final build. Leave unfinished checks honest.

| Check                                                                          | Result: Pass / Fail / Not tested | Tester and time |
| ------------------------------------------------------------------------------ | -------------------------------- | --------------- |
| Exact judging URL: ____________________                                        |                                  |                 |
| Production build and start succeed                                             |                                  |                 |
| Ready on this device appears                                                   |                                  |                 |
| Real browser Offline setting plus normal reload works                          |                                  |                 |
| All eight exercise instructions and explanations open offline                  |                                  |                 |
| Notes and completion survive offline reload                                    |                                  |                 |
| Offline text-file download contains the latest notes                           |                                  |                 |
| Marathi displays correctly and language switching preserves notes              |                                  |                 |
| Reloading Offline learning while signed in preserves the correct owner's notes |                                  |                 |
| Account copy shows only its owner's plan; private inbox is absent              |                                  |                 |
| Offline account actions fail clearly and send nothing                          |                                  |                 |
| Reconnect restores live account data without sending queued requests           |                                  |                 |
| Sign-out clears private notebook and account snapshot                          |                                  |                 |
| Three-minute full demonstration rehearsed within the time limit                |                                  |                 |

Freeze additions after this passes. A proven offline experience is more convincing than extra controls that have not been tested.
