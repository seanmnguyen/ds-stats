"use client";

import { Tables } from "@/database/database.types";
import { createUserLevelClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import StrategyRow, { StrategyWithAuthor } from "./StrategyRow";
import StrategyInputForm, { InputMode } from "./StrategyInputForm";

type Commander = Tables<"commanders">;
type Strategy = Tables<"strategies">;

interface CommanderStatsViewProps {
  commander: Commander | null;
  opponent?: Commander | null;
  reversed?: boolean;
}

const PORTRAIT_SIZE: number = 300;

export default function CommanderStatsView({
  commander,
  opponent,
  reversed,
}: CommanderStatsViewProps) {
  const [wins, setWins] = useState<number>(0);
  const [losses, setLosses] = useState<number>(0);
  const [strategies, setStrategies] = useState<StrategyWithAuthor[]>([]);
  const [isAddingStrategy, setIsAddingStrategy] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);

  function fetchAllStrategies(player: Commander): Promise<StrategyWithAuthor[]> {
    const supabase = createUserLevelClient();
    return (async () => {
      const { data } = await supabase
        .from("strategies")
        .select("*, author_profile:public_profiles!strategies_author_fkey(username)")
        .eq("player", player.slug)
        .order("rating", { ascending: false });

      return data ? data : [];
    })();
  }

  function fetchStrategy(
    player: Commander,
    opponent: Commander
  ): Promise<StrategyWithAuthor[]> {
    const supabase = createUserLevelClient();
    return (async () => {
      const { data } = await supabase
        .from("strategies")
        .select("*, author_profile:public_profiles!strategies_author_fkey(username)")
        .eq("player", player.slug)
        .eq("opponent", opponent.slug)
        .order("rating", { ascending: false });

      return data ? data : [];
    })();
  }

  async function refreshStrategies() {
    if (!commander) return;
    const fetched = opponent
      ? // Get the strategies for just this matchup
        await fetchStrategy(commander, opponent)
      : // Get the strategies for all matchups with this commander
        await fetchAllStrategies(commander);
    setStrategies(fetched);
  }

  // Replace a single strategy in place after an edit. The update returns a plain
  // row (no embedded author), so merge it over the existing one to keep the author.
  function patchStrategy(updated: Strategy) {
    setStrategies((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    );
  }

  // Determine current profile id and admin status
  useEffect(() => {
    const supabase = createUserLevelClient();

    (async () => {
      const { data: currentProfileId } = await supabase.rpc(
        "current_profile_id"
      );
      const { data: isAdmin } = await supabase.rpc("is_admin");
      setCurrentProfileId(currentProfileId);
      setIsAdmin(Boolean(isAdmin));
    })();
  }, []);

  // Auth check
  useEffect(() => {
    const supabase = createUserLevelClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
      }
    })();
  }, []);

  useEffect(() => {
    const supabase = createUserLevelClient();
    if (commander !== null && commander !== undefined) {
      (async () => {
        const { data } = await supabase
          .from("matchup_stats")
          .select("opponent, wins, losses")
          .eq("player", commander.slug);

        if (data) {
          if (opponent === null || opponent === undefined) {
            // No opponent -> get all stats and strategies
            const totalWins = data.reduce(
              (sum, row) => sum + (row.wins ?? 0),
              0
            );
            const totalLosses = data.reduce(
              (sum, row) => sum + (row.losses ?? 0),
              0
            );
            setWins(totalWins);
            setLosses(totalLosses);

            // Get the strategies for all matchups with this commander
            setStrategies(await fetchAllStrategies(commander));
          } else {
            // Opponent selected -> get specific matchup stats and strategies
            const matchupData = data.filter(
              (value) => value.opponent === opponent.slug
            );
            const matchupWins = matchupData.reduce(
              (sum, row) => sum + (row.wins ?? 0),
              0
            );
            const matchupLosses = matchupData.reduce(
              (sum, row) => sum + (row.losses ?? 0),
              0
            );
            setWins(matchupWins);
            setLosses(matchupLosses);

            // Get the strategies for just this matchup
            setStrategies(await fetchStrategy(commander, opponent));
          }
        }
      })();
    } else {
      (async () => setStrategies([]))();
    }
  }, [commander, opponent]);

  // Guard against divide-by-zero when a commander has no recorded games
  const totalGames = wins + losses;
  const winRate =
    commander && totalGames > 0 ? (wins / totalGames) * 100 : null;

  return (
    <div className="panel flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
      <h3
        className={`border-b border-border pb-3 text-center font-display text-2xl font-bold uppercase tracking-wide ${
          commander ? "" : "text-faint"
        }`}
      >
        {commander?.display_name ?? "Select a Commander"}
      </h3>

      <div
        className={`flex items-center gap-6 ${
          reversed ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {commander?.portrait_url ? (
          <Image
            key={commander.slug}
            src={commander.portrait_url}
            width={PORTRAIT_SIZE}
            height={PORTRAIT_SIZE}
            alt={`Portrait of ${commander.display_name}`}
            className="w-2/5 max-w-[300px] rounded-2xl ring-1 ring-border"
          />
        ) : (
          <div className="flex aspect-square w-2/5 max-w-[300px] items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-inset">
            <span className="font-display text-5xl font-bold text-faint">
              ?
            </span>
          </div>
        )}

        <div
          className={`flex flex-1 flex-col gap-2 ${
            reversed ? "items-end text-right" : "items-start text-left"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-faint">
            Matchup Stats
          </p>
          <p
            className={`flex items-baseline gap-3 ${
              reversed ? "flex-row-reverse" : ""
            }`}
          >
            <span className="text-sm text-muted">Wins</span>
            <span
              className={`font-display text-3xl font-bold tabular-nums ${
                commander ? "text-win" : "text-faint"
              }`}
            >
              {commander ? wins : "—"}
            </span>
          </p>
          <p
            className={`flex items-baseline gap-3 ${
              reversed ? "flex-row-reverse" : ""
            }`}
          >
            <span className="text-sm text-muted">Losses</span>
            <span
              className={`font-display text-3xl font-bold tabular-nums ${
                commander ? "text-loss" : "text-faint"
              }`}
            >
              {commander ? losses : "—"}
            </span>
          </p>
          <p
            className={`flex items-baseline gap-3 ${
              reversed ? "flex-row-reverse" : ""
            }`}
          >
            <span className="text-sm text-muted">Win Rate</span>
            <span
              className={`font-display text-3xl font-bold tabular-nums ${
                winRate !== null ? "text-[var(--side)]" : "text-faint"
              }`}
            >
              {winRate !== null ? `${winRate.toFixed(1)}%` : "—"}
            </span>
          </p>
          <div className="h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-surface-inset">
            <div
              className="h-full rounded-full bg-[var(--side)] transition-[width] duration-300"
              style={{ width: `${winRate ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-row items-center justify-between">
          <h4 className="font-display text-lg font-bold uppercase tracking-wide">
            Strategies
          </h4>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddingStrategy(true)}
            disabled={!isAuthenticated || isAddingStrategy || !commander}
          >
            Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {isAddingStrategy && commander ? (
            <StrategyInputForm
              player={commander}
              opponent={opponent ?? undefined}
              mode={InputMode.ADD}
              onSuccess={refreshStrategies}
              onClose={() => setIsAddingStrategy(false)}
            ></StrategyInputForm>
          ) : (
            ""
          )}
          {!commander ? (
            <p className="py-6 text-center text-sm text-faint">
              Select a commander to view strategies.
            </p>
          ) : strategies.length === 0 && !isAddingStrategy ? (
            <p className="py-6 text-center text-sm text-faint">
              No strategies yet.
            </p>
          ) : null}
          {commander &&
            strategies.map((strat) =>
              editingStrategy?.id === strat.id ? (
                <StrategyInputForm
                  key={strat.id}
                  player={commander}
                  opponent={opponent ?? undefined}
                  mode={InputMode.EDIT}
                  strategy={strat}
                  onSuccess={patchStrategy}
                  onClose={() => setEditingStrategy(null)}
                ></StrategyInputForm>
              ) : (
                <StrategyRow
                  key={strat.id}
                  strategy={strat}
                  isAdmin={isAdmin}
                  currentProfileId={currentProfileId}
                  onEdit={(s) => setEditingStrategy(s)}
                ></StrategyRow>
              )
            )}
        </div>
      </div>
    </div>
  );
}
