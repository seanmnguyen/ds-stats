"use client";

import { Tables } from "@/database/database.types";
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
  handleCancel: () => void;
}

export default function StrategyInputForm({
  player,
  opponent,
  handleCancel,
}: StrategyInputFormProps) {
  const [commanderOptions, setComamnderOptions] = useState<Commander[]>([]);
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

    const supabase = createUserLevelClient();

    console.log("FORM DATA", strategyForm);
  }

  return (
    <form className="m-4" onSubmit={handleStrategySubmit}>
      <div className="flex flex-row text-center justify-center font-bold">
        <p>{player.display_name}</p>
        <p className="mx-2"> vs </p>
        <select
          value={strategyForm.opponent ?? "defaultSelect"}
          onChange={(e) => handleFormChange("opponent")(e)}
          required
        >
          <option value="defaultSelect">Opponent</option>
          {commanderOptions.map((c: Commander) => (
            <option key={c.slug} value={c.slug}>
              {c.display_name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-x-2 gap-y-2 items-center">
        <label htmlFor="title" className="mr-1 text-right">
          Title:
        </label>
        <input
          id="title"
          type="text"
          value={strategyForm.title}
          placeholder="(Optional) Name your strategy!"
          onChange={handleFormChange("title")}
          className="w-full pl-1"
        />
        <button
          type="submit"
          className="rounded-full px-3 ml-2 hover:bg-mist-400 bg-mist-300 cursor-pointer"
        >
          Submit
        </button>
        <label htmlFor="body" className="mr-1 text-right self-start">
          Strategy:
        </label>
        <textarea
          id="body"
          value={strategyForm.body}
          placeholder="Your genius plan..."
          onChange={handleFormChange("body")}
          className="w-full pl-1"
          required
        />
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-full px-3 ml-2 hover:bg-mist-400 bg-mist-300 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
