-- =============================================================================
-- DS-Stats: Data Migration — Matches & Strategies
-- =============================================================================
-- Full reseed of real Direct Strike data. Three parts, applied top to bottom:
--   0. reset       truncate matches + strategies (clean slate, ids restart)
--   A. matches     731 games, one row per game (winner beats loser)
--   B. strategies  295 per-matchup notes (includes 14 mirror-matchup strategies)
--
-- Strategy text comes from the sheet's per-cell threaded comments (one comment
-- = one row, replies included); created_at/last_edit use the comment's date in
-- America/Los_Angeles. Mirror matchups (player = opponent) exist for strategies
-- only, never for matches. 
--
-- Reference — valid commander slugs (every slug column must be one of these):
--   Terran    raynor  swann  nova  han_horner  tychus  mengsk
--   Zerg      kerrigan  zagara  abathur  stukov  dehaka  stetmann
--   Protoss   artanis  vorazun  karax  alarak  fenix
--
-- NEVER set these columns (the database fills them):
--   id        generated always as identity            (both tables)
--   rating    generated: upvotes - downvotes          (strategies only)
--
-- ATTRIBUTION: each section stamps every row with a single profile, looked up
-- once by email. If the email isn't found the lookup yields NULL (inserts
-- still succeed — the column just ends up NULL).
--   * matches.logged_by  — not shown anywhere in the UI; NULL is harmless.
--   * strategies.author  — a NULL-author strategy shows no author name and can
--     only be edited/deleted by an admin (which you are).
--
-- DATES: both tables default created_at to now(); matches also has played_at.
-- In the VALUES a NULL date falls back to now() via coalesce(); section B sets
-- created_at AND last_edit from one date column.
--
-- WARNING — destructive full reseed: section 0 TRUNCATEs both tables, so this
-- wipes any matches/strategies added through the live app since the last seed.
-- Re-running won't create duplicates (the truncate clears first), but it will
-- discard app-created rows. Intended to be the single source of seed data.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0. Reset — clear existing rows so this loads as clean seed data
-- -----------------------------------------------------------------------------
-- Wipes matches and strategies and restarts their id sequences. Nothing
-- references these tables by FK, so truncate is safe. This migration is a
-- run-once full reseed, not an incremental add.
truncate table public.matches, public.strategies restart identity;


-- -----------------------------------------------------------------------------
-- A. Matches
-- -----------------------------------------------------------------------------
-- Required : winner, loser (commander slugs)
-- Optional : played_at (timestamptz; NULL -> now())
--
-- Duplicate the example rows and replace with your real games. Keep the
-- ::timestamptz cast on the first row's played_at so the column type is inferred
-- correctly; later rows don't need it.
insert into public.matches (winner, loser, played_at, logged_by)
select
  v.winner,
  v.loser,
  coalesce(v.played_at, now()),
  (select id from public.profiles where lower(email) = lower('smnguyen745@gmail.com'))
from (values
  -- winner,       loser,        played_at (NULL = use now())
  -- Han & Horner wins:
  ('han_horner',   'mengsk',   null),
  ('han_horner',   'mengsk',   null),
  ('han_horner',   'mengsk',   null),
  ('han_horner',   'mengsk',   null),
  ('han_horner',   'mengsk',   null),

  ('han_horner',   'nova',   null),
  ('han_horner',   'nova',   null),
  ('han_horner',   'nova',   null),

  ('han_horner',   'raynor',   null),

  ('han_horner',   'swann',   null),
  ('han_horner',   'swann',   null),
  ('han_horner',   'swann',   null),

  ('han_horner',   'tychus',   null),
  ('han_horner',   'tychus',   null),
  ('han_horner',   'tychus',   null),

  ('han_horner',   'abathur',   null),

  ('han_horner',   'kerrigan',   null),

  ('han_horner',   'stetmann',   null),

  ('han_horner',   'stukov',   null),
  ('han_horner',   'stukov',   null),

  ('han_horner',   'zagara',   null),
  ('han_horner',   'zagara',   null),

  ('han_horner',   'alarak',   null),
  ('han_horner',   'alarak',   null),

  ('han_horner',   'artanis',   null),

  ('han_horner',   'fenix',   null),
  ('han_horner',   'fenix',   null),

  ('han_horner',   'karax',   null),
  ('han_horner',   'karax',   null),

  ('han_horner',   'vorazun',   null),
  ('han_horner',   'vorazun',   null),

  -- Mengsk wins:
  ('mengsk',   'nova',   null),

  ('mengsk',   'raynor',   null),

  ('mengsk',   'tychus',   null),

  ('mengsk',   'abathur',   null),
  ('mengsk',   'abathur',   null),

  ('mengsk',   'dehaka',   null),

  ('mengsk',   'kerrigan',   null),
  ('mengsk',   'kerrigan',   null),

  ('mengsk',   'stetmann',   null),

  ('mengsk',   'alarak',   null),
  ('mengsk',   'alarak',   null),
  ('mengsk',   'alarak',   null),

  ('mengsk',   'artanis',   null),
  ('mengsk',   'artanis',   null),

  ('mengsk',   'fenix',   null),

  ('mengsk',   'vorazun',   null),
  ('mengsk',   'vorazun',   null),

  -- Nova wins:
  ('nova',   'han_horner',   null),

  ('nova',   'mengsk',   null),
  ('nova',   'mengsk',   null),
  ('nova',   'mengsk',   null),
  ('nova',   'mengsk',   null),

  ('nova',   'raynor',   null),
  ('nova',   'raynor',   null),
  ('nova',   'raynor',   null),
  ('nova',   'raynor',   null),
  ('nova',   'raynor',   null),
  ('nova',   'raynor',   null),

  ('nova',   'swann',   null),
  ('nova',   'swann',   null),
  ('nova',   'swann',   null),
  ('nova',   'swann',   null),
  ('nova',   'swann',   null),

  ('nova',   'tychus',   null),
  ('nova',   'tychus',   null),
  ('nova',   'tychus',   null),
  ('nova',   'tychus',   null),
  ('nova',   'tychus',   null),
  ('nova',   'tychus',   null),
  ('nova',   'tychus',   null),
  ('nova',   'tychus',   null),
  ('nova',   'tychus',   null),

  ('nova',   'abathur',   null),
  ('nova',   'abathur',   null),
  ('nova',   'abathur',   null),
  ('nova',   'abathur',   null),
  ('nova',   'abathur',   null),

  ('nova',   'dehaka',   null),
  ('nova',   'dehaka',   null),

  ('nova',   'kerrigan',   null),
  ('nova',   'kerrigan',   null),

  ('nova',   'stetmann',   null),
  ('nova',   'stetmann',   null),
  ('nova',   'stetmann',   null),

  ('nova',   'stukov',   null),
  ('nova',   'stukov',   null),
  ('nova',   'stukov',   null),
  ('nova',   'stukov',   null),
  ('nova',   'stukov',   null),
  ('nova',   'stukov',   null),

  ('nova',   'zagara',   null),
  ('nova',   'zagara',   null),
  ('nova',   'zagara',   null),
  ('nova',   'zagara',   null),

  ('nova',   'alarak',   null),
  ('nova',   'alarak',   null),

  ('nova',   'artanis',   null),
  ('nova',   'artanis',   null),
  ('nova',   'artanis',   null),
  ('nova',   'artanis',   null),
  ('nova',   'artanis',   null),

  ('nova',   'fenix',   null),
  ('nova',   'fenix',   null),
  ('nova',   'fenix',   null),
  ('nova',   'fenix',   null),
  ('nova',   'fenix',   null),

  ('nova',   'karax',   null),
  ('nova',   'karax',   null),
  ('nova',   'karax',   null),
  ('nova',   'karax',   null),

  ('nova',   'vorazun',   null),
  ('nova',   'vorazun',   null),

  -- Raynor wins:
  ('raynor',   'han_horner',   null),
  ('raynor',   'han_horner',   null),
  ('raynor',   'han_horner',   null),
  ('raynor',   'han_horner',   null),
  ('raynor',   'han_horner',   null),

  ('raynor',   'mengsk',   null),
  ('raynor',   'mengsk',   null),
  ('raynor',   'mengsk',   null),
  ('raynor',   'mengsk',   null),
  ('raynor',   'mengsk',   null),

  ('raynor',   'nova',   null),
  ('raynor',   'nova',   null),

  ('raynor',   'swann',   null),
  ('raynor',   'swann',   null),

  ('raynor',   'tychus',   null),
  ('raynor',   'tychus',   null),
  ('raynor',   'tychus',   null),

  ('raynor',   'abathur',   null),

  ('raynor',   'dehaka',   null),

  ('raynor',   'kerrigan',   null),
  ('raynor',   'kerrigan',   null),

  ('raynor',   'stetmann',   null),

  ('raynor',   'stukov',   null),
  ('raynor',   'stukov',   null),
  ('raynor',   'stukov',   null),

  ('raynor',   'zagara',   null),

  ('raynor',   'alarak',   null),

  ('raynor',   'artanis',   null),

  ('raynor',   'fenix',   null),
  ('raynor',   'fenix',   null),

  ('raynor',   'karax',   null),

  ('raynor',   'vorazun',   null),
  ('raynor',   'vorazun',   null),
  ('raynor',   'vorazun',   null),
  ('raynor',   'vorazun',   null),
  ('raynor',   'vorazun',   null),
  ('raynor',   'vorazun',   null),

  -- Swann wins:
  ('swann',   'han_horner',   null),
  ('swann',   'han_horner',   null),

  ('swann',   'mengsk',   null),
  ('swann',   'mengsk',   null),
  ('swann',   'mengsk',   null),
  ('swann',   'mengsk',   null),
  ('swann',   'mengsk',   null),
  ('swann',   'mengsk',   null),
  ('swann',   'mengsk',   null),
  ('swann',   'mengsk',   null),
  ('swann',   'mengsk',   null),
  ('swann',   'mengsk',   null),
  ('swann',   'mengsk',   null),
  ('swann',   'mengsk',   null),

  ('swann',   'nova',   null),
  ('swann',   'nova',   null),
  ('swann',   'nova',   null),
  ('swann',   'nova',   null),
  ('swann',   'nova',   null),
  ('swann',   'nova',   null),
  ('swann',   'nova',   null),
  ('swann',   'nova',   null),

  ('swann',   'raynor',   null),
  ('swann',   'raynor',   null),
  ('swann',   'raynor',   null),

  ('swann',   'tychus',   null),
  ('swann',   'tychus',   null),
  ('swann',   'tychus',   null),
  ('swann',   'tychus',   null),
  ('swann',   'tychus',   null),
  ('swann',   'tychus',   null),

  ('swann',   'abathur',   null),
  ('swann',   'abathur',   null),

  ('swann',   'dehaka',   null),
  ('swann',   'dehaka',   null),
  ('swann',   'dehaka',   null),
  ('swann',   'dehaka',   null),
  ('swann',   'dehaka',   null),

  ('swann',   'kerrigan',   null),
  ('swann',   'kerrigan',   null),
  ('swann',   'kerrigan',   null),
  ('swann',   'kerrigan',   null),
  ('swann',   'kerrigan',   null),

  ('swann',   'stetmann',   null),
  ('swann',   'stetmann',   null),
  ('swann',   'stetmann',   null),

  ('swann',   'stukov',   null),
  ('swann',   'stukov',   null),
  ('swann',   'stukov',   null),
  ('swann',   'stukov',   null),
  ('swann',   'stukov',   null),
  ('swann',   'stukov',   null),

  ('swann',   'zagara',   null),
  ('swann',   'zagara',   null),
  ('swann',   'zagara',   null),
  ('swann',   'zagara',   null),
  ('swann',   'zagara',   null),

  ('swann',   'alarak',   null),
  ('swann',   'alarak',   null),
  ('swann',   'alarak',   null),
  ('swann',   'alarak',   null),

  ('swann',   'artanis',   null),
  ('swann',   'artanis',   null),
  ('swann',   'artanis',   null),
  ('swann',   'artanis',   null),
  ('swann',   'artanis',   null),
  ('swann',   'artanis',   null),

  ('swann',   'fenix',   null),
  ('swann',   'fenix',   null),
  ('swann',   'fenix',   null),
  ('swann',   'fenix',   null),

  ('swann',   'karax',   null),
  ('swann',   'karax',   null),
  ('swann',   'karax',   null),
  ('swann',   'karax',   null),
  ('swann',   'karax',   null),
  ('swann',   'karax',   null),
  ('swann',   'karax',   null),

  ('swann',   'vorazun',   null),
  ('swann',   'vorazun',   null),

  -- Tychus wins:
  ('tychus',   'han_horner',   null),
  ('tychus',   'han_horner',   null),

  ('tychus',   'mengsk',   null),
  ('tychus',   'mengsk',   null),
  ('tychus',   'mengsk',   null),

  ('tychus',   'nova',   null),
  ('tychus',   'nova',   null),
  ('tychus',   'nova',   null),

  ('tychus',   'raynor',   null),
  ('tychus',   'raynor',   null),
  ('tychus',   'raynor',   null),
  ('tychus',   'raynor',   null),
  ('tychus',   'raynor',   null),
  ('tychus',   'raynor',   null),

  ('tychus',   'swann',   null),
  ('tychus',   'swann',   null),
  ('tychus',   'swann',   null),

  ('tychus',   'abathur',   null),

  ('tychus',   'dehaka',   null),
  ('tychus',   'dehaka',   null),
  ('tychus',   'dehaka',   null),
  ('tychus',   'dehaka',   null),

  ('tychus',   'stukov',   null),
  ('tychus',   'stukov',   null),

  ('tychus',   'zagara',   null),

  ('tychus',   'alarak',   null),
  ('tychus',   'alarak',   null),
  ('tychus',   'alarak',   null),

  ('tychus',   'artanis',   null),
  ('tychus',   'artanis',   null),
  ('tychus',   'artanis',   null),
  ('tychus',   'artanis',   null),
  ('tychus',   'artanis',   null),

  ('tychus',   'fenix',   null),
  ('tychus',   'fenix',   null),

  ('tychus',   'vorazun',   null),
  ('tychus',   'vorazun',   null),

  -- Abathur wins:
  ('abathur',   'raynor',   null),
  ('abathur',   'raynor',   null),

  ('abathur',   'swann',   null),
  ('abathur',   'swann',   null),
  ('abathur',   'swann',   null),
  ('abathur',   'swann',   null),
  ('abathur',   'swann',   null),

  ('abathur',   'dehaka',   null),

  ('abathur',   'kerrigan',   null),

  ('abathur',   'stukov',   null),

  ('abathur',   'alarak',   null),

  ('abathur',   'artanis',   null),

  ('abathur',   'fenix',   null),

  ('abathur',   'karax',   null),

  ('abathur',   'vorazun',   null),
  ('abathur',   'vorazun',   null),

  -- Dehaka wins:
  ('dehaka',   'han_horner',   null),
  ('dehaka',   'han_horner',   null),
  ('dehaka',   'han_horner',   null),

  ('dehaka',   'mengsk',   null),
  ('dehaka',   'mengsk',   null),
  ('dehaka',   'mengsk',   null),

  ('dehaka',   'raynor',   null),

  ('dehaka',   'swann',   null),

  ('dehaka',   'tychus',   null),
  ('dehaka',   'tychus',   null),
  ('dehaka',   'tychus',   null),
  ('dehaka',   'tychus',   null),

  ('dehaka',   'abathur',   null),
  ('dehaka',   'abathur',   null),
  ('dehaka',   'abathur',   null),
  ('dehaka',   'abathur',   null),

  ('dehaka',   'kerrigan',   null),
  ('dehaka',   'kerrigan',   null),
  ('dehaka',   'kerrigan',   null),
  ('dehaka',   'kerrigan',   null),

  ('dehaka',   'stetmann',   null),
  ('dehaka',   'stetmann',   null),

  ('dehaka',   'zagara',   null),
  ('dehaka',   'zagara',   null),
  ('dehaka',   'zagara',   null),

  ('dehaka',   'alarak',   null),
  ('dehaka',   'alarak',   null),
  ('dehaka',   'alarak',   null),

  ('dehaka',   'artanis',   null),

  ('dehaka',   'fenix',   null),
  ('dehaka',   'fenix',   null),

  ('dehaka',   'karax',   null),

  ('dehaka',   'vorazun',   null),
  ('dehaka',   'vorazun',   null),
  ('dehaka',   'vorazun',   null),
  ('dehaka',   'vorazun',   null),

  -- Kerrigan wins:
  ('kerrigan',   'han_horner',   null),
  ('kerrigan',   'han_horner',   null),
  ('kerrigan',   'han_horner',   null),

  ('kerrigan',   'mengsk',   null),
  ('kerrigan',   'mengsk',   null),
  ('kerrigan',   'mengsk',   null),
  ('kerrigan',   'mengsk',   null),

  ('kerrigan',   'nova',   null),
  ('kerrigan',   'nova',   null),
  ('kerrigan',   'nova',   null),
  ('kerrigan',   'nova',   null),

  ('kerrigan',   'raynor',   null),
  ('kerrigan',   'raynor',   null),
  ('kerrigan',   'raynor',   null),
  ('kerrigan',   'raynor',   null),
  ('kerrigan',   'raynor',   null),

  ('kerrigan',   'swann',   null),
  ('kerrigan',   'swann',   null),

  ('kerrigan',   'tychus',   null),
  ('kerrigan',   'tychus',   null),
  ('kerrigan',   'tychus',   null),
  ('kerrigan',   'tychus',   null),

  ('kerrigan',   'abathur',   null),
  ('kerrigan',   'abathur',   null),

  ('kerrigan',   'dehaka',   null),
  ('kerrigan',   'dehaka',   null),

  ('kerrigan',   'stetmann',   null),
  ('kerrigan',   'stetmann',   null),
  ('kerrigan',   'stetmann',   null),

  ('kerrigan',   'stukov',   null),
  ('kerrigan',   'stukov',   null),
  ('kerrigan',   'stukov',   null),
  ('kerrigan',   'stukov',   null),
  ('kerrigan',   'stukov',   null),
  ('kerrigan',   'stukov',   null),
  ('kerrigan',   'stukov',   null),

  ('kerrigan',   'alarak',   null),
  ('kerrigan',   'alarak',   null),
  ('kerrigan',   'alarak',   null),
  ('kerrigan',   'alarak',   null),
  ('kerrigan',   'alarak',   null),

  ('kerrigan',   'artanis',   null),

  ('kerrigan',   'karax',   null),
  ('kerrigan',   'karax',   null),
  ('kerrigan',   'karax',   null),

  ('kerrigan',   'vorazun',   null),
  ('kerrigan',   'vorazun',   null),
  ('kerrigan',   'vorazun',   null),
  ('kerrigan',   'vorazun',   null),

  -- Stetmann wins:
  ('stetmann',   'han_horner',   null),
  ('stetmann',   'han_horner',   null),

  ('stetmann',   'mengsk',   null),

  ('stetmann',   'raynor',   null),

  ('stetmann',   'swann',   null),
  ('stetmann',   'swann',   null),
  ('stetmann',   'swann',   null),

  ('stetmann',   'tychus',   null),
  ('stetmann',   'tychus',   null),
  ('stetmann',   'tychus',   null),
  ('stetmann',   'tychus',   null),

  ('stetmann',   'abathur',   null),
  ('stetmann',   'abathur',   null),

  ('stetmann',   'dehaka',   null),

  ('stetmann',   'kerrigan',   null),

  ('stetmann',   'stukov',   null),
  ('stetmann',   'stukov',   null),

  ('stetmann',   'alarak',   null),

  ('stetmann',   'artanis',   null),

  ('stetmann',   'fenix',   null),
  ('stetmann',   'fenix',   null),

  ('stetmann',   'karax',   null),
  ('stetmann',   'karax',   null),

  ('stetmann',   'vorazun',   null),
  ('stetmann',   'vorazun',   null),
  ('stetmann',   'vorazun',   null),
  ('stetmann',   'vorazun',   null),

  -- Stukov wins:
  ('stukov',   'han_horner',   null),

  ('stukov',   'mengsk',   null),
  ('stukov',   'mengsk',   null),

  ('stukov',   'nova',   null),

  ('stukov',   'raynor',   null),

  ('stukov',   'swann',   null),

  ('stukov',   'tychus',   null),
  ('stukov',   'tychus',   null),
  ('stukov',   'tychus',   null),
  ('stukov',   'tychus',   null),
  ('stukov',   'tychus',   null),
  ('stukov',   'tychus',   null),
  ('stukov',   'tychus',   null),

  ('stukov',   'abathur',   null),
  ('stukov',   'abathur',   null),
  ('stukov',   'abathur',   null),
  ('stukov',   'abathur',   null),

  ('stukov',   'dehaka',   null),

  ('stukov',   'stetmann',   null),

  ('stukov',   'zagara',   null),

  ('stukov',   'alarak',   null),

  ('stukov',   'artanis',   null),

  ('stukov',   'fenix',   null),

  ('stukov',   'karax',   null),
  ('stukov',   'karax',   null),

  ('stukov',   'vorazun',   null),

  -- Zagara wins:
  ('zagara',   'han_horner',   null),

  ('zagara',   'mengsk',   null),
  ('zagara',   'mengsk',   null),
  ('zagara',   'mengsk',   null),

  ('zagara',   'nova',   null),
  ('zagara',   'nova',   null),
  ('zagara',   'nova',   null),
  ('zagara',   'nova',   null),

  ('zagara',   'raynor',   null),
  ('zagara',   'raynor',   null),

  ('zagara',   'tychus',   null),

  ('zagara',   'abathur',   null),

  ('zagara',   'dehaka',   null),

  ('zagara',   'stetmann',   null),

  ('zagara',   'stukov',   null),
  ('zagara',   'stukov',   null),

  ('zagara',   'artanis',   null),

  ('zagara',   'fenix',   null),

  ('zagara',   'karax',   null),

  ('zagara',   'vorazun',   null),
  ('zagara',   'vorazun',   null),
  ('zagara',   'vorazun',   null),

  -- Alarak wins:
  ('alarak',   'han_horner',   null),
  ('alarak',   'han_horner',   null),
  ('alarak',   'han_horner',   null),
  ('alarak',   'han_horner',   null),

  ('alarak',   'mengsk',   null),
  ('alarak',   'mengsk',   null),
  ('alarak',   'mengsk',   null),
  ('alarak',   'mengsk',   null),
  ('alarak',   'mengsk',   null),

  ('alarak',   'nova',   null),
  ('alarak',   'nova',   null),
  ('alarak',   'nova',   null),
  ('alarak',   'nova',   null),

  ('alarak',   'raynor',   null),
  ('alarak',   'raynor',   null),

  ('alarak',   'swann',   null),
  ('alarak',   'swann',   null),
  ('alarak',   'swann',   null),
  ('alarak',   'swann',   null),

  ('alarak',   'tychus',   null),
  ('alarak',   'tychus',   null),
  ('alarak',   'tychus',   null),
  ('alarak',   'tychus',   null),
  ('alarak',   'tychus',   null),
  ('alarak',   'tychus',   null),
  ('alarak',   'tychus',   null),

  ('alarak',   'abathur',   null),
  ('alarak',   'abathur',   null),
  ('alarak',   'abathur',   null),
  ('alarak',   'abathur',   null),
  ('alarak',   'abathur',   null),
  ('alarak',   'abathur',   null),
  ('alarak',   'abathur',   null),

  ('alarak',   'dehaka',   null),

  ('alarak',   'kerrigan',   null),

  ('alarak',   'stetmann',   null),
  ('alarak',   'stetmann',   null),
  ('alarak',   'stetmann',   null),
  ('alarak',   'stetmann',   null),

  ('alarak',   'stukov',   null),
  ('alarak',   'stukov',   null),

  ('alarak',   'zagara',   null),
  ('alarak',   'zagara',   null),
  ('alarak',   'zagara',   null),
  ('alarak',   'zagara',   null),
  ('alarak',   'zagara',   null),

  ('alarak',   'artanis',   null),
  ('alarak',   'artanis',   null),
  ('alarak',   'artanis',   null),
  ('alarak',   'artanis',   null),
  ('alarak',   'artanis',   null),
  ('alarak',   'artanis',   null),

  ('alarak',   'karax',   null),
  ('alarak',   'karax',   null),

  ('alarak',   'vorazun',   null),
  ('alarak',   'vorazun',   null),
  ('alarak',   'vorazun',   null),
  ('alarak',   'vorazun',   null),
  ('alarak',   'vorazun',   null),
  ('alarak',   'vorazun',   null),

  -- Artanis wins:
  ('artanis',   'mengsk',   null),
  ('artanis',   'mengsk',   null),

  ('artanis',   'nova',   null),
  ('artanis',   'nova',   null),
  ('artanis',   'nova',   null),
  ('artanis',   'nova',   null),
  ('artanis',   'nova',   null),

  ('artanis',   'raynor',   null),

  ('artanis',   'tychus',   null),
  ('artanis',   'tychus',   null),
  ('artanis',   'tychus',   null),

  ('artanis',   'dehaka',   null),
  ('artanis',   'dehaka',   null),

  ('artanis',   'kerrigan',   null),
  ('artanis',   'kerrigan',   null),

  ('artanis',   'stetmann',   null),

  ('artanis',   'stukov',   null),

  ('artanis',   'zagara',   null),
  ('artanis',   'zagara',   null),

  ('artanis',   'alarak',   null),

  ('artanis',   'karax',   null),

  ('artanis',   'vorazun',   null),
  ('artanis',   'vorazun',   null),

  -- Fenix wins:
  ('fenix',   'han_horner',   null),
  ('fenix',   'han_horner',   null),
  ('fenix',   'han_horner',   null),

  ('fenix',   'mengsk',   null),
  ('fenix',   'mengsk',   null),

  ('fenix',   'nova',   null),
  ('fenix',   'nova',   null),
  ('fenix',   'nova',   null),

  ('fenix',   'raynor',   null),
  ('fenix',   'raynor',   null),
  ('fenix',   'raynor',   null),
  ('fenix',   'raynor',   null),
  ('fenix',   'raynor',   null),

  ('fenix',   'swann',   null),
  ('fenix',   'swann',   null),
  ('fenix',   'swann',   null),

  ('fenix',   'tychus',   null),
  ('fenix',   'tychus',   null),
  ('fenix',   'tychus',   null),
  ('fenix',   'tychus',   null),
  ('fenix',   'tychus',   null),
  ('fenix',   'tychus',   null),

  ('fenix',   'abathur',   null),
  ('fenix',   'abathur',   null),

  ('fenix',   'dehaka',   null),
  ('fenix',   'dehaka',   null),
  ('fenix',   'dehaka',   null),

  ('fenix',   'kerrigan',   null),
  ('fenix',   'kerrigan',   null),

  ('fenix',   'stetmann',   null),

  ('fenix',   'stukov',   null),
  ('fenix',   'stukov',   null),

  ('fenix',   'alarak',   null),

  ('fenix',   'artanis',   null),
  ('fenix',   'artanis',   null),
  ('fenix',   'artanis',   null),
  ('fenix',   'artanis',   null),

  ('fenix',   'karax',   null),
  ('fenix',   'karax',   null),
  ('fenix',   'karax',   null),
  ('fenix',   'karax',   null),

  ('fenix',   'vorazun',   null),
  ('fenix',   'vorazun',   null),

  -- Karax wins:
  ('karax',   'han_horner',   null),
  ('karax',   'han_horner',   null),
  ('karax',   'han_horner',   null),

  ('karax',   'mengsk',   null),
  ('karax',   'mengsk',   null),
  ('karax',   'mengsk',   null),
  ('karax',   'mengsk',   null),
  ('karax',   'mengsk',   null),
  ('karax',   'mengsk',   null),
  ('karax',   'mengsk',   null),
  ('karax',   'mengsk',   null),

  ('karax',   'nova',   null),
  ('karax',   'nova',   null),
  ('karax',   'nova',   null),
  ('karax',   'nova',   null),
  ('karax',   'nova',   null),
  ('karax',   'nova',   null),
  ('karax',   'nova',   null),
  ('karax',   'nova',   null),

  ('karax',   'raynor',   null),
  ('karax',   'raynor',   null),
  ('karax',   'raynor',   null),
  ('karax',   'raynor',   null),
  ('karax',   'raynor',   null),
  ('karax',   'raynor',   null),
  ('karax',   'raynor',   null),
  ('karax',   'raynor',   null),
  ('karax',   'raynor',   null),
  ('karax',   'raynor',   null),
  ('karax',   'raynor',   null),
  ('karax',   'raynor',   null),

  ('karax',   'swann',   null),
  ('karax',   'swann',   null),
  ('karax',   'swann',   null),
  ('karax',   'swann',   null),
  ('karax',   'swann',   null),
  ('karax',   'swann',   null),
  ('karax',   'swann',   null),
  ('karax',   'swann',   null),

  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),
  ('karax',   'tychus',   null),

  ('karax',   'abathur',   null),
  ('karax',   'abathur',   null),
  ('karax',   'abathur',   null),
  ('karax',   'abathur',   null),
  ('karax',   'abathur',   null),

  ('karax',   'dehaka',   null),
  ('karax',   'dehaka',   null),
  ('karax',   'dehaka',   null),
  ('karax',   'dehaka',   null),
  ('karax',   'dehaka',   null),
  ('karax',   'dehaka',   null),
  ('karax',   'dehaka',   null),
  ('karax',   'dehaka',   null),
  ('karax',   'dehaka',   null),
  ('karax',   'dehaka',   null),

  ('karax',   'kerrigan',   null),
  ('karax',   'kerrigan',   null),
  ('karax',   'kerrigan',   null),
  ('karax',   'kerrigan',   null),

  ('karax',   'stetmann',   null),
  ('karax',   'stetmann',   null),
  ('karax',   'stetmann',   null),
  ('karax',   'stetmann',   null),
  ('karax',   'stetmann',   null),
  ('karax',   'stetmann',   null),
  ('karax',   'stetmann',   null),
  ('karax',   'stetmann',   null),

  ('karax',   'stukov',   null),
  ('karax',   'stukov',   null),
  ('karax',   'stukov',   null),
  ('karax',   'stukov',   null),
  ('karax',   'stukov',   null),
  ('karax',   'stukov',   null),
  ('karax',   'stukov',   null),
  ('karax',   'stukov',   null),
  ('karax',   'stukov',   null),

  ('karax',   'zagara',   null),
  ('karax',   'zagara',   null),
  ('karax',   'zagara',   null),
  ('karax',   'zagara',   null),
  ('karax',   'zagara',   null),
  ('karax',   'zagara',   null),
  ('karax',   'zagara',   null),
  ('karax',   'zagara',   null),

  ('karax',   'alarak',   null),
  ('karax',   'alarak',   null),
  ('karax',   'alarak',   null),
  ('karax',   'alarak',   null),
  ('karax',   'alarak',   null),
  ('karax',   'alarak',   null),
  ('karax',   'alarak',   null),

  ('karax',   'artanis',   null),
  ('karax',   'artanis',   null),
  ('karax',   'artanis',   null),
  ('karax',   'artanis',   null),
  ('karax',   'artanis',   null),
  ('karax',   'artanis',   null),
  ('karax',   'artanis',   null),

  ('karax',   'fenix',   null),
  ('karax',   'fenix',   null),
  ('karax',   'fenix',   null),
  ('karax',   'fenix',   null),
  ('karax',   'fenix',   null),
  ('karax',   'fenix',   null),

  ('karax',   'vorazun',   null),
  ('karax',   'vorazun',   null),
  ('karax',   'vorazun',   null),
  ('karax',   'vorazun',   null),
  ('karax',   'vorazun',   null),
  ('karax',   'vorazun',   null),
  ('karax',   'vorazun',   null),
  ('karax',   'vorazun',   null),
  ('karax',   'vorazun',   null),
  ('karax',   'vorazun',   null),

  -- Vorazun wins:
  ('vorazun',   'mengsk',   null),
  ('vorazun',   'mengsk',   null),

  ('vorazun',   'nova',   null),

  ('vorazun',   'raynor',   null),
  ('vorazun',   'raynor',   null),

  ('vorazun',   'swann',   null),
  ('vorazun',   'swann',   null),
  ('vorazun',   'swann',   null),
  ('vorazun',   'swann',   null),
  ('vorazun',   'swann',   null),

  ('vorazun',   'tychus',   null),
  ('vorazun',   'tychus',   null),
  ('vorazun',   'tychus',   null),

  ('vorazun',   'dehaka',   null),
  ('vorazun',   'dehaka',   null),
  ('vorazun',   'dehaka',   null),
  ('vorazun',   'dehaka',   null),

  ('vorazun',   'kerrigan',   null),
  ('vorazun',   'kerrigan',   null),

  ('vorazun',   'stetmann',   null),
  ('vorazun',   'stetmann',   null),

  ('vorazun',   'stukov',   null),
  ('vorazun',   'stukov',   null),

  ('vorazun',   'zagara',   null),
  ('vorazun',   'zagara',   null),
  ('vorazun',   'zagara',   null),
  ('vorazun',   'zagara',   null),

  ('vorazun',   'alarak',   null),

  ('vorazun',   'artanis',   null),

  ('vorazun',   'fenix',   null),

  ('vorazun',   'karax',   null),
  ('vorazun',   'karax',   null)

) as v(winner, loser, played_at);


-- -----------------------------------------------------------------------------
-- B. Strategies
-- -----------------------------------------------------------------------------
-- Required : player, opponent (slugs), body (the advice text)
-- Optional : title, upvotes, downvotes (default 0)
--
-- `player` is the commander the strategy is FOR; `opponent` is who it beats.
-- Use $$dollar-quoting$$ for body/title if the text contains apostrophes, so you
-- don't have to escape them ('' -> $$it's fine$$).
insert into public.strategies (player, opponent, title, body, upvotes, downvotes, created_at, last_edit, author)
select
  v.player,
  v.opponent,
  v.title,
  v.body,
  coalesce(v.upvotes, 0),
  coalesce(v.downvotes, 0),
  coalesce(v.created_at::timestamptz, now()),
  coalesce(v.created_at::timestamptz, now()),
  (select id from public.profiles where lower(email) = lower('smnguyen745@gmail.com'))
-- Grouped by `player`, one block per commander, in section-A order (Terran,
-- Zerg, Protoss; alphabetical within faction). Each block lists every OTHER
-- commander as an opponent, same order — the self/mirror pairing is omitted,
-- just like section A. This is a full scaffold: replace each $$FILL ME$$ with
-- real advice and DELETE any row you have no strategy for. Add a title in place
-- of `null` if you want one. The very last row has no trailing comma.
-- The trailing date sets BOTH created_at and last_edit; `null` = now(). Put a
-- quoted date there to backdate a row, e.g. '2026-06-01'.
-- WARNING: do not run with $$FILL ME$$ placeholders still present.
from (values
  -- player,     opponent,     title (or null), body,        upvotes, downvotes, created_at

  -- Han & Horner strategies:
  ('han_horner', 'mengsk',    null, $$reapers --> sell wraiths$$, 0::int,  0::int, '2023-05-02'),
  ('han_horner', 'mengsk',    null, $$reapers --> widow mines --> battlecruisers --> wraiths (no sell) $$, 0,  0, '2023-07-01'),

  ('han_horner', 'nova',      null, $$hellbat + hellion --> widow mines --> battlecruisers + viking$$, 0,       0, '2023-04-16'),

  ('han_horner', 'raynor',    null, $$reapers --> hellbats --> widow mines --> battlecruisers$$, 0,       0, '2023-04-10'),

  ('han_horner', 'swann',     null, $$wraiths --> assault galleons$$, 0,       0, '2023-03-11'),
  ('han_horner', 'swann',     null, $$hellbats --> widow mines --> assault galleons + battlecruisers$$, 0,       0, '2023-04-12'),

  ('han_horner', 'tychus',    null, $$hellbats + hellions --> assault galleons$$, 0,       0, '2023-03-14'),

  ('han_horner', 'abathur',   null, $$reapers + hellions --> vikings + battlecruisers --> assault galleons$$, 0,       0, '2023-07-20'),

  ('han_horner', 'dehaka',    null, $$NOT: reapers --> wraiths$$, 0,       0, '2023-07-01'),

  ('han_horner', 'stetmann',  null, $$hellbat + hellion --> 3-4 vikings + bc --> hellbat + hellion --> widow mines$$, 0,       0, '2023-04-13'),

  ('han_horner', 'stukov',    null, $$hellbats + hellions --> sell hellions, widow mines --> 12 mins: sell all + 2 battlecruisers + wraiths$$, 0,       0, '2023-07-01'),
  ('han_horner', 'stukov',    null, $$Wraiths --> battlecruisers$$, 0,       0, '2025-06-20'),

  ('han_horner', 'zagara',    null, $$hellbats --> widow mines --> (sell), vikings$$, 0,       0, '2023-05-05'),
  ('han_horner', 'zagara',    null, $$just reapers$$, 0,       0, '2025-06-25'),

  ('han_horner', 'artanis',   null, $$widow mines --> wraiths --> battlecruisers + vikings$$, 0,       0, '2023-04-18'),

  ('han_horner', 'fenix',     null, $$wraiths + hellbats --> add vikings --> switch to battlecruisers + carriers$$, 0,       0, '2026-01-09'),

  ('han_horner', 'karax',     null, $$battlecruisers$$, 0,       0, '2025-06-23'),

  ('han_horner', 'vorazun',   null, $$hellion + hellbats --> sell, battlecruisers + galleons + reapers$$, 0,       0, '2023-07-03'),
  ('han_horner', 'vorazun',   null, $$hellion + hellbats --> sell, wraiths$$, 0,       0, '2025-07-05'),

  -- Mengsk strategies:
  ('mengsk',     'stetmann',  null, $$warhounds + rockets + flamethrowers --> shadow guard --> tanks$$, 0, 0, '2023-07-24'),

  ('mengsk',     'alarak',    null, $$warhounds + marauders + tanks$$, 0, 0, '2023-07-11'),

  ('mengsk',     'artanis',   null, $$marauder + zerglings --> tanks + medivacs$$, 0, 0, '2023-03-13'),

  ('mengsk',     'vorazun',   null, $$troopers + warhounds --> shadow  (1x) for dts / blackhammer + rockets for air$$, 0, 0, '2026-05-02'),

  -- Nova strategies:
  ('nova',       'han_horner',null, $$goliaths$$, 0, 0, '2023-05-05'),

  ('nova',       'mengsk',    null, $$tanks$$, 0, 0, '2023-07-01'),
  ('nova',       'mengsk',    null, $$^$$, 0, 0, '2023-07-02'),

  ('nova',       'nova',      null, $$against liberators: goliaths$$, 0, 0, '2025-07-07'),

  ('nova',       'raynor',    null, $$2/3 row of marines --> tanks --> goliaths$$, 0, 0, '2025-06-24'),

  ('nova',       'swann',     null, $$lots of marauders$$, 0, 0, '2023-08-04'),
  ('nova',       'swann',     null, $$^this works$$, 0, 0, '2023-08-13'),

  ('nova',       'tychus',    null, $$marauders$$, 0, 0, '2023-07-03'),
  ('nova',       'tychus',    null, $$marauders --> tanks$$, 0, 0, '2023-07-24'),

  ('nova',       'abathur',   null, $$marauders + marines$$, 0, 0, '2023-04-13'),
  ('nova',       'abathur',   null, $$ghost --> goliaths$$, 0, 0, '2026-01-09'),

  ('nova',       'dehaka',    null, $$marines (2 lines) --> banshees + 1 raven$$, 0, 0, '2023-07-01'),

  ('nova',       'kerrigan',  null, $$ghosts + tanks --> goliaths --> holos + libs$$, 0, 0, '2025-09-07'),

  ('nova',       'stukov',    null, $$hellbats --> goliaths --> tanks$$, 0, 0, '2023-03-11'),
  ('nova',       'stukov',    null, $$against bunker opener: goliaths --> tanks or holos$$, 0, 0, '2025-07-08'),

  ('nova',       'zagara',    null, $$NOT: ravens + ghosts$$, 0, 0, '2024-01-05'),
  ('nova',       'zagara',    null, $$marauders --> tanks$$, 0, 0, '2025-07-05'),
  ('nova',       'zagara',    null, $$tanks$$, 0, 0, '2025-07-22'),

  ('nova',       'alarak',    null, $$marines --> ghosts --> goliaiths (for destroyers) or tanks$$, 0, 0, '2023-12-15'),

  ('nova',       'artanis',   null, $$tanks + hellbats --> holos$$, 0, 0, '2025-07-31'),
  ('nova',       'artanis',   null, $$honor guards --> reavers --> tempest$$, 0, 0, '2026-03-08'),

  ('nova',       'fenix',     null, $$marines --> (maybe marauders) --> tanks$$, 0, 0, '2023-07-13'),

  ('nova',       'karax',     null, $$holodecoys --> marines$$, 0, 0, '2025-07-22'),

  -- Raynor strategies:
  ('raynor',     'mengsk',    null, $$bio --> tanks --> banshees --> hyperion$$, 0, 0, '2023-03-11'),
  ('raynor',     'mengsk',    null, $$^$$, 0, 0, '2023-07-07'),

  ('raynor',     'nova',      null, $$banshees$$, 0, 0, '2023-07-02'),

  ('raynor',     'tychus',    null, $$hellbats + medics + marauders$$, 0, 0, '2023-07-08'),

  ('raynor',     'abathur',   null, $$marauders + marines + medics --> banshees$$, 0, 0, '2023-07-15'),

  ('raynor',     'kerrigan',  null, $$bio --> banshees + vikings (broodlords or mutas) --> tanks$$, 0, 0, '2025-07-06'),

  ('raynor',     'stukov',    null, $$vultures --> bio --> tanks --> vikings$$, 0, 0, '2023-07-07'),

  ('raynor',     'zagara',    null, $$firebats + medics --> tanks$$, 0, 0, '2023-07-04'),

  ('raynor',     'alarak',    null, $$1/2 row of firebats --> banshees --> hyperion$$, 0, 0, '2024-06-04'),

  ('raynor',     'artanis',   null, $$firebats --> air$$, 0, 0, '2025-07-06'),

  ('raynor',     'fenix',     null, $$dusk wings --> 2 rows vikings --> battlecruisers + hyperion$$, 0, 0, '2023-07-04'),
  ('raynor',     'fenix',     null, $$^air$$, 0, 0, '2025-07-06'),

  ('raynor',     'vorazun',   null, $$bio --> banshees --> vikings --> hyperion$$, 0, 0, '2023-07-13'),
  ('raynor',     'vorazun',   null, $$dusk wings --> vikings --> hyperion + battle cruisers$$, 0, 0, '2024-05-30'),
  ('raynor',     'vorazun',   null, $$^$$, 0, 0, '2024-06-03'),

  -- Swann strategies:
  ('swann',      'han_horner',null, $$goliaths --> science vessels$$, 0, 0, '2023-05-27'),

  ('swann',      'mengsk',    null, $$wraiths + science vessels$$, 0, 0, '2023-03-11'),
  ('swann',      'mengsk',    null, $$science vessels --> thors --> hellbats (front) + ares + tanks$$, 0, 0, '2023-07-04'),

  ('swann',      'nova',      null, $$hellbat + goliath --> areas + science vessels$$, 0, 0, '2023-03-11'),
  ('swann',      'nova',      null, $$everything except wraiths$$, 0, 0, '2023-03-11'),
  ('swann',      'nova',      null, $$hellbats (ares) --> tank --> goliaths --> science vessels$$, 0, 0, '2023-07-01'),
  ('swann',      'nova',      null, $$^$$, 0, 0, '2023-07-19'),

  ('swann',      'raynor',    null, $$science vessels$$, 0, 0, '2023-06-08'),
  ('swann',      'raynor',    null, $$add goliaths/thors if needed$$, 0, 0, '2023-06-09'),

  ('swann',      'swann',     null, $$if wraiths ==> goliaths + science vessels$$, 0, 0, '2023-06-27'),
  ('swann',      'swann',     null, $$if thors ==> thors + science vessels --> tanks --> (maybe) hellbats$$, 0, 0, '2023-06-27'),
  ('swann',      'swann',     null, $$i <3 layered thors$$, 0, 0, '2023-07-13'),

  ('swann',      'tychus',    null, $$cyclones --> firebats --> science vessels$$, 0, 0, '2023-03-11'),

  ('swann',      'abathur',   null, $$this didnt actually work BUT MAYBE
ares in front --> thors (lots and lots of them) and tanks behind --> goliaths in the very back$$, 0, 0, '2023-07-01'),
  ('swann',      'abathur',   null, $$ok so maybe hellbats --> tanks --> science vessels --> thors...? from a brawl$$, 0, 0, '2023-07-22'),
  ('swann',      'abathur',   null, $$^^add goliaths if guardians$$, 0, 0, '2023-07-24'),
  ('swann',      'abathur',   null, $$tanks on the side, cyclones in the middle, goliaths in the back, MAYBE hellbats in the front$$, 0, 0, '2023-08-27'),
  ('swann',      'abathur',   null, $$2 science vessels --> 4 thors --> 4 tanks on the side --> goliaths for air --> more science vessels and thors$$, 0, 0, '2024-05-31'),

  ('swann',      'dehaka',    null, $$hellbat + goliaths --> science vessels (for creeper hosts)$$, 0, 0, '2023-03-11'),
  ('swann',      'dehaka',    null, $$add siege tanks, thors, and ares as needed$$, 0, 0, '2023-07-07'),
  ('swann',      'dehaka',    null, $$hellbats + cyclones + siege tanks + science vessels + thors$$, 0, 0, '2023-07-19'),

  ('swann',      'kerrigan',  null, $$mass thors$$, 0, 0, '2023-06-01'),
  ('swann',      'kerrigan',  null, $$hellbat --> goliath --> thors --> ares$$, 0, 0, '2023-07-07'),

  ('swann',      'stetmann',  null, $$hellbat --> goliath --> science vessels$$, 0, 0, '2023-03-11'),
  ('swann',      'stetmann',  null, $$add thors/siege tanks if they have ultra chompy thingys$$, 0, 0, '2023-07-12'),
  ('swann',      'stetmann',  null, $$layer the thors so theres 2 diff rows of barrage cannons$$, 0, 0, '2023-07-13'),

  ('swann',      'stukov',    null, $$hellbat goliath --> siege tanks$$, 0, 0, '2023-03-11'),
  ('swann',      'stukov',    null, $$for diamondbacks: hellbat/ares --> thors and tanks$$, 0, 0, '2023-07-01'),

  ('swann',      'zagara',    null, $$thors + goliaths --> science vessels$$, 0, 0, '2023-03-11'),
  ('swann',      'zagara',    null, $$thors + hellbats$$, 0, 0, '2023-05-27'),
  ('swann',      'zagara',    null, $$thors + hellbats worked again$$, 0, 0, '2023-07-02'),

  ('swann',      'alarak',    null, $$hellbats front, then thors + science vessels$$, 0, 0, '2023-06-01'),
  ('swann',      'alarak',    null, $$maybe add goliaths if they have ships$$, 0, 0, '2023-07-02'),

  ('swann',      'artanis',   null, $$hellbats --> areas --> science vessels$$, 0, 0, '2023-04-02'),
  ('swann',      'artanis',   null, $$siege tanks$$, 0, 0, '2023-07-15'),

  ('swann',      'fenix',     null, $$hellbats --> ares --> goliaths$$, 0, 0, '2023-07-13'),

  ('swann',      'karax',     null, $$hellbats front --> thors

if they have annihilators, add ares in the front
if they have mirages/support carriers, add goliaths in the back$$, 0, 0, '2023-07-01'),

  ('swann',      'vorazun',   null, $$if they do void rays, do goliaths + science vessels, then add ares/thors if you want to buff it up lol$$, 0, 0, '2023-07-11'),

  -- Tychus strategies:
  ('tychus',     'mengsk',    null, $$tychus --> rattlesnake --> lt nikara --> sams (for PoA)$$, 0, 0, '2025-06-23'),

  ('tychus',     'nova',      null, $$tychus --> sam (for fenix wave) --> blaze --> sirius (fenix wave) --> lt nikara$$, 0, 0, '2025-06-25'),
  ('tychus',     'nova',      null, $$robs$$, 0, 0, '2025-07-24'),

  ('tychus',     'raynor',    null, $$Tychus --> sirius (banshees) --> lt nikara --> rattlesnake$$, 0, 0, '2025-07-05'),

  ('tychus',     'swann',     null, $$tychus --> rattlesnake --> rob --> sirius$$, 0, 0, '2025-06-24'),

  ('tychus',     'tychus',    null, $$mass sams$$, 0, 0, '2025-09-06'),

  ('tychus',     'abathur',   null, $$2 sam --> rattlesnake --> tychus --> nux (brawl)$$, 0, 0, '2023-07-23'),

  ('tychus',     'dehaka',    null, $$tychus --> sam --> sirius x2 --> rob x2$$, 0, 0, '2025-06-24'),

  ('tychus',     'zagara',    null, $$tychus --> rattlesnake + nux --> medic + nux$$, 0, 0, '2026-02-10'),

  ('tychus',     'alarak',    null, $$tychus --> lt nikara --> sam (maybe) --> rattlesnake/rob$$, 0, 0, '2025-07-05'),

  ('tychus',     'artanis',   null, $$tychus --> rattlesnakes$$, 0, 0, '2025-06-25'),

  ('tychus',     'karax',     null, $$tychus --> sirius --> rattlesnake$$, 0, 0, '2023-07-08'),

  -- Abathur strategies:
  ('abathur',    'raynor',    null, $$roach + ravagar --> swarm host$$, 0, 0, '2023-08-15'),

  ('abathur',    'stukov',    null, $$queens + swarm hosts --> ravagers$$, 0, 0, '2023-03-14'),

  ('abathur',    'artanis',   null, $$roaches --> swarm hosts$$, 0, 0, '2023-04-13'),

  ('abathur',    'fenix',     null, $$swarm hosts --> vipers$$, 0, 0, '2023-07-16'),

  -- Dehaka strategies:
  ('dehaka',     'han_horner',null, $$mutalisk --> hydralisk$$, 0, 0, '2023-06-10'),
  ('dehaka',     'han_horner',null, $$if reapers: ravasaurs + ultras$$, 0, 0, '2023-07-01'),
  ('dehaka',     'han_horner',null, $$mutalisks$$, 0, 0, '2023-07-04'),
  ('dehaka',     'han_horner',null, $$just hydras$$, 0, 0, '2025-06-25'),

  ('dehaka',     'mengsk',    null, $$ravasaurs --> creepers$$, 0, 0, '2025-06-25'),

  ('dehaka',     'raynor',    null, $$ravasaur + primal igniter --> creepers$$, 0, 0, '2024-06-03'),

  ('dehaka',     'tychus',    null, $$roaches + ravasaurs --> impalers$$, 0, 0, '2023-06-10'),

  ('dehaka',     'abathur',   null, $$ravasaurs --> hydras --> impalers --> ultras$$, 0, 0, '2023-07-13'),
  ('dehaka',     'abathur',   null, $$^$$, 0, 0, '2023-08-27'),

  ('dehaka',     'kerrigan',  null, $$ravasaurs --> impalers$$, 0, 0, '2024-06-06'),
  ('dehaka',     'kerrigan',  null, $$hydras + ravasaurs + igniters --> creepers$$, 0, 0, '2024-06-10'),

  ('dehaka',     'stetmann',  null, $$ravasaurs + hydras --> swarm host + mutas --> tyrannasaur$$, 0, 0, '2023-07-18'),

  ('dehaka',     'stukov',    null, $$ravasaurs + igniters --> impalers --> creepers$$, 0, 0, '2024-06-08'),

  ('dehaka',     'zagara',    null, $$ravasaurs if queens --> creepers + ultras$$, 0, 0, '2024-06-05'),
  ('dehaka',     'zagara',    null, $$^$$, 0, 0, '2024-07-12'),

  ('dehaka',     'alarak',    null, $$dehaka + impaler --> creepers$$, 0, 0, '2026-01-12'),

  ('dehaka',     'artanis',   null, $$mutalisks --> creeper hosts$$, 0, 0, '2023-07-13'),

  ('dehaka',     'fenix',     null, $$ravasaurs --> impalers --> ultras$$, 0, 0, '2023-05-27'),

  -- Kerrigan strategies:
  ('kerrigan',   'han_horner',null, $$ultras --> hydras$$, 0, 0, '2023-04-11'),

  ('kerrigan',   'mengsk',    null, $$ultras + hydras$$, 0, 0, '2024-06-05'),

  ('kerrigan',   'nova',      null, $$ultras --> mutas$$, 0, 0, '2023-05-02'),
  ('kerrigan',   'nova',      null, $$kerrigan + queens --> ultras --> hydras --> broodlords$$, 0, 0, '2023-06-27'),
  ('kerrigan',   'nova',      null, $$ultras$$, 0, 0, '2025-07-24'),

  ('kerrigan',   'raynor',    null, $$mutas$$, 0, 0, '2023-04-15'),
  ('kerrigan',   'raynor',    null, $$ultras$$, 0, 0, '2023-07-01'),

  ('kerrigan',   'tychus',    null, $$hydras --> broods$$, 0, 0, '2023-04-10'),

  ('kerrigan',   'abathur',   null, $$ultras --> hydras$$, 0, 0, '2023-05-27'),

  ('kerrigan',   'dehaka',    null, $$queens --> hydras --> ultras$$, 0, 0, '2026-03-08'),

  ('kerrigan',   'kerrigan',  null, $$MUTAS$$, 0, 0, '2025-09-08'),

  ('kerrigan',   'stetmann',  null, $$ultras --> hydras --> lurkers --> broodlords$$, 0, 0, '2023-03-11'),

  ('kerrigan',   'stukov',    null, $$ultras --> hydras$$, 0, 0, '2023-05-05'),

  ('kerrigan',   'alarak',    null, $$ultras --> lurkers + hydras$$, 0, 0, '2024-06-08'),

  ('kerrigan',   'artanis',   null, $$ultras --> lurkers$$, 0, 0, '2026-03-09'),

  ('kerrigan',   'karax',     null, $$kerrigan + 2 queens --> ultras$$, 0, 0, '2023-04-10'),
  ('kerrigan',   'karax',     null, $$kerrigan --> ultras --> lurkers --> hydras$$, 0, 0, '2023-05-02'),
  ('kerrigan',   'karax',     null, $$against air: hydras$$, 0, 0, '2026-03-14'),

  ('kerrigan',   'vorazun',   null, $$ultras --> hydras --> lurkers$$, 0, 0, '2023-07-11'),
  ('kerrigan',   'vorazun',   null, $$^$$, 0, 0, '2025-07-30'),

  -- Stetmann strategies:
  ('stetmann',   'han_horner',null, $$zerglings + banelings --> super gary --> hydras$$, 0, 0, '2023-07-08'),
  ('stetmann',   'han_horner',null, $$hydras --> zerglings$$, 0, 0, '2023-07-15'),

  ('stetmann',   'raynor',    null, $$ultras + hydras$$, 0, 0, '2023-07-08'),

  ('stetmann',   'tychus',    null, $$t3 --> zerglings --> super gary --> more zerglings --> ultras$$, 0, 0, '2023-07-05'),
  ('stetmann',   'tychus',    null, $$^$$, 0, 0, '2023-07-13'),
  ('stetmann',   'tychus',    null, $$mecha battlecarrier lords$$, 0, 0, '2025-07-06'),

  ('stetmann',   'abathur',   null, $$lings + lurkers --> ultras$$, 0, 0, '2025-09-06'),

  ('stetmann',   'stetmann',  null, $$hydras + lings --> lurker (maybe)$$, 0, 0, '2025-07-06'),

  ('stetmann',   'fenix',     null, $$zerglings + banelings$$, 0, 0, '2023-05-02'),

  -- Stukov strategies:
  ('stukov',     'mengsk',    null, $$marines --> bunkers --> diamondbacks --> tanks --> diamondbacks --> tanks --> alex$$, 0, 0, '2023-03-15'),

  ('stukov',     'nova',      null, $$banshees$$, 0, 0, '2025-07-06'),

  ('stukov',     'raynor',    null, $$infested marines --> bunkers --> tanks$$, 0, 0, '2023-03-19'),

  ('stukov',     'tychus',    null, $$diamondbacks --> infantry --> banshees or tanks$$, 0, 0, '2023-05-04'),
  ('stukov',     'tychus',    null, $$bunkers + marines --> tanks + diamondbacks$$, 0, 0, '2023-07-04'),

  ('stukov',     'abathur',   null, $$bunkers --> tanks --> apocalisks$$, 0, 0, '2023-07-13'),

  ('stukov',     'dehaka',    null, $$banshees --> alexander$$, 0, 0, '2025-07-05'),

  ('stukov',     'stetmann',  null, $$bunkers + marines --> diamondbacks$$, 0, 0, '2023-05-05'),

  ('stukov',     'stukov',    null, $$1 row of bunkers --> tanks + diamondbacks$$, 0, 0, '2025-06-25'),

  ('stukov',     'artanis',   null, $$banshees --> aleksandr --> more banshees$$, 0, 0, '2023-07-20'),

  -- Zagara strategies:
  ('zagara',     'mengsk',    null, $$hunter killers$$, 0, 0, '2023-05-02'),
  ('zagara',     'mengsk',    null, $$hunter killers + aberrations$$, 0, 0, '2023-07-11'),

  ('zagara',     'nova',      null, $$hunter killers --> (some) roaches --> aberrations$$, 0, 0, '2024-01-05'),

  ('zagara',     'abathur',   null, $$aberrations --> hunter killers$$, 0, 0, '2023-05-27'),

  ('zagara',     'stetmann',  null, $$hunter killers --> aberrations --> scourage$$, 0, 0, '2024-01-05'),

  ('zagara',     'stukov',    null, $$swarmlings --> mix hunter killers and aberrations$$, 0, 0, '2024-01-05'),

  -- Alarak strategies:
  ('alarak',     'han_horner',null, $$slayers$$, 0, 0, '2023-05-04'),
  ('alarak',     'han_horner',null, $$^$$, 0, 0, '2023-06-12'),
  ('alarak',     'han_horner',null, $$add supplicants late game$$, 0, 0, '2024-06-05'),

  ('alarak',     'mengsk',    null, $$supplicants + slayers --> vanguards --> wrathwalkers$$, 0, 0, '2023-08-14'),
  ('alarak',     'mengsk',    null, $$^$$, 0, 0, '2024-07-18'),

  ('alarak',     'nova',      null, $$basic row of supplicants --> like 4 slayers --> wrathwalkers --> alternate between slayers and walkers$$, 0, 0, '2024-06-03'),
  ('alarak',     'nova',      null, $$^ effective against mass holodecoys$$, 0, 0, '2024-06-03'),

  ('alarak',     'raynor',    null, $$supplicants --> slayers --> vanguards$$, 0, 0, '2023-08-15'),
  ('alarak',     'raynor',    null, $$supplicants --> ascendants$$, 0, 0, '2025-07-05'),

  ('alarak',     'swann',     null, $$mass slayers$$, 0, 0, '2025-07-05'),
  ('alarak',     'swann',     null, $$slayers --> wrathwalkers$$, 0, 0, '2025-07-05'),

  ('alarak',     'tychus',    null, $$slayers --> vanguards --> 1 ascendant$$, 0, 0, '2023-04-10'),
  ('alarak',     'tychus',    null, $$supplicants --> wrathwalkers --> more supplicants --> slayers --> mothership$$, 0, 0, '2023-07-11'),
  ('alarak',     'tychus',    null, $$^$$, 0, 0, '2023-07-20'),

  ('alarak',     'abathur',   null, $$1 row supplicants --> slayers --> ascendants$$, 0, 0, '2023-07-13'),
  ('alarak',     'abathur',   null, $$^$$, 0, 0, '2023-07-15'),

  ('alarak',     'dehaka',    null, $$slayers + havocs --> wrathwalkers$$, 0, 0, '2023-07-19'),

  ('alarak',     'stetmann',  null, $$slayers --> vanguards --> wrathwalkers$$, 0, 0, '2023-07-13'),
  ('alarak',     'stetmann',  null, $$^$$, 0, 0, '2024-05-31'),

  ('alarak',     'stukov',    null, $$against alexandr rush: destroyers + wrathwalkers$$, 0, 0, '2024-06-05'),
  ('alarak',     'stukov',    null, $$slayers + vanguards --> ascendants$$, 0, 0, '2024-06-08'),

  ('alarak',     'zagara',    null, $$supplicants --> slayers --> vanguards$$, 0, 0, '2024-01-05'),
  ('alarak',     'zagara',    null, $$^ add ascendants late game$$, 0, 0, '2024-06-03'),

  ('alarak',     'alarak',    null, $$opener but prioritize supplicants first --> balance supplicants and slayers until 1 row of each --> wrathwalkers$$, 0, 0, '2025-07-24'),

  ('alarak',     'artanis',   null, $$against phoenix: destroyers$$, 0, 0, '2024-06-03'),

  ('alarak',     'fenix',     null, $$wrathwalkers vs carrier rush$$, 0, 0, '2025-07-04'),

  ('alarak',     'karax',     null, $$momma ship$$, 0, 0, '2025-07-24'),

  ('alarak',     'vorazun',   null, $$supplicants + slayers$$, 0, 0, '2025-07-05'),

  -- Artanis strategies:
  ('artanis',    'mengsk',    null, $$dragoons --> immortals --> reavers$$, 0, 0, '2023-07-15'),

  ('artanis',    'nova',      null, $$phoenix --> tempest$$, 0, 0, '2023-05-17'),
  ('artanis',    'nova',      null, $$honor guards --> reavers --> tempest$$, 0, 0, '2026-03-10'),

  ('artanis',    'raynor',    null, $$dragoons --> immortals --> archons + phoenix$$, 0, 0, '2023-07-11'),

  ('artanis',    'tychus',    null, $$zealots --> immortals --> tempests$$, 0, 0, '2023-04-02'),
  ('artanis',    'tychus',    null, $$reavers + honor guards$$, 0, 0, '2025-07-05'),

  ('artanis',    'dehaka',    null, $$zealots --> immortals --> reavers$$, 0, 0, '2023-04-11'),
  ('artanis',    'dehaka',    null, $$zealots (shielded) --> archons --> immortals$$, 0, 0, '2023-07-15'),

  ('artanis',    'kerrigan',  null, $$zealots --> archons --> phoenix$$, 0, 0, '2023-05-02'),

  ('artanis',    'stetmann',  null, $$tempest --> zealots --> reavers$$, 0, 0, '2023-07-07'),

  ('artanis',    'stukov',    null, $$against bunkers: honor guards + dragoons$$, 0, 0, '2025-07-07'),

  ('artanis',    'zagara',    null, $$dragoons --> shielded zealots --> archons$$, 0, 0, '2023-07-15'),
  ('artanis',    'zagara',    null, $$dragoons --> shielded zealots --> reavers --> archons$$, 0, 0, '2023-07-16'),

  ('artanis',    'alarak',    null, $$zealot (boosted) dragoons --> phoenix --> archons --> reavers$$, 0, 0, '2023-04-13'),
  ('artanis',    'alarak',    null, $$^$$, 0, 0, '2025-09-05'),

  ('artanis',    'artanis',   null, $$tempest$$, 0, 0, '2025-07-04'),

  ('artanis',    'karax',     null, $$zealot + dragoons (some) --> archons + immortals --> phoenix$$, 0, 0, '2023-05-04'),

  ('artanis',    'vorazun',   null, $$dragoons --> phoenix --> archons$$, 0, 0, '2023-04-01'),
  ('artanis',    'vorazun',   null, $$zealots --> archons --> reavers$$, 0, 0, '2023-04-14'),

  -- Fenix strategies:
  ('fenix',      'han_horner',null, $$adepts --> immortals$$, 0, 0, '2023-07-11'),

  ('fenix',      'mengsk',    null, $$adepts --> immortals --> disruptors$$, 0, 0, '2023-07-15'),

  ('fenix',      'nova',      null, $$adepts --> disruptors --> more adepts$$, 0, 0, '2025-07-23'),
  ('fenix',      'nova',      null, $$^$$, 0, 0, '2025-07-24'),

  ('fenix',      'raynor',    null, $$fenix --> disruptors$$, 0, 0, '2024-06-05'),

  ('fenix',      'tychus',    null, $$legionnaires --> adepts --> fenix --> immortals$$, 0, 0, '2023-03-13'),
  ('fenix',      'tychus',    null, $$adepts + immortals$$, 0, 0, '2025-07-05'),

  ('fenix',      'abathur',   null, $$adepts --> immortals --> fenix (ranged)$$, 0, 0, '2025-07-10'),

  ('fenix',      'dehaka',    null, $$legionnaires --> adepts --> fenix --> immortals$$, 0, 0, '2023-03-11'),
  ('fenix',      'dehaka',    null, $$^$$, 0, 0, '2025-09-07'),

  ('fenix',      'kerrigan',  null, $$legionnaires --> adepts --> immortals --> carriers$$, 0, 0, '2023-07-13'),

  ('fenix',      'stukov',    null, $$adepts --> colossus$$, 0, 0, '2023-05-05'),
  ('fenix',      'stukov',    null, $$^$$, 0, 0, '2023-07-08'),

  ('fenix',      'alarak',    null, $$legionnaires --> fenix + adepts --> conservators + immortals$$, 0, 0, '2025-06-23'),

  ('fenix',      'artanis',   null, $$for tempest: scouts --> carriers$$, 0, 0, '2023-07-03'),
  ('fenix',      'artanis',   null, $$legionnaires --> immortals$$, 0, 0, '2023-07-13'),

  ('fenix',      'fenix',     null, $$adepts --> scouts --> carriers$$, 0, 0, '2023-07-15'),

  ('fenix',      'karax',     null, $$scouts$$, 0, 0, '2023-05-04'),

  ('fenix',      'vorazun',   null, $$adepts + immortals$$, 0, 0, '2025-07-23'),

  -- Karax strategies:
  ('karax',      'han_horner',null, $$LOTS AND LOTS AND LOTS of mirages and carriers$$, 0, 0, '2024-01-05'),

  ('karax',      'mengsk',    null, $$maybe sentinels + annihilators$$, 0, 0, '2023-08-04'),
  ('karax',      'mengsk',    null, $$^^$$, 0, 0, '2024-06-05'),

  ('karax',      'nova',      null, $$mirages --> zealots (late game)$$, 0, 0, '2023-06-08'),
  ('karax',      'nova',      null, $$Sentinels --> annihilators --> mirages --> carriers$$, 0, 0, '2025-06-19'),

  ('karax',      'raynor',    null, $$mirages + carriers$$, 0, 0, '2023-07-08'),

  ('karax',      'swann',     null, $$annihilators everywhere --> sentinels down the sides --> mirages for wraiths$$, 0, 0, '2025-06-23'),

  ('karax',      'tychus',    null, $$half row of sentinels --> annihilators --> carriers$$, 0, 0, '2023-07-13'),
  ('karax',      'tychus',    null, $$^ but can swap carriers for colossus$$, 0, 0, '2023-07-16'),
  ('karax',      'tychus',    null, $$BIG SENTINEL BOX with layered annihilators$$, 0, 0, '2024-06-03'),

  ('karax',      'abathur',   null, $$annihilator triangle --> sentinels --> mirages if bats$$, 0, 0, '2024-06-06'),

  ('karax',      'dehaka',    null, $$sentinels --> colossus$$, 0, 0, '2023-05-02'),
  ('karax',      'dehaka',    null, $$sentinels box --> layered annihilator -> giraffe in back$$, 0, 0, '2024-06-03'),
  ('karax',      'dehaka',    null, $$if they have lots of bats.... BUILD 4 rows of mirages and annihilator triangle$$, 0, 0, '2024-06-03'),

  ('karax',      'kerrigan',  null, $$GRID LOCK annihilators + sentinels$$, 0, 0, '2024-06-08'),

  ('karax',      'stetmann',  null, $$mirage + carriers$$, 0, 0, '2023-07-19'),
  ('karax',      'stetmann',  null, $$sentinels + carriers (but the dude never built gary)$$, 0, 0, '2024-01-05'),
  ('karax',      'stetmann',  null, $$annihlators + sentinels --> carriers$$, 0, 0, '2025-07-22'),

  ('karax',      'stukov',    null, $$sentinels + layered annihilators + giraffe$$, 0, 0, '2024-06-03'),

  ('karax',      'zagara',    null, $$sentinels --> giraffes --> mirages --> carriers$$, 0, 0, '2024-01-02'),

  ('karax',      'alarak',    null, $$against destroyers: all mirages, add some annihilators and sentinels for alarak$$, 0, 0, '2024-06-03'),
  ('karax',      'alarak',    null, $$against anything else: annihilators + sentinels in BOX formation$$, 0, 0, '2024-06-03'),
  ('karax',      'alarak',    null, $$against motherships: mirages (lost until like 10) and then carriers$$, 0, 0, '2026-05-03'),

  ('karax',      'artanis',   null, $$sentinels in front and along the sides, annihilators in my triangle

add carriers if needed$$, 0, 0, '2024-01-05'),

  ('karax',      'fenix',     null, $$a lot of annihilators + a little bit of sentinels + carriers$$, 0, 0, '2024-05-30'),
  ('karax',      'fenix',     null, $$mirages if scouts$$, 0, 0, '2024-06-05'),
  ('karax',      'fenix',     null, $$annihilators --> sentinels --> carriers (LOTS AND LOTS)$$, 0, 0, '2024-08-09'),
  ('karax',      'fenix',     null, $$somehow won with sentinels --> annihlators --> giraffes$$, 0, 0, '2025-07-05'),
  ('karax',      'fenix',     null, $$sentinels + annihlators --> mirages$$, 0, 0, '2025-07-22'),
  ('karax',      'fenix',     null, $$maybe: sentinel + annihilators for start --> then, giraffe for adepts OR carriers for air$$, 0, 0, '2025-09-06'),

  ('karax',      'karax',     null, $$straight mirages$$, 0, 0, '2024-05-30'),

  ('karax',      'vorazun',   null, $$against stalkers + void rays: sentinels --> annihilators --> mirages + carriers$$, 0, 0, '2025-09-05'),

  -- Vorazun strategies:
  ('vorazun',    'mengsk',    null, $$stalkers --> void rays --> dark archons$$, 0, 0, '2023-05-04'),

  ('vorazun',    'nova',      null, $$2 rows stalkers + 4 centurions --> void rays
(note: karax carry)$$, 0, 0, '2025-07-31'),

  ('vorazun',    'raynor',    null, $$some stalkers to tank --> oracles + void rays --> dark archons (for marines, otherwise more air)$$, 0, 0, '2025-07-24'),

  ('vorazun',    'swann',     null, $$1 line stalkers --> void rays (add corsairs for science vessels if needed)$$, 0, 0, '2023-07-01'),
  ('vorazun',    'swann',     null, $$stalkers$$, 0, 0, '2023-07-01'),
  ('vorazun',    'swann',     null, $$stalkers + oracles$$, 0, 0, '2023-07-03'),

  ('vorazun',    'tychus',    null, $$stalkers --> void rays$$, 0, 0, '2023-05-17'),
  ('vorazun',    'tychus',    null, $$dark templar + void rays$$, 0, 0, '2025-09-08'),
  ('vorazun',    'tychus',    null, $$stalkers --> oracles --> void rays$$, 0, 0, '2026-02-10'),

  ('vorazun',    'dehaka',    null, $$centurions + stalkers$$, 0, 0, '2024-06-08'),

  ('vorazun',    'stetmann',  null, $$stalkers$$, 0, 0, '2026-03-02'),

  ('vorazun',    'zagara',    null, $$stalkers$$, 0, 0, '2023-03-11'),
  ('vorazun',    'zagara',    null, $$^$$, 0, 0, '2025-09-06'),

  ('vorazun',    'alarak',    null, $$oracles --> void rays$$, 0, 0, '2023-07-15'),

  ('vorazun',    'artanis',   null, $$stalkers --> void rays --> oracles$$, 0, 0, '2023-03-14'),

  ('vorazun',    'karax',     null, $$stalkers (like half of the map) --> voidrays$$, 0, 0, '2023-07-07'),
  ('vorazun',    'karax',     null, $$straight air$$, 0, 0, '2025-09-04'),

  ('vorazun',    'vorazun',   null, $$1 row stalkers --> oracles --> centurions --> few corsairs --> more oracles$$, 0, 0, '2023-07-07'),
  ('vorazun',    'vorazun',   null, $$centurions --> voidrays --> oracles + corsairs$$, 0, 0, '2023-07-11')
) as v(player, opponent, title, body, upvotes, downvotes, created_at);
