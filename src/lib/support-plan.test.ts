import { describe, expect, it } from "vitest";
import { catalog, sampleLearners, sampleProfiles } from "./data";
import { buildSupportPlan } from "./support-plan";

const goal = catalog.find((item) => item.id === "first-ml-project")!;
const learner = sampleLearners[0].state;
const mentor = {
  ...sampleProfiles[0],
  id: "10000000-0000-0000-0000-000000000001",
  is_demo: false,
};
const peer = {
  ...sampleProfiles.find(
    (person) => person.role === "learner" && person.domain === "data-ai",
  )!,
  id: "10000000-0000-0000-0000-000000000002",
  is_demo: false,
};

describe("first-step support planner", () => {
  it("changes the action, recipient role and request for a project partner", () => {
    const start = buildSupportPlan("start", learner, goal, [mentor, peer]);
    const partner = buildSupportPlan("partner", learner, goal, [mentor, peer]);
    expect(start.match?.person.id).toBe(mentor.id);
    expect(partner.match?.person.id).toBe(peer.id);
    expect(start.helpType).toBe("mentorship");
    expect(partner.helpType).toBe("collaboration");
    expect(start.action).not.toEqual(partner.action);
    expect(partner.draft).toContain("one task each");
  });

  it("builds a returner's plan without resetting or mutating confirmed skills", () => {
    const before = structuredClone(learner);
    const result = buildSupportPlan("return", learner, goal, [mentor]);
    expect(result.draft).toContain("returning to STEM");
    expect(result.draft).toContain("Python basics");
    expect(result.action.title).toBe("Make a small work sample");
    expect(result.focusSkill).toBe("numpy");
    expect(learner).toEqual(before);
  });

  it("selects a resource for the first gap only when its prerequisites are covered", () => {
    const result = buildSupportPlan("start", learner, goal, [mentor]);
    expect(result.resource?.skills).toContain("numpy");
    expect(result.resourceStatus).toBe("ready");
    const earlierGap = buildSupportPlan(
      "start",
      { ...learner, confirmed_skills: [] },
      goal,
      [mentor],
    );
    expect(earlierGap.focusSkill).toBe("python");
    expect(earlierGap.resource).toBeNull();
    expect(earlierGap.resourceStatus).toBe("missing");
    const advanced = { ...result.resource!, requirements: ["ml-foundations"] };
    const blocked = buildSupportPlan("start", learner, goal, [mentor], {
      resources: [advanced],
    });
    expect(blocked.resource).toBeNull();
    expect(blocked.resourceStatus).toBe("prerequisites");
  });

  it("excludes hidden, closed, self and offline people while preserving an honest fallback", () => {
    const people = [
      { ...mentor, discoverable: false },
      { ...mentor, open_to_requests: false },
      { ...mentor, id: learner.user_id },
      { ...mentor, support_modes: ["in-person" as const] },
    ];
    const result = buildSupportPlan(
      "start",
      { ...learner, online_only: true },
      goal,
      people,
    );
    expect(result.match).toBeNull();
    expect(result.community.url).toBe("https://www.wiml.org/");
    expect(
      buildSupportPlan(
        "start",
        { ...learner, online_only: false },
        goal,
        people,
      ).match?.person.support_modes,
    ).toEqual(["in-person"]);
  });

  it("never presents sample people as live recipients, and prefers real members in preview", () => {
    expect(
      buildSupportPlan("start", learner, goal, sampleProfiles).match,
    ).toBeNull();
    const preview = buildSupportPlan("start", learner, goal, sampleProfiles, {
      includeSamples: true,
    });
    expect(preview.sampleMatch).toBe(true);
    const mixed = buildSupportPlan(
      "start",
      learner,
      goal,
      [...sampleProfiles, mentor],
      { includeSamples: true },
    );
    expect(mixed.match?.person.id).toBe(mentor.id);
    expect(mixed.sampleMatch).toBe(false);
  });

  it("does not invent a learning deficit once every listed requirement is confirmed", () => {
    const result = buildSupportPlan(
      "return",
      { ...learner, confirmed_skills: goal.requirements },
      goal,
      [mentor],
    );
    expect(result.focusSkill).toBeNull();
    expect(result.resourceStatus).toBe("not-needed");
    expect(result.resource).toBeNull();
    expect(result.action.description).toContain("skills you already have");
  });
});
