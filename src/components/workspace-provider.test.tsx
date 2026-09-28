// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sampleLearners } from "../lib/data";
import {
  emptyNotebook,
  readOfflineNotebook,
  saveNotebookEntry,
} from "../lib/offline-notebook";
import {
  OFFLINE_WORKSPACE_KEY,
  saveOfflineWorkspace,
} from "../lib/offline-workspace";

const mocks = vi.hoisted(() => ({ getClient: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: mocks.getClient,
}));
vi.mock("@/lib/data", async () => import("../lib/data"));
import { WorkspaceProvider, useWorkspace } from "./workspace-provider";

type Row = Record<string, unknown>;
type Result = { data: Row | Row[] | null; error: { message: string } | null };
type Operation = {
  table: string;
  method: string;
  patch?: Row;
  filters: [string, unknown][];
};
type TestUser = { id: string; email?: string };
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

function fakeSupabase(
  initialUser: TestUser | null = { id: "account-a" },
  expiresAt = Math.floor(Date.now() / 1000) + 3600,
) {
  const rows: Record<string, Row[]> = {
    profiles: ["account-a", "account-b"].map((id, index) => ({
      ...sampleLearners[index].profile,
      id,
      display_name: `Person ${id}`,
      is_demo: false,
    })),
    learner_state: ["account-a", "account-b"].map((id, index) => ({
      ...sampleLearners[index].state,
      user_id: id,
      saved_ids: [],
      online_only: false,
    })),
    community_memberships: [],
    connection_requests: [],
  };
  let user = initialUser;
  let listener: (
    event: string,
    session: { user: TestUser; expires_at?: number } | null,
  ) => void = () => undefined;
  const operations: Operation[] = [];
  const beforeQuery = vi
    .fn<(operation: Operation) => Promise<Result | undefined>>()
    .mockResolvedValue(undefined);
  const from = (table: string) => {
    const operation: Operation = { table, method: "select", filters: [] };
    let single = false;
    let execution: Promise<Result> | undefined;
    const execute = async (): Promise<Result> => {
      const captured = structuredClone(operation);
      operations.push(captured);
      const intercepted = await beforeQuery(captured);
      if (intercepted) return intercepted;
      const matching = () =>
        rows[table].filter((row) =>
          operation.filters.every(([key, value]) => row[key] === value),
        );
      let result = matching();
      if (operation.method === "update")
        result.forEach((row) =>
          Object.assign(row, structuredClone(operation.patch)),
        );
      if (operation.method === "insert" || operation.method === "upsert") {
        const row = structuredClone(operation.patch!);
        if (
          !rows[table].some(
            (entry) =>
              entry.user_id === row.user_id &&
              entry.community_id === row.community_id,
          )
        )
          rows[table].push(row);
        result = [row];
      }
      if (operation.method === "delete")
        rows[table] = rows[table].filter((row) => !result.includes(row));
      return {
        data: structuredClone(single ? (result[0] ?? null) : result),
        error: null,
      };
    };
    const query = {
      select: () => query,
      eq: (key: string, value: unknown) => {
        operation.filters.push([key, value]);
        return query;
      },
      order: () => query,
      abortSignal: () => query,
      single: () => {
        single = true;
        return query;
      },
      maybeSingle: () => {
        single = true;
        return query;
      },
      update: (patch: Row) => {
        operation.method = "update";
        operation.patch = patch;
        return query;
      },
      insert: (patch: Row) => {
        operation.method = "insert";
        operation.patch = patch;
        return query;
      },
      upsert: (patch: Row) => {
        operation.method = "upsert";
        operation.patch = patch;
        return query;
      },
      delete: () => {
        operation.method = "delete";
        return query;
      },
      then: (
        resolve: (value: Result) => unknown,
        reject: (reason: unknown) => unknown,
      ) => (execution ??= execute()).then(resolve, reject),
    };
    return query;
  };
  const auth = {
    onAuthStateChange: (callback: typeof listener) => {
      listener = callback;
      return { data: { subscription: { unsubscribe() {} } } };
    },
    getSession: vi.fn(async () => ({
      data: { session: user ? { user, expires_at: expiresAt } : null },
      error: null,
    })),
    signOut: vi.fn(async () => {
      user = null;
      listener("SIGNED_OUT", null);
      return { error: null };
    }),
  };
  return {
    client: { from, auth, rpc: vi.fn() },
    rows,
    operations,
    beforeQuery,
    emit(next: TestUser | null, nextExpiresAt = expiresAt) {
      user = next;
      listener(
        next ? "SIGNED_IN" : "SIGNED_OUT",
        next ? { user: next, expires_at: nextExpiresAt } : null,
      );
    },
  };
}

let root: Root;
let host: HTMLDivElement;
let workspace: ReturnType<typeof useWorkspace>;
function Probe() {
  workspace = useWorkspace();
  return null;
}
async function mount() {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root.render(createElement(WorkspaceProvider, null, createElement(Probe)));
  });
}
const writes = (db: ReturnType<typeof fakeSupabase>) =>
  db.operations.filter((operation) => operation.method !== "select");

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    value: true,
  });
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mocks.getClient.mockReturnValue(null);
});
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host?.remove();
  vi.useRealTimers();
});

describe("workspace writes use the latest confirmed state", () => {
  it("preserves two preview bookmarks clicked before React rerenders", async () => {
    await mount();
    const actions = workspace;
    await act(async () => {
      await Promise.all([
        actions.toggleSaved("first-ml-project"),
        actions.toggleSaved("data-for-good-challenge"),
      ]);
    });
    expect(workspace.learner.saved_ids).toEqual([
      "first-ml-project",
      "data-for-good-challenge",
    ]);
    expect(
      JSON.parse(localStorage.getItem("stembridge.preview.v1")!).learner
        .saved_ids,
    ).toHaveLength(2);
  });

  it("does not apply an old queued edit after resetting the sample", async () => {
    await mount();
    await act(async () => {
      const pending = workspace
        .toggleSaved("first-ml-project")
        .catch((error) => error);
      workspace.loadSample(1);
      expect(await pending).toBeInstanceOf(Error);
    });
    expect(workspace.profile?.display_name).toBe("Aisha Thomas");
    expect(workspace.learner.saved_ids).toEqual([]);
    expect(workspace.busy).toBe(false);
  });

  it("changes only learner preferences, without rewriting the public profile", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    await act(async () => {
      await workspace.updateLearner({ online_only: true });
    });
    expect(writes(db)).toEqual([
      {
        table: "learner_state",
        method: "update",
        patch: { online_only: true },
        filters: [["user_id", "account-a"]],
      },
    ]);
    expect(workspace.learner.confirmed_skills).toEqual([
      "python",
      "git",
      "communication",
    ]);
  });

  it("keeps a profile edit and two concurrent bookmarks", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    const actions = workspace;
    await act(async () => {
      await Promise.all([
        actions.saveProfile({ headline: "A newly saved introduction" }, {}),
        actions.toggleSaved("first-ml-project"),
        actions.toggleSaved("data-for-good-challenge"),
      ]);
    });
    expect(workspace.profile?.headline).toBe("A newly saved introduction");
    expect(workspace.learner.saved_ids).toEqual([
      "first-ml-project",
      "data-for-good-challenge",
    ]);
    expect(
      writes(db).filter((operation) => operation.table === "profiles"),
    ).toHaveLength(1);
    expect(writes(db)[0].patch).toEqual({
      headline: "A newly saved introduction",
    });
  });

  it("serializes rapid join/leave clicks against the actual membership", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    const actions = workspace;
    await act(async () => {
      await Promise.all([
        actions.toggleMembership("data-ai"),
        actions.toggleMembership("data-ai"),
      ]);
    });
    expect(workspace.memberships).toEqual([]);
    expect(writes(db).map((operation) => operation.method)).toEqual([
      "insert",
      "delete",
    ]);
  });

  it("validates a complete profile before either table is modified", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    await act(async () => {
      await expect(
        workspace.saveProfile(
          { headline: "Would otherwise save" },
          { intro: "x".repeat(2501) },
        ),
      ).rejects.toThrow("Check your profile");
    });
    expect(writes(db)).toEqual([]);
  });

  it("reports partial saves truthfully, reloads confirmed data, and permits retry", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    let failed = false;
    db.beforeQuery.mockImplementation(async (operation) => {
      if (
        !failed &&
        operation.table === "learner_state" &&
        operation.method === "update"
      ) {
        failed = true;
        return { data: null, error: { message: "Temporary write failure" } };
      }
      return undefined;
    });
    await act(async () => {
      await expect(
        workspace.saveProfile(
          { headline: "Saved introduction" },
          { online_only: true },
        ),
      ).rejects.toThrow("Some changes were saved");
    });
    expect(workspace.profile?.headline).toBe("Saved introduction");
    expect(workspace.learner.online_only).toBe(false);
    await act(async () => {
      await workspace.saveProfile(
        { headline: "Saved introduction" },
        { online_only: true },
      );
    });
    expect(workspace.learner.online_only).toBe(true);
    expect(
      writes(db).filter((operation) => operation.table === "profiles"),
    ).toHaveLength(1);
    expect(workspace.busy).toBe(false);
  });
});

describe("authentication races keep account data separate", () => {
  it("recovers to a truthful preview instead of loading forever when session restoration stalls", async () => {
    vi.useFakeTimers();
    const db = fakeSupabase(null);
    db.client.auth.getSession.mockReturnValue(new Promise(() => undefined));
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    expect(workspace.ready).toBe(false);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_001);
    });
    expect(workspace.ready).toBe(true);
    expect(workspace.preview).toBe(true);
    expect(workspace.error).toContain("taking too long");
  });

  it("ends loading after a failed database read and allows refresh recovery", async () => {
    const db = fakeSupabase();
    db.beforeQuery.mockResolvedValue({
      data: null,
      error: { message: "Temporary read failure" },
    });
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    expect(workspace.ready).toBe(true);
    expect(workspace.profile).toBeNull();
    expect(workspace.error).toContain("Temporary read failure");
    db.beforeQuery.mockResolvedValue(undefined);
    await act(async () => {
      await workspace.refresh();
    });
    expect(workspace.profile?.id).toBe("account-a");
    expect(workspace.error).toBeNull();
  });

  it("ignores an old getSession result after a newer sign-in event", async () => {
    const db = fakeSupabase(null);
    const initial =
      deferred<Awaited<ReturnType<typeof db.client.auth.getSession>>>();
    db.client.auth.getSession.mockReturnValue(initial.promise);
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    await act(async () => db.emit({ id: "account-b" }));
    expect(workspace.user?.id).toBe("account-b");
    await act(async () =>
      initial.resolve({ data: { session: null }, error: null }),
    );
    expect(workspace.user?.id).toBe("account-b");
    expect(workspace.profile?.id).toBe("account-b");
    expect(workspace.preview).toBe(false);
  });

  it("does not apply an old account load after another account signs in", async () => {
    const db = fakeSupabase();
    const oldProfile = deferred<Result | undefined>();
    db.beforeQuery.mockImplementation(async (operation) =>
      operation.table === "profiles" &&
      operation.filters.some(
        ([key, value]) => key === "id" && value === "account-a",
      )
        ? oldProfile.promise
        : undefined,
    );
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    await act(async () => db.emit({ id: "account-b" }));
    expect(workspace.profile?.id).toBe("account-b");
    await act(async () => oldProfile.resolve(undefined));
    expect(workspace.profile?.id).toBe("account-b");
    expect(workspace.learner.user_id).toBe("account-b");
  });

  it("drops queued writes for an account that signed out", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    const profileWrite = deferred<Result | undefined>();
    db.beforeQuery.mockImplementation(async (operation) =>
      operation.table === "profiles" && operation.method === "update"
        ? profileWrite.promise
        : undefined,
    );
    let first!: Promise<unknown>;
    let queued!: Promise<unknown>;
    await act(async () => {
      first = workspace
        .saveProfile({ headline: "Old account edit" }, {})
        .catch((error) => error);
      queued = workspace
        .toggleSaved("first-ml-project")
        .catch((error) => error);
    });
    await act(async () => db.emit({ id: "account-b" }));
    await act(async () => {
      profileWrite.resolve(undefined);
      await Promise.all([first, queued]);
    });
    expect(workspace.user?.id).toBe("account-b");
    expect(workspace.learner.saved_ids).toEqual([]);
    expect(workspace.error).toBeNull();
    expect(workspace.busy).toBe(false);
    expect(
      writes(db).filter((operation) => operation.table === "learner_state"),
    ).toEqual([]);
  });

  it("preserves the private account outside the local preview store on sign-out", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    await act(async () => {
      await workspace.saveProfile(
        { headline: "Private account information" },
        {},
      );
      await workspace.signOut();
    });
    expect(workspace.preview).toBe(true);
    expect(workspace.profile?.id).toBe("preview-learner");
    expect(localStorage.getItem("stembridge.preview.v1")).toBeNull();
  });
});

function seedOfflineAccount(id = "account-a") {
  return saveOfflineWorkspace(
    { ...sampleLearners[0].profile, id, is_demo: false },
    {
      ...sampleLearners[0].state,
      user_id: id,
      saved_ids: ["first-ml-project"],
    },
  );
}

async function setConnected(online: boolean) {
  await act(async () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: online,
    });
    window.dispatchEvent(new Event(online ? "online" : "offline"));
  });
}

describe("offline workspace boundaries", () => {
  it("restores only the session owner's plan and saved items without querying the network", async () => {
    const savedAt = seedOfflineAccount();
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await setConnected(false);
    await mount();
    expect(workspace.ready).toBe(true);
    expect(workspace.offline).toBe(true);
    expect(workspace.offlineSnapshot).toBe(true);
    expect(workspace.snapshotSavedAt).toBe(savedAt);
    expect(workspace.profile?.id).toBe("account-a");
    expect(workspace.learner.saved_ids).toEqual(["first-ml-project"]);
    expect(workspace.people).toEqual([]);
    expect(workspace.requests).toEqual([]);
    expect(workspace.memberships).toEqual([]);
    expect(db.operations).toEqual([]);
  });

  it("never treats a saved workspace as authentication", async () => {
    seedOfflineAccount();
    const db = fakeSupabase(null);
    mocks.getClient.mockReturnValue(db.client);
    await setConnected(false);
    await mount();
    expect(workspace.preview).toBe(true);
    expect(workspace.profile?.id).toBe("preview-learner");
    expect(workspace.offlineSnapshot).toBe(false);
    expect(localStorage.getItem(OFFLINE_WORKSPACE_KEY)).toBeNull();
  });

  it("drops expired-session snapshots and opens the preview", async () => {
    seedOfflineAccount();
    const db = fakeSupabase(
      { id: "account-a" },
      Math.floor(Date.now() / 1000) - 1,
    );
    mocks.getClient.mockReturnValue(db.client);
    await setConnected(false);
    await mount();
    expect(workspace.preview).toBe(true);
    expect(workspace.profile?.id).toBe("preview-learner");
    expect(localStorage.getItem(OFFLINE_WORKSPACE_KEY)).toBeNull();
    expect(db.operations).toEqual([]);
  });

  it("does not show another browser account's saved profile", async () => {
    seedOfflineAccount("account-a");
    const db = fakeSupabase({ id: "account-b" });
    mocks.getClient.mockReturnValue(db.client);
    await setConnected(false);
    await mount();
    expect(workspace.user?.id).toBe("account-b");
    expect(workspace.profile).toBeNull();
    expect(workspace.learner.user_id).toBe("account-b");
    expect(workspace.error).toContain("no saved plan");
    expect(localStorage.getItem(OFFLINE_WORKSPACE_KEY)).toBeNull();
  });

  it("blocks all live mutations immediately and never queues them for reconnect", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    await setConnected(false);
    const before = db.operations.length;
    await act(async () => {
      const actions = [
        workspace.saveProfile({ headline: "Must not save" }, {}),
        workspace.updateLearner({ online_only: true }),
        workspace.toggleSaved("first-ml-project"),
        workspace.toggleMembership("data-ai"),
        workspace.sendRequest(
          "account-b",
          "first-ml-project",
          "mentorship",
          "This must not be sent",
        ),
        workspace.respondRequest(
          "request-a",
          "accepted",
          "This must not be sent",
        ),
        workspace.cancelRequest("request-a"),
      ];
      for (const result of await Promise.allSettled(actions)) {
        expect(result.status).toBe("rejected");
        if (result.status === "rejected")
          expect(result.reason.message).toContain(
            "Nothing has been sent or queued",
          );
      }
    });
    expect(db.operations).toHaveLength(before);
    expect(db.client.rpc).not.toHaveBeenCalled();
    expect(workspace.learner.saved_ids).toEqual([]);
    await setConnected(true);
    expect(writes(db)).toEqual([]);
    expect(db.client.rpc).not.toHaveBeenCalled();
    expect(workspace.offlineSnapshot).toBe(false);
  });

  it("refreshes a saved view offline and reloads confirmed cloud data on reconnect", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    await setConnected(false);
    const queryCount = db.operations.length;
    await act(async () => workspace.refresh());
    expect(db.operations).toHaveLength(queryCount);
    expect(workspace.offlineSnapshot).toBe(true);
    expect(workspace.people).toEqual([]);
    db.rows.profiles[0].headline = "New cloud headline";
    await setConnected(true);
    expect(workspace.profile?.headline).toBe("New cloud headline");
    expect(workspace.offlineSnapshot).toBe(false);
    expect(workspace.error).toBeNull();
  });

  it("erases own cached data and hides it when identity changes offline", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    expect(localStorage.getItem(OFFLINE_WORKSPACE_KEY)).not.toBeNull();
    await setConnected(false);
    await act(async () => db.emit({ id: "account-b" }));
    expect(workspace.user?.id).toBe("account-b");
    expect(workspace.profile).toBeNull();
    expect(workspace.learner.user_id).toBe("account-b");
    expect(localStorage.getItem(OFFLINE_WORKSPACE_KEY)).toBeNull();
  });

  it("keeps local preview edits working but rejects account sign-in and creation offline", async () => {
    await setConnected(false);
    await mount();
    await act(async () => {
      await workspace.toggleSaved("first-ml-project");
      await expect(
        workspace.signIn("owned@example.test", "password"),
      ).rejects.toThrow("Reconnect to sign in");
      await expect(
        workspace.signUp("owned@example.test", "password", "Person"),
      ).rejects.toThrow("Reconnect to create an account");
    });
    expect(workspace.learner.saved_ids).toContain("first-ml-project");
    expect(workspace.offlineSnapshot).toBe(false);
  });

  it("removes the private snapshot on explicit sign-out", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    saveNotebookEntry(emptyNotebook("account-a"), "numpy-beginners", {
      notes: "My private work",
    });
    await setConnected(false);
    await act(async () => workspace.signOut());
    expect(localStorage.getItem(OFFLINE_WORKSPACE_KEY)).toBeNull();
    expect(localStorage.getItem("stembridge.notebook.v1")).toBeNull();
    expect(workspace.preview).toBe(true);
    expect(workspace.profile?.id).toBe("preview-learner");
    expect(db.client.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("expires an open offline session without continuing to expose its saved profile", async () => {
    vi.useFakeTimers();
    const db = fakeSupabase(
      { id: "account-a" },
      Math.floor(Date.now() / 1000) + 5,
    );
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    saveNotebookEntry(emptyNotebook("account-a"), "numpy-beginners", {
      notes: "Work written before expiry",
      completed: true,
    });
    await setConnected(false);
    expect(workspace.offlineSnapshot).toBe(true);
    await act(async () => vi.advanceTimersByTimeAsync(5_001));
    expect(workspace.preview).toBe(true);
    expect(workspace.profile?.id).toBe("preview-learner");
    expect(localStorage.getItem(OFFLINE_WORKSPACE_KEY)).toBeNull();
    expect(workspace.error).toContain("session expired");
    expect(localStorage.getItem("stembridge.notebook.v1")).toContain(
      "Work written before expiry",
    );
    const locked = readOfflineNotebook("preview");
    expect(locked.entries).toEqual({});
    expect(locked.locked).toBe(true);
    await setConnected(true);
    await act(async () =>
      db.emit({ id: "account-a" }, Math.floor(Date.now() / 1000) + 3600),
    );
    expect(readOfflineNotebook("account-a").entries["numpy-beginners"]).toEqual(
      { notes: "Work written before expiry", completed: true },
    );
  });

  it("preserves the same owner's notebook on initial session restoration", async () => {
    saveNotebookEntry(emptyNotebook("account-a"), "numpy-beginners", {
      notes: "Saved before reload",
    });
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    expect(workspace.user?.id).toBe("account-a");
    expect(
      readOfflineNotebook("account-a").entries["numpy-beginners"].notes,
    ).toBe("Saved before reload");
  });

  it("locks notes on automatic session loss and restores them to the same account", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    saveNotebookEntry(emptyNotebook("account-a"), "numpy-beginners", {
      notes: "Keep my learning work",
    });
    await act(async () => db.emit(null));
    expect(workspace.preview).toBe(true);
    expect(readOfflineNotebook("preview").entries).toEqual({});
    expect(readOfflineNotebook("preview").locked).toBe(true);
    expect(localStorage.getItem("stembridge.notebook.v1")).toContain(
      "Keep my learning work",
    );
    await act(async () => db.emit({ id: "account-a" }));
    expect(
      readOfflineNotebook("account-a").entries["numpy-beginners"].notes,
    ).toBe("Keep my learning work");
  });

  it("clears a locked previous account's notebook when a different account signs in", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    saveNotebookEntry(emptyNotebook("account-a"), "numpy-beginners", {
      notes: "Previous account work",
    });
    await act(async () => db.emit(null));
    expect(localStorage.getItem("stembridge.notebook.v1")).not.toBeNull();
    await act(async () => db.emit({ id: "account-b" }));
    expect(localStorage.getItem("stembridge.notebook.v1")).toBeNull();
    expect(readOfflineNotebook("account-b").entries).toEqual({});
  });

  it("clears the preview notebook when signing into an account", async () => {
    const db = fakeSupabase(null);
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    saveNotebookEntry(emptyNotebook("preview"), "numpy-beginners", {
      notes: "Sample notes",
    });
    await act(async () => db.emit({ id: "account-a" }));
    expect(localStorage.getItem("stembridge.notebook.v1")).toBeNull();
  });

  it("does not let a pending online directory response overwrite an offline snapshot", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    const directory = deferred<Result | undefined>();
    db.beforeQuery.mockImplementation(async (operation) =>
      operation.table === "profiles" &&
      operation.filters.some(([key]) => key === "discoverable")
        ? directory.promise
        : undefined,
    );
    let pending!: Promise<void>;
    await act(async () => {
      pending = workspace.refresh();
    });
    await setConnected(false);
    expect(workspace.offlineSnapshot).toBe(true);
    await act(async () => {
      directory.resolve(undefined);
      await pending;
    });
    expect(workspace.offlineSnapshot).toBe(true);
    expect(workspace.people).toEqual([]);
  });

  it("rejects an offline click before an earlier online write has finished", async () => {
    const db = fakeSupabase();
    mocks.getClient.mockReturnValue(db.client);
    await mount();
    const slowWrite = deferred<Result | undefined>();
    db.beforeQuery.mockImplementation(async (operation) =>
      operation.table === "profiles" && operation.method === "update"
        ? slowWrite.promise
        : undefined,
    );
    let pending!: Promise<unknown>;
    await act(async () => {
      pending = workspace
        .saveProfile({ headline: "Started online" }, {})
        .catch((error) => error);
    });
    await setConnected(false);
    await act(async () => {
      await expect(workspace.toggleSaved("first-ml-project")).rejects.toThrow(
        "Nothing has been sent or queued",
      );
    });
    await setConnected(true);
    await act(async () => {
      slowWrite.resolve(undefined);
      await pending;
    });
    expect(
      writes(db).filter((operation) => operation.table === "learner_state"),
    ).toEqual([]);
    expect(workspace.learner.saved_ids).toEqual([]);
  });
});
