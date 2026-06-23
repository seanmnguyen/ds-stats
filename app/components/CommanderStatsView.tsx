"use client";

import { Tables } from "@/database/database.types";
import { createUserLevelClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import StrategyRow from "./StrategyRow";
import StrategyInputForm from "./StrategyInputForm";

type Commander = Tables<"commanders">;
type Strategy = Tables<"strategies">;

interface CommanderStatsViewProps {
  commander: Commander | null;
  opponent?: Commander | null;
  reversed?: boolean;
}

const PORTRAIT_DIAMETER: number = 300;

export default function CommanderStatsView({
  commander,
  opponent,
  reversed,
}: CommanderStatsViewProps) {
  const [wins, setWins] = useState<number>(0);
  const [losses, setLosses] = useState<number>(0);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isAddingStrategy, setIsAddingStrategy] = useState<boolean>(false);

  function fetchAllStrategies(player: Commander): Promise<Strategy[]> {
    const supabase = createUserLevelClient();
    return (async () => {
      const { data } = await supabase
        .from("strategies")
        .select("*")
        .eq("player", player.slug);

      return data ? data : [];
    })();
  }

  function fetchStrategy(
    player: Commander,
    opponent: Commander
  ): Promise<Strategy[]> {
    const supabase = createUserLevelClient();
    return (async () => {
      const { data } = await supabase
        .from("strategies")
        .select("*")
        .eq("player", player.slug)
        .eq("opponent", opponent.slug);

      return data ? data : [];
    })();
  }

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

  return (
    <div className="border w-4/5">
      <h3 className="flex justify-center text-3xl">
        {commander?.display_name ?? "Select a Commander"}
      </h3>
      <div
        className={`flex flex-row m-5 ${
          reversed ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <Image
          key={commander?.slug ?? "empty"}
          src={commander?.portrait_url ?? "/portraits/blank"}
          width={PORTRAIT_DIAMETER}
          height={PORTRAIT_DIAMETER}
          alt={`Portrait of ${commander?.display_name ?? "commander"}`}
          className="flex flex-1/2"
        />
        <div
          className={`flex flex-1/2 flex-col justify-around text-xl border ${
            reversed ? "mr-15 text-right" : "ml-15 text-left"
          }`}
        >
          <p className="underline">Match Up Stats</p>
          <p>{`Wins: ${commander ? wins : "N/A"}`}</p>
          <p>{`Losses: ${commander ? losses : "N/A"}`}</p>
          <p>{`Rate: ${
            commander
              ? ((wins / (wins + losses)) * 100).toFixed(2) + "%"
              : "N/A"
          }`}</p>
        </div>
      </div>
      <div className="m-5 border">
        <div className="flex flex-row justify-between m-2">
          <h4 className="text-2xl">Strategies</h4>
          <button
            className={`rounded-full pl-10 pr-10  ${
              isAddingStrategy
                ? "cursor-not-allowed bg-mist-300"
                : "cursor-pointer bg-mist-400 hover:bg-mist-300"
            }`}
            onClick={() => (commander ? setIsAddingStrategy(true) : {})}
            disabled={isAddingStrategy}
          >
            Add
          </button>
        </div>
        <div className="border m-2">
          {isAddingStrategy && commander ? (
            <StrategyInputForm
              player={commander}
              opponent={opponent ?? undefined}
              handleCancel={() => setIsAddingStrategy(false)}
            ></StrategyInputForm>
          ) : (
            ""
          )}
          {strategies.map((strat: Strategy) => (
            <StrategyRow key={strat.id} strategy={strat}></StrategyRow>
          ))}
        </div>
      </div>
    </div>
  );
}
