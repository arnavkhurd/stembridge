// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { sampleLearners } from "./data";
import {
  clearOfflineWorkspace,
  OFFLINE_WORKSPACE_KEY,
  readOfflineWorkspace,
  saveOfflineWorkspace,
} from "./offline-workspace";

const ownProfile = () => ({
  ...sampleLearners[0].profile,
  id: "owner-a",
  is_demo: false,
});
const ownLearner = () => ({ ...sampleLearners[0].state, user_id: "owner-a" });
beforeEach(() => localStorage.clear());

describe("private offline snapshot", () => {
  it("stores only allowed own-profile and learner fields", () => {
    saveOfflineWorkspace(
      {
        ...ownProfile(),
        access_token: "do-not-cache",
        another_person: "do-not-cache",
      } as ReturnType<typeof ownProfile>,
      {
        ...ownLearner(),
        requests: ["private inbox"],
        refresh_token: "do-not-cache",
      } as ReturnType<typeof ownLearner>,
    );
    const raw = localStorage.getItem(OFFLINE_WORKSPACE_KEY)!;
    expect(raw).not.toContain("do-not-cache");
    expect(raw).not.toContain("private inbox");
    expect(readOfflineWorkspace("owner-a")?.learner.confirmed_skills).toEqual(
      ownLearner().confirmed_skills,
    );
  });

  it("rejects mismatched owner identities before writing", () => {
    expect(
      saveOfflineWorkspace(ownProfile(), {
        ...ownLearner(),
        user_id: "owner-b",
      }),
    ).toBeNull();
    expect(localStorage.getItem(OFFLINE_WORKSPACE_KEY)).toBeNull();
  });

  it("removes cached data rather than exposing it to another account", () => {
    saveOfflineWorkspace(ownProfile(), ownLearner());
    expect(readOfflineWorkspace("owner-b")).toBeNull();
    expect(localStorage.getItem(OFFLINE_WORKSPACE_KEY)).toBeNull();
  });

  it("rejects corrupted state and unknown catalog skills", () => {
    localStorage.setItem(OFFLINE_WORKSPACE_KEY, "{bad json");
    expect(readOfflineWorkspace("owner-a")).toBeNull();
    expect(localStorage.getItem(OFFLINE_WORKSPACE_KEY)).toBeNull();
    expect(
      saveOfflineWorkspace(ownProfile(), {
        ...ownLearner(),
        confirmed_skills: ["invented"],
      }),
    ).toBeNull();
  });

  it("does not allow another owner or an extra inbox to be injected into the saved record", () => {
    saveOfflineWorkspace(ownProfile(), ownLearner());
    const saved = JSON.parse(localStorage.getItem(OFFLINE_WORKSPACE_KEY)!);
    localStorage.setItem(
      OFFLINE_WORKSPACE_KEY,
      JSON.stringify({ ...saved, requests: ["inbox"] }),
    );
    expect(readOfflineWorkspace("owner-a")).toBeNull();
    saveOfflineWorkspace(ownProfile(), ownLearner());
    localStorage.setItem(
      OFFLINE_WORKSPACE_KEY,
      JSON.stringify({
        ...saved,
        profile: { ...saved.profile, id: "owner-b" },
      }),
    );
    expect(readOfflineWorkspace("owner-a")).toBeNull();
  });

  it("clears the private snapshot without deleting the separate sample preview", () => {
    localStorage.setItem("stembridge.preview.v1", "preview");
    saveOfflineWorkspace(ownProfile(), ownLearner());
    clearOfflineWorkspace();
    expect(localStorage.getItem(OFFLINE_WORKSPACE_KEY)).toBeNull();
    expect(localStorage.getItem("stembridge.preview.v1")).toBe("preview");
  });
});
