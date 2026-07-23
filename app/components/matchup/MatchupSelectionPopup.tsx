"use client";

import { Tables } from "@/database/database.types";
import { ChangeEvent } from "react";

type Commander = Tables<"commanders">;

interface MatchupSelectionPopupProps {
  selected: Commander;
  selectionIndex: number;
  commanderOptions: Commander[];
  onRemove: (index: number) => void;
  onChangeAt: (index: number, newCommander: Commander) => void;
}

export default function MatchupSelectionPopup({
  selected,
  selectionIndex,
  commanderOptions,
  onRemove,
  onChangeAt,
}: MatchupSelectionPopupProps) {
  function handleCommanderChange(event: ChangeEvent<HTMLSelectElement>) {
    const newCommander = commanderOptions.find(
      (c: Commander) => c.slug === event.target.value
    );

    if (!newCommander) {
      console.error(
        `Cannot find commander ${event.target.value} to replace ${selected.slug}`
      );
      return;
    }

    onChangeAt(selectionIndex, newCommander);
  }

  return (
    <div className="flex flex-col gap-2">
      <select
        value={selected.slug}
        onChange={handleCommanderChange}
        className="field w-full py-1"
      >
        {commanderOptions.map((c: Commander) => (
          <option key={c.slug} value={c.slug}>
            {c.display_name}
          </option>
        ))}
      </select>
      <button className="btn" onClick={() => onRemove(selectionIndex)}>
        Remove
      </button>
    </div>
  );
}
