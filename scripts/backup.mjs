// Snapshots every publicly-readable row from Supabase into backups/data.json.
//
// Output is timestamp-free so unchanged data produces a byte-identical file and
// the workflow can skip the commit. Git history is the timestamp.
//
// Notes for a future restore:
//   * strategies.rating is GENERATED (upvotes - downvotes) — never insert it.
//   * id columns are `generated always as identity`. They're kept here because
//     strategies.author and matches.logged_by reference profiles.id.

import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../backups/data.json"
);

// PostgREST truncates responses at max_rows (1000, see supabase/config.toml),
// so reads page until a short page comes back. Without this the backup would
// silently lose rows the day matches crosses that line.
const PAGE_SIZE = 1000;

// orderBy pins row order so a diff shows real changes, not a reshuffle.
const TABLES = [
  { name: "commanders", orderBy: "slug" },
  { name: "matches", orderBy: "id" },
  { name: "strategies", orderBy: "id" },
  { name: "public_profiles", orderBy: "id" },
];

// Singular/plural for the commit subject.
const LABELS = {
  commanders: ["commander", "commanders"],
  matches: ["match", "matches"],
  strategies: ["strategy", "strategies"],
  public_profiles: ["profile", "profiles"],
};

// The only tables worth naming on a first run; the rest are reference data.
const HEADLINE_TABLES = ["matches", "strategies"];

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
  throw new Error("SUPABASE_URL and SUPABASE_KEY must both be set");
}

const label = (table, n) => LABELS[table][Math.abs(n) === 1 ? 0 : 1];

async function fetchPage(table, orderBy, offset) {
  const res = await fetch(
    `${url}/rest/v1/${table}` +
      `?select=*&order=${orderBy}.asc&offset=${offset}&limit=${PAGE_SIZE}`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );

  if (!res.ok) {
    throw new Error(
      `${table}: HTTP ${res.status} ${res.statusText} — ${await res.text()}`
    );
  }

  return res.json();
}

async function fetchTable({ name, orderBy }) {
  const rows = [];

  for (;;) {
    const page = await fetchPage(name, orderBy, rows.length);
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  // All four tables are always populated, so an empty read means a bad key, a
  // revoked grant, or an outage. Fail instead of overwriting a good backup
  // with nothing.
  if (rows.length === 0) {
    throw new Error(`${name}: returned 0 rows`);
  }

  return rows;
}

// Counts from the snapshot being replaced, so the run can describe what moved.
// A missing or unreadable file reads as a first run — the fetch below rebuilds
// it either way, and git still holds the previous version.
async function previousCounts() {
  try {
    return JSON.parse(await readFile(OUT, "utf8")).counts ?? null;
  } catch {
    return null;
  }
}

function describeChange(previous, counts) {
  if (!previous) {
    const headline = HEADLINE_TABLES.map(
      (t) => `${counts[t]} ${label(t, counts[t])}`
    );
    return `initial snapshot — ${headline.join(", ")}`;
  }

  const deltas = Object.entries(counts)
    .map(([table, n]) => [table, n - (previous[table] ?? 0)])
    .filter(([, delta]) => delta !== 0)
    .map(([table, delta]) => {
      const sign = delta > 0 ? "+" : "";
      return `${sign}${delta} ${label(table, delta)}`;
    });

  // Counts hold steady while strategy text and vote tallies move. The workflow
  // only commits when the file actually differs, so this never labels a no-op.
  return deltas.length > 0 ? deltas.join(", ") : "edits only, no new rows";
}

const previous = await previousCounts();

const tables = {};
for (const spec of TABLES) {
  tables[spec.name] = await fetchTable(spec);
}

// Redundant with the arrays, but it puts a readable summary at the top of the
// diff and gives the next run something to diff against.
const counts = Object.fromEntries(
  Object.entries(tables).map(([name, rows]) => [name, rows.length])
);

await mkdir(dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  JSON.stringify({ schema_version: 1, counts, tables }, null, 2) + "\n"
);

const summary = describeChange(previous, counts);

// Hands the commit subject to the workflow. Absent when run locally.
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `summary=${summary}\n`);
}

console.log(
  [
    `Wrote ${OUT}`,
    ...Object.entries(counts).map(([name, n]) => `  ${name}: ${n}`),
    `Summary: ${summary}`,
  ].join("\n")
);
