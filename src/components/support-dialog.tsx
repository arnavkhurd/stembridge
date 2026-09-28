"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  MessageSquare,
  Users,
} from "lucide-react";
import {
  buildSupportPlan,
  supportIntents,
  type SupportIntent,
} from "@/lib/support-plan";
import type { CatalogItem, ConnectionRequest, Profile } from "@/lib/types";
import { Avatar, Badge, Button, Modal } from "./ui";
import { useLanguage } from "./language-provider";
import { translateAuthoredText } from "@/lib/i18n-content";
import { useWorkspace } from "./workspace-provider";
import styles from "./support-dialog.module.css";

type SupportDialogProps = {
  open: boolean;
  onClose: () => void;
  goal: CatalogItem;
  onViewItem: (item: CatalogItem) => void;
  onRequest: (
    person: Profile,
    goal: CatalogItem,
    helpType: ConnectionRequest["help_type"],
    draft: string,
  ) => void;
  onAuth: () => void;
};

export function SupportDialog(props: SupportDialogProps) {
  const { t } = useLanguage();
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      wide
      title={t("Find my first step")}
      description={t(
        "One useful action. Someone to help. A message you can make your own.",
      )}
    >
      {props.open && <SupportPanel key={props.goal.id} {...props} />}
    </Modal>
  );
}

function SupportPanel({
  goal,
  onClose,
  onViewItem,
  onRequest,
  onAuth,
}: SupportDialogProps) {
  const { t } = useLanguage();
  const workspace = useWorkspace();
  const [intent, setIntent] = useState<SupportIntent>("start");
  const [onlineOnly, setOnlineOnly] = useState(workspace.learner.online_only);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const plan = useMemo(
    () =>
      buildSupportPlan(
        intent,
        { ...workspace.learner, online_only: onlineOnly },
        goal,
        workspace.people,
        { includeSamples: workspace.preview },
      ),
    [
      intent,
      workspace.learner,
      goal,
      workspace.people,
      workspace.preview,
      onlineOnly,
    ],
  );
  const draftKey = `${intent}:${goal.id}:${plan.match?.person.id ?? "none"}`;
  const draft = drafts[draftKey] ?? plan.draft;
  const role = plan.helpType === "mentorship" ? "mentor" : "peer";
  const person = plan.match?.person;
  const canRequest =
    !!workspace.user &&
    !!person &&
    !plan.sampleMatch &&
    person.id !== workspace.user.id;

  function request() {
    if (!canRequest || !person || draft.trim().length < 10) return;
    onClose();
    onRequest(person, goal, plan.helpType, draft.trim());
  }

  return (
    <div className={styles.panel}>
      <div className={styles.goal}>
        <span>{t("Your goal")}</span>
        <strong>{t(goal.title)}</strong>
        {goal.isSample && (
          <Badge className="badge-sample">{t("Practice goal")}</Badge>
        )}
      </div>

      <fieldset className={styles.intentField}>
        <legend>{t("What would help you today?")}</legend>
        <div className={styles.choices}>
          {supportIntents.map((option) => (
            <label
              key={option.id}
              className={`${styles.choice} ${intent === option.id ? styles.selected : ""}`}
            >
              <input
                type="radio"
                name="support-intent"
                value={option.id}
                checked={intent === option.id}
                onChange={() => setIntent(option.id)}
              />
              <span>{t(option.label)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={styles.preference}>
        <input
          type="checkbox"
          checked={onlineOnly}
          onChange={(event) => setOnlineOnly(event.target.checked)}
        />
        {t("Online support only")}
        <span>{t("For this plan")}</span>
      </label>

      <div className={styles.layout}>
        <div className={styles.column}>
          <section
            className={`${styles.card} ${styles.action}`}
            aria-live="polite"
          >
            <div className={styles.heading}>
              <Compass size={20} aria-hidden="true" />
              <h3>{t("Your next action")}</h3>
            </div>
            <h4>{translateAuthoredText(plan.action.title, t)}</h4>
            <p>{translateAuthoredText(plan.action.description, t)}</p>
          </section>

          <section
            className={styles.card}
            aria-label={t("A resource for this step")}
          >
            <div className={styles.heading}>
              <BookOpen size={20} aria-hidden="true" />
              <h3>
                {t(
                  plan.resource
                    ? "Start with this resource"
                    : "Your learning starting point",
                )}
              </h3>
            </div>
            {plan.resource && <h4>{t(plan.resource.title)}</h4>}
            <p>{translateAuthoredText(plan.resourceNote, t)}</p>
            {plan.resource && (
              <>
                <div className={styles.resourceMeta}>
                  <Badge>
                    {t(
                      plan.resource.isSample
                        ? "Practice exercise"
                        : "Official guide",
                    )}
                  </Badge>
                  {plan.resource.cost === "hardware-required" && (
                    <Badge className="badge-orange">
                      {t("Hardware required")}
                    </Badge>
                  )}
                </div>
                {plan.resource.sourceUrl ? (
                  <a
                    className={`button button-secondary ${styles.actionLink}`}
                    href={plan.resource.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("Open the guide")} <ArrowUpRight size={16} />
                  </a>
                ) : (
                  <Button
                    variant="secondary"
                    className={styles.actionLink}
                    onClick={() => {
                      onClose();
                      onViewItem(plan.resource!);
                    }}
                  >
                    {t("Read the exercise")} <ArrowRight size={16} />
                  </Button>
                )}
              </>
            )}
          </section>

          <section className={styles.card} aria-label={t("Suggested person")}>
            <div className={styles.heading}>
              <Users size={20} aria-hidden="true" />
              <h3>
                {t(
                  plan.helpType === "mentorship"
                    ? "A mentor for this step"
                    : "Someone to learn with",
                )}
              </h3>
            </div>
            {person ? (
              <>
                <div className={styles.person}>
                  <Avatar name={person.display_name} domain={person.domain} />
                  <div>
                    <h4>{person.display_name}</h4>
                    <span>
                      {t(
                        plan.sampleMatch
                          ? "Sample profile"
                          : plan.helpType === "mentorship"
                            ? "Offers mentorship"
                            : "Open to collaboration",
                      )}
                    </span>
                  </div>
                </div>
                <p>{translateAuthoredText(plan.match?.reasons[0] ?? "", t)}</p>
                {plan.sampleMatch && (
                  <p className={styles.note}>
                    {t(
                      "This fictional profile shows how a match works. It cannot receive a request.",
                    )}
                  </p>
                )}
              </>
            ) : (
              <p>
                {t(
                  "No {role} accepting requests matches this step and these preferences yet. You can still try the action above or explore the community below.",
                  { role: t(role === "mentor" ? "Mentor" : "Peer") },
                )}
              </p>
            )}
          </section>
        </div>

        <div className={styles.column}>
          <section className={`${styles.card} ${styles.messageCard}`}>
            <div className={styles.heading}>
              <MessageSquare size={20} aria-hidden="true" />
              <h3>{t("Make the first message easier")}</h3>
            </div>
            <p>
              {t(
                "Say what you want to try and ask for one specific kind of help.",
              )}
            </p>
            <label htmlFor="support-message">{t("Your introduction")}</label>
            <textarea
              id="support-message"
              value={draft}
              onChange={(event) =>
                setDrafts((current) => ({
                  ...current,
                  [draftKey]: event.target.value,
                }))
              }
              maxLength={1200}
              aria-describedby="support-message-note"
            />
            <p id="support-message-note" className={styles.note}>
              {t(
                "{count}/1,200 characters. Change any part before continuing.",
                { count: draft.length },
              )}
            </p>
            {canRequest ? (
              <Button
                className={styles.fullWidth}
                onClick={request}
                disabled={workspace.busy || draft.trim().length < 10}
              >
                {t("Review request")} <ArrowRight size={16} />
              </Button>
            ) : !workspace.user ? (
              <>
                <p className={styles.note}>
                  {t(
                    "Sign in to find registered members and send a real request.",
                  )}
                </p>
                <Button
                  className={styles.fullWidth}
                  onClick={() => {
                    onClose();
                    onAuth();
                  }}
                >
                  {t("Sign in to connect")} <ArrowRight size={16} />
                </Button>
              </>
            ) : (
              <p className={styles.note}>
                {t(
                  "There is no eligible recipient for this message yet. No request has been sent.",
                )}
              </p>
            )}
          </section>

          <section className={`${styles.card} ${styles.community}`}>
            <h3>{t("Explore a wider community")}</h3>
            <h4>{plan.community.name}</h4>
            <p>{t(plan.community.description)}</p>
            <a
              href={plan.community.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("Visit their website")} <ArrowUpRight size={16} />
            </a>
            <p className={styles.note}>
              {t(
                "Independent external community. Check their website for membership and event details.",
              )}
            </p>
          </section>
        </div>
      </div>

      <p className={styles.privacy}>
        {t(
          "Your support choice stays in this panel. Only the message you review and send is shared. Your confirmed skills are unchanged. Closing this panel clears its choices and drafts.",
        )}
      </p>
    </div>
  );
}
