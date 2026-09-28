-- Run AFTER configuring the project and exercising two real test accounts.
-- The Supabase SQL Editor normally runs as a privileged role that bypasses RLS.
-- These transaction-local role/claim changes intentionally simulate a third user.
-- Replace UUIDs below with three controlled test account IDs from Authentication.
-- Never paste account passwords, access tokens, or service keys into this file.
-- The local src/lib/database.test.ts separately executes this production schema
-- in PGlite PostgreSQL with an emulated Auth boundary. Hosted checks below remain
-- necessary to verify the actual Supabase configuration and browser sessions.

-- Read-only schema checks. Expect all five tables to have rowsecurity = true.
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in
  ('profiles', 'learner_state', 'communities', 'community_memberships', 'connection_requests');

-- Expect false for direct request writes and demo-flag edits.
select
  has_table_privilege('authenticated', 'public.connection_requests', 'INSERT') as can_directly_insert_requests,
  has_table_privilege('authenticated', 'public.connection_requests', 'UPDATE') as can_directly_update_requests,
  has_table_privilege('authenticated', 'public.connection_requests', 'DELETE') as can_directly_delete_requests,
  has_column_privilege('authenticated', 'public.profiles', 'is_demo', 'UPDATE') as can_change_demo_flag;

-- Replace 3333... with your third account UUID. Expect only that account's
-- learner state, its own memberships plus discoverable members' memberships,
-- and none of the learner/supporter pair's requests.
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select auth.uid() as simulated_third_account;
select user_id from public.learner_state;
select user_id, community_id from public.community_memberships;
select id, sender_id, recipient_id from public.connection_requests;
rollback;

-- Replace 1111... with the learner account UUID. Expect its own state and only
-- requests where it is a participant. Private other-member profiles stay hidden.
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select user_id from public.learner_state;
select id, sender_id, recipient_id, status from public.connection_requests;
select id, discoverable from public.profiles;
rollback;

-- Anonymous readers see only opted-in profiles and community descriptions.
begin;
set local role anon;
select set_config('request.jwt.claims', '{}', true);
select id, discoverable from public.profiles;
select id, name from public.communities;
rollback;

-- Browser checks (do not substitute the privileged SQL Editor for these):
-- 1. Learner A creates a request to opted-in supporter B: pending on both sides.
-- 2. Repeat the same request: rejected; only one active row exists.
-- 3. Account C cannot read that row or A's learner_state, even by guessed ID.
-- 4. A and C cannot accept A-to-B; B can accept once and add a next step.
-- 5. Refresh A: accepted and the next step persist. B cannot accept it again.
-- 6. New pending request: A can cancel; B and C cannot cancel it.
-- 7. A cannot request itself, impersonate another sender, or overwrite names.
-- 8. Turning directory visibility/receiving requests off blocks new requests.
-- 9. Sign out: private operations fail; no prior member's private data stays shown.
-- 10. C can see B's community membership while B is discoverable. Hide B's
--     profile and refresh C: B's membership must disappear from C's result.
--     B can still read its own membership. Counts should say "visible members".
