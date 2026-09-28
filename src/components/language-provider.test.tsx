// @vitest-environment happy-dom
import { act, createElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider, useLanguage } from "./language-provider";
import { LANGUAGE_KEY, LEGACY_LANGUAGE_KEY } from "@/lib/i18n";

function Probe() {
  const { language, setLanguage, t } = useLanguage();
  const [draft, setDraft] = useState("My own question: मला मदत हवी आहे.");
  return createElement(
    "div",
    { lang: language },
    createElement("p", null, t("My Hub")),
    createElement("input", {
      value: draft,
      onChange: (event) => setDraft(event.target.value),
    }),
    createElement(
      "button",
      { onClick: () => setLanguage(language === "en" ? "mr" : "en") },
      "Switch",
    ),
  );
}
let host: HTMLDivElement;
let root: Root;
const render = () =>
  act(async () =>
    root.render(createElement(LanguageProvider, null, createElement(Probe))),
  );
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.clear();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  localStorage.clear();
  document.documentElement.lang = "en";
});
describe("shared website language", () => {
  it("migrates the existing learning-language choice and preserves a mounted draft across both languages", async () => {
    localStorage.setItem(LEGACY_LANGUAGE_KEY, "mr");
    await render();
    expect(document.documentElement.lang).toBe("mr");
    expect(host.textContent).toContain("माझा डॅशबोर्ड");
    const input = host.querySelector("input")!;
    const draft = input.value;
    await act(async () => host.querySelector("button")!.click());
    expect(host.textContent).toContain("My Hub");
    expect(host.querySelector("input")).toBe(input);
    expect(input.value).toBe(draft);
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe("en");
    await act(async () => host.querySelector("button")!.click());
    expect(input.value).toBe(draft);
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe("mr");
  });
  it("keeps switching when browser storage rejects preference writes", async () => {
    await render();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    await act(async () => host.querySelector("button")!.click());
    expect(document.documentElement.lang).toBe("mr");
    expect(host.textContent).toContain("माझा डॅशबोर्ड");
    expect(host.querySelector("input")!.value).toContain("मला मदत हवी आहे.");
  });
  it("uses English for an invalid preference and responds to another tab's saved language", async () => {
    localStorage.setItem(LANGUAGE_KEY, "unknown");
    await render();
    expect(document.documentElement.lang).toBe("en");
    await act(async () => {
      localStorage.setItem(LANGUAGE_KEY, "mr");
      window.dispatchEvent(
        new StorageEvent("storage", { key: LANGUAGE_KEY, newValue: "mr" }),
      );
    });
    expect(document.documentElement.lang).toBe("mr");
    expect(host.querySelector("input")!.value).toBe(
      "My own question: मला मदत हवी आहे.",
    );
  });
});
