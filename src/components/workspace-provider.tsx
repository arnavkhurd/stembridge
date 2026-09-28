"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  catalog,
  defaultLearnerState,
  sampleLearners,
  sampleProfiles,
  skills,
} from "@/lib/data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  ConnectionRequest,
  DomainId,
  LearnerState,
  Membership,
  Profile,
} from "@/lib/types";

type WorkspaceUser = { id: string; email?: string };
type PreviewState = { version: 1; profile: Profile; learner: LearnerState };
type Workspace = {
  ready: boolean;
  configured: boolean;
  user: WorkspaceUser | null;
  profile: Profile | null;
  learner: LearnerState;
  people: Profile[];
  memberships: Membership[];
  requests: ConnectionRequest[];
  error: string | null;
  busy: boolean;
  preview: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  saveProfile: (
    profile: Partial<Profile>,
    learner: Partial<LearnerState>,
  ) => Promise<void>;
  updateLearner: (patch: Partial<LearnerState>) => Promise<void>;
  toggleSaved: (id: string) => Promise<void>;
  toggleMembership: (domainId: DomainId) => Promise<void>;
  sendRequest: (
    recipientId: string,
    itemId: string,
    helpType: ConnectionRequest["help_type"],
    message: string,
  ) => Promise<void>;
  respondRequest: (
    id: string,
    status: "accepted" | "declined",
    nextStep: string,
  ) => Promise<void>;
  cancelRequest: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  loadSample: (index: number) => void;
  clearError: () => void;
};

const WorkspaceContext = createContext<Workspace | null>(null);
const STORAGE_KEY = "stembridge.preview.v1";
const PREVIEW_ID = "preview-learner";
const skillIds = new Set(skills.map((skill) => skill.id));
const itemIds = new Set(catalog.map((item) => item.id));
const isDomain = (value: unknown): value is DomainId =>
  value === "data-ai" || value === "robotics";
const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
const unique = <T,>(values: T[]) => [...new Set(values)];

function sampleState(index = 0): PreviewState {
  const sample = sampleLearners[index] ?? sampleLearners[0];
  return {
    version: 1,
    profile: { ...sample.profile, id: PREVIEW_ID, is_demo: true },
    learner: { ...sample.state, user_id: PREVIEW_ID },
  };
}

function validPreview(value: unknown): value is PreviewState {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isRecord(value.profile) ||
    !isRecord(value.learner)
  )
    return false;
  const p = value.profile;
  const s = value.learner;
  return (
    p.id === PREVIEW_ID &&
    s.user_id === PREVIEW_ID &&
    p.is_demo === true &&
    typeof p.display_name === "string" &&
    p.display_name.length <= 80 &&
    typeof p.headline === "string" &&
    p.headline.length <= 160 &&
    typeof p.bio === "string" &&
    p.bio.length <= 1500 &&
    isDomain(p.domain) &&
    ["learner", "mentor", "both"].includes(String(p.role)) &&
    isStringArray(p.skills) &&
    p.skills.every((id) => skillIds.has(id)) &&
    isStringArray(p.support_modes) &&
    p.support_modes.every(
      (mode) => mode === "online" || mode === "in-person",
    ) &&
    isStringArray(p.help_topics) &&
    p.help_topics.every((topic) => topic.length <= 120) &&
    typeof p.discoverable === "boolean" &&
    typeof p.open_to_requests === "boolean" &&
    isStringArray(s.confirmed_skills) &&
    s.confirmed_skills.every((id) => skillIds.has(id)) &&
    Array.isArray(s.interests) &&
    s.interests.every(isDomain) &&
    (s.goal_id === null ||
      (typeof s.goal_id === "string" && itemIds.has(s.goal_id))) &&
    typeof s.online_only === "boolean" &&
    typeof s.intro === "string" &&
    s.intro.length <= 2500 &&
    isStringArray(s.saved_ids) &&
    s.saved_ids.every((id) => itemIds.has(id))
  );
}

function readPreview(): PreviewState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return sampleState();
    const parsed: unknown = JSON.parse(raw);
    if (validPreview(parsed)) return parsed;
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // A corrupt or unavailable browser store must not prevent first use.
  }
  return sampleState();
}

function writePreview(value: PreviewState) {
  if (!validPreview(value))
    throw new Error(
      "Check your profile fields and select skills and opportunities from the available options.",
    );
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    throw new Error(
      "Your browser blocked saving this preview. Enable browser storage and try again.",
    );
  }
}

function readableError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (isRecord(value) && typeof value.message === "string")
    return new Error(value.message);
  return new Error("Something went wrong. Please try again.");
}

/** Profile IDs and administrative flags never come from form patches. */
function profileFields(profile: Profile) {
  return {
    display_name: profile.display_name.trim(),
    headline: profile.headline.trim(),
    bio: profile.bio.trim(),
    domain: profile.domain,
    skills: unique(profile.skills),
    role: profile.role,
    support_modes: unique(profile.support_modes),
    help_topics: unique(profile.help_topics),
    discoverable: profile.discoverable,
    open_to_requests: profile.open_to_requests,
  };
}

function learnerFields(state: LearnerState, userId: string): LearnerState {
  return {
    user_id: userId,
    confirmed_skills: unique(state.confirmed_skills),
    interests: unique(state.interests),
    goal_id: state.goal_id,
    online_only: state.online_only,
    saved_ids: unique(state.saved_ids),
    intro: state.intro,
  };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => getSupabaseBrowserClient());
  const [user, setUser] = useState<WorkspaceUser | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(
    () => sampleState().profile,
  );
  const [learner, setLearner] = useState<LearnerState>(
    () => sampleState().learner,
  );
  const [people, setPeople] = useState<Profile[]>(sampleProfiles);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingActions, setPendingActions] = useState(0);
  const activeUserId = useRef<string | null>(null);
  const authGeneration = useRef(0);
  const loadSequence = useRef(0);

  const restorePreview = useCallback(() => {
    const saved = readPreview();
    setProfile(saved.profile);
    setLearner(saved.learner);
    setPeople(sampleProfiles);
    setMemberships([]);
    setRequests([]);
  }, []);

  const run = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      const generation = authGeneration.current;
      setPendingActions((count) => count + 1);
      setError(null);
      try {
        return await operation();
      } catch (cause) {
        const failure = readableError(cause);
        if (generation === authGeneration.current) setError(failure.message);
        throw failure;
      } finally {
        setPendingActions((count) => Math.max(0, count - 1));
      }
    },
    [],
  );

  const loadLive = useCallback(
    async (userId: string) => {
      if (!client) throw new Error("Connect Supabase to use a live workspace.");
      if (activeUserId.current !== userId) return;
      const generation = authGeneration.current;
      const sequence = ++loadSequence.current;
      const isCurrent = () =>
        activeUserId.current === userId &&
        authGeneration.current === generation &&
        loadSequence.current === sequence;
      const results = await Promise.all([
        client.from("profiles").select("*").eq("id", userId).single(),
        client
          .from("learner_state")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
        client
          .from("profiles")
          .select("*")
          .eq("discoverable", true)
          .order("display_name"),
        client.from("community_memberships").select("*"),
        client
          .from("connection_requests")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
      if (!isCurrent()) return;
      for (const result of results) {
        if (result.error)
          throw new Error(
            `Could not load your workspace: ${result.error.message}`,
          );
      }
      const ownProfile = results[0].data as Profile;
      let ownLearner = results[1].data as LearnerState | null;
      if (!ownLearner) {
        const initial = {
          ...defaultLearnerState(userId),
          interests: [ownProfile.domain],
        };
        const created = await client
          .from("learner_state")
          .upsert(initial, { onConflict: "user_id" })
          .select("*")
          .single();
        if (created.error) throw readableError(created.error);
        ownLearner = created.data as LearnerState;
      }
      if (!isCurrent()) return;
      setProfile(ownProfile);
      setLearner(ownLearner);
      setPeople(results[2].data as Profile[]);
      setMemberships(results[3].data as Membership[]);
      setRequests(results[4].data as ConnectionRequest[]);
    },
    [client],
  );

  useEffect(() => {
    if (!client) {
      setAuthResolved(true);
      return;
    }
    let disposed = false;
    let authEventVersion = 0;
    const applyUser = (next: WorkspaceUser | null) => {
      if (disposed) return;
      if (activeUserId.current !== (next?.id ?? null)) {
        ++authGeneration.current;
        ++loadSequence.current;
        setReady(false);
        setProfile(null);
        setLearner(defaultLearnerState(next?.id ?? PREVIEW_ID));
        setPeople([]);
        setMemberships([]);
        setRequests([]);
        setError(null);
      }
      activeUserId.current = next?.id ?? null;
      setUser((current) =>
        current?.id === next?.id && current?.email === next?.email
          ? current
          : next,
      );
      setAuthResolved(true);
    };
    // Keep this callback synchronous: Supabase auth listeners must not await database queries.
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      ++authEventVersion;
      applyUser(
        session?.user
          ? { id: session.user.id, email: session.user.email }
          : null,
      );
    });
    const initialEventVersion = authEventVersion;
    void client.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        // A sign-in/sign-out event that happened while this read was pending wins.
        if (disposed || authEventVersion !== initialEventVersion) return;
        if (sessionError)
          setError(`Could not restore your session: ${sessionError.message}`);
        applyUser(
          data.session?.user
            ? { id: data.session.user.id, email: data.session.user.email }
            : null,
        );
      })
      .catch((cause) => {
        if (!disposed && authEventVersion === initialEventVersion) {
          setError(readableError(cause).message);
          applyUser(null);
        }
      });
    return () => {
      disposed = true;
      subscription.unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    if (!authResolved) return;
    let disposed = false;
    setReady(false);
    if (!user) {
      ++loadSequence.current;
      restorePreview();
      setReady(true);
      return;
    }
    // Do not display preview members or another account's data during a live load.
    setProfile(null);
    setLearner(defaultLearnerState(user.id));
    setPeople([]);
    setMemberships([]);
    setRequests([]);
    void loadLive(user.id)
      .catch((cause) => {
        if (!disposed) setError(readableError(cause).message);
      })
      .finally(() => {
        if (!disposed) setReady(true);
      });
    return () => {
      disposed = true;
    };
  }, [authResolved, user?.id, loadLive, restorePreview]); // The stable ID, not token refreshes, controls workspace loading.

  const requireUser = useCallback(() => {
    if (!client)
      throw new Error(
        "Supabase is not connected yet. Set the project environment variables to enable accounts.",
      );
    if (!user) throw new Error("Sign in to use your live workspace.");
    if (activeUserId.current !== user.id)
      throw new Error(
        "Your session changed. Refresh your workspace and try again.",
      );
    return { client, user };
  }, [client, user]);

  const signIn = useCallback(
    (email: string, password: string) =>
      run(async () => {
        if (!client)
          throw new Error(
            "Supabase is not connected yet. Account sign-in will be available after setup.",
          );
        const result = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (result.error) throw readableError(result.error);
      }),
    [client, run],
  );

  const signUp = useCallback(
    (email: string, password: string, displayName: string) =>
      run(async () => {
        if (!client)
          throw new Error(
            "Supabase is not connected yet. Account creation will be available after setup.",
          );
        const result = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: displayName.trim() } },
        });
        if (result.error) throw readableError(result.error);
        return { needsConfirmation: !result.data.session };
      }),
    [client, run],
  );

  const signOut = useCallback(
    () =>
      run(async () => {
        if (!client) return;
        const signingOutUser = activeUserId.current;
        const result = await client.auth.signOut();
        if (result.error) throw readableError(result.error);
        if (
          activeUserId.current !== null &&
          activeUserId.current !== signingOutUser
        )
          return;
        if (activeUserId.current !== null) ++authGeneration.current;
        ++loadSequence.current;
        activeUserId.current = null;
        setUser(null);
        restorePreview();
      }),
    [client, run, restorePreview],
  );

  const refresh = useCallback(
    () =>
      run(async () => {
        if (activeUserId.current !== (user?.id ?? null))
          throw new Error("Your session changed. Please try again.");
        if (user) await loadLive(user.id);
        else restorePreview();
      }),
    [user, loadLive, restorePreview, run],
  );

  const saveProfile = useCallback(
    (profilePatch: Partial<Profile>, learnerPatch: Partial<LearnerState>) =>
      run(async () => {
        if (activeUserId.current !== (user?.id ?? null))
          throw new Error(
            "Your session changed. Reopen your profile and try again.",
          );
        if (!profile)
          throw new Error(
            "Your profile has not loaded. Refresh your workspace and try again.",
          );
        const nextProfile = {
          ...profile,
          ...profilePatch,
          id: profile.id,
          is_demo: profile.is_demo,
        };
        const nextLearner = learnerFields(
          { ...learner, ...learnerPatch },
          user?.id ?? PREVIEW_ID,
        );
        if (learnerPatch.confirmed_skills)
          nextProfile.skills = nextLearner.confirmed_skills;
        if (!user) {
          const saved: PreviewState = {
            version: 1,
            profile: {
              ...nextProfile,
              ...profileFields(nextProfile),
              id: PREVIEW_ID,
              is_demo: true,
            },
            learner: nextLearner,
          };
          writePreview(saved);
          setProfile(saved.profile);
          setLearner(saved.learner);
          return;
        }
        const live = requireUser();
        try {
          const profileResult = await live.client
            .from("profiles")
            .update(profileFields(nextProfile))
            .eq("id", live.user.id)
            .select("id")
            .single();
          if (profileResult.error) throw readableError(profileResult.error);
          const learnerResult = await live.client
            .from("learner_state")
            .upsert(nextLearner, { onConflict: "user_id" });
          if (learnerResult.error) throw readableError(learnerResult.error);
        } catch (cause) {
          await loadLive(live.user.id).catch(() => undefined);
          throw cause;
        }
        await loadLive(live.user.id);
      }),
    [profile, learner, user, requireUser, loadLive, run],
  );

  const updateLearner = useCallback(
    (patch: Partial<LearnerState>) => saveProfile({}, patch),
    [saveProfile],
  );

  const toggleSaved = useCallback(
    (id: string) => {
      if (!itemIds.has(id))
        return Promise.reject(
          new Error("This opportunity is no longer available."),
        );
      const saved_ids = learner.saved_ids.includes(id)
        ? learner.saved_ids.filter((value) => value !== id)
        : [...learner.saved_ids, id];
      return updateLearner({ saved_ids });
    },
    [learner.saved_ids, updateLearner],
  );

  const toggleMembership = useCallback(
    (domainId: DomainId) =>
      run(async () => {
        if (!user)
          throw new Error("Sign in to join a community and meet its members.");
        const live = requireUser();
        const joined = memberships.some(
          (membership) =>
            membership.user_id === user.id &&
            membership.community_id === domainId,
        );
        const result = joined
          ? await live.client
              .from("community_memberships")
              .delete()
              .eq("user_id", user.id)
              .eq("community_id", domainId)
          : await live.client
              .from("community_memberships")
              .insert({ user_id: user.id, community_id: domainId });
        if (result.error) throw readableError(result.error);
        await loadLive(user.id);
      }),
    [user, memberships, requireUser, loadLive, run],
  );

  const sendRequest = useCallback(
    (
      recipientId: string,
      itemId: string,
      helpType: ConnectionRequest["help_type"],
      message: string,
    ) =>
      run(async () => {
        if (!user)
          throw new Error("Sign in to send a real connection request.");
        const live = requireUser();
        const result = await live.client.rpc("create_connection_request", {
          p_recipient_id: recipientId,
          p_opportunity_id: itemId,
          p_help_type: helpType,
          p_message: message.trim(),
        });
        if (result.error) throw readableError(result.error);
        await loadLive(user.id);
      }),
    [user, requireUser, loadLive, run],
  );

  const respondRequest = useCallback(
    (id: string, status: "accepted" | "declined", nextStep: string) =>
      run(async () => {
        const live = requireUser();
        const result = await live.client.rpc("respond_to_request", {
          p_request_id: id,
          p_status: status,
          p_next_step: nextStep.trim(),
        });
        if (result.error) throw readableError(result.error);
        await loadLive(live.user.id);
      }),
    [requireUser, loadLive, run],
  );

  const cancelRequest = useCallback(
    (id: string) =>
      run(async () => {
        const live = requireUser();
        const result = await live.client.rpc("cancel_connection_request", {
          p_request_id: id,
        });
        if (result.error) throw readableError(result.error);
        await loadLive(live.user.id);
      }),
    [requireUser, loadLive, run],
  );

  const loadSample = useCallback(
    (index: number) => {
      if (user || activeUserId.current) {
        setError(
          "Sign out before loading a sample. Your account information has been preserved.",
        );
        return;
      }
      try {
        const saved = sampleState(index);
        writePreview(saved);
        setProfile(saved.profile);
        setLearner(saved.learner);
        setPeople(sampleProfiles);
        setMemberships([]);
        setRequests([]);
        setError(null);
      } catch (cause) {
        setError(readableError(cause).message);
      }
    },
    [user],
  );

  const clearError = useCallback(() => setError(null), []);
  const value = useMemo<Workspace>(
    () => ({
      ready,
      configured: !!client,
      user,
      profile,
      learner,
      people,
      memberships,
      requests,
      error,
      busy: pendingActions > 0,
      preview: !user,
      signIn,
      signUp,
      signOut,
      saveProfile,
      updateLearner,
      toggleSaved,
      toggleMembership,
      sendRequest,
      respondRequest,
      cancelRequest,
      refresh,
      loadSample,
      clearError,
    }),
    [
      ready,
      client,
      user,
      profile,
      learner,
      people,
      memberships,
      requests,
      error,
      pendingActions,
      signIn,
      signUp,
      signOut,
      saveProfile,
      updateLearner,
      toggleSaved,
      toggleMembership,
      sendRequest,
      respondRequest,
      cancelRequest,
      refresh,
      loadSample,
      clearError,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const workspace = useContext(WorkspaceContext);
  if (!workspace)
    throw new Error("useWorkspace must be used inside WorkspaceProvider.");
  return workspace;
}
