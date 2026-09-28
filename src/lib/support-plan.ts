import { catalog, getSkillLabel } from "./data";
import { getCoverage, matchPeople } from "./matching";
import type {
  CatalogItem,
  ConnectionRequest,
  LearnerState,
  PersonMatch,
  Profile,
} from "./types";

export type SupportIntent = "start" | "return" | "partner";

export const supportIntents: { id: SupportIntent; label: string }[] = [
  { id: "start", label: "I'm starting out" },
  { id: "return", label: "I'm returning to STEM" },
  { id: "partner", label: "I want a project partner" },
];

export interface SupportPlan {
  intent: SupportIntent;
  helpType: ConnectionRequest["help_type"];
  focusSkill: string | null;
  action: { title: string; description: string };
  resource: CatalogItem | null;
  resourceStatus: "ready" | "missing" | "prerequisites" | "not-needed";
  resourceNote: string;
  match: PersonMatch | null;
  sampleMatch: boolean;
  draft: string;
  community: { name: string; url: string; description: string };
}

export function isSampleSupportProfile(person: Profile) {
  return (
    person.is_demo ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      person.id,
    )
  );
}

/** Select one usable first step; never treat a career break as missing competence. */
export function buildSupportPlan(
  intent: SupportIntent,
  learner: LearnerState,
  goal: CatalogItem,
  people: Profile[],
  options: {
    resources?: readonly CatalogItem[];
    includeSamples?: boolean;
  } = {},
): SupportPlan {
  const coverage = getCoverage(learner.confirmed_skills, goal.requirements);
  const focusSkill = coverage.missing[0] ?? null;
  const focusLabel = focusSkill ? getSkillLabel(focusSkill) : null;
  const resources = options.resources ?? catalog;
  const matchingResources = focusSkill
    ? resources.filter(
        (item) =>
          item.kind === "resource" &&
          item.domain === goal.domain &&
          (!learner.online_only || item.format === "online") &&
          getCoverage(item.skills, [focusSkill]).met.length > 0,
      )
    : [];
  const resource =
    matchingResources.find(
      (item) =>
        getCoverage(learner.confirmed_skills, item.requirements).missing
          .length === 0,
    ) ?? null;
  const resourceStatus: SupportPlan["resourceStatus"] = !focusSkill
    ? "not-needed"
    : resource
      ? "ready"
      : matchingResources.length
        ? "prerequisites"
        : "missing";
  let resourceNote: string;
  if (resource) {
    resourceNote = `This covers ${focusLabel}. Your confirmed skills include its listed prerequisites.`;
  } else if (resourceStatus === "prerequisites") {
    const prerequisites = getCoverage(
      learner.confirmed_skills,
      matchingResources[0].requirements,
    )
      .missing.map(getSkillLabel)
      .join(", ");
    resourceNote = `The listed resource for ${focusLabel} expects ${prerequisites}. Ask for an earlier starting point; we have not selected an advanced exercise.`;
  } else if (focusSkill) {
    resourceNote = `We do not have a suitable resource for ${focusLabel} with these preferences. Ask for one small exercise to start with.`;
  } else {
    resourceNote = goal.requirements.length
      ? "Your profile lists all the skills in this goal. A work sample or a focused question is a useful next step."
      : "This goal does not list prerequisite skills. Start by discussing a small task you could try.";
  }

  const helpType = intent === "partner" ? "collaboration" : "mentorship";
  const eligiblePeople = people.filter(
    (person) => options.includeSamples || !isSampleSupportProfile(person),
  );
  const matches = matchPeople(
    eligiblePeople,
    learner,
    goal,
    intent === "partner" ? "peer" : "mentor",
  ).filter(
    ({ person }) =>
      intent === "partner" ||
      !focusSkill ||
      getCoverage(person.skills, [focusSkill]).met.length > 0,
  );
  // Real members take precedence even when sample browsing is explicitly enabled.
  const match =
    matches.find(({ person }) => !isSampleSupportProfile(person)) ??
    matches[0] ??
    null;
  const action = actionFor(intent, focusLabel, resource);
  const community =
    goal.domain === "robotics"
      ? {
          name: "Women in Robotics",
          url: "https://www.womeninrobotics.org/chapters/",
          description:
            "Explore local chapters and the virtual community for women in robotics.",
        }
      : {
          name: "Women in Machine Learning",
          url: "https://www.wiml.org/",
          description:
            "Explore mentorship and networking resources for women in machine learning.",
        };

  return {
    intent,
    helpType,
    focusSkill,
    action,
    resource,
    resourceStatus,
    resourceNote,
    match,
    sampleMatch: !!match && isSampleSupportProfile(match.person),
    community,
    draft: draftFor(
      intent,
      learner,
      goal,
      match?.person ?? null,
      focusLabel,
      resource,
    ),
  };
}

function actionFor(
  intent: SupportIntent,
  focus: string | null,
  resource: CatalogItem | null,
): SupportPlan["action"] {
  if (intent === "partner") {
    return resource
      ? {
          title: "Try one exercise together",
          description: `Invite a peer to work through “${resource.title}”. Choose one task each, then compare what you learned.`,
        }
      : {
          title: "Agree on a small first task",
          description: focus
            ? `Ask a peer to compare what you already know and choose one exercise for ${focus}. Start there before taking on the whole project.`
            : "Suggest one small task you can take and one a partner might enjoy. Agree on what your first version should do.",
        };
  }
  if (intent === "return") {
    return resource
      ? {
          title: "Make a small work sample",
          description: `Build on the skills you already have. Try “${resource.title}” and bring one example or question to a mentor.`,
        }
      : {
          title: "Talk through your next project",
          description: focus
            ? `Describe the skills you already use and ask a mentor for a small first task in ${focus}. Returning does not change your confirmed skills.`
            : "Write a short outline of something you would like to build. Ask a mentor how it could show the skills you already have.",
        };
  }
  return resource
    ? {
        title: resource.isSample
          ? "Try one practice exercise"
          : "Try one guided example",
        description: `Start with “${resource.title}”. Try one example or task, then write down one question to discuss with a mentor.`,
      }
    : {
        title: focus
          ? `Find a starting point for ${focus}`
          : "Share a short project outline",
        description: focus
          ? `Ask a mentor for one beginner exercise in ${focus} and what to bring back for feedback. A suitable learning link is not listed yet.`
          : "Write the problem you want to solve and what you plan to build. Ask a mentor for feedback on the scope.",
      };
}

function draftFor(
  intent: SupportIntent,
  learner: LearnerState,
  goal: CatalogItem,
  person: Profile | null,
  focus: string | null,
  resource: CatalogItem | null,
) {
  const firstName = person?.display_name.trim().split(/\s+/)[0] || "there";
  const known = [...new Set(learner.confirmed_skills)]
    .slice(0, 3)
    .map(getSkillLabel);
  const context =
    intent === "return"
      ? "I'm returning to STEM and would like to choose a manageable next step."
      : intent === "partner"
        ? "I'm looking for a project partner."
        : "I'd like help choosing my first step.";
  const target = goal.isSample
    ? `I'm using “${goal.title}” as a practice goal.`
    : `I'm exploring “${goal.title}”.`;
  const strengths = known.length
    ? ` My starting skills include ${known.join(", ")}.`
    : "";
  const task = resource ? ` I plan to try “${resource.title}”.` : "";
  const ask =
    intent === "partner"
      ? `Would you like to ${resource ? "work through that exercise together" : focus ? `choose a first exercise for ${focus}` : "pick a small project task together"} and agree on one task each?`
      : intent === "return"
        ? `Could you review ${resource ? "a small work sample" : "my project outline"} and help me choose ${focus ? `one next step for ${focus}` : "one practical next step"}?`
        : `Could you ${focus ? `suggest one small exercise for ${focus}` : "review my project scope"} and tell me what to bring back for feedback?`;
  return `Hi ${firstName}, ${context} ${target}${strengths}${task} ${ask}`;
}
