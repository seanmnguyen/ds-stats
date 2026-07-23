"use client";

import { Tables, TablesInsert } from "@/database/database.types";
import { errorToUserMessage, postgrestErrorToHttpStatus } from "@/database/utils";
import { createUserLevelClient } from "@/lib/supabase/client";
import { ChangeEvent, useEffect, useState } from "react";
import { useToast } from "./Toast";

type Commander = Tables<"commanders">;
type Strategy = Tables<"strategies">;

type StrategyFormState = {
  title: string;
  body: string;
  opponent: string;
};

interface StrategyInputFormProps {
  player: Commander;
  opponent?: Commander;
  mode: InputMode;
  strategy?: Strategy;
  onSuccess: (strategy: Strategy) => void | Promise<void>;
  onClose: () => void;
}

export enum InputMode {
  ADD = "add",
  EDIT = "edit",
}

export default function StrategyInputForm({
  player,
  opponent,
  mode,
  strategy,
  onSuccess,
  onClose,
}: StrategyInputFormProps) {
  const [commanderOptions, setComamnderOptions] = useState<Commander[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [strategyForm, setStrategyForm] = useState<StrategyFormState>(
    createStartingStrategyForm()
  );
  const [formError, setFormError] = useState<string | null>(null);
  const toast = useToast();

  function createStartingStrategyForm() {
    return {
      title: strategy?.title ?? "",
      body: strategy?.body ?? "",
      opponent: opponent?.slug ?? strategy?.opponent ?? "",
    };
  }

  useEffect(() => {
    const supabase = createUserLevelClient();

    (async () => {
      const { data, error } = await supabase
        .from("commanders")
        .select("*")
        .order("slug", { ascending: true });

      if (data) {
        setComamnderOptions(data);
      } else {
        console.error(postgrestErrorToHttpStatus(error));
      }
    })();
  }, []);

  function handleFormChange(field: keyof StrategyFormState) {
    return (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setStrategyForm((currentForm) => ({
        ...currentForm,
        [field]: event.target.value,
      }));
    };
  }

  async function handleStrategyCreate(event: React.SubmitEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const supabase = createUserLevelClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("Error 401: Unauthorized");
      setFormError("You need to be signed in to add a strategy.");
      setIsSubmitting(false);
      return;
    }

    const { data: currentProfileId } = await supabase.rpc("current_profile_id");
    if (!currentProfileId) {
      console.error("Error 401: Unauthorized. Profile not found.");
      setFormError("You need to be signed in to add a strategy.");
      setIsSubmitting(false);
      return;
    }
    const newStrategy = {
      author: currentProfileId,
      player: player.slug,
      opponent: strategyForm.opponent,
      title: strategyForm.title,
      body: strategyForm.body,
    } as TablesInsert<"strategies">;
    const { data: created, error } = await supabase
      .from("strategies")
      .insert(newStrategy)
      .select()
      .single();

    if (error || !created) {
      console.error(postgrestErrorToHttpStatus(error), error);
      setFormError(errorToUserMessage(error));
      setIsSubmitting(false);
      return;
    }

    toast.success("Strategy added.");
    await onSuccess(created);
    onClose();
  }

  async function handleStrategyUpdate(event: React.SubmitEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (!strategy) {
      setIsSubmitting(false);
      return;
    }

    const supabase = createUserLevelClient();

    const { data: updated, error } = await supabase
      .from("strategies")
      .update({ title: strategyForm.title, body: strategyForm.body })
      .eq("id", strategy.id)
      .select()
      .single();

    if (error || !updated) {
      console.error(
        `Error updating strategy ${strategy.id} ${strategy.title}:`,
        postgrestErrorToHttpStatus(error),
        error
      );
      setFormError(errorToUserMessage(error));
      setIsSubmitting(false);
      return;
    }

    toast.success("Strategy updated.");
    await onSuccess(updated);
    onClose();
  }

  // Opponent display name is derived from the loaded commanders using the slug.
  const editOpponentName =
    commanderOptions.find((c) => c.slug === strategy?.opponent)?.display_name ??
    "";

  return (
    <form
      className="panel-inset flex flex-col gap-3 border-accent-deep p-4"
      onSubmit={
        mode === InputMode.ADD ? handleStrategyCreate : handleStrategyUpdate
      }
    >
      <div className="flex flex-row items-center justify-center gap-2 text-center">
        <p className="font-display font-semibold uppercase tracking-wide">
          {player.display_name}
        </p>
        <p className="font-display uppercase text-faint">vs</p>
        {mode === InputMode.ADD ? (
          <select
            value={strategyForm.opponent}
            onChange={(e) => handleFormChange("opponent")(e)}
            required
            className="field w-auto py-1"
          >
            <option value="">Opponent</option>
            {commanderOptions.map((c: Commander) => (
              <option key={c.slug} value={c.slug}>
                {c.display_name}
              </option>
            ))}
          </select>
        ) : (
          <p className="font-display font-semibold uppercase tracking-wide">
            {opponent?.display_name ?? editOpponentName}
          </p>
        )}
      </div>
      {formError && (
        <p role="alert" className="text-sm text-loss">
          {formError}
        </p>
      )}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-3">
        <label
          htmlFor="title"
          className="text-right text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={strategyForm.title}
          placeholder="(Optional) Name your strategy!"
          onChange={handleFormChange("title")}
          className="field"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          Submit
        </button>
        <label
          htmlFor="body"
          className="self-start pt-2 text-right text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Strategy
        </label>
        <textarea
          id="body"
          rows={3}
          value={strategyForm.body}
          placeholder="Your genius plan..."
          onChange={handleFormChange("body")}
          className="field resize-y"
          required
        />
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost self-start"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
