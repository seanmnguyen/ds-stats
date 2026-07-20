"use client";

import { useEffect, useState } from "react";
import StrategyInputForm, { InputMode } from "./StrategyInputForm";
import StrategyRow, { StrategyWithAuthor } from "./StrategyRow";
import { createUserLevelClient } from "@/lib/supabase/client";
import { Tables } from "@/database/database.types";
import { postgrestErrorToHttpStatus } from "@/database/utils";

type Commander = Tables<"commanders">;
type Strategy = Tables<"strategies">;

interface StrategyViewProps {
  commander: Commander | null;
  opponent?: Commander | null;
}

export function fetchAllStrategies(
  player: Commander
): Promise<StrategyWithAuthor[]> {
  const supabase = createUserLevelClient();
  return (async () => {
    const { data } = await supabase
      .from("strategies")
      .select(
        "*, author_profile:public_profiles!strategies_author_fkey(username)"
      )
      .eq("player", player.slug)
      .order("rating", { ascending: false });

    return data ? data : [];
  })();
}

export function fetchStrategy(
  player: Commander,
  opponent: Commander
): Promise<StrategyWithAuthor[]> {
  const supabase = createUserLevelClient();
  return (async () => {
    const { data } = await supabase
      .from("strategies")
      .select(
        "*, author_profile:public_profiles!strategies_author_fkey(username)"
      )
      .eq("player", player.slug)
      .eq("opponent", opponent.slug)
      .order("rating", { ascending: false });

    return data ? data : [];
  })();
}

export default function StrategyView({
  commander,
  opponent,
}: StrategyViewProps) {
  const [strategies, setStrategies] = useState<StrategyWithAuthor[]>([]);
  const [isAddingStrategy, setIsAddingStrategy] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);

  async function refreshStrategies() {
    if (!commander) return;
    const fetched = opponent
      ? // Get the strategies for just this matchup
        await fetchStrategy(commander, opponent)
      : // Get the strategies for all matchups with this commander
        await fetchAllStrategies(commander);
    setStrategies(fetched);
  }

  // Auth check
  useEffect(() => {
    const supabase = createUserLevelClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
      }
    })();
  }, []);

  // Fetch strategies
  useEffect(() => {
    (async () => {
      if (!commander) return;
      const fetched = opponent
        ? // Get the strategies for just this matchup
          await fetchStrategy(commander, opponent)
        : // Get the strategies for all matchups with this commander
          await fetchAllStrategies(commander);
      setStrategies(fetched);
    })();
  }, [commander, opponent]);

  // Replace a single strategy in place after an edit. The update returns a plain
  // row (no embedded author), so merge it over the existing one to keep the author.
  function patchStrategy(updated: Strategy) {
    setStrategies((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    );
  }

  async function deleteStrategy(strategy: Strategy) {
    const supabase = createUserLevelClient();

    const { error } = await supabase
      .from("strategies")
      .delete()
      .eq("id", strategy.id);

    if (error) {
      console.error(
        `Error deleting strategy ${strategy.id} ${
          strategy.title
        }: ${postgrestErrorToHttpStatus(error)}, ${error}`
      );
      return;
    }

    // Remove this strategy from the displayed list
    setStrategies((prev) => prev.filter((s) => s.id !== strategy.id));
  }

  // Determine current profile id and admin status
  useEffect(() => {
    const supabase = createUserLevelClient();

    (async () => {
      const { data: currentProfileId } = await supabase.rpc(
        "current_profile_id"
      );
      const { data: isAdmin } = await supabase.rpc("is_admin");
      setCurrentProfileId(currentProfileId);
      setIsAdmin(Boolean(isAdmin));
    })();
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 border-t border-border pt-4">
      <div className="flex flex-row items-center justify-between">
        <h4 className="font-display text-lg font-bold uppercase tracking-wide">
          Strategies
        </h4>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddingStrategy(true)}
          disabled={!isAuthenticated || isAddingStrategy || !commander}
        >
          Add
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {isAddingStrategy && commander ? (
          <StrategyInputForm
            player={commander}
            opponent={opponent ?? undefined}
            mode={InputMode.ADD}
            onSuccess={refreshStrategies}
            onClose={() => setIsAddingStrategy(false)}
          ></StrategyInputForm>
        ) : (
          ""
        )}
        {!commander ? (
          <p className="py-6 text-center text-sm text-faint">
            Select a commander to view strategies.
          </p>
        ) : strategies.length === 0 && !isAddingStrategy ? (
          <p className="py-6 text-center text-sm text-faint">
            No strategies yet.
          </p>
        ) : null}
        {commander &&
          strategies.map((strat) =>
            editingStrategy?.id === strat.id ? (
              <StrategyInputForm
                key={strat.id}
                player={commander}
                opponent={opponent ?? undefined}
                mode={InputMode.EDIT}
                strategy={strat}
                onSuccess={patchStrategy}
                onClose={() => setEditingStrategy(null)}
              ></StrategyInputForm>
            ) : (
              <StrategyRow
                key={strat.id}
                strategy={strat}
                isAdmin={isAdmin}
                currentProfileId={currentProfileId}
                onEdit={(s) => setEditingStrategy(s)}
                onDelete={(s) => deleteStrategy(s)}
              ></StrategyRow>
            )
          )}
      </div>
    </div>
  );
}
