import { offlineLessons } from "./offline-lessons";

const KEY = "stembridge.notebook.v1";
const ids = new Set(offlineLessons.map((lesson) => lesson.id));
export type NotebookEntry = { notes: string; completed: boolean };
export type OfflineNotebook = {
  version: 1;
  ownerId: string;
  entries: Record<string, NotebookEntry>;
  updatedAt: string | null;
  locked?: boolean;
};
export const emptyNotebook = (ownerId: string): OfflineNotebook => ({
  version: 1,
  ownerId,
  entries: {},
  updatedAt: null,
});

export function clearOfflineNotebook() {
  try {
    localStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}

export function readOfflineNotebook(ownerId: string): OfflineNotebook {
  const empty = emptyNotebook(ownerId);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const value = JSON.parse(raw) as OfflineNotebook;
    if (
      !value ||
      value.version !== 1 ||
      typeof value.ownerId !== "string" ||
      !value.entries ||
      Array.isArray(value.entries) ||
      typeof value.entries !== "object" ||
      (value.updatedAt !== null &&
        (typeof value.updatedAt !== "string" ||
          !Number.isFinite(Date.parse(value.updatedAt))))
    ) {
      clearOfflineNotebook();
      return empty;
    }
    for (const [id, entry] of Object.entries(value.entries)) {
      if (
        !ids.has(id) ||
        !entry ||
        typeof entry.notes !== "string" ||
        entry.notes.length > 5000 ||
        typeof entry.completed !== "boolean"
      ) {
        clearOfflineNotebook();
        return empty;
      }
    }
    // Session expiry must not destroy offline work. Another identity gets no
    // content and cannot overwrite this book without explicitly clearing it.
    if (value.ownerId !== ownerId) return { ...empty, locked: true };
    return value;
  } catch {
    return empty;
  }
}

export function preserveNotebookForOwner(ownerId: string): void {
  // Called when a real account signs in. Keep its own work; clear another
  // account's or the preview's notebook at this explicit identity boundary.
  if (readOfflineNotebook(ownerId).locked) clearOfflineNotebook();
}

export function saveNotebookEntry(
  book: OfflineNotebook,
  id: string,
  patch: Partial<NotebookEntry>,
): OfflineNotebook {
  if (book.locked)
    throw new Error(
      "Sign in to the same account or clear this notebook before writing new notes.",
    );
  if (!ids.has(id)) throw new Error("Choose an exercise from the notebook.");
  const entry = {
    ...(book.entries[id] ?? { notes: "", completed: false }),
    ...patch,
  };
  if (
    typeof entry.notes !== "string" ||
    entry.notes.length > 5000 ||
    typeof entry.completed !== "boolean"
  )
    throw new Error("Keep your notes within 5,000 characters.");
  const next: OfflineNotebook = {
    ...book,
    entries: { ...book.entries, [id]: entry },
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    throw new Error(
      "Your browser could not save these notes. Download or copy them before leaving this page.",
    );
  }
  return next;
}

export function notebookText(book: OfflineNotebook): string {
  const entries = offlineLessons.filter(
    (lesson) =>
      book.entries[lesson.id]?.notes.trim() ||
      book.entries[lesson.id]?.completed,
  );
  return [
    "STEMBridge — my offline learning notes",
    "Device-only practice notes. Completion does not certify a skill.",
    "",
    ...entries.flatMap((lesson) => [
      lesson.title,
      book.entries[lesson.id].completed
        ? "Exercise marked complete"
        : "In progress",
      book.entries[lesson.id].notes || "No notes yet.",
      "",
    ]),
  ].join("\n");
}
