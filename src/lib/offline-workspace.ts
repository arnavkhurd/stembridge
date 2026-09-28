import { z } from "zod";
import { catalog, skills } from "./data";
import type { LearnerState, Profile } from "./types";

export const OFFLINE_WORKSPACE_KEY = "stembridge.offline-workspace.v1";
export const RECONNECT_MESSAGE =
  "You're offline. Reconnect to save account changes or contact people. Nothing has been sent or queued.";

const domain = z.enum(["data-ai", "robotics"]);
const skillIds = new Set(skills.map((skill) => skill.id));
const itemIds = new Set(catalog.map((item) => item.id));
const skillList = z.array(z.string().refine((id) => skillIds.has(id))).max(40);
const itemId = z.string().refine((id) => itemIds.has(id));
const profileSchema = z.object({
  id: z.string().min(1).max(200),
  display_name: z.string().trim().min(1).max(80),
  headline: z.string().max(160),
  bio: z.string().max(1500),
  domain,
  skills: skillList,
  role: z.enum(["learner", "mentor", "both"]),
  support_modes: z.array(z.enum(["online", "in-person"])).max(2),
  help_topics: z.array(z.string().max(120)).max(20),
  discoverable: z.boolean(),
  open_to_requests: z.boolean(),
  is_demo: z.literal(false),
});
const learnerSchema = z.object({
  user_id: z.string().min(1).max(200),
  confirmed_skills: skillList,
  interests: z.array(domain).max(2),
  goal_id: itemId.nullable(),
  online_only: z.boolean(),
  saved_ids: z.array(itemId).max(100),
  intro: z.string().max(2500),
});
const snapshotSchema = z
  .object({
    version: z.literal(1),
    userId: z.string().min(1).max(200),
    savedAt: z.iso.datetime(),
    profile: profileSchema,
    learner: learnerSchema,
  })
  .strict()
  .refine(
    (value) =>
      value.profile.id === value.userId &&
      value.learner.user_id === value.userId,
  );

export type OfflineWorkspaceSnapshot = z.infer<typeof snapshotSchema>;

export function isBrowserOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function clearOfflineWorkspace() {
  try {
    window.localStorage.removeItem(OFFLINE_WORKSPACE_KEY);
  } catch {
    // Browser storage can be unavailable in a private or restricted window.
  }
}

/** No identity is inferred from storage. The caller must already have a session. */
export function readOfflineWorkspace(
  userId: string,
): OfflineWorkspaceSnapshot | null {
  try {
    const raw = window.localStorage.getItem(OFFLINE_WORKSPACE_KEY);
    if (!raw) return null;
    const parsed = snapshotSchema.safeParse(JSON.parse(raw));
    if (parsed.success && parsed.data.userId === userId) return parsed.data;
    clearOfflineWorkspace();
  } catch {
    clearOfflineWorkspace();
  }
  return null;
}

/** Zod's allowlist strips unknown fields: never store tokens, inboxes or people. */
export function saveOfflineWorkspace(
  profile: Profile,
  learner: LearnerState,
): string | null {
  const parsed = snapshotSchema.safeParse({
    version: 1,
    userId: profile.id,
    savedAt: new Date().toISOString(),
    profile,
    learner,
  });
  if (!parsed.success) return null;
  try {
    window.localStorage.setItem(
      OFFLINE_WORKSPACE_KEY,
      JSON.stringify(parsed.data),
    );
    return parsed.data.savedAt;
  } catch {
    return null;
  }
}
