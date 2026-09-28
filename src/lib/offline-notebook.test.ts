// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { catalog } from "./data";
import { offlineLessons } from "./offline-lessons";
import {
  emptyNotebook,
  readOfflineNotebook,
  saveNotebookEntry,
  clearOfflineNotebook,
  notebookText,
  preserveNotebookForOwner,
} from "./offline-notebook";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
describe("offline learning notebook", () => {
  it("provides an original exercise for every resource with no network dependency", () => {
    expect(new Set(offlineLessons.map((l) => l.id)).size).toBe(8);
    expect(offlineLessons.map((l) => l.id).sort()).toEqual(
      catalog
        .filter((i) => i.kind === "resource")
        .map((i) => i.id)
        .sort(),
    );
    expect(
      offlineLessons.every(
        (l) =>
          l.steps.length >= 3 && l.check.length > 30 && l.prompt.length > 20,
      ),
    ).toBe(true);
  });
  it("persists notes and completion across reload without touching confirmed skills", () => {
    const first = saveNotebookEntry(emptyNotebook("a"), "numpy-beginners", {
      notes: "A shape of (2, 3).",
    });
    const completed = saveNotebookEntry(first, "numpy-beginners", {
      completed: true,
    });
    expect(readOfflineNotebook("a")).toEqual(completed);
    expect(completed.entries["numpy-beginners"].notes).toBe(
      "A shape of (2, 3).",
    );
    expect(completed).not.toHaveProperty("confirmed_skills");
  });
  it("locks another account's notes and preserves work for reauthentication", () => {
    saveNotebookEntry(emptyNotebook("a"), "numpy-beginners", {
      notes: "Private draft",
    });
    expect(readOfflineNotebook("b").entries).toEqual({});
    expect(readOfflineNotebook("b").locked).toBe(true);
    expect(() =>
      saveNotebookEntry(readOfflineNotebook("b"), "numpy-beginners", {
        notes: "overwrite",
      }),
    ).toThrow("Sign in to the same account");
    preserveNotebookForOwner("a");
    expect(readOfflineNotebook("a").entries["numpy-beginners"].notes).toBe(
      "Private draft",
    );
    preserveNotebookForOwner("b");
    expect(readOfflineNotebook("a").entries).toEqual({});
  });
  it("rejects corrupt, unexpected or oversized stored entries", () => {
    for (const raw of [
      "broken",
      JSON.stringify({
        version: 1,
        ownerId: "a",
        entries: { bad: { notes: "hi", completed: false } },
        updatedAt: null,
      }),
      JSON.stringify({
        version: 1,
        ownerId: "a",
        entries: {
          "numpy-beginners": { notes: "x".repeat(5001), completed: false },
        },
        updatedAt: null,
      }),
    ]) {
      localStorage.setItem("stembridge.notebook.v1", raw);
      expect(readOfflineNotebook("a").entries).toEqual({});
    }
  });
  it("reports storage failure and preserves the last saved record", () => {
    const saved = saveNotebookEntry(emptyNotebook("a"), "numpy-beginners", {
      notes: "saved",
    });
    vi.spyOn(localStorage, "setItem").mockImplementationOnce(() => {
      throw new Error("full");
    });
    expect(() =>
      saveNotebookEntry(saved, "numpy-beginners", { notes: "unsaved" }),
    ).toThrow("could not save");
    expect(readOfflineNotebook("a").entries["numpy-beginners"].notes).toBe(
      "saved",
    );
  });
  it("exports Unicode notes as plain text without account IDs and can clear the notebook", () => {
    const saved = saveNotebookEntry(
      emptyNotebook("private-user-id"),
      "numpy-beginners",
      { notes: "मेरे नोट्स", completed: true },
    );
    expect(notebookText(saved)).toContain("मेरे नोट्स");
    expect(notebookText(saved)).not.toContain("private-user-id");
    clearOfflineNotebook();
    expect(readOfflineNotebook("private-user-id").entries).toEqual({});
  });
  it("reports a failed clear without pretending stored work was deleted", () => {
    saveNotebookEntry(emptyNotebook("a"), "numpy-beginners", {
      notes: "Keep until actually removed",
    });
    vi.spyOn(localStorage, "removeItem").mockImplementationOnce(() => {
      throw new Error("blocked");
    });
    expect(clearOfflineNotebook()).toBe(false);
    expect(readOfflineNotebook("a").entries["numpy-beginners"].notes).toBe(
      "Keep until actually removed",
    );
    expect(clearOfflineNotebook()).toBe(true);
    expect(readOfflineNotebook("a").entries).toEqual({});
  });
});
