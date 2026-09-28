export type DomainId = "data-ai" | "robotics";
export type CatalogKind = "resource" | "competition" | "internship" | "project";
export type SupportMode = "online" | "in-person";
export type MemberRole = "learner" | "mentor" | "both";
export type RequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export interface Skill {
  id: string;
  label: string;
  domain: DomainId | "shared";
}
export interface Community {
  id: DomainId;
  name: string;
  shortName: string;
  description: string;
  focus: string[];
  color: string;
}
export interface CatalogItem {
  id: string;
  kind: CatalogKind;
  title: string;
  description: string;
  domain: DomainId;
  provider: string;
  format: "online" | "in-person" | "hybrid";
  cost: "free" | "hardware-required" | "unknown";
  skills: string[];
  requirements: string[];
  tags: string[];
  isSample: boolean;
  sourceUrl?: string;
  effort?: string;
}
export interface Profile {
  id: string;
  display_name: string;
  headline: string;
  bio: string;
  domain: DomainId;
  skills: string[];
  role: MemberRole;
  support_modes: SupportMode[];
  help_topics: string[];
  discoverable: boolean;
  open_to_requests: boolean;
  is_demo: boolean;
  created_at?: string;
}
export interface LearnerState {
  user_id: string;
  confirmed_skills: string[];
  interests: DomainId[];
  goal_id: string | null;
  online_only: boolean;
  saved_ids: string[];
  intro: string;
}
export interface Membership {
  user_id: string;
  community_id: DomainId;
  created_at?: string;
}
export interface ConnectionRequest {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_name: string;
  recipient_name: string;
  opportunity_id: string;
  help_type: "mentorship" | "collaboration";
  message: string;
  status: RequestStatus;
  next_step: string | null;
  created_at: string;
  updated_at: string;
}
export interface Coverage {
  met: string[];
  missing: string[];
  total: number;
}
export interface PersonMatch {
  person: Profile;
  reasons: string[];
  sharedSkills: string[];
}
export interface PathStep {
  id: string;
  title: string;
  description: string;
  gapIds: string[];
  resources: CatalogItem[];
}
export interface SuggestedProfile {
  skills: string[];
  interests: DomainId[];
  goal: string;
  evidence: { skill: string; quote: string }[];
}
