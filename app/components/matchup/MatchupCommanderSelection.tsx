"use client";

import { Tables } from "@/database/database.types";
import { createUserLevelClient } from "@/lib/supabase/client";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import MatchupSelectionPopup from "./MatchupSelectionPopup";

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
const POPUP_WIDTH: number = 224; // px, matches w-56 below

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);

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

  // Position and open the edit popover once an editing target is set. Runs after
  // render so the popover content exists before it is shown (no empty flash).
  useEffect(() => {
    if (editingIndex === null) return;
    const popover = popoverRef.current;
    const anchor = anchorRef.current;
    if (!popover || !anchor) return;

    const rect = anchor.getBoundingClientRect();
    const left = Math.max(
      8,
      Math.min(rect.left, window.innerWidth - POPUP_WIDTH - 8)
    );
    popover.style.left = `${left}px`;
    popover.style.top = `${rect.bottom + 6}px`;

    // Already-open popovers throw on showPopover(); just reposition instead.
    if (!popover.matches(":popover-open")) {
      popover.showPopover();
    }
  }, [editingIndex]);

  function handleAdd(event: ChangeEvent<HTMLSelectElement>): void {
    const newCommander =
      commanderOptions.find((c) => c.slug === event.target.value) ?? null;

    if (!newCommander) return;

    onAdd(newCommander);
  }

  function openEditPopup(index: number, trigger: HTMLElement) {
    anchorRef.current = trigger;
    setEditingIndex(index);
  }

  function closeEditPopup() {
    setEditingIndex(null);
    popoverRef.current?.hidePopover();
  }

  const editingCommander =
    editingIndex !== null ? selected[editingIndex] ?? null : null;

  return (
    <div className="-m-1.5 flex shrink-0 gap-3 p-1.5 max-lg:overflow-x-auto lg:w-fit lg:flex-col lg:items-center lg:self-center lg:overflow-y-auto">
      {selected.map((c: Commander, i) => (
        <div key={`${c.slug}_${i}`} className="group relative shrink-0">
          <button
            type="button"
            // Jump the carousel to the matchup this selection belongs to
            onClick={(e) => {
              onSelectIndex(i);
              if (e.detail > 0) e.currentTarget.blur();
            }}
            title={c.display_name}
            className={`block cursor-pointer overflow-hidden rounded-xl ring-1 transition duration-150 hover:shadow-glow-sm hover:ring-[var(--side)] ${
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
          <button
            type="button"
            aria-label={`Edit ${c.display_name}`}
            onClick={(e) => openEditPopup(i, e.currentTarget)}
            className="absolute right-1 top-1 cursor-pointer rounded-md bg-surface p-1 text-muted opacity-0 ring-1 ring-border transition hover:text-accent group-hover:opacity-100 pointer-coarse:opacity-100"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M11 3l2 2-8 8-3 1 1-3 8-8z" />
            </svg>
          </button>
        </div>
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

      <div
        ref={popoverRef}
        popover="auto"
        onToggle={(e) => {
          if (!e.currentTarget.matches(":popover-open")) {
            setEditingIndex(null);
          }
        }}
        className="fixed inset-auto m-0 w-56 panel-inset p-3 shadow-glow-sm"
      >
        {editingCommander && editingIndex !== null && (
          <MatchupSelectionPopup
            selected={editingCommander}
            selectionIndex={editingIndex}
            commanderOptions={commanderOptions}
            onRemove={(index) => {
              onRemove(index);
              closeEditPopup();
            }}
            onChangeAt={onChangeAt}
          />
        )}
      </div>
    </div>
  );
}
