"use client";

import { motion } from "framer-motion";

export function PlayerCard({
  name,
  position,
  age,
  played,
  won,
  rate,
}: {
  name: string;
  position?: string | null;
  age?: number | null;
  played: number;
  won: number;
  rate: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="card-surface group relative overflow-hidden rounded-2xl p-6"
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-500/10 blur-2xl transition-all duration-500 group-hover:bg-gold-500/20" />

      <div className="relative flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-ink-800 font-display text-lg text-gold-200">
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">{name}</h3>
          <p className="text-xs uppercase tracking-wide text-white/40">
            {position === "REVES" ? "Revés" : position === "DERECHA" ? "Derecha" : "—"}
            {age ? ` · ${age} años` : ""}
          </p>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="font-display text-xl text-gold-100">{played}</p>
          <p className="text-[10px] uppercase tracking-wide text-white/40">Jugados</p>
        </div>
        <div>
          <p className="font-display text-xl text-gold-100">{won}</p>
          <p className="text-[10px] uppercase tracking-wide text-white/40">Ganados</p>
        </div>
        <div>
          <p className="font-display text-xl text-gold-100">{rate}%</p>
          <p className="text-[10px] uppercase tracking-wide text-white/40">% Éxito</p>
        </div>
      </div>
    </motion.div>
  );
}
