"use client";

import { Tables } from "@/database/database.types";
import { postgrestErrorToHttpStatus } from "@/database/utils";
import { createUserLevelClient } from "@/lib/supabase/client";
import { useState } from "react";

type Strategy = Tables<"strategies">;

// A strategy row plus its author's username, embedded via the author FK.
export type StrategyWithAuthor = Strategy & {
  author_profile: { username: string | null } | null;
};

interface StrategyRowProps {
  strategy: StrategyWithAuthor;
  isAdmin: boolean;
  currentProfileId: number | null;
  onEdit: (strategy: Strategy) => void;
  onDelete: (strategy: Strategy) => void;
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
  onEdit,
  onDelete,
}: StrategyRowProps) {
  const [rating, setRating] = useState<number>(strategy.rating ?? 0);
  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);

  // Author username arrives embedded with the strategy from the parent query
  const authorName = strategy.author_profile?.username ?? "";

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

  // Author (or an admin) may edit/delete this strategy
  const canModify =
    isAdmin ||
    (currentProfileId !== null && currentProfileId === strategy.author);

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
            {authorName !== "" ? (
              <em className="text-sm text-muted">{`- ${authorName}`}</em>
            ) : (
              ""
            )}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <div
              className={`flex items-center gap-0.5 transition-opacity duration-150 group-focus-within:opacity-100 pointer-coarse:opacity-100 ${
                confirmingDelete
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
              hidden={!canModify}
            >
              {confirmingDelete ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted">Delete?</span>
                  <button
                    aria-label="Confirm delete strategy"
                    className="cursor-pointer rounded-md px-1.5 py-0.5 text-xs font-semibold text-loss transition hover:bg-surface-raised"
                    onClick={() => onDelete(strategy)}
                  >
                    Yes
                  </button>
                  <button
                    aria-label="Cancel delete strategy"
                    className="cursor-pointer rounded-md px-1.5 py-0.5 text-xs font-semibold text-muted transition hover:bg-surface-raised"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    No
                  </button>
                </div>
              ) : (
                <>
                  <button
                    aria-label="Edit strategy"
                    className="cursor-pointer rounded-md p-1 text-muted transition hover:bg-surface-raised hover:text-accent"
                    onClick={() => onEdit(strategy)}
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
                    onClick={() => setConfirmingDelete(true)}
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
                </>
              )}
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
