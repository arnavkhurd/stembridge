// @vitest-environment happy-dom
import { act, createElement, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sampleLearners, sampleProfiles } from "@/lib/data";
import {
  emptyNotebook,
  readOfflineNotebook,
  saveNotebookEntry,
} from "@/lib/offline-notebook";
import type { ConnectionRequest } from "@/lib/types";
import type { useWorkspace } from "./workspace-provider";

const session = vi.hoisted(() => ({ workspace: null as unknown }));
vi.mock("@/components/workspace-provider", () => ({
  useWorkspace: () => session.workspace,
}));

// Keep the real forms and screen state; only replace the portal/focus machinery.
vi.mock("@/components/ui", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/components/ui")>();
  return {
    ...original,
    Modal: ({
      open,
      title,
      description,
      children,
    }: ComponentProps<typeof original.Modal>) =>
      open
        ? createElement(
            "section",
            { role: "dialog", "aria-label": title },
            createElement("h2", null, title),
            description && createElement("p", null, description),
            children,
          )
        : null,
  };
});

import { StemBridge } from "./stembridge";
import { LanguageProvider } from "./language-provider";
import { translate } from "@/lib/i18n";

type Workspace = ReturnType<typeof useWorkspace>;
let host: HTMLDivElement;
let root: Root;

function workspaceFor(id: string, sampleIndex: number): Workspace {
  const sample = sampleLearners[sampleIndex];
  return {
    ready: true,
    configured: true,
    user: { id },
    preview: false,
    offline: false,
    offlineSnapshot: false,
    snapshotSavedAt: null,
    profile: { ...sample.profile, id, is_demo: false },
    learner: { ...sample.state, user_id: id },
    people: [],
    memberships: [],
    requests: [],
    error: null,
    busy: false,
    signIn: vi.fn().mockResolvedValue(undefined),
    signUp: vi.fn().mockResolvedValue({ needsConfirmation: false }),
    signOut: vi.fn().mockResolvedValue(undefined),
    saveProfile: vi.fn().mockResolvedValue(undefined),
    updateLearner: vi.fn().mockResolvedValue(undefined),
    toggleSaved: vi.fn().mockResolvedValue(undefined),
    toggleMembership: vi.fn().mockResolvedValue(undefined),
    sendRequest: vi.fn().mockResolvedValue(undefined),
    respondRequest: vi.fn().mockResolvedValue(undefined),
    cancelRequest: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn().mockResolvedValue(undefined),
    loadSample: vi.fn(),
    clearError: vi.fn(),
  };
}

function buttonStartingWith(text: string): HTMLButtonElement {
  const button = [...host.querySelectorAll("button")].find((element) =>
    element.textContent?.trim().startsWith(text),
  );
  if (!button) throw new Error(`Button not found: ${text}`);
  return button;
}

beforeEach(() => {
  localStorage.clear();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  window.history.replaceState({}, "", "/?view=connections");
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

describe("account identity boundary", () => {
  it("does not erase a saved notebook while an offline page restores its account", async () => {
    window.history.replaceState({}, "", "/?view=offline");
    saveNotebookEntry(emptyNotebook("account-a"), "numpy-beginners", {
      notes: "Keep my offline work",
    });
    session.workspace = {
      ...workspaceFor("preview", 0),
      user: null,
      ready: false,
      preview: true,
    };
    await act(async () => root.render(createElement(StemBridge)));
    expect(
      readOfflineNotebook("account-a").entries["numpy-beginners"].notes,
    ).toBe("Keep my offline work");
    session.workspace = workspaceFor("account-a", 0);
    await act(async () => root.render(createElement(StemBridge)));
    expect(
      host.querySelector<HTMLTextAreaElement>("#offline-notes")?.value,
    ).toBe("Keep my offline work");
    localStorage.clear();
  });
  it("keeps a private acceptance draft during a same-user refresh but discards it on account switch", async () => {
    const accountA = workspaceFor("account-a", 0);
    const incoming: ConnectionRequest = {
      id: "private-request-a",
      sender_id: "private-sender",
      recipient_id: "account-a",
      sender_name: "Private Sender A",
      recipient_name: "Priya",
      opportunity_id: "first-ml-project",
      help_type: "mentorship",
      message: "Please help me review my private project idea.",
      status: "pending",
      next_step: null,
      created_at: "2026-09-28T08:00:00.000Z",
      updated_at: "2026-09-28T08:00:00.000Z",
    };
    accountA.requests = [incoming];
    session.workspace = accountA;
    await act(async () => root.render(createElement(StemBridge)));
    await act(async () => buttonStartingWith("Received requests").click());
    await act(async () => buttonStartingWith("Accept request").click());

    const privateDraft =
      "Private draft: review my unpublished sensor idea next Thursday.";
    const input = host.querySelector<HTMLTextAreaElement>("#next-step");
    expect(input).not.toBeNull();
    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )!.set!;
      setValue.call(input, privateDraft);
      input!.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Token refreshes and ordinary workspace rerenders must preserve the user's work.
    session.workspace = { ...accountA, user: { id: "account-a" } };
    await act(async () => root.render(createElement(StemBridge)));
    expect(host.querySelector<HTMLTextAreaElement>("#next-step")?.value).toBe(
      privateDraft,
    );
    expect(host.querySelector('[role="dialog"]')?.textContent).toContain(
      "Private Sender A",
    );

    // The provider can switch accounts after a sign-in/out event in another tab.
    const accountB = workspaceFor("account-b", 1);
    session.workspace = accountB;
    await act(async () => root.render(createElement(StemBridge)));

    expect(host.querySelector('[role="dialog"]')).toBeNull();
    expect(host.querySelector("#next-step")).toBeNull();
    expect(host.textContent).not.toContain("Private Sender A");
    expect(host.textContent).not.toContain(privateDraft);
    expect(accountA.respondRequest).not.toHaveBeenCalled();
    expect(accountB.respondRequest).not.toHaveBeenCalled();
  });
});

describe("first-step request handoff", () => {
  it("switches the plan and account interface without changing the learner's saved skills or goal", async () => {
    window.history.replaceState({}, "", "/?view=hub");
    const workspace = workspaceFor("account-a", 0);
    session.workspace = workspace;
    const before = JSON.stringify(workspace.learner);
    await act(async () =>
      root.render(
        createElement(LanguageProvider, null, createElement(StemBridge)),
      ),
    );
    await act(async () => buttonStartingWith("मराठी").click());
    expect(document.documentElement.lang).toBe("mr");
    expect(host.textContent).toContain(translate("mr", "My Hub"));
    expect(host.textContent).toContain(
      translate("mr", "Build your first ML project"),
    );
    await act(async () =>
      buttonStartingWith(translate("mr", "See my plan")).click(),
    );
    expect(host.querySelector('[role="dialog"]')?.textContent).toContain(
      translate(
        "mr",
        "Based on the skills you selected. This is not a skills test.",
      ),
    );
    expect(JSON.stringify(workspace.learner)).toBe(before);
    expect(workspace.updateLearner).not.toHaveBeenCalled();
    expect(workspace.saveProfile).not.toHaveBeenCalled();
    expect(workspace.sendRequest).not.toHaveBeenCalled();
    await act(async () => buttonStartingWith("English").click());
    expect(host.querySelector('[role="dialog"]')?.textContent).toContain(
      "Based on the skills you selected. This is not a skills test.",
    );
    expect(JSON.stringify(workspace.learner)).toBe(before);
  });
  it("keeps the edited introduction through review and sends only after explicit submit", async () => {
    window.history.replaceState({}, "", "/?view=hub");
    const workspace = workspaceFor("account-a", 0);
    const recipient = {
      ...sampleProfiles[0],
      id: "10000000-0000-0000-0000-000000000001",
      is_demo: false,
    };
    workspace.people = [recipient];
    session.workspace = workspace;
    await act(async () => root.render(createElement(StemBridge)));
    await act(async () => buttonStartingWith("Find my first step").click());
    await act(async () =>
      host.querySelector<HTMLInputElement>('input[value="return"]')!.click(),
    );
    const draft =
      "I would like feedback on one small NumPy example before choosing my next project task.";
    const input = host.querySelector<HTMLTextAreaElement>("#support-message");
    expect(input?.value).toContain("returning to STEM");
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )!.set!.call(input, draft);
      input!.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => buttonStartingWith("Review request").click());
    expect(workspace.sendRequest).not.toHaveBeenCalled();
    expect(host.querySelector("#support-message")).toBeNull();
    expect(
      host.querySelector<HTMLTextAreaElement>("#request-message")?.value,
    ).toBe(draft);
    const form = host
      .querySelector<HTMLTextAreaElement>("#request-message")!
      .closest("form")!;
    await act(async () =>
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      ),
    );
    expect(workspace.sendRequest).toHaveBeenCalledExactlyOnceWith(
      recipient.id,
      "first-ml-project",
      "mentorship",
      draft,
    );
    expect(workspace.saveProfile).not.toHaveBeenCalled();
    expect(workspace.updateLearner).not.toHaveBeenCalled();
  });
});
