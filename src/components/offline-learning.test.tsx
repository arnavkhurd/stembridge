// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { catalog, sampleLearners } from "@/lib/data";
import {
  emptyNotebook,
  readOfflineNotebook,
  saveNotebookEntry,
} from "@/lib/offline-notebook";
import { offlineMarathi, offlineUiMarathi } from "@/lib/offline-marathi";

const session = vi.hoisted(() => ({ workspace: null as unknown }));
vi.mock("./workspace-provider", () => ({
  useWorkspace: () => session.workspace,
}));
vi.mock("./offline-provider", () => ({
  useOffline: () => ({
    offline: false,
    ready: true,
    preparing: false,
    error: null,
    prepare: async () => {},
  }),
}));
import { OfflineLearning } from "./offline-learning";
import { LanguageProvider } from "./language-provider";

const goal = catalog.find((item) => item.id === "first-ml-project")!;
let host: HTMLDivElement;
let root: Root;
function button(text: string) {
  const result = [...host.querySelectorAll("button")].find(
    (item) => item.textContent?.trim() === text,
  );
  if (!result) throw new Error(`Missing button: ${text}`);
  return result;
}
function render() {
  return act(async () =>
    root.render(
      createElement(
        LanguageProvider,
        null,
        createElement(OfflineLearning, {
          goal,
          initialLesson: "pandas-introduction",
        }),
      ),
    ),
  );
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.clear();
  session.workspace = {
    ready: true,
    user: null,
    learner: sampleLearners[0].state,
    snapshotSavedAt: null,
  };
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("bilingual offline learning", () => {
  it("keeps expired-account notes private and requires explicit clearing before a new notebook", async () => {
    saveNotebookEntry(emptyNotebook("account-a"), "pandas-introduction", {
      notes: "Private work to resume later",
    });
    await render();
    expect(host.textContent).toContain(
      "Your account notes are kept on this device",
    );
    expect(host.textContent).not.toContain("Private work to resume later");
    expect(host.querySelector<HTMLTextAreaElement>("textarea")?.disabled).toBe(
      true,
    );
    expect(button("Download my notes").disabled).toBe(true);
    await act(async () => button("Clear this notebook").click());
    expect(
      readOfflineNotebook("account-a").entries["pandas-introduction"].notes,
    ).toBe("Private work to resume later");
    await act(async () => button("Keep notes").click());
    expect(host.querySelector<HTMLTextAreaElement>("textarea")?.disabled).toBe(
      true,
    );
    await act(async () => button("Clear this notebook").click());
    await act(async () => button("Yes, clear my notes").click());
    expect(host.querySelector<HTMLTextAreaElement>("textarea")?.disabled).toBe(
      false,
    );
    expect(readOfflineNotebook("account-a").entries).toEqual({});
  });
  it("switches authored content while retaining the selected lesson, exact notes and completion", async () => {
    const notes =
      "My own words: माझ्या स्वतःच्या नोंदी. Keep Noor's missing minutes unknown.";
    saveNotebookEntry(emptyNotebook("preview"), "pandas-introduction", {
      notes,
    });
    await render();
    const checkbox = host.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    )!;
    await act(async () => checkbox.click());
    const before = JSON.stringify(readOfflineNotebook("preview"));
    await act(async () => button("मराठी").click());
    expect(host.firstElementChild?.getAttribute("lang")).toBe("mr");
    expect(host.querySelector("article h2")?.textContent).toBe(
      offlineMarathi["pandas-introduction"].title,
    );
    expect(host.querySelector<HTMLTextAreaElement>("textarea")?.value).toBe(
      notes,
    );
    expect(
      host.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked,
    ).toBe(true);
    expect(host.textContent).toContain("8 पैकी 1 सराव पूर्ण");
    expect(JSON.stringify(readOfflineNotebook("preview"))).toBe(before);
    expect(localStorage.getItem("stembridge.learning-language.v1")).toBe("mr");
    await act(async () =>
      button(offlineUiMarathi["Check your thinking"]).click(),
    );
    expect(host.textContent).toContain(
      offlineMarathi["pandas-introduction"].check,
    );
    await act(async () => button("English").click());
    expect(host.querySelector("article h2")?.textContent).toBe(
      "Clean a tiny table",
    );
    expect(host.querySelector<HTMLTextAreaElement>("textarea")?.value).toBe(
      notes,
    );
    expect(JSON.stringify(readOfflineNotebook("preview"))).toBe(before);
  });

  it("restores the saved reading language and still switches when preference storage fails", async () => {
    localStorage.setItem("stembridge.learning-language.v1", "mr");
    await render();
    expect(host.firstElementChild?.getAttribute("lang")).toBe("mr");
    expect(button("मराठी").getAttribute("aria-pressed")).toBe("true");
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    await act(async () => button("English").click());
    expect(host.firstElementChild?.getAttribute("lang")).toBe("en");
    expect(host.textContent).toContain(
      "English and Marathi work across the main website",
    );
  });

  it("claims an account snapshot is saved only when its storage timestamp exists", async () => {
    const workspace = {
      ready: true,
      user: { id: "account-a" },
      learner: sampleLearners[0].state,
      snapshotSavedAt: null as string | null,
    };
    session.workspace = workspace;
    await render();
    expect(host.textContent).toContain(
      "Your profile has not been saved for offline use on this device.",
    );
    expect(host.textContent).not.toContain(
      "A saved copy of your own profile and plan is kept",
    );
    workspace.snapshotSavedAt = "2026-09-28T09:00:00.000Z";
    await render();
    expect(host.textContent).toContain(
      "A saved copy of your own profile and plan is kept",
    );
  });
});
