"use client";

import { useState, useTransition } from "react";
import { setPairResult } from "@/app/panel/partidos/actions";

type Result = "WON" | "LOST" | "PENDING";

const OPTIONS: { value: Result; label: string; activeClass: string }[] = [
  { value: "WON", label: "Ganado", activeClass: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300" },
  { value: "LOST", label: "Perdido", activeClass: "bg-rose-500/20 border-rose-500/50 text-rose-300" },
  { value: "PENDING", label: "Pendiente", activeClass: "bg-white/10 border-white/30 text-white/70" },
];

export function ResultPicker({ pairId, initial }: { pairId: string; initial: Result }) {
  const [value, setValue] = useState<Result>(initial);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          disabled={isPending}
          onClick={() => {
            setValue(o.value);
            startTransition(() => setPairResult(pairId, o.value));
          }}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
            value === o.value ? o.activeClass : "border-white/10 text-white/40 hover:text-white/70"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
