import { describe, expect, it } from "vitest";
import { offlineLessons } from "./offline-lessons";
import { offlineMarathi, offlineUiMarathi } from "./offline-marathi";

describe("Marathi offline learning content", () => {
  it("covers all eight exercises and every authored field without changing lesson identities", () => {
    expect(Object.keys(offlineMarathi).sort()).toEqual(
      offlineLessons.map((lesson) => lesson.id).sort(),
    );
    expect(offlineLessons).toHaveLength(8);
    for (const lesson of offlineLessons) {
      const translated = offlineMarathi[lesson.id];
      expect(Object.keys(translated).sort()).toEqual(
        ["title", "summary", "steps", "check", "prompt"].sort(),
      );
      expect(translated.steps).toHaveLength(lesson.steps.length);
      for (const text of [
        translated.title,
        translated.summary,
        ...translated.steps,
        translated.check,
        translated.prompt,
      ]) {
        expect(text.trim().length).toBeGreaterThan(8);
        expect(text).toMatch(/[\u0900-\u097f]/);
      }
    }
  });

  it("preserves every numerical example and answer", () => {
    const numerals = (text: string) => text.match(/\d+(?:\.\d+)?/g) ?? [];
    for (const lesson of offlineLessons) {
      const translated = offlineMarathi[lesson.id];
      expect(numerals(translated.steps.join(" "))).toEqual(
        numerals(lesson.steps.join(" ")),
      );
      expect(numerals(translated.check)).toEqual(numerals(lesson.check));
    }
  });

  it("provides Marathi reading controls, reversible notebook actions and correct count word order", () => {
    for (const key of [
      "Reading language",
      "Download my notes",
      "Check your thinking",
      "Hide explanation",
      "I finished this exercise",
      "Yes, clear my notes",
      "Keep notes",
      "Clear this notebook",
    ]) {
      expect(offlineUiMarathi[key]).toMatch(/[\u0900-\u097f]/);
    }
    expect(offlineUiMarathi["{completed} of {total} exercises completed"]).toBe(
      "{total} पैकी {completed} सराव पूर्ण",
    );
  });
});
