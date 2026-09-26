"use client";

import { useTransition } from "react";
import { toggleSponsor, deleteSponsor } from "./actions";

export function SponsorRow({ id, name, logoUrl, active }: { id: string; name: string; logoUrl: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`card-surface flex items-center justify-between rounded-xl p-4 ${!active ? "opacity-40" : ""}`}>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={name} className="h-8 w-auto max-w-[100px] object-contain" />
        <span className="text-sm text-white/80">{name}</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <button disabled={isPending} onClick={() => startTransition(() => toggleSponsor(id, !active))} className="text-white/50 hover:text-gold-300">
          {active ? "Ocultar" : "Mostrar"}
        </button>
        <button
          disabled={isPending}
          onClick={() => {
            if (confirm("¿Eliminar este patrocinador?")) startTransition(() => deleteSponsor(id));
          }}
          className="text-white/50 hover:text-rose-300"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
