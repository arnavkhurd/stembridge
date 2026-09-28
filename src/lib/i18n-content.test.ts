import { describe, expect, it } from "vitest";
import { translate } from "./i18n";
import { translateAuthoredText } from "./i18n-content";

const t = (key: string, values?: Record<string, string | number>) =>
  translate("mr", key, values);

describe("authored copy localization", () => {
  it("matches the complete mentor explanation before the compact template", () => {
    const result = translateAuthoredText(
      "Can help with NumPy basics, pandas basics, which your profile does not yet list.",
      t,
    );
    expect(result).toBe(
      t("Can help with {skills}, which your profile does not yet list.", {
        skills: `${t("NumPy basics")}, ${t("pandas basics")}`,
      }),
    );
    expect(result).not.toContain("which your profile");
    expect(result).not.toContain("basics");
  });

  it("still translates compact card reasons and all their skill labels", () => {
    expect(
      translateAuthoredText("Can help with NumPy basics, pandas basics.", t),
    ).toBe(
      t("Can help with {skills}.", {
        skills: `${t("NumPy basics")}, ${t("pandas basics")}`,
      }),
    );
  });

  it("preserves both original English forms when English is selected", () => {
    const english = (key: string, values?: Record<string, string | number>) =>
      translate("en", key, values);
    for (const source of [
      "Can help with NumPy basics, pandas basics.",
      "Can help with NumPy basics, pandas basics, which your profile does not yet list.",
    ]) {
      expect(translateAuthoredText(source, english)).toBe(source);
    }
  });
});
