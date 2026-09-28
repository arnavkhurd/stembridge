// @vitest-environment happy-dom
import { act, createElement, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sampleLearners, sampleProfiles } from "@/lib/data";
import type { ConnectionRequest, Profile } from "@/lib/types";
import type { useWorkspace } from "./workspace-provider";

const session = vi.hoisted(() => ({ workspace: null as unknown }));
vi.mock("@/components/workspace-provider", () => ({
  useWorkspace: () => session.workspace,
}));

// Exercise the real cards and forms without portal/focus behavior.
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

type Workspace = ReturnType<typeof useWorkspace>;
let host: HTMLDivElement;
let root: Root;

function workspaceFor(owner: "me" | "saransh" = "me"): Workspace {
  const people: Profile[] = [
    {
      ...sampleProfiles[0],
      id: "me",
      display_name: "Me",
      role: "learner" as const,
    },
    { ...sampleProfiles[0], id: "saransh", display_name: "Saransh" },
    {
      ...sampleProfiles[0],
      id: "khushi",
      display_name: "Khushi",
      role: "learner" as const,
    },
  ].map((person) => ({ ...person, is_demo: false }));
  const accepted: ConnectionRequest = {
    id: "accepted-request",
    sender_id: "me",
    recipient_id: "saransh",
    sender_name: "Me",
    recipient_name: "Saransh",
    opportunity_id: "first-ml-project",
    help_type: "mentorship",
    message: "Please help me review my project.",
    status: "accepted",
    next_step: "Review the project together.",
    created_at: "2026-09-28T08:00:00.000Z",
    updated_at: "2026-09-28T08:05:00.000Z",
  };
  return {
    ready: true,
    configured: true,
    user: { id: owner },
    preview: false,
    offline: false,
    offlineSnapshot: false,
    snapshotSavedAt: null,
    profile: people.find((person) => person.id === owner)!,
    learner: { ...sampleLearners[0].state, user_id: owner },
    people,
    memberships: people.map((person) => ({
      user_id: person.id,
      community_id: "data-ai",
    })),
    requests: [accepted],
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

function memberNames() {
  return [...host.querySelectorAll(".member-grid .person-card h3")].map(
    (heading) => heading.textContent,
  );
}

function buttonNamed(name: string, container: ParentNode = host) {
  const button = [
    ...container.querySelectorAll<HTMLButtonElement>("button"),
  ].find((element) => element.textContent?.trim() === name);
  if (!button) throw new Error(`Button not found: ${name}`);
  return button;
}

async function renderWorkspace(workspace: Workspace) {
  session.workspace = workspace;
  await act(async () => root.render(createElement(StemBridge)));
}

async function searchFor(value: string) {
  const input = host.querySelector<HTMLInputElement>("#people-search")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(() => {
  localStorage.clear();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  window.history.replaceState({}, "", "/?view=communities");
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

describe("own community profile visibility", () => {
  it("shows all three joined profiles to either participant after a request is accepted", async () => {
    await renderWorkspace(workspaceFor());
    expect(memberNames().sort()).toEqual(["Khushi", "Me", "Saransh"]);
    expect(host.querySelectorAll(".person-card")).toHaveLength(3);
    const ownCard = buttonNamed("Me").closest(".person-card")!;
    expect(ownCard.textContent).toContain("Your profile");
    expect(buttonNamed("Edit profile", ownCard)).toBeDefined();

    await renderWorkspace(workspaceFor("saransh"));
    expect(memberNames().sort()).toEqual(["Khushi", "Me", "Saransh"]);
    expect(
      buttonNamed("Saransh").closest(".person-card")?.textContent,
    ).toContain("Your profile");
    expect(
      buttonNamed("Me").closest(".person-card")?.textContent,
    ).not.toContain("Your profile");
  });

  it("opens the owner's editor from their community card without a self-request", async () => {
    const workspace = workspaceFor();
    await renderWorkspace(workspace);
    const ownCard = buttonNamed("Me").closest(".person-card")!;
    await act(async () => buttonNamed("Edit profile", ownCard).click());

    expect(
      host.querySelector('[role="dialog"]')?.getAttribute("aria-label"),
    ).toBe("Your profile");
    expect(host.querySelector<HTMLInputElement>("#profile-name")?.value).toBe(
      "Me",
    );
    expect(host.querySelector("#request-message")).toBeNull();
    expect(workspace.sendRequest).not.toHaveBeenCalled();
  });

  it("keeps the owner out of help recommendations", async () => {
    window.history.replaceState({}, "", "/?view=hub");
    await renderWorkspace(workspaceFor());
    const recommendations = host.querySelector(".hub-mentors")!;
    const names = [...recommendations.querySelectorAll(".person-card h3")].map(
      (heading) => heading.textContent,
    );
    expect(names.sort()).toEqual(["Khushi", "Saransh"]);
  });

  it.each(["unjoined", "hidden"] as const)(
    "does not put an %s owner in the public community list",
    async (state) => {
      const workspace = workspaceFor();
      if (state === "unjoined") {
        workspace.memberships = workspace.memberships.filter(
          (membership) => membership.user_id !== "me",
        );
      } else {
        workspace.profile = { ...workspace.profile!, discoverable: false };
        workspace.people = workspace.people.filter(
          (person) => person.id !== "me",
        );
      }
      await renderWorkspace(workspace);
      expect(memberNames().sort()).toEqual(["Khushi", "Saransh"]);
    },
  );

  it("applies the selected role and search filters to the owner's card", async () => {
    await renderWorkspace(workspaceFor());
    const roleFilter = host.querySelector(
      '[aria-label="Filter community people"]',
    )!;
    await act(async () => buttonNamed("Mentors", roleFilter).click());
    expect(memberNames()).toEqual(["Saransh"]);

    await act(async () => buttonNamed("Peers", roleFilter).click());
    expect(memberNames().sort()).toEqual(["Khushi", "Me"]);
    await searchFor("Khushi");
    expect(memberNames()).toEqual(["Khushi"]);
    await searchFor("");
    expect(memberNames().sort()).toEqual(["Khushi", "Me"]);
  });

  it("keeps a public owner's card visible when they stop accepting requests", async () => {
    const workspace = workspaceFor();
    workspace.profile = { ...workspace.profile!, open_to_requests: false };
    workspace.people = workspace.people.map((person) =>
      person.id === "me" ? workspace.profile! : person,
    );
    await renderWorkspace(workspace);
    expect(memberNames().sort()).toEqual(["Khushi", "Me", "Saransh"]);
    expect(
      buttonNamed("Edit profile", buttonNamed("Me").closest(".person-card")!),
    ).toBeDefined();
  });

  it("hides an in-person owner's card when online-only support is selected", async () => {
    const workspace = workspaceFor();
    workspace.profile = { ...workspace.profile!, support_modes: ["in-person"] };
    workspace.people = workspace.people.map((person) =>
      person.id === "me" ? workspace.profile! : person,
    );
    await renderWorkspace(workspace);
    expect(memberNames().sort()).toEqual(["Khushi", "Saransh"]);

    await renderWorkspace({
      ...workspace,
      learner: { ...workspace.learner, online_only: false },
    });
    expect(memberNames().sort()).toEqual(["Khushi", "Me", "Saransh"]);
  });
});
