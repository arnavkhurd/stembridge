import { describe, expect, it } from "vitest";
import { catalog, sampleProfiles } from "./data";
import { catalogMatchesSearch, personMatchesSearch } from "./discovery";

describe("discovery search", () => {
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
