"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  CheckCircle2,
  Circle,
  LoaderCircle,
  Mail,
  Sparkles,
  Users,
} from "lucide-react";
import {
  catalog,
  communities,
  domainLabel,
  getSkillLabel,
  skills,
} from "@/lib/data";
import { getCoverage, getPathSteps, matchPeople } from "@/lib/matching";
import type {
  CatalogItem,
  ConnectionRequest,
  DomainId,
  LearnerState,
  MemberRole,
  Profile,
  SuggestedProfile,
  SupportMode,
} from "@/lib/types";
import { Avatar, Badge, Button, Modal } from "./ui";
import { useWorkspace } from "./workspace-provider";
import { useLanguage } from "./language-provider";
import { translateAuthoredText } from "@/lib/i18n-content";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  onNotice: (message: string) => void;
};
type HelpType = ConnectionRequest["help_type"];
const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Please try again. Your changes have not been saved.";
const isSamplePerson = (person: Profile) =>
  person.is_demo ||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    person.id,
  );

export function AuthDialog({ open, onClose, onNotice }: DialogProps) {
  const { t } = useLanguage();
  const { configured } = useWorkspace();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("Your STEMBridge account")}
      description={t("Meet mentors, find peers, and save your next steps.")}
    >
      {open &&
        (configured ? (
          <AuthForm onClose={onClose} onNotice={onNotice} />
        ) : (
          <div className="stack">
            <p className="form-note">
              {t(
                "Accounts are not connected yet. You can try a sample profile and save opportunities in this browser.",
              )}
            </p>
            <p className="small muted">
              {t(
                "Joining a community and sending requests need a connected account.",
              )}
            </p>
            <Button onClick={onClose}>
              {t("Keep exploring")}
              <ArrowRight size={16} />
            </Button>
          </div>
        ))}
    </Modal>
  );
}

function AuthForm({ onClose, onNotice }: Omit<DialogProps, "open">) {
  const { t } = useLanguage();
  const { signIn, signUp } = useWorkspace();
  const [creating, setCreating] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      if (creating) {
        const result = await signUp(email, password, name);
        onNotice(
          result.needsConfirmation
            ? t(
                "Check your email to confirm your account, then return to sign in.",
              )
            : t(
                "Your account is ready. Add your skills and choose how you want to connect.",
              ),
        );
      } else {
        await signIn(email, password);
        onNotice(t("Welcome back. Your workspace is loading."));
      }
      onClose();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="stack">
        {creating && (
          <div className="field">
            <label htmlFor="auth-name">{t("Your name")}</label>
            <input
              id="auth-name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={80}
              placeholder={t("Your preferred name")}
              disabled={pending}
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="auth-email">{t("Email address")}</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            maxLength={254}
            placeholder="you@example.com"
            disabled={pending}
          />
        </div>
        <div className="field">
          <label htmlFor="auth-password">{t("Password")}</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={creating ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={creating ? 8 : 1}
            maxLength={128}
            disabled={pending}
          />
          {creating && (
            <small>
              {t(
                "At least 8 characters. You choose whether to make your profile public.",
              )}
            </small>
          )}
        </div>
        {error && (
          <p className="field-error" role="alert">
            {t(error)}
          </p>
        )}
        <Button type="submit" className="full-width" disabled={pending}>
          {pending ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <Mail size={16} />
          )}
          {pending
            ? t("One moment…")
            : creating
              ? t("Create my account")
              : t("Sign in")}
        </Button>
      </div>
      <p className="auth-switch">
        {creating
          ? t("Already part of the community?")
          : t("New to STEMBridge?")}{" "}
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setCreating(!creating);
            setError(null);
          }}
        >
          {creating ? t("Sign in") : t("Create an account")}
        </button>
      </p>
    </form>
  );
}

export function ProfileDialog({ open, onClose, onNotice }: DialogProps) {
  const { t } = useLanguage();
  const { profile, learner, preview } = useWorkspace();
  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={preview ? t("Try a sample profile") : t("Your profile")}
      description={t("Choose your skills and how you want to connect.")}
    >
      {open &&
        (profile ? (
          <ProfileForm
            key={profile.id}
            profile={profile}
            learner={learner}
            onClose={onClose}
            onNotice={onNotice}
          />
        ) : (
          <p className="loading-surface">
            {t(
              "Loading your profile… If it does not appear, close this panel and refresh.",
            )}
          </p>
        ))}
    </Modal>
  );
}

function ProfileForm({
  profile,
  learner,
  onClose,
  onNotice,
}: { profile: Profile; learner: LearnerState } & Omit<DialogProps, "open">) {
  const { t } = useLanguage();
  const workspace = useWorkspace();
  const [name, setName] = useState(profile.display_name);
  const [headline, setHeadline] = useState(profile.headline);
  const [bio, setBio] = useState(profile.bio);
  const [domain, setDomain] = useState<DomainId>(profile.domain);
  const [role, setRole] = useState<MemberRole>(profile.role);
  const [confirmed, setConfirmed] = useState(learner.confirmed_skills);
  const [interests, setInterests] = useState<DomainId[]>(
    learner.interests.length ? learner.interests : [profile.domain],
  );
  const [modes, setModes] = useState<SupportMode[]>(profile.support_modes);
  const [topics, setTopics] = useState(profile.help_topics.join(", "));
  const [onlineOnly, setOnlineOnly] = useState(learner.online_only);
  const [discoverable, setDiscoverable] = useState(profile.discoverable);
  const [openToRequests, setOpenToRequests] = useState(
    profile.open_to_requests,
  );
  const [intro, setIntro] = useState(learner.intro);
  const [consent, setConsent] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestedProfile | null>(null);
  const [suggestionApplied, setSuggestionApplied] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const aiController = useRef<AbortController | null>(null);
  const optionalDetails = useRef<HTMLDetailsElement | null>(null);
  const topicInput = useRef<HTMLInputElement | null>(null);
  useEffect(() => () => aiController.current?.abort(), []);

  async function suggest() {
    setAiBusy(true);
    setAiError(null);
    setSuggestion(null);
    setSuggestionApplied(false);
    aiController.current = new AbortController();
    const timer = window.setTimeout(
      () => aiController.current?.abort(),
      18_000,
    );
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: intro, consent: true }),
        signal: aiController.current.signal,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error ||
            "AI assistance is unavailable. You can continue manually.",
        );
      if (
        !Array.isArray(result.skills) ||
        !Array.isArray(result.interests) ||
        !Array.isArray(result.evidence)
      )
        throw new Error(
          "AI returned an unreadable suggestion. Continue with manual editing.",
        );
      setSuggestion(result as SuggestedProfile);
    } catch (cause) {
      setAiError(
        cause instanceof Error && cause.name === "AbortError"
          ? "AI took too long. Your introduction is preserved; you can continue manually."
          : errorMessage(cause),
      );
    } finally {
      window.clearTimeout(timer);
      setAiBusy(false);
    }
  }

  function applySuggestion() {
    if (!suggestion) return;
    setConfirmed((current) => [...new Set([...current, ...suggestion.skills])]);
    if (suggestion.interests.length) {
      setInterests(suggestion.interests);
      setDomain(suggestion.interests[0]);
    }
    setSuggestionApplied(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please add the name you would like the community to use.");
      return;
    }
    if (!modes.length) {
      setError("Choose at least one way you are open to connecting.");
      return;
    }
    const helpTopics = topics
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);
    if (
      helpTopics.length > 20 ||
      helpTopics.some((topic) => topic.length > 120)
    ) {
      setError("Use up to 20 short help topics, separated by commas.");
      if (optionalDetails.current) optionalDetails.current.open = true;
      topicInput.current?.focus();
      return;
    }
    setSaving(true);
    try {
      await workspace.saveProfile(
        {
          display_name: name.trim(),
          headline: headline.trim(),
          bio: bio.trim(),
          domain,
          role,
          skills: confirmed,
          support_modes: modes,
          help_topics: helpTopics,
          discoverable,
          open_to_requests: discoverable && openToRequests,
        },
        {
          confirmed_skills: confirmed,
          interests: interests.length ? interests : [domain],
          online_only: onlineOnly,
          intro,
        },
      );
      onNotice(
        workspace.preview
          ? t("Your preview profile is saved in this browser.")
          : t("Profile saved. Your recommendations are updated."),
      );
      onClose();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      onInvalidCapture={(event) => {
        if (event.target instanceof HTMLElement) {
          const section = event.target.closest("details");
          if (section) section.open = true;
        }
      }}
    >
      <h3>{t("About you")}</h3>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="profile-name">{t("Your name")}</label>
          <input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            required
            autoComplete="name"
          />
        </div>
        <div className="field">
          <label htmlFor="profile-domain">{t("Main interest")}</label>
          <select
            id="profile-domain"
            value={domain}
            onChange={(event) => {
              const next = event.target.value as DomainId;
              setDomain(next);
              setInterests((current) =>
                current.includes(next) ? current : [...current, next],
              );
            }}
          >
            {communities.map((community) => (
              <option key={community.id} value={community.id}>
                {t(community.name)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="profile-role">{t("I want to…")}</label>
          <select
            id="profile-role"
            value={role}
            onChange={(event) => setRole(event.target.value as MemberRole)}
          >
            <option value="learner">{t("Learn with others")}</option>
            <option value="mentor">{t("Be a mentor")}</option>
            <option value="both">{t("Learn and mentor")}</option>
          </select>
        </div>
      </div>
      <div className="profile-form-section">
        <h3>{t("Your skills")}</h3>
        <details className="ai-panel">
          <summary>{t("Suggest skills with AI (optional)")}</summary>
          <p>
            {t(
              "Describe what you can do and what you want to learn. Review the suggestions before adding them.",
            )}
          </p>
          <div className="field" style={{ marginTop: 12 }}>
            <label className="sr-only" htmlFor="profile-intro">
              {t("Your experience and interests")}
            </label>
            <textarea
              id="profile-intro"
              value={intro}
              onChange={(event) => {
                setIntro(event.target.value);
                setSuggestion(null);
                setSuggestionApplied(false);
              }}
              maxLength={2500}
              placeholder={t(
                "I can write beginner Python and use Git. I want to build my first ML project…",
              )}
              disabled={aiBusy}
            />
            <small>
              {t("{count}/2,500 characters", { count: intro.length })}
            </small>
          </div>
          <label className="check-label" style={{ marginTop: 12 }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              disabled={aiBusy}
            />
            {t(
              "Send this introduction to Google Gemini for skill suggestions.",
            )}
          </label>
          <p style={{ marginTop: 7 }}>
            {t(
              "Leave out sensitive details. You can also choose skills yourself below.",
            )}
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void suggest()}
            disabled={!consent || intro.trim().length < 10 || aiBusy || saving}
          >
            {aiBusy ? (
              <LoaderCircle size={15} className="spin" />
            ) : (
              <Sparkles size={15} />
            )}
            {aiBusy ? t("Finding suggestions…") : t("Suggest skills")}
          </Button>
          {aiError && (
            <p className="field-error" role="alert" style={{ marginTop: 12 }}>
              {t(aiError)}
            </p>
          )}
          {suggestion && (
            <div className="ai-suggestion" aria-live="polite">
              <h4>{t("Check the suggestions")}</h4>
              <p>
                {suggestion.skills.length
                  ? t("Keep only skills you can use or explain.")
                  : t("No skills found. Choose your skills below instead.")}
              </p>
              {suggestion.evidence.length > 0 && (
                <ul>
                  {suggestion.evidence.map((entry) => (
                    <li key={entry.skill}>
                      <strong>{t(getSkillLabel(entry.skill))}:</strong> “
                      {entry.quote}”
                    </li>
                  ))}
                </ul>
              )}
              {suggestion.interests.length > 0 && (
                <p>
                  {t("Interests:")}{" "}
                  {suggestion.interests
                    .map((id) => t(domainLabel(id)))
                    .join(", ")}
                </p>
              )}
              {suggestion.goal && (
                <p>
                  {t("Your goal:")} {suggestion.goal}
                </p>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={applySuggestion}
                disabled={suggestionApplied}
              >
                {suggestionApplied ? (
                  <Check size={15} />
                ) : (
                  <ArrowRight size={15} />
                )}
                {suggestionApplied
                  ? t("Added to your draft")
                  : t("Use these suggestions")}
              </Button>
              {suggestionApplied && (
                <p style={{ marginTop: 8 }}>
                  {t(
                    "Check your skills below, then save. These changes are still a draft.",
                  )}
                </p>
              )}
            </div>
          )}
        </details>
        <div className="field" style={{ marginTop: 18 }}>
          <span className="label">{t("What can you already do?")}</span>
          <small>{t("Select skills you can use or explain today.")}</small>
          <div className="checkbox-grid">
            {skills.map((skill) => (
              <label className="skill-option" key={skill.id}>
                <input
                  type="checkbox"
                  checked={confirmed.includes(skill.id)}
                  onChange={(event) =>
                    setConfirmed((current) =>
                      event.target.checked
                        ? [...current, skill.id]
                        : current.filter((id) => id !== skill.id),
                    )
                  }
                />
                <span>
                  {confirmed.includes(skill.id) && (
                    <Check size={16} aria-hidden="true" />
                  )}
                  {t(skill.label)}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="profile-form-section">
        <h3>{t("How you want to connect")}</h3>
        <div className="stack">
          <span className="label">{t("Topics you want to explore")}</span>
          <div className="row wrap">
            {communities.map((community) => (
              <label className="check-label" key={community.id}>
                <input
                  type="checkbox"
                  checked={interests.includes(community.id)}
                  onChange={(event) =>
                    setInterests((current) =>
                      event.target.checked
                        ? [...current, community.id]
                        : current.filter((id) => id !== community.id),
                    )
                  }
                />
                {t(community.shortName)}
              </label>
            ))}
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(event) => setOnlineOnly(event.target.checked)}
            />
            {t("Show only online opportunities and online support")}
          </label>
          <details ref={optionalDetails}>
            <summary>{t("More about you (optional)")}</summary>
            <div className="stack" style={{ marginTop: 16 }}>
              <div className="field">
                <label htmlFor="profile-headline">
                  {t("A short introduction")}
                </label>
                <input
                  id="profile-headline"
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  maxLength={160}
                  placeholder={t("Engineering student, curious about AI")}
                />
              </div>
              <div className="field">
                <label htmlFor="profile-bio">
                  {t("A little more about you")}
                </label>
                <textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={1500}
                  placeholder={t(
                    "Your interests and the people you would like to meet",
                  )}
                />
                <small>
                  {t("Visible with your profile if you make it public.")}
                </small>
              </div>
              <div className="field">
                <label htmlFor="profile-topics">
                  {t("Topics you can help with")}
                </label>
                <input
                  id="profile-topics"
                  ref={topicInput}
                  value={topics}
                  onChange={(event) => setTopics(event.target.value)}
                  maxLength={600}
                  placeholder={t(
                    "Project feedback, Study buddy, Python practice",
                  )}
                />
                <small>
                  {t("Separate topics with commas. Skills are self-reported.")}
                </small>
              </div>
            </div>
          </details>
          <div className="field">
            <span className="label">{t("I can connect…")}</span>
            <div className="row wrap">
              {(["online", "in-person"] as SupportMode[]).map((mode) => (
                <label className="check-label" key={mode}>
                  <input
                    type="checkbox"
                    checked={modes.includes(mode)}
                    onChange={(event) =>
                      setModes((current) =>
                        event.target.checked
                          ? [...current, mode]
                          : current.filter((value) => value !== mode),
                      )
                    }
                  />
                  {mode === "online" ? t("Online") : t("In person")}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="profile-form-section stack">
        <h3>{t("Who can find you")}</h3>
        <label className="check-label">
          <input
            type="checkbox"
            checked={discoverable}
            onChange={(event) => setDiscoverable(event.target.checked)}
          />
          {t("Show my profile in the public directory")}
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={openToRequests}
            disabled={!discoverable}
            onChange={(event) => setOpenToRequests(event.target.checked)}
          />
          {t("Let members send me connection requests")}
        </label>
        <p className="form-note">
          {t(
            "Your email stays private. A public profile shows your name, bio, skills, interests, joined circles and connection preferences.",
          )}{" "}
          {workspace.preview
            ? t(
                "This sample is saved only in this browser. It is not published.",
              )
            : t(
                "You can hide it at any time. Past requests remain visible to you and the other person.",
              )}
        </p>
      </div>
      {error && (
        <p className="field-error" role="alert" style={{ marginTop: 16 }}>
          {t(error)}
        </p>
      )}
      <div className="form-actions">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={saving}
        >
          {t("Cancel")}
        </Button>
        <Button type="submit" disabled={saving || aiBusy}>
          {saving ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <Check size={16} />
          )}
          {saving
            ? t("Saving…")
            : workspace.preview
              ? t("Save preview profile")
              : t("Save profile")}
        </Button>
      </div>
    </form>
  );
}

type RequestDialogProps = {
  person: Profile | null;
  item: CatalogItem | null;
  helpType?: HelpType;
  initialMessage?: string;
  onClose: () => void;
  onNotice: (message: string) => void;
};
export function RequestDialog({
  person,
  item,
  helpType,
  initialMessage,
  onClose,
  onNotice,
}: RequestDialogProps) {
  const { t } = useLanguage();
  return (
    <Modal
      open={!!person}
      onClose={onClose}
      title={t("Ask to connect")}
      description={t("Share your goal and one thing you would like help with.")}
    >
      {person && (
        <RequestForm
          key={`${person.id}:${item?.id ?? "none"}:${helpType ?? "default"}`}
          person={person}
          item={item}
          helpType={helpType}
          initialMessage={initialMessage}
          onClose={onClose}
          onNotice={onNotice}
        />
      )}
    </Modal>
  );
}

function requestMessage(
  person: Profile,
  item: CatalogItem | undefined,
  helpType: HelpType,
  learner: LearnerState,
  t: ReturnType<typeof useLanguage>["t"],
) {
  const known = learner.confirmed_skills
    .slice(0, 3)
    .map((id) => t(getSkillLabel(id)));
  return [
    t("Hi {name}, I’m working toward {goal}.", {
      name: person.display_name.split(" ")[0],
      goal: item ? `“${t(item.title)}”` : t("my next STEM project"),
    }),
    known.length
      ? t("My starting skills include {skills}.", { skills: known.join(", ") })
      : t("I’m starting as a beginner."),
    helpType === "mentorship"
      ? t(
          "Could you help me review the scope and suggest one useful next step?",
        )
      : t(
          "Would you like to work through a first exercise together and agree on a small shared task?",
        ),
  ].join(" ");
}

function RequestForm({
  person,
  item,
  helpType: initialHelpType,
  initialMessage,
  onClose,
  onNotice,
}: RequestDialogProps & { person: Profile }) {
  const { t } = useLanguage();
  const workspace = useWorkspace();
  const goals = catalog.filter((entry) => entry.kind !== "resource");
  const initialGoal =
    item?.kind !== "resource" && item
      ? item
      : (goals.find((goal) => goal.id === workspace.learner.goal_id) ??
        goals.find((goal) => goal.domain === person.domain) ??
        goals[0]);
  const initialType: HelpType =
    person.role === "learner"
      ? "collaboration"
      : (initialHelpType ?? "mentorship");
  const [goalId, setGoalId] = useState(initialGoal.id);
  const [helpType, setHelpType] = useState<HelpType>(initialType);
  const [message, setMessage] = useState(
    () =>
      initialMessage ??
      requestMessage(person, initialGoal, initialType, workspace.learner, t),
  );
  const [editedMessage, setEditedMessage] = useState(
    initialMessage !== undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const sample = isSamplePerson(person);
  const canSend =
    !!workspace.user &&
    !sample &&
    person.id !== workspace.user.id &&
    person.open_to_requests &&
    person.discoverable;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) {
      setError(
        sample
          ? "This is a sample profile and cannot receive requests. Choose a registered member after signing in."
          : "Sign in and choose a member who is accepting requests.",
      );
      return;
    }
    if (message.trim().length < 10) {
      setError(
        "Add at least 10 characters to explain the help you are asking for.",
      );
      return;
    }
    setPending(true);
    setError(null);
    try {
      await workspace.sendRequest(person.id, goalId, helpType, message);
      onNotice(
        t(
          "Your request was sent to {name}. Track the response in Connections.",
          { name: person.display_name.split(" ")[0] },
        ),
      );
      onClose();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="stack">
        <div className="request-context">
          <div className="row">
            <Avatar name={person.display_name} domain={person.domain} />
            <div>
              <strong>{person.display_name}</strong>
              <p>
                {isSamplePerson(person) ? t(person.headline) : person.headline}
              </p>
            </div>
          </div>
        </div>
        {sample && (
          <p className="form-note">
            {t(
              "This is a fictional sample. Only registered members can receive requests.",
            )}
          </p>
        )}
        <div className="field">
          <label htmlFor="request-goal">{t("Your goal")}</label>
          <select
            id="request-goal"
            value={goalId}
            disabled={pending}
            onChange={(event) => {
              const next = event.target.value;
              setGoalId(next);
              if (!editedMessage)
                setMessage(
                  requestMessage(
                    person,
                    goals.find((goal) => goal.id === next),
                    helpType,
                    workspace.learner,
                    t,
                  ),
                );
            }}
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {t(goal.title)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="request-type">
            {t("How would you like to connect?")}
          </label>
          <select
            id="request-type"
            value={helpType}
            disabled={pending}
            onChange={(event) => {
              const next = event.target.value as HelpType;
              setHelpType(next);
              if (!editedMessage)
                setMessage(
                  requestMessage(
                    person,
                    goals.find((goal) => goal.id === goalId),
                    next,
                    workspace.learner,
                    t,
                  ),
                );
            }}
          >
            {person.role !== "learner" && (
              <option value="mentorship">{t("Ask a mentor")}</option>
            )}
            <option value="collaboration">{t("Work with a peer")}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="request-message">{t("Your message")}</label>
          <textarea
            id="request-message"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setEditedMessage(true);
            }}
            minLength={10}
            maxLength={1200}
            required
            disabled={pending}
            style={{ minHeight: 150 }}
          />
          <small>
            {t("{count}/1,200 characters. Ask for one clear next step.", {
              count: message.length,
            })}
            {initialMessage !== undefined && (
              <>
                {" "}
                {t(
                  "If you change the goal or request type, update your message too.",
                )}
              </>
            )}
          </small>
        </div>
        {!workspace.user && (
          <p className="form-note">
            {t(
              "Sign in to send a real request. Preview interactions do not contact anyone.",
            )}
          </p>
        )}
        {error && (
          <p className="field-error" role="alert">
            {t(error)}
          </p>
        )}
      </div>
      <div className="form-actions">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={pending}
        >
          {t("Cancel")}
        </Button>
        <Button type="submit" disabled={pending || !canSend}>
          {pending ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <ArrowUpRight size={16} />
          )}
          {pending ? t("Sending…") : t("Send request")}
        </Button>
      </div>
    </form>
  );
}

type OpportunityDialogProps = {
  item: CatalogItem | null;
  onClose: () => void;
  onRequest: (person: Profile, item: CatalogItem, helpType: HelpType) => void;
  onNotice: (message: string) => void;
  onOfflineLesson?: (id: string) => void;
};
export function OpportunityDialog({
  item,
  onClose,
  onRequest,
  onNotice,
  onOfflineLesson,
}: OpportunityDialogProps) {
  const { t } = useLanguage();
  return (
    <Modal
      open={!!item}
      onClose={onClose}
      wide
      title={t(item?.title ?? "Your plan")}
      description={
        item
          ? `${t(domainLabel(item.domain))} · ${t(item.provider)}`
          : undefined
      }
    >
      {item && (
        <OpportunityDetails
          key={item.id}
          item={item}
          onClose={onClose}
          onRequest={onRequest}
          onNotice={onNotice}
          onOfflineLesson={onOfflineLesson}
        />
      )}
    </Modal>
  );
}

function OpportunityDetails({
  item,
  onClose,
  onRequest,
  onNotice,
  onOfflineLesson,
}: OpportunityDialogProps & { item: CatalogItem }) {
  const { t } = useLanguage();
  const workspace = useWorkspace();
  const [error, setError] = useState<string | null>(null);
  const coverage = getCoverage(
    workspace.learner.confirmed_skills,
    item.requirements,
  );
  const steps = getPathSteps(workspace.learner, item);
  const mentors = matchPeople(
    workspace.people,
    workspace.learner,
    item,
    "mentor",
  ).slice(0, 1);
  const peers = matchPeople(
    workspace.people,
    workspace.learner,
    item,
    "peer",
  ).slice(0, 1);
  const saved = workspace.learner.saved_ids.includes(item.id);
  const currentGoal = workspace.learner.goal_id === item.id;

  async function bookmark() {
    setError(null);
    try {
      await workspace.toggleSaved(item.id);
      onNotice(
        saved
          ? t("Removed from your saved opportunities.")
          : workspace.preview
            ? t("Saved in this browser preview.")
            : t("Saved to your workspace."),
      );
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  async function chooseGoal() {
    setError(null);
    try {
      await workspace.updateLearner({
        goal_id: item.id,
        interests: [...new Set([...workspace.learner.interests, item.domain])],
      });
      onNotice(
        t("Your next goal is “{goal}”. Find it on My Hub.", {
          goal: t(item.title),
        }),
      );
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  return (
    <>
      <div className="detail-hero">
        <div className="row wrap">
          <Badge className={item.isSample ? "badge-sample" : "badge-lime"}>
            {item.isSample
              ? item.kind === "resource" || item.kind === "project"
                ? t("Practice exercise")
                : t("Sample listing")
              : t("Official resource")}
          </Badge>
          <Badge>
            {item.format === "in-person"
              ? t("In person")
              : item.format === "hybrid"
                ? t("Hybrid")
                : t("Online")}
          </Badge>
          {item.cost === "hardware-required" && (
            <Badge className="badge-orange">{t("Hardware required")}</Badge>
          )}
        </div>
        <p>{t(item.description)}</p>
        <div className="row wrap">
          {item.kind !== "resource" && (
            <Button
              onClick={() => void chooseGoal()}
              disabled={workspace.busy || currentGoal}
            >
              {currentGoal ? <Check size={15} /> : <ArrowRight size={15} />}
              {currentGoal ? t("Current goal") : t("Choose this goal")}
            </Button>
          )}
          {item.sourceUrl && (
            <a
              className="button button-primary"
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {workspace.offline
                ? t("Full resource · needs internet")
                : t("Open resource")}{" "}
              <ArrowUpRight size={15} />
            </a>
          )}
          {item.kind === "resource" && onOfflineLesson && (
            <Button
              variant="secondary"
              onClick={() => onOfflineLesson(item.id)}
            >
              {t("Try an offline exercise")}
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => void bookmark()}
            disabled={workspace.busy}
            aria-pressed={saved}
          >
            <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
            {saved ? t("Saved") : t("Save for later")}
          </Button>
        </div>
        {item.isSample && (
          <p style={{ marginBottom: 0 }}>
            {item.kind === "resource" || item.kind === "project"
              ? t("A practice brief created by STEMBridge.")
              : t(
                  "This is a fictional example, not a live event or opening. There is no application or deadline.",
                )}
          </p>
        )}
      </div>
      {error && (
        <p className="field-error" role="alert" style={{ marginBottom: 16 }}>
          {t(error)}
        </p>
      )}
      <div className="detail-layout">
        <div className="detail-section">
          <h3>{t("Your skills today")}</h3>
          <div className="coverage-box">
            {coverage.total ? (
              <>
                <div>
                  <span className="number">
                    {coverage.met.length}
                    <span className="muted">/{coverage.total}</span>
                  </span>{" "}
                  <span>{t("listed skills in your profile")}</span>
                </div>
                <p>
                  {t(
                    "Based on the skills you selected. This is not a skills test.",
                  )}
                </p>
                <div className="coverage-bars" aria-hidden="true">
                  {item.requirements.map((skill) => (
                    <span
                      key={skill}
                      className={
                        coverage.met.includes(skill) ? "met" : undefined
                      }
                    />
                  ))}
                </div>
              </>
            ) : (
              <p>
                {t(
                  "No starting skills are listed. Read the introduction to get started.",
                )}
              </p>
            )}
            {coverage.met.length > 0 && (
              <details>
                <summary>
                  {t("Skills you already listed ({count})", {
                    count: coverage.met.length,
                  })}
                </summary>
                {coverage.met.map((skill) => (
                  <div className="skill-line met" key={skill}>
                    <CheckCircle2 size={16} />
                    {t(getSkillLabel(skill))}
                  </div>
                ))}
              </details>
            )}
            {coverage.missing.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h4>{t("Skills to learn")}</h4>
                {coverage.missing.map((skill) => (
                  <div className="skill-line" key={skill}>
                    <Circle size={16} />
                    {t(getSkillLabel(skill))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <h3>{t("Your plan")}</h3>
          <div className="timeline">
            {steps.map((step, index) => (
              <div className="timeline-step" key={step.id}>
                <span className="step-number">{index + 1}</span>
                <h4>{t(step.title)}</h4>
                <p>
                  {step.id.endsWith("-foundations")
                    ? t(
                        "Try these resources in order. Check their starting requirements.",
                      )
                    : step.id.endsWith("-practice")
                      ? t(
                          "Try a small exercise. Update your skills yourself when you are ready.",
                        )
                      : step.id.endsWith("-connect")
                        ? t("Ask a mentor or peer for help with one next step.")
                        : step.id.endsWith("-unresolved")
                          ? t(
                              "No matching resource is listed here for {skills}. Ask a relevant person for guidance; these gaps remain unresolved.",
                              {
                                skills: step.gapIds
                                  .map((id) => t(getSkillLabel(id)))
                                  .join(", "),
                              },
                            )
                          : t(step.description)}
                </p>
                {step.resources.map((resource) =>
                  resource.sourceUrl ? (
                    <a
                      className="resource-link"
                      href={resource.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={resource.id}
                    >
                      <ArrowUpRight size={14} />
                      <span>{t(resource.title)}</span>
                    </a>
                  ) : (
                    <details className="resource-link" key={resource.id}>
                      <summary>{t(resource.title)}</summary>
                      <p style={{ marginTop: 12 }}>{t(resource.description)}</p>
                    </details>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
        <aside className="detail-aside">
          <h3>{t("People who can help")}</h3>
          <label className="check-label" style={{ marginBottom: 17 }}>
            <input
              type="checkbox"
              checked={workspace.learner.online_only}
              disabled={workspace.busy}
              onChange={(event) => {
                setError(null);
                void workspace
                  .updateLearner({ online_only: event.target.checked })
                  .catch((cause) => setError(errorMessage(cause)));
              }}
            />
            {t("Online only")}
          </label>
          {[
            {
              matches: mentors,
              label: t("A mentor"),
              type: "mentorship" as HelpType,
            },
            {
              matches: peers,
              label: t("A learning partner"),
              type: "collaboration" as HelpType,
            },
          ].map(({ matches, label, type }) => (
            <div key={type} style={{ marginBottom: 18 }}>
              <h4 style={{ marginBottom: 12 }}>{t(label)}</h4>
              {matches.length ? (
                matches.map(({ person, reasons }) => (
                  <div className="support-person" key={person.id}>
                    <div className="row">
                      <Avatar
                        name={person.display_name}
                        domain={person.domain}
                        size="small"
                      />
                      <div>
                        <h4>{person.display_name}</h4>
                        <small>
                          {isSamplePerson(person)
                            ? t("Fictional sample")
                            : person.is_demo
                              ? t("Demo account")
                              : t(domainLabel(person.domain))}
                        </small>
                      </div>
                    </div>
                    <p>{translateAuthoredText(reasons[0] ?? "", t)}</p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onClose();
                        onRequest(person, item, type);
                      }}
                    >
                      {workspace.preview
                        ? t("Sign in to connect")
                        : type === "mentorship"
                          ? t("Ask for help")
                          : t("Connect")}
                      <ArrowUpRight size={14} />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="form-note">
                  {workspace.preview
                    ? t(
                        "No sample matches yet. Try changing your online preference.",
                      )
                    : t(
                        "No available member matches yet. Try changing your preference or check back later.",
                      )}
                </p>
              )}
            </div>
          ))}
          <p className="muted row" style={{ alignItems: "flex-start" }}>
            <Users size={15} style={{ flexShrink: 0, marginTop: 3 }} />
            <span>
              {t(
                "Suggestions use shared interests, relevant skills and your preferences. Members describe their own skills.",
              )}
            </span>
          </p>
        </aside>
      </div>
    </>
  );
}
