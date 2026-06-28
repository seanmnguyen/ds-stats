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
    <div>
      <main>
        <div className="flex flex-row w-dvw justify-between">
          <div className="flex flex-1/2 flex-row h-dvh max-h-dvh bg-white text-black">
            <CommanderSelection
              onClick={handleLeftCommanderClick}
            ></CommanderSelection>
            <CommanderStatsView
              commander={leftCommander}
              opponent={rightCommander}
            ></CommanderStatsView>
          </div>
          <div className="flex flex-1/2 flex-row-reverse h-dvh max-h-dvh bg-white text-black">
            <CommanderSelection
              onClick={handleRightCommanderClick}
            ></CommanderSelection>
            <CommanderStatsView
              commander={rightCommander}
              opponent={leftCommander}
              reversed={true}
            ></CommanderStatsView>
          </div>
        </div>
      </main>
    </div>
  );
}
