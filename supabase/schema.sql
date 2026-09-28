-- STEMBridge hackathon schema. Run once in the Supabase SQL Editor.
-- Safe to rerun for this schema version; no passwords or service keys belong here.
begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'New member' check (char_length(display_name) between 1 and 80),
  headline text not null default '' check (char_length(headline) <= 160),
  bio text not null default '' check (char_length(bio) <= 1500),
  domain text not null default 'data-ai' check (domain in ('data-ai', 'robotics')),
  skills text[] not null default '{}' check (cardinality(skills) <= 40),
  role text not null default 'learner' check (role in ('learner', 'mentor', 'both')),
  support_modes text[] not null default '{online}' check (support_modes <@ array['online', 'in-person']::text[]),
  help_topics text[] not null default '{}' check (cardinality(help_topics) <= 20),
  discoverable boolean not null default false,
  open_to_requests boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.learner_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  confirmed_skills text[] not null default '{}' check (cardinality(confirmed_skills) <= 40),
  interests text[] not null default '{data-ai}' check (interests <@ array['data-ai', 'robotics']::text[]),
  goal_id text check (goal_id is null or char_length(goal_id) <= 120),
  online_only boolean not null default false,
  saved_ids text[] not null default '{}' check (cardinality(saved_ids) <= 100),
  intro text not null default '' check (char_length(intro) <= 2500)
);

create table if not exists public.communities (
  id text primary key check (id in ('data-ai', 'robotics')),
  name text not null,
  description text not null
);

insert into public.communities (id, name, description) values
  ('data-ai', 'Data & AI Circle', 'Learn data skills, build useful projects, and find project feedback.'),
  ('robotics', 'Robotics & Makers Circle', 'Explore circuits, embedded programming, and hands-on projects.')
on conflict (id) do update set name = excluded.name, description = excluded.description;

create table if not exists public.community_memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  community_id text not null references public.communities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, community_id)
);

create table if not exists public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  sender_name text not null,
  recipient_name text not null,
  opportunity_id text not null check (char_length(opportunity_id) between 1 and 120),
  help_type text not null check (help_type in ('mentorship', 'collaboration')),
  message text not null check (char_length(message) between 10 and 1200),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  next_step text check (next_step is null or char_length(next_step) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create unique index if not exists connection_requests_unique_active
  on public.connection_requests(sender_id, recipient_id, opportunity_id, help_type)
  where status in ('pending', 'accepted');
create index if not exists connection_requests_recipient on public.connection_requests(recipient_id, created_at desc);
create index if not exists connection_requests_sender on public.connection_requests(sender_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.learner_state enable row level security;
alter table public.communities enable row level security;
alter table public.community_memberships enable row level security;
alter table public.connection_requests enable row level security;

-- Explicit grants: authenticated users cannot modify is_demo, timestamps or request
-- participants. Request writes are exposed only through the checked functions below.
revoke all on public.profiles, public.learner_state, public.communities,
  public.community_memberships, public.connection_requests from anon, authenticated;
grant select on public.profiles, public.communities to anon, authenticated;
grant insert (id, display_name, headline, bio, domain, skills, role, support_modes,
  help_topics, discoverable, open_to_requests) on public.profiles to authenticated;
grant update (display_name, headline, bio, domain, skills, role, support_modes,
  help_topics, discoverable, open_to_requests) on public.profiles to authenticated;
grant select, insert, update, delete on public.learner_state to authenticated;
grant select, insert, delete on public.community_memberships to authenticated;
grant select on public.connection_requests to authenticated;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to anon, authenticated
  using (discoverable or id = (select auth.uid()));
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert to authenticated
  with check (id = (select auth.uid()) and is_demo = false);
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists learner_read_self on public.learner_state;
create policy learner_read_self on public.learner_state for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists learner_insert_self on public.learner_state;
create policy learner_insert_self on public.learner_state for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists learner_update_self on public.learner_state;
create policy learner_update_self on public.learner_state for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists learner_delete_self on public.learner_state;
create policy learner_delete_self on public.learner_state for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists communities_read on public.communities;
create policy communities_read on public.communities for select to anon, authenticated using (true);
drop policy if exists memberships_read_self on public.community_memberships;
drop policy if exists memberships_read_visible on public.community_memberships;
create policy memberships_read_visible on public.community_memberships for select to authenticated
  using (user_id = (select auth.uid()) or exists (
    select 1 from public.profiles member_profile
    where member_profile.id = community_memberships.user_id and member_profile.discoverable
  ));
drop policy if exists memberships_join_self on public.community_memberships;
create policy memberships_join_self on public.community_memberships for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists memberships_leave_self on public.community_memberships;
create policy memberships_leave_self on public.community_memberships for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists requests_read_participant on public.connection_requests;
create policy requests_read_participant on public.connection_requests for select to authenticated
  using ((select auth.uid()) in (sender_id, recipient_id));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), 'New member'), 80))
  on conflict (id) do nothing;
  insert into public.learner_state (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Covers accounts created before this schema was installed.
insert into public.profiles (id, display_name)
select id, left(coalesce(nullif(btrim(raw_user_meta_data ->> 'display_name'), ''), 'New member'), 80)
from auth.users on conflict (id) do nothing;
insert into public.learner_state (user_id) select id from auth.users on conflict (user_id) do nothing;

create or replace function public.create_connection_request(
  p_recipient_id uuid, p_opportunity_id text, p_help_type text, p_message text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_sender public.profiles%rowtype;
  v_recipient public.profiles%rowtype;
  v_request public.connection_requests%rowtype;
begin
  if v_actor is null then raise exception 'Sign in to request a connection.' using errcode = '42501'; end if;
  if p_recipient_id is null or p_recipient_id = v_actor then
    raise exception 'Choose another member.' using errcode = '22023';
  end if;
  if p_opportunity_id is null or char_length(btrim(p_opportunity_id)) not between 1 and 120
    or p_help_type is null or p_help_type not in ('mentorship', 'collaboration')
    or p_message is null or char_length(btrim(p_message)) not between 10 and 1200 then
    raise exception 'Provide a goal, valid help type, and a 10–1200 character introduction.' using errcode = '22023';
  end if;
  select * into v_sender from public.profiles where id = v_actor;
  if not found then raise exception 'Finish your profile first.' using errcode = '22023'; end if;
  if v_sender.is_demo then raise exception 'Sample profiles cannot send live requests.' using errcode = '22023'; end if;
  select * into v_recipient from public.profiles
    where id = p_recipient_id and discoverable and open_to_requests and not is_demo;
  if not found then raise exception 'This member is not accepting requests.' using errcode = '22023'; end if;
  if p_help_type = 'mentorship' and v_recipient.role not in ('mentor', 'both') then
    raise exception 'This member offers peer collaboration. Choose a collaboration request.' using errcode = '22023';
  end if;
  insert into public.connection_requests
    (sender_id, recipient_id, sender_name, recipient_name, opportunity_id, help_type, message)
  values (v_actor, p_recipient_id, v_sender.display_name, v_recipient.display_name,
    btrim(p_opportunity_id), p_help_type, btrim(p_message)) returning * into v_request;
  return to_jsonb(v_request);
exception when unique_violation then
  raise exception 'You already have an active request for this goal and help type.' using errcode = '23505';
end;
$$;

create or replace function public.respond_to_request(
  p_request_id uuid, p_status text, p_next_step text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_request public.connection_requests%rowtype;
begin
  if v_actor is null then raise exception 'Sign in to respond.' using errcode = '42501'; end if;
  if p_status is null or p_status not in ('accepted', 'declined') then
    raise exception 'Choose accepted or declined.' using errcode = '22023';
  end if;
  if p_next_step is not null and char_length(p_next_step) > 500 then
    raise exception 'Keep the next step under 500 characters.' using errcode = '22023';
  end if;
  update public.connection_requests set status = p_status,
    next_step = case when p_status = 'accepted' then nullif(btrim(p_next_step), '') else null end,
    updated_at = now()
  where id = p_request_id and recipient_id = v_actor and status = 'pending'
  returning * into v_request;
  if not found then raise exception 'Only the recipient can respond to a pending request.' using errcode = '42501'; end if;
  return to_jsonb(v_request);
end;
$$;

create or replace function public.cancel_connection_request(p_request_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_request public.connection_requests%rowtype;
begin
  if v_actor is null then raise exception 'Sign in to cancel.' using errcode = '42501'; end if;
  update public.connection_requests set status = 'cancelled', updated_at = now()
    where id = p_request_id and sender_id = v_actor and status = 'pending'
    returning * into v_request;
  if not found then raise exception 'Only the sender can cancel a pending request.' using errcode = '42501'; end if;
  return to_jsonb(v_request);
end;
$$;

revoke all on function public.create_connection_request(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.respond_to_request(uuid, text, text) from public, anon, authenticated;
revoke all on function public.cancel_connection_request(uuid) from public, anon, authenticated;
grant execute on function public.create_connection_request(uuid, text, text, text) to authenticated;
grant execute on function public.respond_to_request(uuid, text, text) to authenticated;
grant execute on function public.cancel_connection_request(uuid) to authenticated;

commit;
