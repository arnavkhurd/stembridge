"use client";
import {
  ArrowUpRight,
  Bookmark,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Globe2,
  Lightbulb,
  MapPin,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Avatar, Badge, Button, DomainIcon } from "@/components/ui";
import { domainLabel } from "@/lib/data";
import type { CatalogItem, Community, PersonMatch, Profile } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";
import { translateAuthoredText } from "@/lib/i18n-content";
import { cn } from "@/lib/utils";

export const kindLabels = {
  resource: "Learning resource",
  competition: "Competition",
  internship: "Internship",
  project: "Practice project",
};
export function KindIcon({
  kind,
  size = 18,
}: {
  kind: CatalogItem["kind"];
  size?: number;
}) {
  const Icon = {
    resource: BookOpen,
    competition: Trophy,
    internship: BriefcaseBusiness,
    project: Lightbulb,
  }[kind];
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}
export function CatalogCard({
  item,
  saved,
  onOpen,
  onSave,
}: {
  item: CatalogItem;
  saved: boolean;
  onOpen: () => void;
  onSave: () => void;
}) {
  const { t } = useLanguage();
  return (
    <article className="catalog-card card">
      <div className="catalog-card-top">
        <div className="row">
          <span className={cn("catalog-type-icon", item.kind)}>
            <KindIcon kind={item.kind} />
          </span>
          <span className="eyebrow">{t(kindLabels[item.kind])}</span>
        </div>
        <button
          className={cn("icon-button", saved && "saved")}
          aria-label={t(saved ? "Unsave {title}" : "Save {title}", {
            title: t(item.title),
          })}
          aria-pressed={saved}
          onClick={onSave}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <button className="catalog-title" onClick={onOpen}>
        {t(item.title)}
      </button>
      <p>{t(item.description).split(/(?<=[.!?।])\s/)[0]}</p>
      <div className="catalog-meta">
        <span>{t(domainLabel(item.domain))}</span>
        <span aria-hidden="true">·</span>
        <span>
          {t(
            item.cost === "hardware-required"
              ? "Hardware required"
              : item.format === "online"
                ? "Online"
                : item.format === "hybrid"
                  ? "Online + hands-on"
                  : "In person",
          )}
        </span>
      </div>
      <div className="catalog-card-footer">
        <Badge className={item.isSample ? "badge-sample" : "badge-lime"}>
          {t(
            item.isSample
              ? item.kind === "resource" || item.kind === "project"
                ? "Practice brief"
                : "Sample listing"
              : "Official resource",
          )}
        </Badge>
        <button className="text-button" onClick={onOpen}>
          {t(item.kind === "resource" ? "View resource" : "View plan")}
          <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}
export function PersonCard({
  match,
  onRequest,
  onOpen,
  onEdit,
  role,
}: {
  match: PersonMatch;
  onRequest: () => void;
  onOpen?: () => void;
  onEdit?: () => void;
  role?: "mentor" | "peer";
}) {
  const { t } = useLanguage();
  const { person, reasons } = match;
  const isMentor = role ? role === "mentor" : person.role !== "learner";
  return (
    <article className="person-card card">
      <div className="person-card-head">
        <Avatar name={person.display_name} domain={person.domain} />
        <Badge className={isMentor ? "badge-violet" : "badge-orange"}>
          {t(onEdit ? "Your profile" : isMentor ? "Mentor" : "Peer")}
          {person.is_demo ? t(" · sample") : ""}
        </Badge>
      </div>
      <div>
        <h3>
          <button
            className="catalog-title"
            onClick={onEdit ?? onOpen ?? onRequest}
          >
            {person.display_name}
          </button>
        </h3>
        <p className="person-headline">{person.headline}</p>
      </div>
      <div className="match-reason">
        <Sparkles size={12} />
        <span>
          {translateAuthoredText(
            reasons[0]
              ?.replace(", which your profile does not yet list.", ".")
              .replace("You both list ", "Shared skills: ") ||
              `Interested in ${domainLabel(person.domain)}.`,
            t,
          )}
        </span>
      </div>
      <div className="person-card-footer">
        <span className="mode-label">
          {person.support_modes.includes("online") ? (
            <Globe2 size={12} />
          ) : (
            <MapPin size={12} />
          )}
          {t(person.support_modes.includes("online") ? "Online" : "In person")}
        </span>
        <button className="text-button" onClick={onEdit ?? onOpen ?? onRequest}>
          {t(
            onEdit
              ? "Edit profile"
              : onOpen
                ? "View profile"
                : isMentor
                  ? "Ask for help"
                  : "Connect",
          )}
          <ArrowUpRight size={14} />
        </button>
      </div>
    </article>
  );
}
export function CommunityCard({
  community,
  people,
  count,
  joined,
  preview,
  selected,
  onOpen,
  onJoin,
}: {
  community: Community;
  people: Profile[];
  count: number;
  joined: boolean;
  preview: boolean;
  selected?: boolean;
  onOpen: () => void;
  onJoin: () => void;
}) {
  const { t } = useLanguage();
  return (
    <article className={cn("community-card card", selected && "selected")}>
      <div className="community-card-top">
        <span
          className={cn(
            "community-symbol",
            community.id === "robotics" && "robotics",
          )}
        >
          <DomainIcon domain={community.id} />
        </span>
        <div className="grow">
          <button className="catalog-title" onClick={onOpen}>
            <h3>{t(community.name)}</h3>
          </button>
        </div>
      </div>
      <p>{t(community.description)}</p>
      <div className="community-card-bottom">
        <div className="community-members">
          <span className="avatar-stack">
            {people.slice(0, 3).map((person) => (
              <Avatar
                key={person.id}
                name={person.display_name}
                domain={person.domain}
                size="small"
              />
            ))}
          </span>
          <span>
            {preview
              ? t("Demo members")
              : t(
                  count === 1
                    ? "{count} visible member"
                    : "{count} visible members",
                  { count },
                )}
          </span>
        </div>
        <Button variant={joined ? "secondary" : "primary"} onClick={onJoin}>
          {joined ? (
            <>
              <Check size={13} />
              {t("Leave community")}
            </>
          ) : (
            <>
              <Users size={13} />
              {t("Join community")}
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
