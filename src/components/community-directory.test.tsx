// @vitest-environment happy-dom
import { act, createElement, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultLearnerState, sampleProfiles } from "@/lib/data";
import type { Profile } from "@/lib/types";
import type { useWorkspace } from "./workspace-provider";

const session = vi.hoisted(() => ({ workspace: null as unknown }));
vi.mock("@/components/workspace-provider", () => ({
  useWorkspace: () => session.workspace,
}));
vi.mock("@/components/ui", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/components/ui")>();
  return {
    ...original,
    // Keep the real cards and forms, replacing only the portal/focus machinery.
    Modal: ({
      open,
      title,
      children,
    }: ComponentProps<typeof original.Modal>) =>
      open
        ? createElement(
            "section",
            { role: "dialog", "aria-label": title },
            children,
          )
        : null,
  };
});

import { StemBridge } from "./stembridge";

type Workspace = ReturnType<typeof useWorkspace>;
const names = ["Arnav Khurd", "Khushi Kumari", "Saransh Raj"];
let host: HTMLDivElement;
let root: Root;

function workspaceFor(owner: number = 0): Workspace {
  const details: Pick<
    Profile,
    "display_name" | "role" | "domain" | "skills"
  >[] = [
    {
      display_name: names[0],
      role: "both",
      domain: "robotics",
      skills: [
        "git",
        "numpy",
        "ml-project",
        "arduino-basics",
        "embedded-project",
      ],
    },
    {
      display_name: names[1],
      role: "learner",
      domain: "data-ai",
      skills: ["python"],
    },
    {
      display_name: names[2],
      role: "learner",
      domain: "data-ai",
      skills: ["git", "pandas", "numpy", "circuits"],
    },
  ];
  const people: Profile[] = details.map((detail, index) => ({
    ...sampleProfiles[0],
    ...detail,
    id: `10000000-0000-4000-8000-00000000000${index + 1}`,
    support_modes: ["online"],
    discoverable: true,
    open_to_requests: true,
    is_demo: false,
  }));
  const profile = people[owner];
  return {
    ready: true,
    configured: true,
    user: { id: profile.id },
    preview: false,
    offline: false,
    offlineSnapshot: false,
    snapshotSavedAt: null,
    profile,
    learner: {
      ...defaultLearnerState(profile.id),
      confirmed_skills: profile.skills,
      interests: ["data-ai"],
      goal_id: "first-ml-project",
      online_only: true,
    },
    people,
    memberships: people.flatMap((person) =>
      (["data-ai", "robotics"] as const).map((community_id) => ({
        user_id: person.id,
        community_id,
      })),
    ),
    requests:
      owner === 1
        ? []
        : [
            {
              id: "accepted-request",
              sender_id: people[0].id,
              sender_name: people[0].display_name,
              recipient_id: people[2].id,
              recipient_name: people[2].display_name,
              opportunity_id: "first-ml-project",
              help_type: "collaboration",
              message: "Please help me review my project.",
              status: "accepted",
              next_step: "Review the project together.",
              created_at: "2026-09-28T08:00:00.000Z",
              updated_at: "2026-09-28T08:05:00.000Z",
            },
          ],
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

function button(name: string, container: ParentNode = host) {
  const found = [
    ...container.querySelectorAll<HTMLButtonElement>("button"),
  ].find((element) => element.textContent?.trim() === name);
  if (!found) throw new Error(`Button not found: ${name}`);
  return found;
}

function memberNames() {
  return [...host.querySelectorAll(".member-grid .person-card h3")]
    .map((heading) => heading.textContent)
    .sort();
}

async function renderWorkspace(workspace: Workspace) {
  session.workspace = workspace;
  await act(async () => root.render(createElement(StemBridge)));
}

async function search(value: string) {
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

describe("public community membership directory", () => {
  it.each([0, 1, 2])(
    "shows all three joined members in both circles to viewer %i and lets them edit themselves",
    async (owner) => {
      const workspace = workspaceFor(owner);
      await renderWorkspace(workspace);
      for (const circle of ["Data & AI Circle", "Robotics & Makers Circle"]) {
        await act(async () => button(circle).click());
        expect(memberNames()).toEqual(names);
        expect(
          host.querySelector(".community-detail-header")?.textContent,
        ).toContain("3 visible members");
        const ownCard = button(names[owner]).closest(".person-card")!;
        expect(ownCard.textContent).toContain("Your profile");
        expect(button("Edit profile", ownCard)).toBeDefined();
      }
      expect(
        [...host.querySelectorAll(".avatar-stack")].map(
          (stack) => stack.children.length,
        ),
      ).toEqual([3, 3]);
      await act(async () =>
        button(
          "Edit profile",
          button(names[owner]).closest(".person-card")!,
        ).click(),
      );
      expect(
        host.querySelector('[role="dialog"]')?.getAttribute("aria-label"),
      ).toBe("Your profile");
      expect(host.querySelector<HTMLInputElement>("#profile-name")?.value).toBe(
        names[owner],
      );
      expect(host.querySelector("#request-message")).toBeNull();
      expect(workspace.sendRequest).not.toHaveBeenCalled();
    },
  );

  it("keeps hidden profiles and unjoined members out of cards, avatars, and visible-member counts", async () => {
    const workspace = workspaceFor(2);
    workspace.profile = { ...workspace.profile!, discoverable: false };
    workspace.people[2] = workspace.profile;
    workspace.memberships = workspace.memberships.filter(
      (membership) =>
        !(
          membership.user_id === workspace.people[0].id &&
          membership.community_id === "robotics"
        ),
    );
    await renderWorkspace(workspace);
    expect(memberNames()).toEqual(names.slice(0, 2));
    expect(
      host.querySelector(".community-detail-header")?.textContent,
    ).toContain("2 visible members");
    const summaries = [...host.querySelectorAll(".community-members")];
    expect(summaries[0].textContent).toContain("2 visible members");
    expect(summaries[1].textContent).toContain("1 visible member");
    expect(
      summaries.map((summary) => summary.querySelectorAll(".avatar").length),
    ).toEqual([2, 1]);
    await act(async () => button("Robotics & Makers Circle").click());
    expect(memberNames()).toEqual([names[1]]);
  });

  it("lists a mentor whose skills do not match the selected goal", async () => {
    const workspace = workspaceFor(1);
    workspace.people[0] = {
      ...workspace.people[0],
      domain: "data-ai",
      role: "mentor",
      skills: ["sensors"],
    };
    await renderWorkspace(workspace);
    await act(async () =>
      button(
        "Mentors",
        host.querySelector('[aria-label="Filter community people"]')!,
      ).click(),
    );
    expect(memberNames()).toEqual([names[0]]);
  });

  it("lists public members with requests closed without allowing a new request", async () => {
    const workspace = workspaceFor(1);
    workspace.people[0] = { ...workspace.people[0], open_to_requests: false };
    await renderWorkspace(workspace);
    const memberCard = button(names[0]).closest(".person-card")!;
    await act(async () => button("View profile", memberCard).click());
    const dialog = host.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute("aria-label")).toBe(names[0]);
    expect(dialog.textContent).toContain(
      "This member is not accepting new requests right now.",
    );
    expect(dialog.textContent).not.toContain("Sample profile");
    expect(
      [...dialog.querySelectorAll("button")].map((entry) => entry.textContent),
    ).toEqual(["Close"]);
    expect(workspace.sendRequest).not.toHaveBeenCalled();
  });

  it("still applies the explicit role, search, and online filters", async () => {
    const workspace = workspaceFor(2);
    await renderWorkspace(workspace);
    const roles = host.querySelector('[aria-label="Filter community people"]')!;
    await act(async () => button("Mentors", roles).click());
    expect(memberNames()).toEqual([names[0]]);
    await act(async () => button("Peers", roles).click());
    expect(memberNames()).toEqual(names);
    await search("Khushi");
    expect(memberNames()).toEqual([names[1]]);
    await search("");
    workspace.people[0] = {
      ...workspace.people[0],
      support_modes: ["in-person"],
    };
    await renderWorkspace({ ...workspace });
    expect(memberNames()).toEqual(names.slice(1));
  });

  it("preserves self and primary-domain exclusions in Hub recommendations", async () => {
    window.history.replaceState({}, "", "/?view=hub");
    await renderWorkspace(workspaceFor(2));
    const recommendedNames = [
      ...host.querySelectorAll(".hub-mentors .person-card h3"),
    ].map((heading) => heading.textContent);
    expect(recommendedNames).toEqual([names[1]]);
  });
});
