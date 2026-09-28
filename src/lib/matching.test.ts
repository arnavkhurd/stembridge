import { describe, expect, it } from "vitest";
import {
  catalog,
  defaultLearnerState,
  sampleLearners,
  sampleProfiles,
  skills,
} from "./data";
import {
  getCoverage,
  getPathSteps,
  getRecommendedItems,
  matchPeople,
} from "./matching";
import type { Profile } from "./types";

const priya = sampleLearners[0].state;
const aisha = sampleLearners[1].state;
const mlGoal = catalog.find((item) => item.id === "first-ml-project")!;
const roboticsGoal = catalog.find(
  (item) => item.id === "first-embedded-project",
)!;

describe("honest requirement coverage", () => {
  it("shows Priya's three supported skills out of exactly seven", () => {
    expect(getCoverage(priya.confirmed_skills, mlGoal.requirements)).toEqual({
      met: ["python", "git", "communication"],
      missing: ["numpy", "pandas", "ml-foundations", "ml-project"],
      total: 7,
    });
  });
  it("deduplicates known aliases and requirements", () => {
    expect(
      getCoverage(
        ["Python basics", "PYTHON", "Git basics"],
        ["python", "Python basics", "git", "NumPy basics"],
      ),
    ).toEqual({ met: ["python", "git"], missing: ["numpy"], total: 3 });
  });
  it("never interprets aspirations, negations or broad skills as narrower skills", () => {
    expect(
      getCoverage(
        ["want to learn pandas", "never used NumPy", "python"],
        ["pandas", "numpy", "ml-project"],
      ).met,
    ).toEqual([]);
  });
  it("keeps unspecified requirements empty and saved items separate from competence", () => {
    expect(getCoverage([], [])).toEqual({ met: [], missing: [], total: 0 });
    const saved = {
      ...priya,
      saved_ids: ["numpy-beginners", "ml-practice-notebook"],
    };
    expect(
      getCoverage(saved.confirmed_skills, mlGoal.requirements).met,
    ).toHaveLength(3);
  });
});

describe("people recommendations", () => {
  it("actually excludes in-person-only profiles when online support is selected", () => {
    const online = matchPeople(sampleProfiles, priya, mlGoal, "mentor");
    const allModes = matchPeople(
      sampleProfiles,
      { ...priya, online_only: false },
      mlGoal,
      "mentor",
    );
    expect(online.map((match) => match.person.id)).toEqual([
      "sample-mentor-ananya",
    ]);
    expect(allModes.map((match) => match.person.id)).toContain(
      "sample-mentor-meera",
    );
    expect(online[0].reasons.join(" ")).toContain("NumPy basics");
  });
  it("filters hidden, closed, unrelated and self profiles", () => {
    const source = sampleProfiles[0];
    const blocked: Profile[] = [
      { ...source, id: "hidden", discoverable: false },
      { ...source, id: "closed", open_to_requests: false },
      { ...source, id: priya.user_id },
      { ...source, id: "other-domain", domain: "robotics" },
      { ...source, id: "unrelated-expertise", skills: ["sensors"] },
    ];
    expect(matchPeople(blocked, priya, mlGoal, "mentor")).toEqual([]);
  });
  it("finds peers through a shared interest and mentors through relevant expertise", () => {
    const peers = matchPeople(sampleProfiles, priya, mlGoal, "peer");
    expect(peers.map((match) => match.person.id)).toEqual(["sample-peer-zoya"]);
    expect(peers[0].sharedSkills).toEqual(["python", "git"]);
    expect(
      matchPeople(sampleProfiles, aisha, roboticsGoal, "mentor")[0].person.id,
    ).toBe("sample-mentor-kavya");
  });
  it("returns no invented matches and uses a stable tie-break independent of input order", () => {
    expect(matchPeople([], priya, mlGoal)).toEqual([]);
    expect(
      matchPeople(sampleProfiles, defaultLearnerState("new-user")),
    ).toEqual([]);
    const twins = ["z", "a"].map((id) => ({ ...sampleProfiles[0], id }));
    expect(
      matchPeople(twins, priya, mlGoal).map((match) => match.person.id),
    ).toEqual(["a", "z"]);
  });
  it("explains dual-role members as mentors by default while preserving explicit peer matching", () => {
    const dualRole: Profile = { ...sampleProfiles[0], role: "both" };
    const defaultMatch = matchPeople([dualRole], priya, mlGoal)[0];
    const peerMatch = matchPeople([dualRole], priya, mlGoal, "peer")[0];

    expect(defaultMatch.reasons[0]).toContain("Can help with NumPy basics");
    expect(peerMatch.reasons[0]).toContain("You both list Python basics");
    expect(peerMatch.sharedSkills).toEqual(defaultMatch.sharedSkills);

    const unrelatedExpertise = { ...dualRole, skills: ["sensors"] };
    expect(matchPeople([unrelatedExpertise], priya, mlGoal)).toEqual([]);
    expect(
      matchPeople([unrelatedExpertise], priya, mlGoal, "peer"),
    ).toHaveLength(1);
  });
});

describe("catalog and paths", () => {
  it("covers each requested catalogue category and uses only known skill IDs", () => {
    expect(catalog.filter((item) => item.kind === "competition")).toHaveLength(
      2,
    );
    expect(catalog.filter((item) => item.kind === "internship")).toHaveLength(
      2,
    );
    expect(catalog.filter((item) => item.kind === "project")).toHaveLength(2);
    const ids = new Set(skills.map((skill) => skill.id));
    expect(
      catalog.every((item) =>
        [...item.skills, ...item.requirements].every((id) => ids.has(id)),
      ),
    ).toBe(true);
    expect(new Set(catalog.map((item) => item.id)).size).toBe(catalog.length);
  });
  it("changes domain suggestions and respects the online-only constraint", () => {
    expect(
      getRecommendedItems(priya).every(
        (item) => item.domain === "data-ai" && item.format === "online",
      ),
    ).toBe(true);
    expect(
      getRecommendedItems(aisha).some(
        (item) => item.id === "makers-prototype-challenge",
      ),
    ).toBe(true);
    expect(
      getRecommendedItems({ ...aisha, online_only: true }).some(
        (item) => item.id === "makers-prototype-challenge",
      ),
    ).toBe(false);
  });
  it("links all four ML gaps to actual relevant resources and orders study before practice", () => {
    const steps = getPathSteps(priya, mlGoal);
    expect(steps.map((step) => step.id)).toEqual([
      "first-ml-project-foundations",
      "first-ml-project-practice",
      "first-ml-project-connect",
    ]);
    expect(new Set(steps.flatMap((step) => step.gapIds))).toEqual(
      new Set(["numpy", "pandas", "ml-foundations", "ml-project"]),
    );
    for (const step of steps)
      for (const resource of step.resources) {
        expect(catalog).toContain(resource);
        expect(
          resource.skills.some((skill) => step.gapIds.includes(skill)),
        ).toBe(true);
      }
  });
  it("keeps unavailable gaps explicit rather than fabricating resources", () => {
    const steps = getPathSteps({ ...priya, confirmed_skills: [] }, mlGoal);
    expect(
      steps.find((step) => step.id.endsWith("-unresolved"))?.gapIds,
    ).toContain("python");
  });
  it("does not invent gap work for a complete or unspecified requirement list", () => {
    expect(
      getPathSteps(
        { ...priya, confirmed_skills: mlGoal.requirements },
        mlGoal,
      )[0].gapIds,
    ).toEqual([]);
    expect(
      getPathSteps(priya, { ...mlGoal, requirements: [] })[0].description,
    ).toContain("no specified skill requirements");
  });
  it("keeps sample profiles and illustrative listings explicit", () => {
    expect(
      sampleProfiles.every(
        (profile) => profile.is_demo && profile.id.startsWith("sample-"),
      ),
    ).toBe(true);
    expect(
      catalog
        .filter((item) => item.kind !== "resource")
        .every((item) => item.isSample && !item.sourceUrl),
    ).toBe(true);
  });
});
