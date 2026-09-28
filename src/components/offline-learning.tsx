"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  CheckCircle2,
  Download,
  LoaderCircle,
  WifiOff,
} from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import { useOffline } from "./offline-provider";
import { useLanguage } from "./language-provider";
import { Badge, Button } from "./ui";
import { catalog, domainLabel } from "@/lib/data";
import { offlineLessons } from "@/lib/offline-lessons";
import { offlineMarathi } from "@/lib/offline-marathi";
import {
  clearOfflineNotebook,
  emptyNotebook,
  notebookText,
  readOfflineNotebook,
  saveNotebookEntry,
  type NotebookEntry,
} from "@/lib/offline-notebook";
import type { CatalogItem, DomainId } from "@/lib/types";
import styles from "./offline-learning.module.css";

export function OfflineLearning({
  goal,
  initialLesson,
}: {
  goal: CatalogItem;
  initialLesson?: string;
}) {
  const ws = useWorkspace();
  return (
    <Notebook
      key={ws.user?.id ?? "preview"}
      goal={goal}
      initialLesson={initialLesson}
      ownerId={ws.user?.id ?? "preview"}
    />
  );
}

function Notebook({
  goal,
  initialLesson,
  ownerId,
}: {
  goal: CatalogItem;
  initialLesson?: string;
  ownerId: string;
}) {
  const connection = useOffline();
  const ws = useWorkspace();
  const suggested =
    offlineLessons.find((lesson) => {
      const item = catalog.find((item) => item.id === lesson.id)!;
      return (
        lesson.domain === goal.domain &&
        item.skills.some(
          (id) =>
            goal.requirements.includes(id) &&
            !ws.learner.confirmed_skills.includes(id),
        ) &&
        item.requirements.every((id) =>
          ws.learner.confirmed_skills.includes(id),
        )
      );
    }) ?? offlineLessons.find((lesson) => lesson.domain === goal.domain)!;
  const start =
    offlineLessons.find((lesson) => lesson.id === initialLesson) ?? suggested;
  const [domain, setDomain] = useState<DomainId>(start.domain);
  const [lessonId, setLessonId] = useState(start.id);
  const [book, setBook] = useState(() => emptyNotebook(ownerId));
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearError, setClearError] = useState("");
  const [showCheck, setShowCheck] = useState(false);
  const { language, setLanguage: chooseLanguage, t } = useLanguage();
  useEffect(() => {
    if (!ws.ready) return;
    setBook(readOfflineNotebook(ownerId));
    setLoaded(true);
  }, [ownerId, ws.ready]);
  const originalLesson = offlineLessons.find(
    (lesson) => lesson.id === lessonId,
  )!;
  const lesson =
    language === "mr"
      ? { ...originalLesson, ...offlineMarathi[originalLesson.id] }
      : originalLesson;
  const entry = book.entries[lesson.id] ?? { notes: "", completed: false };
  const completed = Object.values(book.entries).filter(
    (value) => value.completed,
  ).length;

  function update(patch: Partial<NotebookEntry>) {
    try {
      setBook(saveNotebookEntry(book, lesson.id, patch));
      setError("");
    } catch (cause) {
      // Keep unsaved typing visible and downloadable if storage is blocked or full.
      setBook({
        ...book,
        entries: { ...book.entries, [lesson.id]: { ...entry, ...patch } },
      });
      setError(
        cause instanceof Error ? cause.message : "Could not save these notes.",
      );
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([notebookText(book)], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "STEMBridge-my-learning-notes.txt";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className={styles.root} lang={language}>
      <div className="page-header">
        <div>
          <p className="eyebrow">{t("Learn wherever you are")}</p>
          <h1>{t("Keep learning, even offline.")}</h1>
          <p className="subtitle">
            {t(
              "Eight short exercises. Your own notes. One useful step at a time.",
            )}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={download}
          disabled={!loaded || book.locked || !Object.keys(book.entries).length}
        >
          <Download size={18} />
          {t("Download my notes")}
        </Button>
      </div>
      <section
        className={styles.languageBar}
        aria-label={t("Reading language")}
      >
        <div>
          <strong>{t("Reading language")}</strong>
          <p>
            {t(
              "English and Marathi work across the main website and these exercises. Your language choice is saved on this device.",
            )}
          </p>
          <p>{t("Your notes stay exactly as you write them.")}</p>
        </div>
        <div
          className={styles.languageChoices}
          role="group"
          aria-label={t("Reading language")}
        >
          <button
            type="button"
            lang="en"
            aria-pressed={language === "en"}
            onClick={() => chooseLanguage("en")}
          >
            English
          </button>
          <button
            type="button"
            lang="mr"
            aria-pressed={language === "mr"}
            onClick={() => chooseLanguage("mr")}
          >
            मराठी
          </button>
        </div>
      </section>
      {book.locked && (
        <p className={styles.warning} role="status">
          {t(
            "Your account notes are kept on this device. Reconnect and sign in to the same account, or clear this notebook to start again.",
          )}
        </p>
      )}
      <section
        className={styles.readiness}
        aria-label={t("Offline availability")}
      >
        <div className={styles.statusIcon}>
          {connection.ready ? (
            <CheckCircle2 size={24} />
          ) : (
            <WifiOff size={24} />
          )}
        </div>
        <div>
          <h2>
            {t(
              connection.preparing
                ? "Preparing this device…"
                : connection.ready
                  ? "Ready on this device"
                  : "Save the website for offline use",
            )}
          </h2>
          <p>
            {t(
              connection.ready
                ? "You can reopen this website without internet. Exercises and the catalog stay available. Saving notes also needs this browser's storage."
                : "Open the website with internet first and wait for “Ready on this device” before disconnecting.",
            )}
          </p>
          <p className={styles.fine}>
            {t(
              ws.user
                ? ws.snapshotSavedAt
                  ? "A saved copy of your own profile and plan is kept in this browser. Account changes and connections need internet."
                  : "Your profile has not been saved for offline use on this device. Exercises still work; account changes and connections need internet."
                : "The demo works offline too. Real sign-in and connections need internet.",
            )}
          </p>
        </div>
        <Button
          variant="secondary"
          disabled={connection.preparing || connection.offline}
          onClick={() => void connection.prepare()}
        >
          {connection.preparing ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <Download size={17} />
          )}
          {t(connection.ready ? "Update offline copy" : "Prepare offline")}
        </Button>
      </section>
      {connection.error && (
        <p role="status" className={styles.warning}>
          {t(connection.error)}
        </p>
      )}
      <div className={styles.toolbar}>
        <div className="segmented" aria-label={t("Exercise topic")}>
          {(["data-ai", "robotics"] as const).map((value) => (
            <button
              key={value}
              className={domain === value ? "active" : ""}
              aria-pressed={domain === value}
              onClick={() => {
                setDomain(value);
                setLessonId(
                  offlineLessons.find((lesson) => lesson.domain === value)!.id,
                );
                setShowCheck(false);
              }}
            >
              {t(domainLabel(value))}
            </button>
          ))}
        </div>
        <span>
          {t("{completed} of {total} exercises completed", {
            completed,
            total: offlineLessons.length,
          })}
        </span>
      </div>
      <div className={styles.layout}>
        <nav className={styles.lessons} aria-label={t("Offline exercises")}>
          {offlineLessons
            .filter((item) => item.domain === domain)
            .map((item) => (
              <button
                key={item.id}
                className={item.id === lesson.id ? styles.selected : ""}
                aria-current={item.id === lesson.id ? "true" : undefined}
                onClick={() => {
                  setLessonId(item.id);
                  setShowCheck(false);
                }}
              >
                <span className={styles.lessonMeta}>
                  {book.entries[item.id]?.completed ? (
                    <>
                      <Check size={16} />
                      {t("Completed")}
                    </>
                  ) : (
                    <>
                      <BookOpen size={16} />
                      {t("{minutes} minutes", { minutes: item.minutes })}
                    </>
                  )}
                </span>
                <strong>
                  {language === "mr"
                    ? (offlineMarathi[item.id]?.title ?? item.title)
                    : item.title}
                </strong>
                {item.id === suggested.id && (
                  <span className={styles.relevant}>
                    {t("A useful place to start")}
                  </span>
                )}
              </button>
            ))}
          <p className={styles.fine}>
            {t(
              "Original STEMBridge practice. No account, code installation or hardware needed for these exercises. Full external tutorials still need internet.",
            )}
          </p>
        </nav>
        <article
          className={styles.exercise}
          aria-label={t("Selected exercise")}
        >
          <div className={styles.exerciseHeader}>
            <Badge>{t("Available offline")}</Badge>
            <span>{t("{minutes} minutes", { minutes: lesson.minutes })}</span>
          </div>
          <h2>{lesson.title}</h2>
          <p>{lesson.summary}</p>
          <ol>
            {lesson.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <button
            className="text-button"
            aria-expanded={showCheck}
            onClick={() => setShowCheck(!showCheck)}
          >
            {t(showCheck ? "Hide explanation" : "Check your thinking")}
          </button>
          {showCheck && <div className={styles.answer}>{lesson.check}</div>}
          <div className={styles.notes}>
            <label htmlFor="offline-notes">
              {t("My notes & questions for a mentor")}
            </label>
            <p>{lesson.prompt}</p>
            <textarea
              id="offline-notes"
              value={entry.notes}
              translate="no"
              maxLength={5000}
              disabled={!loaded || book.locked}
              onChange={(event) => update({ notes: event.target.value })}
              placeholder={t("Write your idea here. It stays on this device.")}
            />
            <span role="status" className={styles.fine}>
              {t(
                error
                  ? "Not saved — download or copy your notes."
                  : book.updatedAt
                    ? "Saved on this device · not sent to anyone"
                    : "Notes save here as you type.",
              )}
            </span>
            {error && (
              <p role="alert" className={styles.warning}>
                {t(error)}
              </p>
            )}
            <label className={styles.complete}>
              <input
                type="checkbox"
                checked={entry.completed}
                disabled={!loaded || book.locked}
                onChange={(event) =>
                  update({ completed: event.target.checked })
                }
              />
              {t("I finished this exercise")}
            </label>
            <p className={styles.fine}>
              {t(
                "Completion records practice. It does not add a skill to your profile. When online, review your notes and share a question with a mentor.",
              )}
            </p>
          </div>
        </article>
      </div>
      <footer className={styles.privacy}>
        <div>
          <strong>{t("Your device, your notes.")}</strong>
          <p>
            {t(
              "Notes are stored only in this browser and do not sync between devices. Signing out or switching accounts clears them. Download a copy to keep your work, especially on a shared device.",
            )}
          </p>
          {clearError && (
            <p role="alert" className={styles.warning}>
              {t(clearError)}
            </p>
          )}
        </div>
        {confirmClear ? (
          <div className={styles.clearActions}>
            <Button
              variant="danger"
              onClick={() => {
                if (!clearOfflineNotebook()) {
                  setClearError(
                    "Could not clear this notebook. Your notes are still here. Try again or clear this website's data in your browser settings.",
                  );
                  return;
                }
                setBook(emptyNotebook(ownerId));
                setConfirmClear(false);
                setError("");
                setClearError("");
              }}
            >
              {t("Yes, clear my notes")}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              {t("Keep notes")}
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            disabled={!book.locked && !Object.keys(book.entries).length}
            onClick={() => setConfirmClear(true)}
          >
            {t("Clear this notebook")}
          </Button>
        )}
      </footer>
    </div>
  );
}
