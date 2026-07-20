"use client";

import { Tables } from "@/database/database.types";
import Image from "next/image";

type Commander = Tables<"commanders">;

interface CommanderMatchupStatsProps {
  commander: Commander | null;
  wins: number;
  losses: number;
  portrait_size: number;
  reversed?: boolean;
}

export default function CommanderMatchupStats({
  commander,
  wins,
  losses,
  portrait_size,
  reversed,
}: CommanderMatchupStatsProps) {
  // Guard against divide-by-zero when a commander has no recorded games
  const totalGames = wins + losses;
  const winRate =
    commander && totalGames > 0 ? (wins / totalGames) * 100 : null;

  return (
    <div
      className={`flex items-center gap-6 ${
        reversed ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {commander?.portrait_url ? (
        <Image
          key={commander.slug}
          src={commander.portrait_url}
          width={portrait_size}
          height={portrait_size}
          alt={`Portrait of ${commander.display_name}`}
          className="w-2/5 max-w-[300px] rounded-2xl ring-1 ring-border"
        />
      ) : (
        <div className="flex aspect-square w-2/5 max-w-[300px] items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-inset">
          <span className="font-display text-5xl font-bold text-faint">?</span>
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
  );
}
