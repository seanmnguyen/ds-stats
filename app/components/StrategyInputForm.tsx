"use client";

import { Tables, TablesInsert } from "@/database/database.types";
import { postgrestErrorToHttpStatus } from "@/database/utils";
import { createUserLevelClient } from "@/lib/supabase/client";
import { ChangeEvent, useEffect, useState } from "react";

type Commander = Tables<"commanders">;

type StrategyFormState = {
  title: string;
  body: string;
  opponent: string;
};

interface StrategyInputFormProps {
  player: Commander;
  opponent?: Commander;
  onSuccess: () => Promise<void>;
  onClose: () => void;
}

export default function StrategyInputForm({
  player,
  opponent,
  onSuccess,
  onClose,
}: StrategyInputFormProps) {
  const [commanderOptions, setComamnderOptions] = useState<Commander[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [strategyForm, setStrategyForm] = useState<StrategyFormState>(
    createBlankStrategyForm()
  );

  function createBlankStrategyForm() {
    return {
      title: "",
      body: "",
      opponent: opponent?.slug ?? "",
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

  async function handleStrategySubmit(event: React.SubmitEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const supabase = createUserLevelClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("Error 401: Unauthorized");
      return;
    }

    const { data: currentProfileId } = await supabase.rpc("current_profile_id");
    if (!currentProfileId) {
      console.error("Error 401: Unauthorized. Profile not found.");
      return;
    }
    const newStrategy = {
      author: currentProfileId,
      player: player.slug,
      opponent: strategyForm.opponent,
      title: strategyForm.title,
      body: strategyForm.body,
    } as TablesInsert<"strategies">;
    const { error } = await supabase.from("strategies").insert(newStrategy);

    if (error) {
      console.error(postgrestErrorToHttpStatus(error), error);
      return;
    }

    await onSuccess();
    onClose();
  }

  return (
    <form
      className="panel-inset flex flex-col gap-3 border-accent-deep p-4"
      onSubmit={handleStrategySubmit}
    >
      <div className="flex flex-row items-center justify-center gap-2 text-center">
        <p className="font-display font-semibold uppercase tracking-wide">
          {player.display_name}
        </p>
        <p className="font-display uppercase text-faint">vs</p>
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
      </div>
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
