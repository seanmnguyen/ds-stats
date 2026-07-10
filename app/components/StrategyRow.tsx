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
    <div className="panel-inset flex flex-row gap-3 p-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-row flex-wrap items-baseline justify-between gap-x-3">
          <p className="min-w-0">
            <strong
              className={`font-semibold ${
                strategy?.title === null || strategy?.title === ""
                  ? "italic text-faint"
                  : ""
              }`}
            >
              {strategy?.title ?? "Untitled"}
            </strong>{" "}
            {author !== "" ? (
              <em className="text-sm text-muted">{`- ${author}`}</em>
            ) : (
              ""
            )}
          </p>
          {/* <p>Author: {strategy?.author}</p> */}
          {/* <p className="italic text-right">
            Created: {formatDate(strategy?.created_at)}
          </p> */}
          <p className="whitespace-nowrap text-xs italic text-faint">
            Last Modified: {formatDate(strategy?.last_edit)}
          </p>
        </div>
        <p className="max-h-24 overflow-y-auto pr-1 text-sm leading-relaxed text-muted">
          {strategy?.body}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-center justify-center">
        <button
          aria-label="Upvote"
          className="cursor-pointer rounded-md p-1 text-muted transition hover:bg-surface-raised hover:text-win"
          onClick={() => vote(true)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 10l5-5 5 5" />
          </svg>
        </button>
        <p className="min-w-6 text-center font-display text-sm font-bold tabular-nums">
          {rating}
        </p>
        <button
          aria-label="Downvote"
          className="cursor-pointer rounded-md p-1 text-muted transition hover:bg-surface-raised hover:text-loss"
          onClick={() => vote(false)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6l5 5 5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
