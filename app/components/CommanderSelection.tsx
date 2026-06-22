"use client";

import { Tables } from "@/database/database.types";
import { createUserLevelClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";

type Commander = Tables<"commanders">;

interface CommanderSelectionProps {
  onClick: (c: Commander | null) => void;
}

const PORTRAIT_DIAMETER: number = 100;

export default function CommanderSelection({
  onClick,
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
    <div className="h-full w-fit flex flex-col justify-start overflow-y-auto">
      <button
        onClick={() => onClick(null)}
        className="rounded-full mt-2 bg-mist-300 hover:bg-mist-400 cursor-pointer"
      >
        Clear
      </button>
      {commanders.map((c: Commander) => (
        <Image
          key={c.slug}
          src={c.portrait_url ? c.portrait_url : ""}
          width={PORTRAIT_DIAMETER}
          height={PORTRAIT_DIAMETER}
          alt={`Portrait of ${c.display_name}`}
          className="rounded-full my-2"
          onClick={() => onClick(c)}
        />
      ))}
    </div>
  );
}
