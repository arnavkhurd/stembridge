import { describe, expect, it } from "vitest";
import { catalog, sampleProfiles } from "./data";
import { catalogMatchesSearch, personMatchesSearch } from "./discovery";

describe("discovery search", () => {
  it("accepts Marathi and mixed-language queries without changing catalog identities", () => {
    const project = catalog.find((item) => item.id === "first-ml-project")!;
    expect(catalogMatchesSearch(project, "डेटा Python")).toBe(true);
    expect(catalogMatchesSearch(project, "प्रकल्प")).toBe(true);
    expect(catalogMatchesSearch(project, "रोबोटिक्स")).toBe(false);
    expect(project.id).toBe("first-ml-project");
  });

  it("finds opted-in member data by Marathi domain and role vocabulary", () => {
    const mentor = { ...sampleProfiles[0], role: "mentor" as const };
    expect(personMatchesSearch(mentor, "मार्गदर्शक डेटा")).toBe(true);
    expect(personMatchesSearch(mentor, "रोबोटिक्स")).toBe(false);
  });
  it("finds an opportunity by a required skill, not just its title", () => {
    const project = catalog.find((item) => item.id === "first-ml-project")!;
    expect(catalogMatchesSearch(project, "pandas")).toBe(true);
    expect(catalogMatchesSearch(project, "sensors")).toBe(false);
  });

  it("understands ML and machine learning as the same search and requires every term", () => {
    const project = catalog.find((item) => item.id === "first-ml-project")!;
    expect(catalogMatchesSearch(project, "  MACHINE   LEARNING  ")).toBe(true);
    expect(catalogMatchesSearch(project, "ML arduino")).toBe(false);
    expect(catalogMatchesSearch(project, " ")).toBe(true);
  });

  it("finds a member by skills or help offered and tolerates accents", () => {
    const person = {
      ...sampleProfiles[0],
      display_name: "Ánanya Rao",
      help_topics: ["Project feedback"],
    };
    expect(personMatchesSearch(person, "ananya feedback")).toBe(true);
    expect(personMatchesSearch(person, "numpy")).toBe(true);
    expect(personMatchesSearch(person, "nonexistent topic")).toBe(false);
  });

  it("never searches identifiers or extra private fields", () => {
    const person = {
      ...sampleProfiles[0],
      id: "privateidentifier",
      email: "privateemail@example.com",
    };
    expect(personMatchesSearch(person, "privateidentifier")).toBe(false);
    expect(personMatchesSearch(person, "privateemail")).toBe(false);
  });
});
