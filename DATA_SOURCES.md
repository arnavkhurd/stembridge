# Data sources and demonstration limits

The prototype keeps its small catalog and preview people in `src/lib/data.ts`. It does not scrape listings or invent an active network.

## People and opportunities

- Priya Sharma and Aisha Thomas are fictional sample learners. Their confirmed starting skills are explicitly supported by their sample descriptions.
- Ananya Rao, Meera Shah, Zoya Khan, Kavya Menon, Ishita Das and Tara Nair are fictional preview profiles. Names do not represent consented mentors, real credentials or company affiliations. Their IDs are sample IDs, not Supabase Auth accounts.
- The two project goals, two competitions and two internships are illustrative briefs authored for this prototype. They have no verified employer, event organizer, stipend, deadline, application link or available place.
- Actual registered profiles in a configured Supabase project are supplied by their account holders. Skills, roles and support preferences are self-described. No identity or mentor-verification process is claimed.

## Real learning material

The following official pages were opened successfully on **28 September 2026**. This verifies the links and documentation identity, not learning outcomes, certifications, completion times or future availability.

| Resource | Official source | Interpretation |
| --- | --- | --- |
| NumPy: the absolute basics | https://numpy.org/doc/stable/user/absolute_beginners.html | Beginner documentation for arrays and operations |
| 10 minutes to pandas | https://pandas.pydata.org/docs/user_guide/10min.html | Introductory tour; its title is not a mastery guarantee |
| scikit-learn Getting Started | https://scikit-learn.org/stable/getting_started.html | Introduction to basic model fitting and evaluation |
| Arduino Built-in Examples | https://docs.arduino.cc/built-in-examples/ | Free-to-read example documentation; physical builds require compatible hardware |

The tiny classifier, circuit planning, sensor build and prototype-sharing entries are **STEMBridge practice exercises**, not external courses or certificates. Circuit and sensor instructions are introductory practice descriptions; component-specific wiring must follow the actual manufacturer's documentation. Hardware-required work is labelled accordingly.

## Requirements and matching

### External women-in-STEM communities

The first-step panel links to [Women in Machine Learning](https://www.wiml.org/) for its mentorship and networking resources, and [Women in Robotics chapters](https://www.womeninrobotics.org/chapters/) for local chapters and an online community. Both official pages were opened on **28 September 2026**. These are independent external organisations, not STEMBridge partners or in-app mentors. Check their own membership terms, eligibility and event availability; opening a link does not join either community.

### First-step choices

Starting out, returning to STEM, and finding a project partner change the proposed action, relevant mentor/peer role, and editable introduction. The planner uses the current goal and existing confirmed skills. It never treats a career break as lost competence, never confirms skills automatically, and does not require AI. It selects a resource only when the first missing requirement and the resource's stated prerequisites match; otherwise it explains the gap. Choices and unsent drafts are temporary panel state. Only an explicitly reviewed and submitted request is stored and shared with its recipient.

Skill requirements attached to sample opportunities are illustrative product data, not research about the complete job market. All listed requirements are counted equally in this prototype. Coverage uses confirmed self-report and a small canonical skill vocabulary; it does not independently assess proficiency.

The suggested path uses curated foundation-before-practice ordering. It is a helpful learning sequence, not a proven shortest route. Resource prerequisites remain visible, unresolved gaps remain explicit, and saving a link does not add a skill.

No outcome, salary, hiring probability, completion time, mentor capacity or community impact is verified. Counts must come from the actual current dataset or visible database results. Unknown listing cost is not represented as a verified free opportunity.

## Implementation references

- [Supabase SMTP restrictions](https://supabase.com/docs/guides/auth/auth-smtp) and [password auth](https://supabase.com/docs/guides/auth/passwords): consulted on 28 September 2026 for the prototype email setup.
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [Next.js SSR authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs): consulted for account-session handling and access rules.
- [Google Gemini structured generation example](https://ai.google.dev/gemini-api/docs/migrate-to-interactions): consulted for the existing `generateContent` JSON-response interface. The application uses a small server-side REST call and validates the result.
- [PGlite getting started](https://pglite.dev/docs/) and [API reference](https://pglite.dev/docs/api): consulted for in-memory PostgreSQL execution of the actual application schema and parameterized permission tests.

These sources inform implementation. They do not establish that a particular deployment's configuration, security boundaries or live AI response have been verified. Run the account walkthrough and database checks described in the README and setup guide for your deployment.
