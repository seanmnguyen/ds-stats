"use client";

import { Tables } from "@/database/database.types";
import { postgrestErrorToHttpStatus } from "@/database/utils";
import { createUserLevelClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Strategy = Tables<"strategies">;

interface StrategyRowProps {
  strategy: Strategy;
  isAdmin: boolean;
  currentProfileId: number | null;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function StrategyRow({
  strategy,
  isAdmin,
  currentProfileId,
}: StrategyRowProps) {
  const [author, setAuthor] = useState<string>("");
  const [rating, setRating] = useState<number>(strategy.rating ?? 0);

  // Load the username
  useEffect(() => {
    const authorId = strategy.author;
    if (!authorId) return;

    const supabase = createUserLevelClient();

    (async () => {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("username")
        .eq("id", authorId)
        .maybeSingle();

      if (error) {
        console.error(error);
        console.error(postgrestErrorToHttpStatus(error));
        return;
      } else {
        setAuthor(data?.username ?? "");
      }
    })();
  }, [strategy.author]);
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
    <div className="group panel-inset flex flex-row gap-3 p-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-row flex-wrap items-center justify-between gap-x-3">
          <p className="min-w-0">
            <strong
              className={`font-semibold ${
                strategy.title === null || strategy.title === ""
                  ? "italic text-faint"
                  : ""
              }`}
            >
              {strategy.title !== null && strategy.title !== ""
                ? strategy.title
                : "Untitled"}
            </strong>{" "}
            {author !== "" ? (
              <em className="text-sm text-muted">{`- ${author}`}</em>
            ) : (
              ""
            )}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <div
              className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100"
              hidden={
                !(
                  isAdmin ||
                  (currentProfileId && currentProfileId === strategy.author)
                )
              }
            >
              <button
                aria-label="Edit strategy"
                className="cursor-pointer rounded-md p-1 text-muted transition hover:bg-surface-raised hover:text-accent"
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
                  <path d="M11 3l2 2-8 8-3 1 1-3 8-8z" />
                </svg>
              </button>
              <button
                aria-label="Delete strategy"
                className="cursor-pointer rounded-md p-1 text-muted transition hover:bg-surface-raised hover:text-loss"
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
                  <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.8 9.5h6.4L12 4" />
                </svg>
              </button>
            </div>
            <p className="whitespace-nowrap text-xs italic text-faint">
              Last Modified: {formatDate(strategy.last_edit)}
            </p>
          </div>
        </div>
        <p className="max-h-24 overflow-y-auto pr-1 text-sm leading-relaxed text-muted">
          {strategy.body}
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
