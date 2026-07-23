"use client";

import { Tables } from "@/database/database.types";
import { createUserLevelClient } from "@/lib/supabase/client";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";

type Commander = Tables<"commanders">;

interface MatchupCommanderSelectionProps {
  selected: Commander[];
  activeIndex: number;
  onAdd: (c: Commander) => void;
  onClear: () => void;
  onRemove: (index: number) => void;
  onChangeAt: (index: number, c: Commander) => void;
  onSelectIndex: (index: number) => void;
}

const PORTRAIT_SIZE: number = 100;

export default function MatchupCommanderSelection({
  selected,
  activeIndex,
  onAdd,
  onClear,
  onRemove,
  onChangeAt,
  onSelectIndex,
}: MatchupCommanderSelectionProps) {
  const [commanderOptions, setComamnderOptions] = useState<Commander[]>([]);

  // Load all commanders for selection
  useEffect(() => {
    const supabase = createUserLevelClient();

    (async () => {
      const { data } = await supabase
        .from("commanders")
        .select("*")
        .order("slug", { ascending: true });

      if (data) {
        setComamnderOptions(data);
      }
    })();
  }, []);

  function handleAdd(event: ChangeEvent<HTMLSelectElement>): void {
    const newCommander =
      commanderOptions.find((c) => c.slug === event.target.value) ?? null;

    if (!newCommander) return;

    onAdd(newCommander);
  }

  return (
    <div className="-m-1.5 flex shrink-0 gap-3 p-1.5 max-lg:overflow-x-auto lg:w-fit lg:flex-col lg:items-center lg:self-center lg:overflow-y-auto">
      {selected.map((c: Commander, i) => (
        <button
          key={`${c.slug}_${i}`}
          type="button"
          // Jump the carousel to the matchup this selection belongs to
          onClick={() => onSelectIndex(i)}
          title={c.display_name}
          className={`shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 transition duration-150 hover:shadow-glow-sm hover:ring-[var(--side)] ${
            i === activeIndex
              ? "shadow-glow-sm ring-[var(--side)]"
              : "ring-border"
          }`}
        >
          <Image
            src={c.portrait_url ?? ""}
            width={PORTRAIT_SIZE}
            height={PORTRAIT_SIZE}
            alt={`Portrait of ${c.display_name}`}
            className="block"
          />
        </button>
      ))}
      <div className="flex shrink-0 flex-wrap justify-center gap-2">
        <select value="" onChange={handleAdd} className="field w-18 py-1">
          <option value="" disabled>
            Add
          </option>
          {commanderOptions.map((c: Commander) => (
            <option key={c.slug} value={c.slug}>
              {c.display_name}
            </option>
          ))}
        </select>
        <button className="btn" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
}
