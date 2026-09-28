import { domainLabel, getSkillLabel } from "./data";
import type { CatalogItem, Profile } from "./types";

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bml\b/g, "machine learning")
    .replace(/\bai\b/g, "artificial intelligence");
}

function includesTerms(query: string, fields: string[]) {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const text = normalize(fields.join(" "));
  return terms.every((term) => text.includes(term));
}

export function catalogMatchesSearch(item: CatalogItem, query: string) {
  return includesTerms(query, [
    item.title,
    item.description,
    item.provider,
    item.kind,
    domainLabel(item.domain),
    ...item.tags,
    ...item.skills.map(getSkillLabel),
    ...item.requirements.map(getSkillLabel),
  ]);
}

// Search only the public fields displayed in the member profile.
// The caller applies membership, visibility and availability filters first.
export function personMatchesSearch(person: Profile, query: string) {
  return includesTerms(query, [
    person.display_name,
    person.headline,
    person.bio,
    domainLabel(person.domain),
    person.role === "both"
      ? "mentor peer"
      : person.role === "learner"
        ? "peer"
        : "mentor",
    ...person.help_topics,
    ...person.skills.map(getSkillLabel),
  ]);
}
