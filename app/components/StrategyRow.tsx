"use client";

import { Tables } from "@/database/database.types";
import { postgrestErrorToHttpStatus } from "@/database/utils";
import { createUserLevelClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Strategy = Tables<"strategies">;

interface StrategyRowProps {
  strategy: Strategy;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function StrategyRow({ strategy }: StrategyRowProps) {
  const [author, setAuthor] = useState<string>("");
  const [rating, setRating] = useState<number>(strategy.rating ?? 0);

  useEffect(() => {
    if (
      strategy === null ||
      strategy === undefined ||
      strategy.author === null
    ) {
      return;
    }
    const supabase = createUserLevelClient();

    (async () => {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("username")
        .eq("id", strategy.author)
        .maybeSingle();

      if (error) {
        console.error(error);
        console.error(postgrestErrorToHttpStatus(error));
        return;
      } else {
        setAuthor(data?.username);
      }
    })();
  });
  /**
   * Votes on the rating. `isUpvote` of `true` gives an upvote; otherwise, downvote
   */
  function vote(isUpvote: boolean) {
    const supabase = createUserLevelClient();

    (async () => {
      const { error } = await supabase.rpc("vote", {
        strategy_id: strategy.id,
        is_upvote: isUpvote,
      });

      if (error) {
        console.error(postgrestErrorToHttpStatus(error));
        return;
      }

      const { data } = await supabase
        .from("strategies")
        .select("rating")
        .eq("id", strategy.id)
        .maybeSingle();

      if (data) {
        setRating(data.rating ?? 0);
      }
    })();
  }

  return (
    <div className="m-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-1/2 flex-row">
          <p className="">
            <strong
              className={`underline ${
                strategy?.title === null || strategy?.title === ""
                  ? "italic"
                  : ""
              }`}
            >
              {strategy?.title ?? "Untitled"}
            </strong>{" "}
            {author !== "" ? <em>{`- ${author}`}</em> : ""}
          </p>
          {/* <p>Author: {strategy?.author}</p> */}
        </div>
        <div className="flex flex-1/2 flex-col overflow-x-auto">
          {/* <p className="italic text-right">
            Created: {formatDate(strategy?.created_at)}
          </p> */}
          <p className="italic text-right whitespace-nowrap">
            Last Modified: {formatDate(strategy?.last_edit)}
          </p>
        </div>
      </div>
      <div className="flex flex-row">
        <p className="flex-9/10 bg-red-50 max-h-12   overflow-y-auto">
          {strategy?.body}
        </p>
        <div className="flex flex-1/10 flex-row justify-between ml-1">
          <button className="m-auto cursor-pointer" onClick={() => vote(true)}>
            ⬆️
          </button>
          <p className="mx-1 my-auto text-center align-middle">{rating}</p>
          <button className="m-auto cursor-pointer" onClick={() => vote(false)}>
            ⬇️
          </button>
        </div>
      </div>
    </div>
  );
}
