"use client";

import { useState } from "react";
import MatchupCommanderSelection from "../components/matchup/MatchupCommanderSelection";
import MatchupCarousel from "../components/matchup/MatchupCarousel";
import CommanderStatsView from "../components/CommanderStatsView";
import { Tables } from "@/database/database.types";

type Commander = Tables<"commanders">;

export default function Matchup() {
  const [leftCommanders, setLeftCommanders] = useState<Commander[]>([]);
  const [rightCommanders, setRightCommanders] = useState<Commander[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Pairwise matchups run 1-to-1. Pad to the longer side so an unfilled slot
  // still shows a matchup with an empty panel on the short side.
  const matchupCount = Math.max(leftCommanders.length, rightCommanders.length);
  // Clamp during render so a shrinking list (e.g. after Clear) never leaves the
  // index out of range — no effect needed.
  const currentMatchup = Math.min(currentIndex, Math.max(0, matchupCount - 1));
  const selectedLeft = leftCommanders[currentMatchup] ?? null;
  const selectedRight = rightCommanders[currentMatchup] ?? null;

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
            <div className="relative flex flex-row items-start justify-center gap-4">
              <div className="side-ally flex flex-1 flex-col gap-3">
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

              <div className="side-enemy flex flex-1 flex-col gap-3">
                <CommanderStatsView
                  commander={selectedRight}
                  opponent={selectedLeft}
                  reversed={true}
                />
              </div>
            </div>
          </MatchupCarousel>
        )}
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
