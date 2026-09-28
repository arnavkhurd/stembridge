"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Compass,
  Cpu,
  Download,
  Globe2,
  Handshake,
  Home,
  Info,
  LoaderCircle,
  LogOut,
  Mail,
  Pencil,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  WifiOff,
  X,
} from "lucide-react";
import { useWorkspace } from "@/components/workspace-provider";
import { useLanguage } from "@/components/language-provider";
import {
  Avatar,
  Badge,
  Button,
  DomainIcon,
  EmptyState,
  Modal,
  SectionHeading,
  SearchField,
} from "@/components/ui";
import { CatalogCard, CommunityCard, PersonCard } from "@/components/cards";
import { MemberDialog } from "@/components/member-dialog";
import { SupportDialog } from "@/components/support-dialog";
import { OfflineLearning } from "@/components/offline-learning";
import { useOffline } from "@/components/offline-provider";
import { catalogMatchesSearch, personMatchesSearch } from "@/lib/discovery";
import {
  AuthDialog,
  OpportunityDialog,
  ProfileDialog,
  RequestDialog,
} from "@/components/dialogs";
import {
  catalog,
  communities,
  domainLabel,
  getSkillLabel,
  sampleLearners,
} from "@/lib/data";
import { getCoverage, getRecommendedItems, matchPeople } from "@/lib/matching";
import { cn, errorMessage } from "@/lib/utils";
import type {
  CatalogItem,
  CatalogKind,
  ConnectionRequest,
  DomainId,
  PersonMatch,
  Profile,
} from "@/lib/types";

type View = "hub" | "communities" | "explore" | "connections" | "offline";
type HelpType = ConnectionRequest["help_type"];
const navigation = [
  { id: "hub", label: "My Hub", mobileLabel: "My Hub", icon: Home },
  {
    id: "communities",
    label: "Communities",
    mobileLabel: "Circles",
    icon: Users,
  },
  { id: "explore", label: "Explore", mobileLabel: "Explore", icon: Compass },
  {
    id: "connections",
    label: "Connections",
    mobileLabel: "Connect",
    icon: Handshake,
  },
  {
    id: "offline",
    label: "Offline learning",
    mobileLabel: "Offline",
    icon: Download,
  },
] as const;

export function StemBridge() {
  const { user } = useWorkspace();
  // Discard private drafts and open dialogs immediately when the account changes.
  return <WorkspaceScreen key={user?.id ?? "preview"} />;
}

function WorkspaceScreen() {
  const ws = useWorkspace();
  const { language, setLanguage, t } = useLanguage();
  const offlineSupport = useOffline();
  const [view, setView] = useState<View>("hub");
  const [communityId, setCommunityId] = useState<DomainId>("data-ai");
  const [category, setCategory] = useState<CatalogKind | "all">("all");
  const [filterDomain, setFilterDomain] = useState<DomainId | "all">("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [peopleQuery, setPeopleQuery] = useState("");
  const [memberTarget, setMemberTarget] = useState<{
    person: Profile;
    goal: CatalogItem;
  } | null>(null);
  const [peopleRole, setPeopleRole] = useState<"all" | "mentor" | "peer">(
    "all",
  );
  const [inbox, setInbox] = useState<"incoming" | "outgoing">("outgoing");
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [opportunity, setOpportunity] = useState<CatalogItem | null>(null);
  const [requestTarget, setRequestTarget] = useState<{
    person: Profile;
    item: CatalogItem;
    type: HelpType;
    initialMessage?: string;
  } | null>(null);
  const [responseTarget, setResponseTarget] =
    useState<ConnectionRequest | null>(null);
  const [responseNote, setResponseNote] = useState("");
  const [responseError, setResponseError] = useState("");
  const [notice, setNotice] = useState("");
  const [offline, setOffline] = useState(false);
  const [offlineLesson, setOfflineLesson] = useState<string>();
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introducedUser = useRef<string | null>(null);

  useEffect(() => {
    if (
      !ws.ready ||
      !ws.user ||
      !ws.profile ||
      authOpen ||
      introducedUser.current === ws.user.id
    )
      return;
    introducedUser.current = ws.user.id;
    if (
      !ws.profile.headline &&
      !ws.profile.bio &&
      ws.profile.skills.length === 0
    )
      setProfileOpen(true);
  }, [ws.ready, ws.user, ws.profile, authOpen]);

  const notify = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 6500);
  }, []);
  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );
  useEffect(() => {
    function readView() {
      const value = new URLSearchParams(window.location.search).get("view");
      if (navigation.some((n) => n.id === value)) setView(value as View);
      else setView("hub");
    }
    readView();
    window.addEventListener("popstate", readView);
    const readOnline = () => setOffline(!navigator.onLine);
    readOnline();
    window.addEventListener("online", readOnline);
    window.addEventListener("offline", readOnline);
    return () => {
      window.removeEventListener("popstate", readView);
      window.removeEventListener("online", readOnline);
      window.removeEventListener("offline", readOnline);
    };
  }, []);
  const navigate = (next: View) => {
    setView(next);
    const url = new URL(window.location.href);
    url.searchParams.set("view", next);
    window.history.pushState({}, "", url);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const act = async (operation: () => Promise<void>, success?: string) => {
    try {
      await operation();
      if (success) notify(success);
    } catch (error) {
      notify(errorMessage(error));
    }
  };
  const requireUser = (operation: () => void) => {
    if (!ws.user) {
      setAuthOpen(true);
      return;
    }
    operation();
  };
  const selectedGoal =
    catalog.find(
      (item) => item.id === ws.learner.goal_id && item.kind !== "resource",
    ) ??
    catalog.find(
      (item) =>
        item.kind === "project" && item.domain === ws.learner.interests[0],
    ) ??
    catalog[0];
  const coverage = getCoverage(
    ws.learner.confirmed_skills,
    selectedGoal.requirements,
  );
  const mentorMatches = matchPeople(
    ws.people,
    ws.learner,
    selectedGoal,
    "mentor",
  );
  const peerMatches = matchPeople(ws.people, ws.learner, selectedGoal, "peer");
  const supportMatches = [
    ...mentorMatches.slice(0, 2),
    ...peerMatches.slice(0, 1),
  ].filter(
    (match, index, matches) =>
      matches.findIndex((entry) => entry.person.id === match.person.id) ===
      index,
  );
  const recommended = getRecommendedItems(ws.learner)
    .filter((item) => item.kind !== "resource")
    .slice(0, 2);
  const firstName = ws.profile?.display_name.split(" ")[0] || t("there");
  const incomingPending = ws.requests.filter(
    (r) => r.recipient_id === ws.user?.id && r.status === "pending",
  ).length;

  const request = (
    person: Profile,
    item: CatalogItem = selectedGoal,
    type: HelpType = person.role === "learner" ? "collaboration" : "mentorship",
    initialMessage?: string,
  ) => {
    if (!ws.user) {
      setOpportunity(null);
      setAuthOpen(true);
      return;
    }
    if (person.is_demo || person.id.startsWith("sample-")) {
      notify(
        "This is a sample profile. Choose a registered member to send a real request.",
      );
      return;
    }
    setOpportunity(null);
    setRequestTarget({ person, item, type, initialMessage });
  };
  const saveItem = (id: string) =>
    act(
      () => ws.toggleSaved(id),
      ws.learner.saved_ids.includes(id)
        ? "Removed from your saved opportunities."
        : ws.preview
          ? "Saved in this browser's sample workspace."
          : "Saved to your account.",
    );
  const joinCircle = (id: DomainId) =>
    requireUser(() => {
      const joined = ws.memberships.some(
        (m) => m.user_id === ws.user?.id && m.community_id === id,
      );
      void act(
        () => ws.toggleMembership(id),
        joined
          ? "You left the circle."
          : "You're in. Your membership is saved.",
      );
    });
  const membersFor = (id: DomainId) =>
    ws.preview
      ? ws.people.filter((p) => p.domain === id)
      : ws.people.filter(
          (p) =>
            p.discoverable &&
            ws.memberships.some(
              (m) => m.user_id === p.id && m.community_id === id,
            ),
        );
  const communityCard = (id: DomainId, selected = false) => {
    const community = communities.find((c) => c.id === id)!;
    return (
      <CommunityCard
        key={id}
        community={community}
        people={membersFor(id)}
        count={membersFor(id).length}
        preview={ws.preview}
        joined={ws.memberships.some(
          (m) => m.user_id === ws.user?.id && m.community_id === id,
        )}
        selected={selected}
        onOpen={() => {
          setCommunityId(id);
          navigate("communities");
        }}
        onJoin={() => joinCircle(id)}
      />
    );
  };
  const peopleCards = (matches: PersonMatch[], role?: "mentor" | "peer") =>
    matches.map((match) => (
      <PersonCard
        key={match.person.id}
        match={match}
        role={role}
        onOpen={() =>
          setMemberTarget({ person: match.person, goal: selectedGoal })
        }
        onRequest={() =>
          request(
            match.person,
            selectedGoal,
            role === "peer" || (!role && match.person.role === "learner")
              ? "collaboration"
              : "mentorship",
          )
        }
      />
    ));

  const localizedSearch = (query: string, fields: string[]) => {
    if (language !== "mr") return false;
    const terms = query
      .normalize("NFKC")
      .toLocaleLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const text = fields
      .map((field) => t(field))
      .join(" ")
      .normalize("NFKC")
      .toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  };

  function hubView() {
    return (
      <>
        <div className="page-header">
          <div>
            <p className="eyebrow">
              {ws.preview
                ? t("{name}’s demo profile", { name: firstName })
                : t("Hello, {name}", { name: firstName })}
            </p>
            <h1>{t("Your next step in STEM.")}</h1>
            <p className="subtitle">
              {t(
                "Meet a mentor. Find a study partner. Build something together.",
              )}
            </p>
          </div>
          <div className="page-header-actions">
            <Button variant="secondary" onClick={() => navigate("offline")}>
              <Download size={16} />
              {t("Offline learning")}
            </Button>
            <Button variant="secondary" onClick={() => setProfileOpen(true)}>
              <Settings2 size={15} />
              {t("My profile")}
            </Button>
          </div>
        </div>
        <div className="hub-feature-grid">
          <section className="next-step-card" aria-label={t("Your next step")}>
            <div>
              <div className="row between">
                <p className="eyebrow">{t("Your goal")}</p>
                <Badge>{t(domainLabel(selectedGoal.domain))}</Badge>
              </div>
              <h2>{t(selectedGoal.title)}</h2>
              <p className="description">
                {t("See what to learn next and find someone who can help.")}
              </p>
            </div>
            <div className="next-step-bottom">
              <Button
                variant="lime"
                onClick={() => setOpportunity(selectedGoal)}
              >
                {t("See my plan")}
                <ArrowUpRight size={16} />
              </Button>
              <button
                className="text-button"
                onClick={() => setSupportOpen(true)}
              >
                {t("Find my first step")}
                <ArrowRight size={16} />
              </button>
              <div className="coverage-preview">
                {t("{met} of {total} skills in your profile", {
                  met: coverage.met.length,
                  total: coverage.total,
                })}
              </div>
            </div>
          </section>
          <section
            className="profile-summary card"
            aria-label={t("Your profile")}
          >
            <div className="profile-summary-header">
              <p className="eyebrow">{t("Your profile")}</p>
              <button
                className="icon-button"
                aria-label={t("Edit your profile")}
                onClick={() => setProfileOpen(true)}
              >
                <Pencil size={14} />
              </button>
            </div>
            <div className="row name-row">
              <Avatar
                name={ws.profile?.display_name || "You"}
                domain={ws.profile?.domain}
              />
              <div>
                <h3>{ws.profile?.display_name || t("Your profile")}</h3>
                <p>
                  {ws.profile?.headline || t("Add what you're curious about")}
                </p>
              </div>
            </div>
            <div className="skill-chips">
              {ws.learner.confirmed_skills.length ? (
                ws.learner.confirmed_skills
                  .slice(0, 4)
                  .map((id) => <Badge key={id}>{t(getSkillLabel(id))}</Badge>)
              ) : (
                <span className="small muted">
                  {t("Add skills you've already tried.")}
                </span>
              )}
            </div>
            <div className="preference-row">
              <span className="row">
                <Globe2 size={13} />
                {t("Online only")}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  aria-label={t("Online only")}
                  checked={ws.learner.online_only}
                  disabled={ws.busy}
                  onChange={(e) => {
                    void act(() =>
                      ws.updateLearner({ online_only: e.target.checked }),
                    );
                  }}
                />
                <span className="switch-track" />
              </label>
            </div>
          </section>
        </div>
        <section className="section">
          <SectionHeading
            title={t("Find your community")}
            action={t("All communities")}
            onAction={() => navigate("communities")}
          />
          <div className="community-grid">
            {communities.map((c) => communityCard(c.id))}
          </div>
        </section>
        <section className="section hub-mentors">
          <SectionHeading
            title={t("People who can help")}
            action={t("See all people")}
            onAction={() => {
              setCommunityId(selectedGoal.domain);
              setPeopleRole("all");
              navigate("communities");
            }}
          />
          {supportMatches.length ? (
            <div
              className={cn(
                "member-grid",
                supportMatches.length === 2 && "two",
                supportMatches.length === 1 && "one",
              )}
            >
              {peopleCards(supportMatches)}
            </div>
          ) : (
            <EmptyState
              icon={<Users size={24} />}
              title={t("Meet your first mentor")}
            >
              {t(
                "No members match your goal yet. Try another community or change your online preference.",
              )}
              <Button
                variant="secondary"
                onClick={() => navigate("communities")}
              >
                {t("Explore communities")}
                <ArrowRight size={15} />
              </Button>
            </EmptyState>
          )}
        </section>
        <section className="section">
          <SectionHeading
            title={t("Explore opportunities")}
            action={t("View all")}
            onAction={() => navigate("explore")}
          />
          <div className="catalog-grid two">
            {recommended.map((item) => (
              <CatalogCard
                key={item.id}
                item={item}
                saved={ws.learner.saved_ids.includes(item.id)}
                onOpen={() => setOpportunity(item)}
                onSave={() => {
                  void saveItem(item.id);
                }}
              />
            ))}
          </div>
        </section>
      </>
    );
  }

  function communitiesView() {
    const community = communities.find((c) => c.id === communityId)!;
    const goal =
      selectedGoal.domain === communityId
        ? selectedGoal
        : catalog.find(
            (i) => i.kind === "project" && i.domain === communityId,
          )!;
    const candidates = membersFor(communityId);
    // Use the same membership roster as the circle avatars and total. Goal,
    // primary-field and request-availability rules belong to recommendations.
    const matches: PersonMatch[] = candidates
      .filter(
        (person) =>
          (!ws.learner.online_only ||
            person.support_modes.includes("online")) &&
          (peopleRole === "all" ||
            person.role === "both" ||
            person.role === (peopleRole === "peer" ? "learner" : "mentor")),
      )
      .map((person) => ({ person, reasons: [], sharedSkills: [] }))
      .filter(
        (match) =>
          personMatchesSearch(match.person, peopleQuery) ||
          localizedSearch(peopleQuery, [
            domainLabel(match.person.domain),
            ...match.person.skills.map(getSkillLabel),
            ...(match.person.role === "both"
              ? ["Mentors", "Peers"]
              : match.person.role === "mentor"
                ? ["Mentors"]
                : ["Peers"]),
          ]),
      );
    const relevantItems = catalog
      .filter(
        (i) =>
          i.domain === communityId &&
          (!ws.learner.online_only || i.format === "online"),
      )
      .filter((i) => i.kind !== "resource")
      .slice(0, 3);
    return (
      <>
        <div className="page-header">
          <div>
            <p className="eyebrow">{t("Learn together")}</p>
            <h1>{t("Find your community.")}</h1>
            <p className="subtitle">
              {t(
                "Meet women who share your interests in AI, data, and robotics.",
              )}
            </p>
          </div>
        </div>
        <div className="community-grid">
          {communities.map((c) => communityCard(c.id, communityId === c.id))}
        </div>
        <div className="community-detail-header">
          <div className="row">
            <span
              className={cn(
                "community-symbol",
                communityId === "robotics" && "robotics",
              )}
            >
              <DomainIcon domain={communityId} />
            </span>
            <div>
              <h2>{t(community.name)}</h2>
              <p>{t(community.description)}</p>
            </div>
          </div>
          <Badge className="badge-outline">
            {ws.preview
              ? t("Demo community")
              : t("{count} visible members", {
                  count: candidates.length,
                })}
          </Badge>
        </div>
        <div className="people-toolbar">
          <div>
            <h2>{t("Community members")}</h2>
            <p className="small muted" style={{ marginTop: 6 }}>
              {t("Browse everyone who has joined this community.")}
            </p>
          </div>
          <div className="segmented" aria-label={t("Filter community people")}>
            {(["all", "mentor", "peer"] as const).map((role) => (
              <button
                key={role}
                className={peopleRole === role ? "active" : ""}
                aria-pressed={peopleRole === role}
                onClick={() => setPeopleRole(role)}
              >
                {role === "all"
                  ? t("Everyone")
                  : role === "mentor"
                    ? t("Mentors")
                    : t("Peers")}
              </button>
            ))}
          </div>
        </div>
        <SearchField
          id="people-search"
          label={t("Search members")}
          placeholder={t("Search by name, skill, or topic")}
          value={peopleQuery}
          onChange={setPeopleQuery}
        />
        <div className="filter-bar">
          <span className="filter-count" aria-live="polite">
            {t(
              matches.length === 1
                ? "{count} member shown"
                : "{count} members shown",
              { count: matches.length },
            )}
          </span>
          <label className="check-label">
            <input
              type="checkbox"
              checked={ws.learner.online_only}
              disabled={ws.busy}
              onChange={(e) => {
                void act(() =>
                  ws.updateLearner({ online_only: e.target.checked }),
                );
              }}
            />
            {t("Online only")}
          </label>
        </div>
        {matches.length ? (
          <div className="member-grid">
            {matches.map((match) => (
              <PersonCard
                key={match.person.id}
                match={match}
                role={peopleRole === "all" ? undefined : peopleRole}
                onEdit={
                  match.person.id === ws.user?.id
                    ? () => setProfileOpen(true)
                    : undefined
                }
                onOpen={() => setMemberTarget({ person: match.person, goal })}
                onRequest={() =>
                  request(
                    match.person,
                    goal,
                    peopleRole === "peer" || match.person.role === "learner"
                      ? "collaboration"
                      : "mentorship",
                  )
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users size={24} />}
            title={
              peopleQuery
                ? t("No people match that search")
                : t("No members found yet")
            }
          >
            {peopleQuery
              ? t("Try another name, skill, or topic.")
              : t("Join this community or try another filter to find people.")}
            <Button
              variant="secondary"
              onClick={() =>
                peopleQuery
                  ? setPeopleQuery("")
                  : ws.user
                    ? setProfileOpen(true)
                    : setAuthOpen(true)
              }
            >
              {peopleQuery ? t("Clear search") : t("Set up your profile")}
              <ArrowUpRight size={15} />
            </Button>
          </EmptyState>
        )}
        <section className="section">
          <SectionHeading
            title={t("Things to learn and build")}
            action={t("View all")}
            onAction={() => {
              setFilterDomain(communityId);
              navigate("explore");
            }}
          />
          <div className="catalog-grid">
            {relevantItems.map((item) => (
              <CatalogCard
                key={item.id}
                item={item}
                saved={ws.learner.saved_ids.includes(item.id)}
                onOpen={() => setOpportunity(item)}
                onSave={() => {
                  void saveItem(item.id);
                }}
              />
            ))}
          </div>
        </section>
        <p className="small muted" style={{ marginTop: 22 }}>
          {t(
            "Members choose whether their profiles and circle memberships appear here. Mentor expertise is self-described.",
          )}
        </p>
      </>
    );
  }

  function exploreView() {
    const items = catalog.filter(
      (item) =>
        (category === "all" || item.kind === category) &&
        (filterDomain === "all" || item.domain === filterDomain) &&
        (!savedOnly || ws.learner.saved_ids.includes(item.id)) &&
        (!ws.learner.online_only || item.format === "online") &&
        (catalogMatchesSearch(item, catalogQuery) ||
          localizedSearch(catalogQuery, [
            item.title,
            item.description,
            item.provider,
            domainLabel(item.domain),
            ...item.tags,
            ...item.skills.map(getSkillLabel),
            ...item.requirements.map(getSkillLabel),
          ])),
    );
    const tabs: { id: CatalogKind | "all"; label: string }[] = [
      { id: "all", label: "All" },
      { id: "resource", label: "Resources" },
      { id: "competition", label: "Competitions" },
      { id: "internship", label: "Internships" },
      { id: "project", label: "Projects" },
    ];
    return (
      <>
        <div className="page-header">
          <div>
            <p className="eyebrow">{t("Find your next opportunity")}</p>
            <h1>{t("Learn. Build. Take part.")}</h1>
            <p className="subtitle">
              {t(
                "Resources, competitions, internships, and projects—all in one place.",
              )}
            </p>
          </div>
        </div>
        <SearchField
          id="catalog-search"
          label={t("Search opportunities")}
          placeholder={t("Search topics, skills, or opportunities")}
          value={catalogQuery}
          onChange={setCatalogQuery}
        />
        <div className="tabbar" aria-label={t("Filter catalogue by type")}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn("tab", category === tab.id && "active")}
              aria-pressed={category === tab.id}
              onClick={() => setCategory(tab.id)}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
        <div className="filter-bar">
          <div className="filter-left">
            <label className="sr-only" htmlFor="domain-filter">
              {t("Filter by STEM field")}
            </label>
            <select
              id="domain-filter"
              value={filterDomain}
              onChange={(e) =>
                setFilterDomain(e.target.value as DomainId | "all")
              }
            >
              <option value="all">{t("All STEM fields")}</option>
              <option value="data-ai">{t("Data & AI")}</option>
              <option value="robotics">{t("Robotics & Makers")}</option>
            </select>
            <label className="check-label">
              <input
                type="checkbox"
                checked={savedOnly}
                onChange={(e) => setSavedOnly(e.target.checked)}
              />
              {t("Saved only")}
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={ws.learner.online_only}
                disabled={ws.busy}
                onChange={(e) => {
                  void act(() =>
                    ws.updateLearner({ online_only: e.target.checked }),
                  );
                }}
              />
              {t("Online only")}
            </label>
          </div>
          <span className="filter-count" aria-live="polite">
            {t(items.length === 1 ? "{count} result" : "{count} results", {
              count: items.length,
            })}
          </span>
        </div>
        {items.length ? (
          <div className="catalog-grid">
            {items.map((item) => (
              <CatalogCard
                key={item.id}
                item={item}
                saved={ws.learner.saved_ids.includes(item.id)}
                onOpen={() => setOpportunity(item)}
                onSave={() => {
                  void saveItem(item.id);
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Compass size={25} />}
            title={
              savedOnly && !ws.learner.saved_ids.length
                ? t("Nothing saved yet")
                : t("No matches for these filters")
            }
          >
            {savedOnly && !ws.learner.saved_ids.length
              ? t("Save a resource or opportunity to find it here later.")
              : t(
                  "Try another search, choose a different field, or turn off online only.",
                )}
            <Button
              variant="secondary"
              onClick={() => {
                setSavedOnly(false);
                setCategory("all");
                setFilterDomain("all");
                setCatalogQuery("");
              }}
            >
              {t("Browse all")}
              <ArrowRight size={15} />
            </Button>
          </EmptyState>
        )}
        <p className="small muted" style={{ marginTop: 23 }}>
          {t(
            "Competitions and internships are sample listings. Official learning resources link to their original publishers. Hardware requirements are shown separately.",
          )}
        </p>
      </>
    );
  }

  function connectionsView() {
    if (!ws.user)
      return (
        <>
          <div className="page-header">
            <div>
              <p className="eyebrow">{t("Your connections")}</p>
              <h1>{t("Start a conversation.")}</h1>
              <p className="subtitle">
                {t("Ask for help, find a teammate, and agree on a next step.")}
              </p>
            </div>
          </div>
          <div className="welcome-panel">
            <div>
              <h2>{t("A simple hello is a good start.")}</h2>
              <p>
                {t(
                  "Create an account to send requests and hear back from mentors and peers.",
                )}
              </p>
            </div>
            <Button variant="lime" onClick={() => setAuthOpen(true)}>
              {t("Sign in to connect")}
              <ArrowUpRight size={16} />
            </Button>
          </div>
          <section className="section">
            <EmptyState
              icon={<Handshake size={25} />}
              title={t("Your requests will appear here")}
            >
              {t(
                "Sign in to see sent requests, replies, and agreed next steps.",
              )}
              <Button
                variant="secondary"
                onClick={() => navigate("communities")}
              >
                {t("Meet the community")}
                <ArrowRight size={15} />
              </Button>
            </EmptyState>
          </section>
        </>
      );
    const filtered = ws.requests.filter((r) =>
      inbox === "incoming"
        ? r.recipient_id === ws.user?.id
        : r.sender_id === ws.user?.id,
    );
    return (
      <>
        <div className="page-header">
          <div>
            <p className="eyebrow">{t("Stay in touch")}</p>
            <h1>{t("Your connections.")}</h1>
            <p className="subtitle">
              {t("Keep track of the people you’re learning and building with.")}
            </p>
          </div>
          <div className="page-header-actions">
            <Button
              variant="secondary"
              disabled={ws.busy}
              onClick={() => {
                void act(ws.refresh, "Inbox refreshed.");
              }}
            >
              <RefreshCw size={15} className={ws.busy ? "spin" : ""} />
              {t("Refresh inbox")}
            </Button>
          </div>
        </div>
        <div className="connection-summary">
          <div className="summary-pill">
            <strong>
              {ws.requests.filter((r) => r.status === "pending").length}
            </strong>
            {t("Pending")}
          </div>
          <div className="summary-pill">
            <strong>
              {ws.requests.filter((r) => r.status === "accepted").length}
            </strong>
            {t("Accepted")}
          </div>
          <div className="summary-pill">
            <strong>{ws.requests.length}</strong>
            {t("Total requests")}
          </div>
        </div>
        <div className="tabbar">
          <button
            className={cn("tab", inbox === "outgoing" && "active")}
            aria-pressed={inbox === "outgoing"}
            onClick={() => setInbox("outgoing")}
          >
            {t("Sent requests")}
          </button>
          <button
            className={cn("tab", inbox === "incoming" && "active")}
            aria-pressed={inbox === "incoming"}
            onClick={() => setInbox("incoming")}
          >
            {t("Received requests")}{" "}
            {incomingPending > 0 && `(${incomingPending})`}
          </button>
        </div>
        {filtered.length ? (
          <div className="request-grid">
            {filtered.map((r) => {
              const incoming = r.recipient_id === ws.user?.id;
              const item = catalog.find((i) => i.id === r.opportunity_id);
              return (
                <article className="request-card card" key={r.id}>
                  <div className="request-card-header">
                    <div className="row">
                      <Avatar
                        name={incoming ? r.sender_name : r.recipient_name}
                        domain={item?.domain}
                      />
                      <div>
                        <h3>{incoming ? r.sender_name : r.recipient_name}</h3>
                        <p className="request-goal">
                          {r.help_type === "mentorship"
                            ? t("Mentorship")
                            : t("Peer collaboration")}
                        </p>
                      </div>
                    </div>
                    <Badge className={`status-${r.status}`}>
                      {t(r.status[0].toUpperCase() + r.status.slice(1))}
                    </Badge>
                  </div>
                  {item && (
                    <button
                      className="text-button"
                      onClick={() => setOpportunity(item)}
                    >
                      {t(item.title)}
                      <ArrowUpRight size={14} />
                    </button>
                  )}
                  <p className="request-message" translate="no">
                    {r.message}
                  </p>
                  {r.status === "accepted" && r.next_step && (
                    <div className="next-action">
                      <strong>{t("Next step")}</strong>
                      <p translate="no">{r.next_step}</p>
                    </div>
                  )}
                  <div className="request-meta">
                    <span>
                      {incoming ? t("Received") : t("Sent")}{" "}
                      {new Date(r.created_at).toLocaleDateString(
                        language === "mr" ? "mr-IN" : "en-IN",
                        { day: "numeric", month: "short" },
                      )}
                    </span>
                    <span>{t("Only visible to you two")}</span>
                  </div>
                  {r.status === "pending" && (
                    <div className="request-actions">
                      {incoming ? (
                        <>
                          <Button
                            disabled={ws.busy}
                            onClick={() => {
                              setResponseTarget(r);
                              setResponseNote("");
                              setResponseError("");
                            }}
                          >
                            {t("Accept request")}
                            <Check size={14} />
                          </Button>
                          <Button
                            variant="secondary"
                            disabled={ws.busy}
                            onClick={() => {
                              void act(
                                () => ws.respondRequest(r.id, "declined", ""),
                                "Request declined.",
                              );
                            }}
                          >
                            {t("Decline")}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="secondary"
                          disabled={ws.busy}
                          onClick={() => {
                            void act(
                              () => ws.cancelRequest(r.id),
                              "Request cancelled.",
                            );
                          }}
                        >
                          {t("Cancel request")}
                        </Button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Mail size={24} />}
            title={
              inbox === "incoming"
                ? t("A little quiet, for now")
                : t("Start with a thoughtful hello")
            }
          >
            {inbox === "incoming"
              ? t(
                  "Make your profile discoverable and join a circle so people can find you. Refresh to check for new requests.",
                )
              : t(
                  "Choose a mentor or peer and tell them what you'd like to work on.",
                )}
            <Button
              variant="secondary"
              onClick={() =>
                inbox === "incoming"
                  ? setProfileOpen(true)
                  : navigate("communities")
              }
            >
              {inbox === "incoming"
                ? t("Edit your profile")
                : t("Find your people")}
              <ArrowUpRight size={15} />
            </Button>
          </EmptyState>
        )}
      </>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t("Skip to content")}
      </a>
      <div className="app-shell">
        <aside className="sidebar">
          <Brand />
          <p className="sidebar-intro">{t("A community for women in STEM")}</p>
          <nav className="main-nav" aria-label={t("Main navigation")}>
            {navigation.map(({ id, label, mobileLabel, icon: Icon }) => (
              <button
                key={id}
                className={cn("nav-item", view === id && "active")}
                aria-current={view === id ? "page" : undefined}
                aria-label={t(label)}
                onClick={() => navigate(id)}
              >
                <Icon />
                <span className="nav-label-full" aria-hidden="true">
                  {t(label)}
                </span>
                <span className="nav-label-short" aria-hidden="true">
                  {t(mobileLabel)}
                </span>
                {id === "connections" && incomingPending > 0 && (
                  <span className="nav-count">{incomingPending}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-footer">
              <Avatar
                name={ws.profile?.display_name || "Explorer"}
                domain={ws.profile?.domain}
                size="small"
              />
              <div className="user-info">
                <strong>
                  {ws.preview
                    ? t("Demo profile")
                    : ws.profile?.display_name || t("Your account")}
                </strong>
                <small>
                  {ws.preview
                    ? t("Try the website")
                    : t("Your STEMBridge account")}
                </small>
              </div>
              <button
                className="icon-button"
                aria-label={ws.user ? t("Sign out") : t("Sign in")}
                onClick={() =>
                  ws.user
                    ? void act(ws.signOut, "Signed out.")
                    : setAuthOpen(true)
                }
              >
                {ws.user ? <LogOut size={15} /> : <ArrowUpRight size={15} />}
              </button>
            </div>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="mobile-brand">
              <Brand />
            </div>
            <div className="breadcrumb">
              <span>{t("STEMBridge")}</span>
              <ChevronRight size={12} />
              <span>
                {t(navigation.find((n) => n.id === view)?.label ?? "My Hub")}
              </span>
            </div>
            <div className="topbar-right">
              <div
                className="language-switch"
                role="group"
                aria-label={t("Website language")}
              >
                <button
                  type="button"
                  lang="en"
                  aria-pressed={language === "en"}
                  onClick={() => setLanguage("en")}
                >
                  English
                </button>
                <button
                  type="button"
                  lang="mr"
                  aria-pressed={language === "mr"}
                  onClick={() => setLanguage("mr")}
                >
                  मराठी
                </button>
              </div>
              <span className="live-label">
                {offlineSupport.ready ? (
                  <Download size={15} />
                ) : (
                  <ShieldCheck size={15} />
                )}
                {offlineSupport.ready
                  ? t("Offline ready")
                  : ws.preview
                    ? t("Explore the demo")
                    : t("Signed in")}
              </span>
              {ws.user ? (
                <>
                  <button
                    className="icon-button"
                    aria-label={t("Edit profile")}
                    onClick={() => setProfileOpen(true)}
                  >
                    <Avatar
                      name={ws.profile?.display_name || "You"}
                      domain={ws.profile?.domain}
                      size="small"
                    />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={t("Sign out")}
                    onClick={() => {
                      void act(ws.signOut, "Signed out.");
                    }}
                  >
                    <LogOut size={15} />
                  </button>
                </>
              ) : (
                <Button onClick={() => setAuthOpen(true)}>
                  {t("Join STEMBridge")}
                  <ArrowUpRight size={14} />
                </Button>
              )}
            </div>
          </header>
          {offline && (
            <div className="global-offline">
              <WifiOff
                size={13}
                style={{ display: "inline", marginRight: 7 }}
              />
              {t(
                "You're offline. Keep learning and saving device notes. Reconnect for accounts, members and requests.",
              )}
              <button
                className="text-button"
                style={{ marginLeft: 16 }}
                onClick={() => navigate("offline")}
              >
                {t("Open offline learning")}
              </button>
            </div>
          )}
          <main id="main-content" className="page-content">
            {ws.preview && (
              <div className="preview-banner">
                <span className="row">
                  <Info size={14} />
                  <span>{t("Demo · Sample data")}</span>
                </span>
                <button
                  className="text-button"
                  onClick={() => {
                    const index = ws.profile?.domain === "data-ai" ? 1 : 0;
                    ws.loadSample(index);
                    setCommunityId(sampleLearners[index].profile.domain);
                    notify(
                      t("Now exploring {name}’s sample profile.", {
                        name: sampleLearners[index].profile.display_name,
                      }),
                    );
                  }}
                >
                  {t("Switch profile")}
                  <RefreshCw size={12} />
                </button>
              </div>
            )}
            {ws.error && (
              <div className="error-banner" role="alert">
                <span>{t(ws.error)}</span>
                <button
                  className="icon-button"
                  onClick={ws.clearError}
                  aria-label={t("Dismiss error")}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {ws.offlineSnapshot && (
              <div className="preview-banner" role="status">
                <span>
                  {t("Saved copy of your plan")}
                  {ws.snapshotSavedAt
                    ? ` · ${new Date(ws.snapshotSavedAt).toLocaleString(language === "mr" ? "mr-IN" : "en-IN")}`
                    : ""}
                  {t(". Other members and your inbox need internet.")}
                </span>
                {!offline && (
                  <button
                    className="text-button"
                    onClick={() => void act(ws.refresh)}
                  >
                    {t("Refresh from account")}
                  </button>
                )}
              </div>
            )}
            {!ws.ready ? (
              <div className="loading-surface" role="status">
                <LoaderCircle
                  className="spin"
                  style={{ margin: "0 auto 12px" }}
                />
                {t("Opening your workspace…")}
              </div>
            ) : view === "offline" ? (
              <OfflineLearning
                goal={selectedGoal}
                initialLesson={offlineLesson}
              />
            ) : view === "hub" ? (
              hubView()
            ) : view === "communities" ? (
              communitiesView()
            ) : view === "explore" ? (
              exploreView()
            ) : (
              connectionsView()
            )}
            <footer className="page-footer">
              <span>{t("STEMBridge · Women in STEM, together.")}</span>
              <span>{t("Made for curiosity. Built for connection.")}</span>
            </footer>
          </main>
        </div>
      </div>
      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onNotice={notify}
      />
      <MemberDialog
        person={memberTarget?.person ?? null}
        currentGoal={memberTarget?.goal ?? selectedGoal}
        onClose={() => setMemberTarget(null)}
        onRequest={(person, type) =>
          request(person, memberTarget?.goal ?? selectedGoal, type)
        }
        onAuth={() => setAuthOpen(true)}
      />
      <SupportDialog
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        goal={selectedGoal}
        onViewItem={setOpportunity}
        onRequest={request}
        onAuth={() => setAuthOpen(true)}
      />
      <ProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onNotice={notify}
      />
      <OpportunityDialog
        item={opportunity}
        onClose={() => setOpportunity(null)}
        onRequest={request}
        onNotice={notify}
        onOfflineLesson={(id) => {
          setOpportunity(null);
          setOfflineLesson(id);
          navigate("offline");
        }}
      />
      <RequestDialog
        person={requestTarget?.person ?? null}
        item={requestTarget?.item ?? null}
        helpType={requestTarget?.type}
        initialMessage={requestTarget?.initialMessage}
        onClose={() => setRequestTarget(null)}
        onNotice={(message) => {
          notify(message);
          setInbox("outgoing");
          navigate("connections");
        }}
      />
      <Modal
        open={!!responseTarget}
        onClose={() => setResponseTarget(null)}
        title={t("A next step, together")}
        description={t(
          "Accept {name}’s request with one practical action to start with.",
          { name: responseTarget?.sender_name || t("this member") },
        )}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!responseTarget) return;
            setResponseError("");
            try {
              await ws.respondRequest(
                responseTarget.id,
                "accepted",
                responseNote,
              );
              setResponseTarget(null);
              notify(
                "Request accepted. Your next step is visible to both of you.",
              );
            } catch (error) {
              setResponseError(errorMessage(error));
            }
          }}
        >
          <div className="field">
            <label htmlFor="next-step">
              {t("What should you work on next?")}
            </label>
            <textarea
              id="next-step"
              required
              minLength={5}
              maxLength={500}
              value={responseNote}
              translate="no"
              onChange={(e) => setResponseNote(e.target.value)}
              placeholder={t(
                "For example: write a short project outline and choose one dataset. We can review the scope together.",
              )}
            />
            <small>
              {t("This is shared with the sender as your agreed next step.")}
            </small>
          </div>
          {responseError && (
            <p className="field-error" role="alert" style={{ marginTop: 12 }}>
              {t(responseError)}
            </p>
          )}
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setResponseTarget(null)}
            >
              {t("Go back")}
            </Button>
            <Button
              type="submit"
              disabled={ws.busy || responseNote.trim().length < 5}
            >
              {ws.busy ? (
                <LoaderCircle size={15} className="spin" />
              ) : (
                <Check size={15} />
              )}
              {t("Accept request")}
            </Button>
          </div>
        </form>
      </Modal>
      {notice && (
        <div className="notice" role="status">
          <Check size={17} />
          <span>{t(notice)}</span>
          <button
            className="icon-button"
            aria-label={t("Dismiss notification")}
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}

function Brand() {
  return (
    <div className="brand">
      <img src="/icon.svg" alt="" width={34} height={34} />
      <span>
        <span className="brand-stem">STEM</span>Bridge
        <span style={{ color: "#78917a" }}>.</span>
      </span>
    </div>
  );
}
