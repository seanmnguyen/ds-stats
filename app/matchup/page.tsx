"use client";

import { useEffect, useState } from "react";
import MatchupCommanderSelection from "../components/matchup/MatchupCommanderSelection";
import MatchupCarousel from "../components/matchup/MatchupCarousel";
import CommanderStatsView from "../components/CommanderStatsView";
import { Tables, TablesInsert } from "@/database/database.types";
import { createUserLevelClient } from "@/lib/supabase/client";
import { postgrestErrorToHttpStatus } from "@/database/utils";

type Commander = Tables<"commanders">;
type MatchInsert = TablesInsert<"matches">;

export default function Matchup() {
  const [leftCommanders, setLeftCommanders] = useState<Commander[]>([]);
  const [rightCommanders, setRightCommanders] = useState<Commander[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);

  // Pairwise matchups run 1-to-1. Pad to the longer side
  const matchupCount = Math.max(leftCommanders.length, rightCommanders.length);
  // Clamp during render
  const currentMatchup = Math.min(currentIndex, Math.max(0, matchupCount - 1));
  const selectedLeft = leftCommanders[currentMatchup] ?? null;
  const selectedRight = rightCommanders[currentMatchup] ?? null;

  // Determine current profile id and admin status
  useEffect(() => {
    const supabase = createUserLevelClient();

    (async () => {
      const { data: currentProfileId } = await supabase.rpc(
        "current_profile_id"
      );
      setCurrentProfileId(currentProfileId);
    })();
  }, []);

  function handleClearAll() {
    setLeftCommanders([]);
    setRightCommanders([]);
  }

  async function handleSubmitResults() {
    const supabase = createUserLevelClient();

    const matchupResults: MatchInsert[] = leftCommanders.map(
      (c: Commander, i: number) => {
        return {
          winner: c.slug,
          loser: rightCommanders.at(i)?.slug,
          logged_by: currentProfileId,
        } as MatchInsert;
      }
    );

    const { error } = await supabase.from("matches").insert(matchupResults);
    if (error) {
      console.error(
        `Error inserting match ups for ${leftCommanders} ${rightCommanders}: ${postgrestErrorToHttpStatus(
          error
        )}, ${error}`
      );
    }
  }

  return (
    <main className="flex w-full flex-1 flex-col lg:h-[calc(100dvh-var(--nav-h))] lg:flex-none lg:flex-row">
      <section className="side-ally flex min-h-0 flex-1 flex-col gap-4 p-4">
        <h2 className="text-center font-display text-xl font-bold uppercase tracking-wide">
          Winners
        </h2>
        <MatchupCommanderSelection
          selected={leftCommanders}
          activeIndex={currentMatchup}
          onAdd={(c) => setLeftCommanders((prev) => [...prev, c])}
          onClear={() => setLeftCommanders([])}
          onSelectIndex={setCurrentIndex}
        />
      </section>

      <section className="side-ally flex min-h-0 flex-1 flex-col justify-center gap-4 p-4 lg:flex-[6]">
        {matchupCount === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="font-display text-lg font-bold uppercase tracking-wide text-faint">
              No matchups yet
            </p>
            <p className="text-sm text-muted">
              Add commanders to the Winners and Losers to build pairwise
              matchups.
            </p>
          </div>
        ) : (
          <MatchupCarousel
            count={matchupCount}
            index={currentMatchup}
            onIndexChange={setCurrentIndex}
          >
            <div className="relative flex min-h-0 flex-1 flex-row items-stretch justify-center gap-4">
              <div className="side-ally flex min-h-0 flex-1 flex-col gap-3">
                <CommanderStatsView
                  commander={selectedLeft}
                  opponent={selectedRight}
                  reversed={false}
                />
              </div>

              <div
                aria-hidden
                className="absolute inset-x-0 top-1/2 h-px bg-border lg:inset-x-auto lg:inset-y-0 lg:left-1/2 lg:h-auto lg:w-px"
              />
              <span className="relative self-center rounded-full border border-border-strong bg-surface px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-muted">
                vs
              </span>

              <div className="side-enemy flex min-h-0 flex-1 flex-col gap-3">
                <CommanderStatsView
                  commander={selectedRight}
                  opponent={selectedLeft}
                  reversed={true}
                />
              </div>
            </div>
          </MatchupCarousel>
        )}

        <div className="flex shrink-0 items-center justify-center gap-3 border-t border-border pt-4">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleClearAll}
            disabled={
              leftCommanders.length === 0 && rightCommanders.length === 0
            }
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.8 9.5h6.4L12 4" />
            </svg>
            Clear All
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmitResults}
            disabled={
              matchupCount === 0 ||
              leftCommanders.length !== rightCommanders.length
            }
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 8.5l3 3 7-7" />
            </svg>
            Submit Results
          </button>
        </div>
      </section>

      <section className="side-enemy flex min-h-0 flex-1 flex-col gap-4 p-4">
        <h2 className="text-center font-display text-xl font-bold uppercase tracking-wide">
          Losers
        </h2>
        <MatchupCommanderSelection
          selected={rightCommanders}
          activeIndex={currentMatchup}
          onAdd={(c) => setRightCommanders((prev) => [...prev, c])}
          onClear={() => setRightCommanders([])}
          onSelectIndex={setCurrentIndex}
        />
      </section>
    </main>
  );
}
