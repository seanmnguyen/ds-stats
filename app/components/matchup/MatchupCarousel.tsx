"use client";

import { ReactNode, useCallback, useEffect } from "react";

interface MatchupCarouselProps {
  count: number;
  index: number;
  onIndexChange: (index: number) => void;
  children: ReactNode;
}

export default function MatchupCarousel({
  count,
  index,
  onIndexChange,
  children,
}: MatchupCarouselProps) {
  const go = useCallback(
    (delta: number) => {
      if (count <= 0) return;
      // Wrap around so navigation is continuous at both ends.
      onIndexChange((index + delta + count) % count);
    },
    [count, index, onIndexChange]
  );

  // Bind arrow keys globally so matchups can be flipped without focusing the
  // carousel first. Skip while typing in a field / using the Add dropdown.
  useEffect(() => {
    if (count <= 1) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.isContentEditable ||
          el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT")
      ) {
        return;
      }

      e.preventDefault();
      go(e.key === "ArrowLeft" ? -1 : 1);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go, count]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Pairwise matchups"
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      <div className="flex min-h-0 flex-1 items-stretch gap-2">
        <CarouselArrow
          direction="prev"
          disabled={count <= 1}
          onClick={() => go(-1)}
        />
        {/* Keying on index remounts the slide so it fades in on each change */}
        <div key={index} className="animate-fade-in min-h-0 flex-1">
          {children}
        </div>
        <CarouselArrow
          direction="next"
          disabled={count <= 1}
          onClick={() => go(1)}
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to matchup ${i + 1}`}
              aria-current={i === index}
              onClick={() => onIndexChange(i)}
              className={`h-2 w-2 rounded-full transition duration-150 ${
                i === index
                  ? "bg-accent"
                  : "cursor-pointer bg-border-strong hover:bg-faint"
              }`}
            />
          ))}
        </div>
        <span className="font-display text-xs font-bold uppercase tracking-widest tabular-nums text-muted">
          Matchup {index + 1} of {count}
        </span>
      </div>
    </div>
  );
}

function CarouselArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? "Previous matchup" : "Next matchup"}
      className="btn btn-ghost h-10 w-10 shrink-0 cursor-pointer self-center rounded-full p-0"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {isPrev ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}
