-- =============================================================================
-- DS-Stats: Database Initialization
-- =============================================================================
-- Backend for tracking Direct Strike commander matchups, win rates, and the
-- community strategies/voting that go with them.
--
-- Enums      user_role (admin | author), faction (Terran | Zerg | Protoss)
-- Tables     commanders  reference list of the 17 playable commanders
--            profiles    app users; linked to auth.users, gated by an allowlist
--            matches     one row per game; source of truth for win rates
--            strategies  per-matchup advice with upvote/downvote counts
-- Functions  current_profile_id(), is_admin()  RLS helpers (security definer)
--            vote()      atomic, column-scoped upvote/downvote RPC
-- Triggers   link_profile_on_auth_signup  allowlist gate + auth linking
--            update_strategy_edit_time    bumps last_edit on content edits only
-- Views      public_profiles  public-safe author fields (id, username)
--            matchup_stats    17x17 win matrix derived from matches
--
-- RLS is enabled on every table; policies are defined per-table below.
--
-- After applying: (1) seed the 17 commanders, (2) insert your own admin profile
-- row before first login — the allowlist gate rejects any unknown email.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Enum Types
-- -----------------------------------------------------------------------------
-- roles enum
create type user_role as enum (
    'admin',
    'author'
);

-- faction enum
create type faction as enum (
    'Terran',
    'Zerg',
    'Protoss'
);


-- -----------------------------------------------------------------------------
-- 2. Tables
-- -----------------------------------------------------------------------------
-- Commanders table
create table if not exists public.commanders (
    slug text PRIMARY KEY,
    display_name text NOT NULL,
    faction faction NOT NULL,
    portrait_url text
);

-- Profiles table
create table if not exists public.profiles (
    id bigint NOT NULL generated always as identity PRIMARY KEY,
    email text UNIQUE NOT NULL,
    auth_user_id uuid UNIQUE REFERENCES auth.users(id) on delete set null,
    username text,
    role user_role DEFAULT 'author',
    created_at timestamptz DEFAULT now()
);

-- Matches table
create table if not exists public.matches (
    id bigint NOT NULL generated always as identity PRIMARY KEY,
    winner text REFERENCES public.commanders(slug) NOT NULL,
    loser text REFERENCES public.commanders(slug) NOT NULL,
    played_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    logged_by bigint REFERENCES public.profiles(id)
);

-- Strategies table
create table if not exists public.strategies (
    id bigint NOT NULL generated always as identity PRIMARY KEY,
    player text REFERENCES public.commanders(slug) NOT NULL,
    opponent text REFERENCES public.commanders(slug) NOT NULL,
    title text,
    body text NOT NULL,
    author bigint REFERENCES public.profiles(id),
    upvotes int DEFAULT 0,
    downvotes int DEFAULT 0,
    rating int GENERATED ALWAYS AS (upvotes - downvotes) STORED,
    created_at timestamptz DEFAULT now(),
    last_edit timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3. Helper Functions
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER lets these bypass RLS on profiles (avoiding recursion when
-- policies on profiles itself call is_admin()). STABLE allows the planner to
-- cache results within a statement.
-- -----------------------------------------------------------------------------

create or replace function public.current_profile_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = (select auth.uid())
$$;

comment on function public.current_profile_id() is
  'Returns profiles.id for the current auth user, or NULL if not linked. Bypasses RLS.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = (select auth.uid())
      and role = 'admin'
  )
$$;

comment on function public.is_admin() is
  'True if the current auth user is linked to a profile with role = admin.';

-- -----------------------------------------------------------------------------
-- 4. RPC
-- -----------------------------------------------------------------------------
-- Atomically does upvotes = upvotes + 1 or downvotes = downvotes + 1 and
-- nothing else. Granted to anon + authenticated. This is what makes "vote via a
-- column" safe: atomic (no lost updates) and column-scoped (anon never gets
-- direct UPDATE on the row, so they can't touch body/title).
-- -----------------------------------------------------------------------------

create or replace function public.vote(
  strategy_id bigint,
  is_upvote   boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_strat     strategies%rowtype;
begin
  -- Lock the strategy so concurrent strategy submissions for it serialize.
  select * into v_strat
  from strategies
  where id = strategy_id
  for update;

  if not found then
    return;
  end if;

  if is_upvote then
    -- Strategy upvoted, increment `strategies.upvotes`
    update strategies
    set upvotes = v_strat.upvotes + 1
    where id = strategy_id;

  else
    -- Strategy downvoted, increment `strategies.downvotes`
    update strategies
    set downvotes = v_strat.downvotes + 1
    where id = strategy_id;
  end if;
end;
$$;

revoke all on function public.vote(bigint, boolean) from public;
grant execute on function public.vote(bigint, boolean) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. Triggers
-- -----------------------------------------------------------------------------

-- Auth Trigger Flow:
--   admin creates profile through Supabase Dashboard
--   -> user signs in through Google OAuth
--   -> Supabase Auth creates auth.users row
--   -> this trigger fires, sets profiles.auth_user_id = NEW.id
create or replace function public.link_profile_on_auth_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set auth_user_id = new.id
    where lower(email) = lower(new.email)
      and auth_user_id is null;
  if not found then
    raise exception 'Email % is not on the allowlist', new.email;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_link_profile on auth.users;
create trigger on_auth_user_created_link_profile
  after insert on auth.users
  for each row execute function public.link_profile_on_auth_signup();

-- Only the trigger (running as SECURITY DEFINER with the function owner's
-- privileges) should ever write auth_user_id. Admins update other columns through
-- their RLS policy; the column-level revoke prevents them from re-pointing
-- a profile at a different auth.users row.

revoke update (auth_user_id) on public.profiles from authenticated;
revoke update (auth_user_id) on public.profiles from anon;

-- Strategy last_edit trigger
create or replace function public.update_strategy_edit_time() returns trigger
language plpgsql as $$
begin
  new.last_edit = now();
  return new;
end;
$$;

drop trigger if exists on_strategy_update on public.strategies;
create trigger on_strategy_update
  before update on public.strategies
  for each row
  when (
       old.title    is distinct from new.title
    or old.body     is distinct from new.body
    or old.player   is distinct from new.player
    or old.opponent is distinct from new.opponent
  )
  execute function public.update_strategy_edit_time();

-- -----------------------------------------------------------------------------
-- 6. Views
-- -----------------------------------------------------------------------------
-- The UI should query this view. Anyone (anon or authenticated) can SELECT from
-- it. 
--
-- The matchup_stats win matrix is built from matches, cross-joined against
-- commanders × commanders so every cell renders even with zero games. Per
-- ordered (player, opponent) pair: wins, losses (the reciprocal cell), total,
-- win_rate.
-- -----------------------------------------------------------------------------


-- security_invoker = false (the default) makes the view run with its owner's
-- privileges, bypassing RLS on the underlying profiles table. The view is the
-- public access boundary: the SELECT list below is the single source of truth
-- for what unauthenticated users can see. Anon has no direct access to profiles
create or replace view public.public_profiles
with (security_invoker = false)
as
select
  id,
  username
from public.profiles;

comment on view public.public_profiles is
  'Whitelist of profile columns safe for unauthenticated UI to display.';

grant select on public.public_profiles to anon, authenticated;

-- matchup_stats win matrix
create or replace view public.matchup_stats
with (security_invoker = true)
as
  with cells as (
    select
      p.slug as player,
      o.slug as opponent,
      (select count(*) from public.matches m
         where m.winner = p.slug and m.loser = o.slug)::int as wins,
      (select count(*) from public.matches m
         where m.winner = o.slug and m.loser = p.slug)::int as losses
    from public.commanders p
    cross join public.commanders o
  )
  select
    player,
    opponent,
    wins,
    case when player = opponent then 0 else losses end                        as losses,
    case when player = opponent then wins else wins + losses end              as total,
    case when player = opponent then null
         else round(wins::numeric / nullif(wins + losses, 0), 4) end          as win_rate
  from cells;

  grant select on public.matchup_stats to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 7. Enable RLS
-- -----------------------------------------------------------------------------

alter table public.commanders   enable row level security;
alter table public.matches      enable row level security;
alter table public.strategies   enable row level security;
alter table public.profiles     enable row level security;

-- -----------------------------------------------------------------------------
-- 8. Policies: Commanders
-- -----------------------------------------------------------------------------
-- public:        SELECT all
-- -----------------------------------------------------------------------------

drop policy if exists commanders_public_select_all on public.commanders;
create policy commanders_public_select_all on public.commanders
  for select to public
  using (true);

comment on policy commanders_public_select_all on public.commanders is
  'Anyone can read commanders.';

-- -----------------------------------------------------------------------------
-- 9. Policies: Matches
-- -----------------------------------------------------------------------------
-- Admin:       full CRUD
-- Author:      INSERT
-- Anon:        SELECT
-- -----------------------------------------------------------------------------

drop policy if exists matches_public_select_all on public.matches;
create policy matches_public_select_all on public.matches
  for select using (true);

comment on policy matches_public_select_all on public.matches is
  'Anyone can read matches.';

drop policy if exists matches_admin_all on public.matches;
create policy matches_admin_all on public.matches
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

comment on policy matches_admin_all on public.matches is
  'Admins have full CRUD access.';

drop policy if exists matches_author_insert on public.matches;
create policy matches_author_insert on public.matches
  for insert to authenticated with check (true);

comment on policy matches_author_insert on public.matches is
  'Authenticated users can insert matches.';


-- -----------------------------------------------------------------------------
-- 10. Policies: Strategies
-- -----------------------------------------------------------------------------
-- Admin:       full CRUD
-- Author:      CRUD on their rows
-- Anon:        SELECT
-- -----------------------------------------------------------------------------

drop policy if exists strategies_public_select on public.strategies;
create policy strategies_public_select on public.strategies
  for select using (true);

comment on policy strategies_public_select on public.strategies is
  'Anyone can read strategies.';

drop policy if exists strategies_auth_insert_as_self on public.strategies;
create policy strategies_auth_insert_as_self on public.strategies
  for insert to authenticated
  with check (author = public.current_profile_id());

comment on policy strategies_auth_insert_as_self on public.strategies is
  'Authenticated users can only insert as themselves.';

drop policy if exists strategies_auth_update on public.strategies;
create policy strategies_auth_update on public.strategies
  for update to authenticated
  using (author = public.current_profile_id() or public.is_admin())
  with check (author = public.current_profile_id() or public.is_admin());

comment on policy strategies_auth_update on public.strategies is
  'Author-or-admin edits.';

drop policy if exists strategies_auth_delete on public.strategies;
create policy strategies_auth_delete on public.strategies
  for delete to authenticated
  using (author = public.current_profile_id() or public.is_admin());

comment on policy strategies_auth_delete on public.strategies is
  'Author-or-admin deletes.';

-- -----------------------------------------------------------------------------
-- 11. Policies: Profiles
-- -----------------------------------------------------------------------------
-- authenticated:        SELECT their own row
-- -----------------------------------------------------------------------------

drop policy if exists profiles_auth_self_select on public.profiles;
create policy profiles_auth_self_select on public.profiles
  for select to authenticated using (auth_user_id = auth.uid());

comment on policy profiles_auth_self_select on public.profiles is
  'Authenticated users can only select their own rows.';


-- -----------------------------------------------------------------------------
-- 12. Indexes
-- -----------------------------------------------------------------------------

create index idx_matches_winner_loser on matches (winner, loser);
create index idx_strategies_player_opponent on strategies (player, opponent);
create index idx_strategies_author on strategies (author);
create index idx_matches_logged_by on matches (logged_by);

-- -----------------------------------------------------------------------------
-- 13. Seed: commanders (reference data)
-- -----------------------------------------------------------------------------

insert into public.commanders (slug, display_name, faction) values
  ('raynor',     'Raynor',       'Terran'),
  ('swann',      'Swann',        'Terran'),
  ('nova',       'Nova',         'Terran'),
  ('han_horner', 'Han & Horner', 'Terran'),
  ('tychus',     'Tychus',       'Terran'),
  ('mengsk',     'Mengsk',       'Terran'),
  ('kerrigan',   'Kerrigan',     'Zerg'),
  ('zagara',     'Zagara',       'Zerg'),
  ('abathur',    'Abathur',      'Zerg'),
  ('stukov',     'Stukov',       'Zerg'),
  ('dehaka',     'Dehaka',       'Zerg'),
  ('stetmann',   'Stetmann',     'Zerg'),
  ('artanis',    'Artanis',      'Protoss'),
  ('vorazun',    'Vorazun',      'Protoss'),
  ('karax',      'Karax',        'Protoss'),
  ('alarak',     'Alarak',       'Protoss'),
  ('fenix',      'Fenix',        'Protoss')
on conflict (slug) do nothing;