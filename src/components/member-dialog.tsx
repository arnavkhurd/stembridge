"use client";

import { ArrowUpRight, Globe2, MapPin } from "lucide-react";
import { domainLabel, getSkillLabel } from "@/lib/data";
import { getCoverage } from "@/lib/matching";
import type { CatalogItem, ConnectionRequest, Profile } from "@/lib/types";
import { Avatar, Badge, Button, Modal } from "./ui";
import { useWorkspace } from "./workspace-provider";

type MemberDialogProps = {
  person: Profile | null;
  onClose: () => void;
  onRequest: (
    person: Profile,
    type: ConnectionRequest["help_type"],
  ) => void;
  currentGoal: CatalogItem;
  onAuth?: () => void;
};

export function MemberDialog({
  person,
  onClose,
  onRequest,
  currentGoal,
  onAuth,
}: MemberDialogProps) {
  const { user, learner } = useWorkspace();
  const sample = !!person && (person.is_demo || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(person.id));
  const ownProfile = person?.id === user?.id;
  const acceptingRequests = !!person?.discoverable && !!person?.open_to_requests;
  const profileSkills = [...new Set(person?.skills ?? [])];
  const helpTopics = [...new Set(person?.help_topics ?? [])];
  const missing = getCoverage(learner.confirmed_skills, currentGoal.requirements).missing;
  const relevantSkills = person?.domain === currentGoal.domain
    ? profileSkills.filter((skill) => missing.includes(skill))
    : [];
  const canRequest = !!person && !!user && !sample && !ownProfile && acceptingRequests;

  function connect(type: ConnectionRequest["help_type"]) {
    if (!person || !canRequest) return;
    onClose();
    onRequest(person, type);
  }

  return (
    <Modal
      open={!!person}
      onClose={onClose}
      title={person?.display_name ?? "Member profile"}
      description={person?.headline || "Get to know someone in your community."}
    >
      {person && (
        <>
          <div className="stack">
            <div className="row wrap">
              <Avatar name={person.display_name} domain={person.domain} size="large" />
              <div className="stack" style={{ gap: 10 }}>
                <div className="row wrap">
                  <Badge className="badge-violet">
                    {person.role === "both" ? "Mentor & peer" : person.role === "mentor" ? "Mentor" : "Peer"}
                  </Badge>
                  <Badge>{domainLabel(person.domain)}</Badge>
                  {sample && <Badge className="badge-sample">Sample profile</Badge>}
                </div>
                <div className="row wrap muted">
                  {person.support_modes.includes("online") && (
                    <span className="row"><Globe2 size={16} aria-hidden="true" /> Online</span>
                  )}
                  {person.support_modes.includes("in-person") && (
                    <span className="row"><MapPin size={16} aria-hidden="true" /> In person</span>
                  )}
                  {!person.support_modes.length && <span>No connection format listed</span>}
                </div>
              </div>
            </div>

            {sample && (
              <p className="form-note">
                This is a fictional sample, not a real community member. It cannot receive connection requests.
              </p>
            )}

            <section>
              <h3>About</h3>
              <p style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>
                {person.bio || "No introduction added yet."}
              </p>
            </section>

            <section>
              <h3>Skills</h3>
              {profileSkills.length ? (
                <div className="skill-chips" style={{ marginTop: 12 }}>
                  {profileSkills.map((skill) => <Badge key={skill}>{getSkillLabel(skill)}</Badge>)}
                </div>
              ) : <p className="muted" style={{ marginTop: 10 }}>No skills listed yet.</p>}
              <p className="muted" style={{ marginTop: 12 }}>These skills are self-reported.</p>
            </section>

            {!!helpTopics.length && (
              <section>
                <h3>Happy to help with</h3>
                <div className="skill-chips" style={{ marginTop: 12 }}>
                  {helpTopics.map((topic) => <Badge key={topic}>{topic}</Badge>)}
                </div>
              </section>
            )}

            {!!relevantSkills.length && (
              <section className="request-context">
                <h3>For your next step</h3>
                <p style={{ marginTop: 10 }}>{currentGoal.title}</p>
                <p style={{ marginTop: 8 }}>
                  {person.display_name.split(" ")[0]} lists {relevantSkills.map(getSkillLabel).join(", ")}, which could help with this goal.
                </p>
              </section>
            )}

            {!sample && ownProfile && <p className="form-note">This is your public profile.</p>}
            {!sample && !ownProfile && !acceptingRequests && (
              <p className="form-note">This member is not accepting new requests right now.</p>
            )}
            {!sample && !ownProfile && acceptingRequests && (
              <p className="form-note">
                {user ? "Start with a short request. You can review your message before sending." : "Sign in to send a connection request."}
              </p>
            )}
          </div>

          <div className="form-actions wrap">
            <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
            {!user && onAuth && (
              <Button type="button" onClick={() => { onClose(); onAuth(); }}>
                {sample ? "Meet real members" : "Sign in to connect"}
                <ArrowUpRight size={16} />
              </Button>
            )}
            {canRequest && person.role !== "mentor" && (
              <Button type="button" variant={person.role === "both" ? "secondary" : "primary"} onClick={() => connect("collaboration")}>
                Ask to collaborate <ArrowUpRight size={16} />
              </Button>
            )}
            {canRequest && person.role !== "learner" && (
              <Button type="button" onClick={() => connect("mentorship")}>
                Ask for guidance <ArrowUpRight size={16} />
              </Button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
