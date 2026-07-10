"use client";

import { Tables } from "@/database/database.types";
import { createUserLevelClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";

type Commander = Tables<"commanders">;

interface CommanderSelectionProps {
  onClick: (c: Commander | null) => void;
  selected?: Commander | null;
}

const PORTRAIT_SIZE: number = 100;

export default function CommanderSelection({
  onClick,
  selected,
}: CommanderSelectionProps) {
  const [commanders, setCommanders] = useState<Commander[]>([]);

  useEffect(() => {
    const supabase = createUserLevelClient();
    (async () => {
      const { data } = await supabase
        .from("commanders")
        .select("*")
        .order("slug", { ascending: true });

      if (data) {
        setCommanders(data);
      }
    })();
  }, []);

  return (
    // -m/p bleed: the scroll container clips at its padding box, so rings/glows need this room
    <div className="-m-1.5 flex shrink-0 gap-3 p-1.5 max-lg:overflow-x-auto lg:w-fit lg:flex-col lg:overflow-y-auto">
      <button onClick={() => onClick(null)} className="btn btn-ghost shrink-0">
        Clear
      </button>
      {commanders.map((c: Commander) => {
        const isSelected = selected?.slug === c.slug;
        return (
          <button
            key={c.slug}
            type="button"
            onClick={() => onClick(c)}
            aria-pressed={isSelected}
            title={c.display_name}
            className={`shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 transition duration-150 ${
              isSelected
                ? "shadow-glow ring-2 ring-[var(--side)]"
                : "ring-border hover:shadow-glow-sm hover:ring-[var(--side)]"
            }`}
          >
            <Image
              src={c.portrait_url ? c.portrait_url : ""}
              width={PORTRAIT_SIZE}
              height={PORTRAIT_SIZE}
              alt={`Portrait of ${c.display_name}`}
              className="block"
            />
          </button>
        );
      })}
    </div>
  );
}
