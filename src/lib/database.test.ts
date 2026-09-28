import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { ConnectionRequest } from "./types";

// Execute the actual production schema in PostgreSQL WASM. Only Supabase's
// external Auth boundary is emulated; no production policy or RPC is replaced.
const schema = readFileSync(
  new URL("../../supabase/schema.sql", import.meta.url),
  "utf8",
);
const learnerId = "11111111-1111-4111-8111-111111111111";
const mentorId = "22222222-2222-4222-8222-222222222222";
const outsiderId = "33333333-3333-4333-8333-333333333333";
const demoId = "44444444-4444-4444-8444-444444444444";
let db: PGlite;

async function asUser(id: string) {
  await db.exec("reset role; set role authenticated;");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}

async function asAnonymous() {
  await db.exec("reset role; set role anon;");
  await db.query("select set_config('request.jwt.claim.sub', '', false)");
}

async function createRequest(
  recipient = mentorId,
  goal = "first-ml-project",
  type = "mentorship",
) {
  const result = await db.query<{ request: ConnectionRequest }>(
    "select public.create_connection_request($1::uuid, $2, $3, $4) as request",
    [
      recipient,
      goal,
      type,
      "Could you review my first project's train/test explanation?",
    ],
  );
  return result.rows[0].request;
}

beforeAll(async () => {
  db = await PGlite.create();
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, raw_user_meta_data jsonb not null default '{}');
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
  `);
  await db.exec(schema);
}, 60_000);

beforeEach(async () => {
  await db.exec("reset role; truncate table auth.users cascade;");
  await db.query(
    "insert into auth.users (id, raw_user_meta_data) values ($1, $2::jsonb), ($3, $4::jsonb), ($5, $6::jsonb), ($7, $8::jsonb)",
    [
      learnerId,
      JSON.stringify({
        display_name: "  Learner A  ",
        role: "mentor",
        is_demo: true,
      }),
      mentorId,
      JSON.stringify({ display_name: "Mentor B" }),
      outsiderId,
      JSON.stringify({ display_name: "Outsider C" }),
      demoId,
      JSON.stringify({ display_name: "Sample member" }),
    ],
  );
  await db.query(
    "update public.profiles set role = 'mentor', discoverable = true, open_to_requests = true where id = $1",
    [mentorId],
  );
  await db.query(
    "update public.profiles set role = 'mentor', discoverable = true, open_to_requests = true, is_demo = true where id = $1",
    [demoId],
  );
});

afterAll(async () => {
  if (db) await db.close();
});

describe(
  "actual PostgreSQL schema and row-level security",
  { concurrent: false },
  () => {
    it("initializes safe account defaults and can apply the schema twice", async () => {
      await db.exec(schema);
      await asUser(learnerId);
      const profile = await db.query<{
        display_name: string;
        is_demo: boolean;
        role: string;
        discoverable: boolean;
      }>(
        "select display_name, is_demo, role, discoverable from public.profiles where id = $1",
        [learnerId],
      );
      expect(profile.rows[0]).toEqual({
        display_name: "Learner A",
        is_demo: false,
        role: "learner",
        discoverable: false,
      });
      const state = await db.query<{
        user_id: string;
        confirmed_skills: string[];
      }>("select user_id, confirmed_skills from public.learner_state");
      expect(state.rows).toEqual([
        { user_id: learnerId, confirmed_skills: [] },
      ]);
    });

    it("allows an owner profile update but blocks protected flags, IDs and another profile", async () => {
      await asUser(learnerId);
      const own = await db.query<{ headline: string }>(
        "update public.profiles set headline = 'Learning with a purpose', skills = array['python'], discoverable = true where id = $1 returning headline",
        [learnerId],
      );
      expect(own.rows[0].headline).toBe("Learning with a purpose");
      await expect(
        db.query("update public.profiles set is_demo = true where id = $1", [
          learnerId,
        ]),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        db.query("update public.profiles set id = $1 where id = $2", [
          outsiderId,
          learnerId,
        ]),
      ).rejects.toMatchObject({ code: "42501" });
      expect(
        (
          await db.query(
            "update public.profiles set headline = 'Impersonated' where id = $1 returning id",
            [mentorId],
          )
        ).rows,
      ).toEqual([]);
    });

    it("isolates learner state and allows the owner's provider-style upsert", async () => {
      await asUser(learnerId);
      await db.query(
        `insert into public.learner_state (user_id, confirmed_skills, intro)
      values ($1, array['python'], 'My private learner description')
      on conflict (user_id) do update set confirmed_skills = excluded.confirmed_skills, intro = excluded.intro`,
        [learnerId],
      );
      expect(
        (
          await db.query<{ intro: string }>(
            "select intro from public.learner_state",
          )
        ).rows,
      ).toEqual([{ intro: "My private learner description" }]);
      expect(
        (
          await db.query(
            "update public.learner_state set intro = 'Stolen' where user_id = $1 returning user_id",
            [mentorId],
          )
        ).rows,
      ).toEqual([]);
      await expect(
        db.query(
          "insert into public.learner_state (user_id) values ($1) on conflict (user_id) do update set intro = 'Stolen'",
          [mentorId],
        ),
      ).rejects.toMatchObject({ code: "42501" });
      await asUser(outsiderId);
      expect(
        (
          await db.query(
            "select user_id from public.learner_state where user_id = $1",
            [learnerId],
          )
        ).rows,
      ).toEqual([]);
      expect(
        (
          await db.query<{ user_id: string }>(
            "select user_id from public.learner_state",
          )
        ).rows,
      ).toEqual([{ user_id: outsiderId }]);
    });

    it("shows only public profiles to anonymous visitors and denies private reads", async () => {
      await asAnonymous();
      const people = await db.query<{ id: string }>(
        "select id from public.profiles order by id",
      );
      expect(people.rows.map((row) => row.id)).toEqual([mentorId, demoId]);
      expect(
        (await db.query("select id from public.communities")).rows,
      ).toHaveLength(2);
      await expect(
        db.query("select * from public.learner_state"),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        db.query("select * from public.connection_requests"),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(createRequest()).rejects.toMatchObject({ code: "42501" });
    });

    it("allows only own membership writes and hides non-discoverable members", async () => {
      await asUser(learnerId);
      await db.query(
        "insert into public.community_memberships (user_id, community_id) values ($1, 'data-ai')",
        [learnerId],
      );
      await expect(
        db.query(
          "insert into public.community_memberships (user_id, community_id) values ($1, 'robotics')",
          [mentorId],
        ),
      ).rejects.toMatchObject({ code: "42501" });
      await asUser(mentorId);
      await db.query(
        "insert into public.community_memberships (user_id, community_id) values ($1, 'data-ai')",
        [mentorId],
      );
      await asUser(outsiderId);
      const visible = await db.query<{ user_id: string }>(
        "select user_id from public.community_memberships",
      );
      expect(visible.rows).toEqual([{ user_id: mentorId }]);
      expect(
        (
          await db.query(
            "delete from public.community_memberships where user_id = $1 returning user_id",
            [mentorId],
          )
        ).rows,
      ).toEqual([]);
      await asUser(mentorId);
      await db.query(
        "update public.profiles set discoverable = false where id = $1",
        [mentorId],
      );
      await asUser(outsiderId);
      expect(
        (await db.query("select * from public.community_memberships")).rows,
      ).toEqual([]);
      await asUser(mentorId);
      expect(
        (
          await db.query<{ user_id: string }>(
            "select user_id from public.community_memberships",
          )
        ).rows,
      ).toEqual([{ user_id: mentorId }]);
      expect(
        (
          await db.query(
            "delete from public.community_memberships where user_id = $1 returning user_id",
            [mentorId],
          )
        ).rows,
      ).toHaveLength(1);
    });

    it("creates a real pending request with server-owned snapshots and blocks duplicates/self/sample requests", async () => {
      await asUser(learnerId);
      const request = await createRequest();
      expect(request).toMatchObject({
        sender_id: learnerId,
        recipient_id: mentorId,
        sender_name: "Learner A",
        recipient_name: "Mentor B",
        status: "pending",
        next_step: null,
      });
      expect(request.id).toMatch(/^[0-9a-f-]{36}$/);
      await expect(createRequest()).rejects.toMatchObject({ code: "23505" });
      await expect(createRequest(learnerId)).rejects.toMatchObject({
        code: "22023",
      });
      await expect(createRequest(demoId)).rejects.toMatchObject({
        code: "22023",
      });
      await expect(createRequest(outsiderId)).rejects.toMatchObject({
        code: "22023",
      });
      await db.query(
        "update public.profiles set display_name = 'Changed name' where id = $1",
        [learnerId],
      );
      expect(
        (
          await db.query<{ sender_name: string }>(
            "select sender_name from public.connection_requests where id = $1",
            [request.id],
          )
        ).rows[0].sender_name,
      ).toBe("Learner A");
      await asUser(demoId);
      await expect(createRequest()).rejects.toMatchObject({ code: "22023" });
    });

    it("restricts request reads to participants and denies direct table writes", async () => {
      await asUser(learnerId);
      const request = await createRequest();
      expect(
        (await db.query("select id from public.connection_requests")).rows,
      ).toHaveLength(1);
      await expect(
        db.query(
          "update public.connection_requests set status = 'accepted' where id = $1",
          [request.id],
        ),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        db.query("delete from public.connection_requests where id = $1", [
          request.id,
        ]),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        db.query(
          `insert into public.connection_requests
      (sender_id, recipient_id, sender_name, recipient_name, opportunity_id, help_type, message)
      values ($1, $2, 'Forged', 'Forged', 'fake-goal', 'mentorship', 'A forged request')`,
          [outsiderId, mentorId],
        ),
      ).rejects.toMatchObject({ code: "42501" });
      await asUser(mentorId);
      expect(
        (
          await db.query<{ id: string }>(
            "select id from public.connection_requests",
          )
        ).rows,
      ).toEqual([{ id: request.id }]);
      await asUser(outsiderId);
      expect(
        (
          await db.query(
            "select * from public.connection_requests where id = $1",
            [request.id],
          )
        ).rows,
      ).toEqual([]);
    });

    it("allows only the recipient to accept pending requests with a bounded next step", async () => {
      await asUser(learnerId);
      const request = await createRequest();
      const respond = (
        status = "accepted",
        note = "Share one notebook question in your next session.",
      ) =>
        db.query<{ request: ConnectionRequest }>(
          "select public.respond_to_request($1::uuid, $2, $3) as request",
          [request.id, status, note],
        );
      await expect(respond()).rejects.toMatchObject({ code: "42501" });
      await asUser(outsiderId);
      await expect(respond()).rejects.toMatchObject({ code: "42501" });
      await asUser(mentorId);
      await expect(respond("pending")).rejects.toMatchObject({ code: "22023" });
      await expect(respond("accepted", "x".repeat(501))).rejects.toMatchObject({
        code: "22023",
      });
      const accepted = (await respond()).rows[0].request;
      expect(accepted.status).toBe("accepted");
      expect(accepted.next_step).toBe(
        "Share one notebook question in your next session.",
      );
      await expect(respond("declined")).rejects.toMatchObject({
        code: "42501",
      });
      await asUser(learnerId);
      expect(
        (
          await db.query<{ status: string; next_step: string }>(
            "select status, next_step from public.connection_requests where id = $1",
            [request.id],
          )
        ).rows[0],
      ).toMatchObject({ status: "accepted", next_step: accepted.next_step });
      await expect(createRequest()).rejects.toMatchObject({ code: "23505" });
      await expect(
        db.query("select public.cancel_connection_request($1::uuid)", [
          request.id,
        ]),
      ).rejects.toMatchObject({ code: "42501" });
    });

    it("lets only the sender cancel pending requests and makes cancellation final", async () => {
      await asUser(learnerId);
      const request = await createRequest();
      const cancel = () =>
        db.query<{ request: ConnectionRequest }>(
          "select public.cancel_connection_request($1::uuid) as request",
          [request.id],
        );
      await asUser(mentorId);
      await expect(cancel()).rejects.toMatchObject({ code: "42501" });
      await asUser(outsiderId);
      await expect(cancel()).rejects.toMatchObject({ code: "42501" });
      await asUser(learnerId);
      expect((await cancel()).rows[0].request.status).toBe("cancelled");
      await expect(cancel()).rejects.toMatchObject({ code: "42501" });
      const retry = await createRequest();
      expect(retry.id).not.toBe(request.id);
      await asUser(mentorId);
      await expect(
        db.query(
          "select public.respond_to_request($1::uuid, 'accepted', null)",
          [request.id],
        ),
      ).rejects.toMatchObject({ code: "42501" });
    });

    it("declines without storing an acceptance note and rejects closed recipients", async () => {
      await asUser(learnerId);
      const request = await createRequest();
      await asUser(mentorId);
      const declined = await db.query<{ request: ConnectionRequest }>(
        "select public.respond_to_request($1::uuid, 'declined', 'This must not become an accepted next step') as request",
        [request.id],
      );
      expect(declined.rows[0].request).toMatchObject({
        status: "declined",
        next_step: null,
      });
      await expect(
        db.query(
          "select public.respond_to_request($1::uuid, 'accepted', null)",
          [request.id],
        ),
      ).rejects.toMatchObject({ code: "42501" });
      await db.query(
        "update public.profiles set open_to_requests = false where id = $1",
        [mentorId],
      );
      await asUser(learnerId);
      await expect(createRequest()).rejects.toMatchObject({ code: "22023" });
    });
  },
);
