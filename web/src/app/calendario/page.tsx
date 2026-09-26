import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { FixtureCard } from "@/components/FixtureCard";
import { getFixtures, getTeamSummary } from "@/lib/data";

export const metadata: Metadata = { title: "Calendario · Invictus Padel Club" };
export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const [fixtures, summary] = await Promise.all([getFixtures(), getTeamSummary()]);

  return (
    <div className="bg-ink-950 pb-28 pt-40">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-400">Liga veteranos +45</p>
          <h1 className="font-display text-5xl font-bold text-white sm:text-6xl">Calendario</h1>
          <p className="mt-4 text-white/55">
            {summary.jornadasWon} ganadas · {summary.jornadasLost} perdidas · {summary.jornadasPending} pendientes de{" "}
            {summary.totalJornadas} jornadas.
          </p>
        </Reveal>

        <div className="mt-14 space-y-4">
          {fixtures.map((fx, i) => (
            <FixtureCard
              key={fx.id}
              id={fx.id}
              jornada={fx.jornada}
              opponent={fx.opponent}
              manualResult={fx.manualResult}
              note={fx.note}
              pairs={fx.pairs.map((p) => ({
                id: p.id,
                category: p.category,
                combinedAge: p.combinedAge,
                result: p.result,
                revesPlayer: p.revesPlayer ? { fullName: `${p.revesPlayer.nombre} ${p.revesPlayer.apellidos}`.trim() } : null,
                derechaPlayer: p.derechaPlayer ? { fullName: `${p.derechaPlayer.nombre} ${p.derechaPlayer.apellidos}`.trim() } : null,
              }))}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
