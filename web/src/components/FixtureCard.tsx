"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fixtureOutcome, type Outcome } from "@/lib/matches";

type Pair = {
  id: string;
  category: string;
  combinedAge: number | null;
  result: "WON" | "LOST" | "PENDING";
  revesPlayer: { fullName: string } | null;
  derechaPlayer: { fullName: string } | null;
};

const RESULT_STYLES: Record<Outcome, string> = {
  WON: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  LOST: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  PENDING: "bg-white/5 text-white/50 border-white/10",
};

const RESULT_LABEL: Record<Outcome, string> = {
  WON: "Ganado",
  LOST: "Perdido",
  PENDING: "Pendiente",
};

export function FixtureCard({
  id,
  jornada,
  opponent,
  pairs,
  manualResult,
  note,
  index,
}: {
  id: string;
  jornada: number;
  opponent: string | null;
  pairs: Pair[];
  manualResult?: Outcome | null;
  note?: string | null;
  index: number;
}) {
  const teamResult = fixtureOutcome({ manualResult: manualResult ?? null, pairs });

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="card-surface relative rounded-2xl p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/30 font-display text-sm text-gold-200">
            {jornada}
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/40">Jornada {jornada}</p>
            <p className="font-semibold text-white">vs {opponent ?? "Por confirmar"}</p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${RESULT_STYLES[teamResult]}`}>
          {RESULT_LABEL[teamResult]}
        </span>
      </div>

      {note && <p className="mt-3 text-xs italic text-white/40">{note}</p>}

      {pairs.length > 0 && (
        <div className="mt-4 grid gap-2 border-t border-white/5 pt-4 sm:grid-cols-3">
          {pairs.map((p) => (
            <div key={p.id} className="rounded-xl bg-white/[0.03] p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                {p.category}
                {p.combinedAge ? ` · Índice ${p.combinedAge}` : ""}
              </p>
              <p className="mt-1 truncate text-sm text-white/80">
                {p.revesPlayer?.fullName ?? "—"} <span className="text-white/30">/</span>{" "}
                {p.derechaPlayer?.fullName ?? "—"}
              </p>
              <span className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] ${RESULT_STYLES[p.result]}`}>
                {RESULT_LABEL[p.result]}
              </span>
            </div>
          ))}
        </div>
      )}

      {teamResult === "PENDING" && (
        <Link
          href={`/partidos/${id}`}
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-gold-300 hover:text-gold-200"
        >
          Ver partido y apuntarme
          <span aria-hidden>→</span>
        </Link>
      )}
    </motion.div>
  );
}
