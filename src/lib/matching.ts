import { catalog, domainLabel, getSkillLabel } from "./data";
import type {
  CatalogItem,
  Coverage,
  LearnerState,
  PathStep,
  PersonMatch,
  Profile,
} from "./types";

// Deliberately small vocabulary: aliases never turn a broad skill into a narrower one.
const aliases: Record<string, string> = {
  "python-basics": "python",
  "beginner-python": "python",
  "git-basics": "git",
  "technical-communication": "communication",
  "numpy-basics": "numpy",
  "pandas-basics": "pandas",
  "machine-learning-foundations": "ml-foundations",
  "ml-basics": "ml-foundations",
  "small-ml-project": "ml-project",
  "c-programming-basics": "c-basics",
  "circuit-basics": "circuits",
  "reading-sensors": "sensors",
  "small-embedded-project": "embedded-project",
};

function canonicalSkill(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
  return aliases[normalized] ?? normalized;
}

function uniqueSkills(values: string[]): string[] {
  return [...new Set(values.map(canonicalSkill).filter(Boolean))];
}

export function getCoverage(
  confirmedSkills: string[],
  requirements: string[],
): Coverage {
  const known = new Set(uniqueSkills(confirmedSkills));
  const required = uniqueSkills(requirements);
  return {
    met: required.filter((skill) => known.has(skill)),
    missing: required.filter((skill) => !known.has(skill)),
    total: required.length,
  };
}

function selectedGoal(
  state: LearnerState,
  item?: CatalogItem,
): CatalogItem | undefined {
  return item ?? catalog.find((candidate) => candidate.id === state.goal_id);
}

export function matchPeople(
  profiles: Profile[],
  state: LearnerState,
  item?: CatalogItem,
  role?: "mentor" | "peer",
): PersonMatch[] {
  const goal = selectedGoal(state, item);
  const domains = goal ? [goal.domain] : state.interests;
  const known = uniqueSkills(state.confirmed_skills);
  const coverage = getCoverage(known, goal?.requirements ?? []);
  const relevant = uniqueSkills(
    goal?.requirements.length ? goal.requirements : (goal?.skills ?? []),
  );

  return profiles
    .flatMap((person) => {
      if (
        person.id === state.user_id ||
        !person.discoverable ||
        !person.open_to_requests
      )
        return [];
      if (!domains.includes(person.domain)) return [];
      if (state.online_only && !person.support_modes.includes("online"))
        return [];
      if (
        role === "mentor" &&
        person.role !== "mentor" &&
        person.role !== "both"
      )
        return [];
      if (
        role === "peer" &&
        person.role !== "learner" &&
        person.role !== "both"
      )
        return [];

      const personSkills = uniqueSkills(person.skills);
      const supportedGaps = coverage.missing.filter((skill) =>
        personSkills.includes(skill),
      );
      const relevantSkills = relevant.filter((skill) =>
        personSkills.includes(skill),
      );
      const sharedSkills = known.filter((skill) =>
        personSkills.includes(skill),
      );
      const isMentor =
        role === "mentor" || (role !== "peer" && person.role !== "learner");
      if (
        isMentor &&
        (relevant.length
          ? relevantSkills.length === 0
          : personSkills.length === 0)
      )
        return [];

      const reasons: string[] = [];
      if (isMentor && supportedGaps.length) {
        reasons.push(
          `Can help with ${supportedGaps.map(getSkillLabel).join(", ")}, which your profile does not yet list.`,
        );
      } else if (isMentor && relevantSkills.length) {
        reasons.push(
          `Offers skills relevant to this goal: ${relevantSkills.map(getSkillLabel).join(", ")}.`,
        );
      } else if (sharedSkills.length) {
        reasons.push(
          `You both list ${sharedSkills.map(getSkillLabel).join(", ")}.`,
        );
      }
      reasons.push(`Shares your ${domainLabel(person.domain)} interest.`);
      if (person.support_modes.includes("online"))
        reasons.push("Open to online connections.");
      else reasons.push("Offers in-person connections.");

      return [
        {
          person,
          reasons,
          sharedSkills,
          gapCount: supportedGaps.length,
          relevantCount: relevantSkills.length,
        },
      ];
    })
    .sort(
      (a, b) =>
        b.gapCount - a.gapCount ||
        b.relevantCount - a.relevantCount ||
        b.sharedSkills.length - a.sharedSkills.length ||
        a.person.id.localeCompare(b.person.id),
    )
    .map(({ person, reasons, sharedSkills }) => ({
      person,
      reasons,
      sharedSkills,
    }));
}

export function getRecommendedItems(state: LearnerState): CatalogItem[] {
  const goal = selectedGoal(state);
  const domains = state.interests.length
    ? state.interests
    : goal
      ? [goal.domain]
      : [];
  const gaps = goal
    ? getCoverage(state.confirmed_skills, goal.requirements).missing
    : [];
  const relevance = (item: CatalogItem) =>
    uniqueSkills(item.skills).filter((skill) => gaps.includes(skill)).length;
  return catalog
    .filter(
      (item) =>
        (!domains.length || domains.includes(item.domain)) &&
        (!state.online_only || item.format === "online"),
    )
    .sort((a, b) => relevance(b) - relevance(a) || a.id.localeCompare(b.id));
}

export function getPathSteps(
  state: LearnerState,
  item: CatalogItem,
): PathStep[] {
  const missing = getCoverage(
    state.confirmed_skills,
    item.requirements,
  ).missing;
  if (!missing.length) {
    return [
      {
        id: `${item.id}-review`,
        title: "Choose your next action",
        gapIds: [],
        resources: [],
        description: item.requirements.length
          ? "Your self-reported profile covers these listed requirements. Ask a mentor or peer for feedback, then review the opportunity details. This is not an eligibility assessment."
          : "This listing has no specified skill requirements. Review its details and ask a relevant mentor or peer what to do next.",
      },
    ];
  }

  // Catalog order is curated from foundations to practice; it is not an optimal-route claim.
  const resources = catalog.filter(
    (entry) =>
      entry.kind === "resource" &&
      entry.domain === item.domain &&
      (!state.online_only || entry.format === "online") &&
      entry.skills.some((skill) => missing.includes(canonicalSkill(skill))),
  );
  const practiceIds = new Set(["ml-project", "embedded-project"]);
  const foundational = resources.filter(
    (resource) => !resource.skills.some((skill) => practiceIds.has(skill)),
  );
  const practice = resources.filter((resource) =>
    resource.skills.some((skill) => practiceIds.has(skill)),
  );
  const coveredGaps = (entries: CatalogItem[]) =>
    missing.filter((gap) =>
      entries.some((entry) => uniqueSkills(entry.skills).includes(gap)),
    );
  const steps: PathStep[] = [];
  if (foundational.length)
    steps.push({
      id: `${item.id}-foundations`,
      title: "Build the foundations",
      gapIds: coveredGaps(foundational),
      resources: foundational,
      description:
        "Work through these resources in order. Check their prerequisites and ask a peer to discuss an example with you.",
    });
  if (practice.length)
    steps.push({
      id: `${item.id}-practice`,
      title: "Try a small project",
      gapIds: coveredGaps(practice),
      resources: practice,
      description:
        "Use a practice brief to put the ideas together. Completing an exercise does not automatically change your confirmed skills.",
    });
  const unresolved = missing.filter(
    (gap) => !coveredGaps(resources).includes(gap),
  );
  if (unresolved.length)
    steps.unshift({
      id: `${item.id}-unresolved`,
      title: "Find support for the remaining gaps",
      gapIds: unresolved,
      resources: [],
      description: `No matching resource is listed here for ${unresolved.map(getSkillLabel).join(", ")}. Ask a relevant person for guidance; these gaps remain unresolved.`,
    });
  steps.push({
    id: `${item.id}-connect`,
    title: "Ask for focused feedback",
    gapIds: [],
    resources: [],
    description:
      "Choose a mentor or peer below. Explain your goal, what you have tried, and one specific thing you would like help with.",
  });
  return steps;
}
