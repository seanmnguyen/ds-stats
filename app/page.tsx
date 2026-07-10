"use client";

import { Tables } from "@/database/database.types";
import CommanderSelection from "./components/CommanderSelection";
import { useState } from "react";
import CommanderStatsView from "./components/CommanderStatsView";

type Commander = Tables<"commanders">;

export default function Home() {
  const [leftCommander, setLeftCommander] = useState<Commander | null>(null);
  const [rightCommander, setRightCommander] = useState<Commander | null>(null);

  const handleLeftCommanderClick = (e: Commander | null) => {
    setLeftCommander(e);
  };

  const handleRightCommanderClick = (e: Commander | null) => {
    setRightCommander(e);
  };

  return (
    <main className="flex w-full flex-1 flex-col lg:h-[calc(100dvh-var(--nav-h))] lg:flex-none lg:flex-row">
      <section className="side-ally flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row">
        <CommanderSelection
          onClick={handleLeftCommanderClick}
          selected={leftCommander}
        ></CommanderSelection>
        <CommanderStatsView
          commander={leftCommander}
          opponent={rightCommander}
        ></CommanderStatsView>
      </section>

      {/* Divider: horizontal rule on small screens, vertical on large */}
      <div className="relative mx-4 flex items-center justify-center lg:mx-0 lg:my-6">
        <div
          aria-hidden
          className="absolute inset-x-0 top-1/2 h-px bg-border lg:inset-x-auto lg:inset-y-0 lg:left-1/2 lg:h-auto lg:w-px"
        />
        <span className="relative rounded-full border border-border-strong bg-surface px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-muted">
          vs
        </span>
      </div>

      <section className="side-enemy flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row-reverse">
        <CommanderSelection
          onClick={handleRightCommanderClick}
          selected={rightCommander}
        ></CommanderSelection>
        <CommanderStatsView
          commander={rightCommander}
          opponent={leftCommander}
          reversed={true}
        ></CommanderStatsView>
      </section>
    </main>
  );
}
