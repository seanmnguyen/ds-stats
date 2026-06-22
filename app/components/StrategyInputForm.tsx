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
}

export default function StrategyInputForm({
  player,
  opponent,
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
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setStrategyForm((currentForm) => ({
        ...currentForm,
        [field]: event.target.value,
      }));
    };
  }

  async function handleStrategySubmit(event: React.SubmitEvent) {
    event.preventDefault();

    const supabase = createUserLevelClient();
  }

  return (
    <form className="m-4" onSubmit={handleStrategySubmit}>
      <div className="flex flex-row">
        <p>{player.display_name}</p>
        <p className="mx-1"> vs </p>
        <select
          value={strategyForm.opponent ?? "defaultSelect"}
          onChange={(e) => handleFormChange("opponent")(e)}
          required
        >
          <option value="defaultSelect">Select Opponent</option>
          {commanderOptions.map((c: Commander) => (
            <option key={c.slug} value={c.slug}>
              {c.display_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="title" className="mr-1">
          Title <em>(optional)</em>
        </label>
        <input
          id="title"
          type="text"
          value={strategyForm.title}
          placeholder="Name your strategy!"
          onChange={handleFormChange("title")}
        />
      </div>
      <div>
        <label htmlFor="body" className="mr-1">
          Strategy
        </label>
        <input
          id="body"
          type="text"
          value={strategyForm.body}
          placeholder="Your genius plan..."
          onChange={handleFormChange("body")}
          required
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
