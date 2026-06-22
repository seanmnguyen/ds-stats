"use client";

import { Tables } from "@/database/database.types";
import { ChangeEvent, useState } from "react";

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

function createBlankStrategyForm() {
  return {
    title: "",
    body: "",
    opponent: "",
  };
}

export default function StrategyInputForm({
  player,
  opponent,
}: StrategyInputFormProps) {
  const [strategyForm, setStrategyForm] = useState<StrategyFormState>(
    createBlankStrategyForm()
  );

  function handleFormChange(field: keyof StrategyFormState) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setStrategyForm((currentForm) => ({
        ...currentForm,
        [field]: event.target.value,
      }));
    };
  }
  return (
    <form>
      <div>
        <p>{player.display_name}</p>
        {" vs "}
        <p>{opponent?.display_name}</p>
      </div>
      <div>
        <label htmlFor="title">
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
        <label htmlFor="body">Strategy</label>
        <input
          id="body"
          type="text"
          value={strategyForm.body}
          placeholder="Your genius plan..."
          onChange={handleFormChange("body")}
        />
      </div>
    </form>
  );
}
