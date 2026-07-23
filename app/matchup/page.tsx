"use client";

import { SetStateAction, useEffect, useRef, useState } from "react";
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
  const [statsVersion, setStatsVersion] = useState<number>(0);
  const [pendingAction, setPendingAction] = useState<"clear" | "submit" | null>(
    null
  );
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

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

  // Move focus to Cancel whenever a confirmation prompt opens
  useEffect(() => {
    if (pendingAction) {
      cancelButtonRef.current?.focus();
    }
  }, [pendingAction]);

  function handleClearAll() {
    setLeftCommanders([]);
    setRightCommanders([]);
  }

  async function handleSubmitResults() {
    if (
      matchupCount === 0 ||
      leftCommanders.length !== rightCommanders.length ||
      currentProfileId === null
    )
      return false;

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
      return false;
    }

    setStatsVersion((v) => v + 1);
    return true;
  }

  function confirmPendingAction() {
    if (pendingAction === "clear") {
      handleClearAll();
    } else if (pendingAction === "submit") {
      handleSubmitResults();
    }
    setPendingAction(null);
  }

  function onRemoveHandler(
    setter: (value: SetStateAction<Commander[]>) => void
  ): (index: number) => void {
    return (index: number) => {
      setter((prev) => prev.filter((_, i) => i !== index));
      setCurrentIndex((i: number) => (index < i ? i - 1 : i));
    };
  }

  function onChangeAtHandler(
    setter: (value: SetStateAction<Commander[]>) => void
  ): (index: number, newCommander: Commander) => void {
    return (index: number, newCommander: Commander) => {
      setter((prev) =>
        prev.map((c: Commander, i: number) => (i === index ? newCommander : c))
      );
    };
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
          onRemove={onRemoveHandler(setLeftCommanders)}
          onChangeAt={onChangeAtHandler(setLeftCommanders)}
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
                  version={statsVersion}
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
                  version={statsVersion}
                />
              </div>
            </div>
          </MatchupCarousel>
        )}

        {pendingAction ? (
          <div className="flex shrink-0 flex-col items-center justify-center gap-3 border-t border-border pt-4 sm:flex-row">
            <span className="text-center text-sm text-muted">
              {pendingAction === "clear"
                ? "Clear all selected commanders?"
                : `Submit ${leftCommanders.length} matchup result${
                    leftCommanders.length === 1 ? "" : "s"
                  }?`}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                ref={cancelButtonRef}
                className="btn btn-ghost"
                onClick={() => setPendingAction(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmPendingAction}
              >
                {pendingAction === "clear" ? "Clear All" : "Submit"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex shrink-0 items-center justify-center gap-3 border-t border-border pt-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setPendingAction("clear")}
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
              onClick={() => setPendingAction("submit")}
              disabled={
                matchupCount === 0 ||
                leftCommanders.length !== rightCommanders.length ||
                currentProfileId === null
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
          onRemove={onRemoveHandler(setRightCommanders)}
          onChangeAt={onChangeAtHandler(setRightCommanders)}
          onSelectIndex={setCurrentIndex}
        />
      </section>
    </main>
  );
}
