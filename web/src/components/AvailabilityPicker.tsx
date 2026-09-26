"use client";

import { useState, useTransition } from "react";
import { setAvailability } from "@/app/panel/partidos/actions";

type Status = "AVAILABLE" | "UNAVAILABLE" | null;

export function AvailabilityPicker({ fixtureId, initial, closed }: { fixtureId: string; initial: Status; closed: boolean }) {
  const [value, setValue] = useState<Status>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function choose(status: "AVAILABLE" | "UNAVAILABLE") {
    setError(null);
    setValue(status);
    startTransition(async () => {
      try {
        await setAvailability(fixtureId, status);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar.");
      }
    });
  }

  if (closed) {
    return <p className="text-sm text-white/40">El plazo para apuntarse a este partido ya ha cerrado.</p>;
  }

  return (
    <div>
      <div className="flex gap-3">
        <button
          disabled={isPending}
          onClick={() => choose("AVAILABLE")}
          className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
            value === "AVAILABLE" ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300" : "border-white/15 text-white/60 hover:text-white/90"
          }`}
        >
          Disponible
        </button>
        <button
          disabled={isPending}
          onClick={() => choose("UNAVAILABLE")}
          className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
            value === "UNAVAILABLE" ? "border-rose-500/50 bg-rose-500/20 text-rose-300" : "border-white/15 text-white/60 hover:text-white/90"
          }`}
        >
          No disponible
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </div>
  );
}
