"use client";

import { Tables } from "@/database/database.types";
import { createUserLevelClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import CommanderMatchupStats from "./CommanderMatchupStats";
import StrategyView from "./StrategyView";

type Commander = Tables<"commanders">;

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
          }
        }
      })();
    }
  }, [commander, opponent]);

  return (
    <div className="panel flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
      <h3
        className={`border-b border-border pb-3 text-center font-display text-2xl font-bold uppercase tracking-wide ${
          commander ? "" : "text-faint"
        }`}
      >
        {commander?.display_name ?? "Select a Commander"}
      </h3>

      <CommanderMatchupStats
        commander={commander}
        wins={wins}
        losses={losses}
        portrait_size={PORTRAIT_SIZE}
        reversed={reversed}
      />

      <StrategyView commander={commander} opponent={opponent} />
    </div>
  );
}
