// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sampleLearners } from "../lib/data";

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

function fakeSupabase(initialUser: TestUser | null = { id: "account-a" }) {
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
    session: { user: TestUser } | null,
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
      data: { session: user ? { user } : null },
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
    emit(next: TestUser | null) {
      user = next;
      listener(next ? "SIGNED_IN" : "SIGNED_OUT", next ? { user: next } : null);
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
