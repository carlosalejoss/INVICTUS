"use client";

import { useTransition } from "react";
import { togglePlayerActive } from "./actions";

export function ToggleActiveButton({ userId, active }: { userId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (active && !confirm("¿Dar de baja a este jugador? Sus estadísticas históricas se conservan.")) return;
        startTransition(() => togglePlayerActive(userId, !active));
      }}
      className="text-xs text-white/50 hover:text-rose-300 disabled:opacity-50"
    >
      {active ? "Dar de baja" : "Reactivar"}
    </button>
  );
}
