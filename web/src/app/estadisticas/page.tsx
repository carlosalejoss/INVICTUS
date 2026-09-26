import type { Metadata } from "next";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { Counter } from "@/components/Counter";
import { StatBar } from "@/components/StatBar";
import { getPlayersRanked, getTeamSummary } from "@/lib/data";

export const metadata: Metadata = { title: "Estadísticas · Invictus Padel Club" };
export const dynamic = "force-dynamic";

export default async function EstadisticasPage() {
  const [players, summary] = await Promise.all([getPlayersRanked(), getTeamSummary()]);
  const active = players.filter((p) => p.matchesPlayed > 0).sort((a, b) => b.rate - a.rate || b.matchesPlayed - a.matchesPlayed);
  const mostPlayed = [...players].sort((a, b) => b.matchesPlayed - a.matchesPlayed).slice(0, 8);

  const teamRate = summary.totalMatchesPlayed > 0 ? Math.round((summary.totalMatchesWon / summary.totalMatchesPlayed) * 100) : 0;

  return (
    <div className="bg-ink-950 pb-28 pt-40">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-400">Temporada 2025/2026</p>
          <h1 className="font-display text-5xl font-bold text-white sm:text-6xl">Estadísticas</h1>
          <p className="mt-4 max-w-xl text-white/55">
            Rendimiento individual y colectivo a partir de los partidos disputados esta temporada.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4" stagger={0.08}>
          {[
            { value: summary.totalMatchesPlayed, label: "Partidos jugados" },
            { value: summary.totalMatchesWon, label: "Partidos ganados" },
            { value: teamRate, suffix: "%", label: "% Victorias del equipo" },
            { value: summary.playersCount, label: "Jugadores" },
          ].map((s) => (
            <RevealItem key={s.label} className="card-surface rounded-2xl p-6 text-center">
              <p className="font-display text-4xl text-gold-100">
                <Counter value={s.value} suffix={s.suffix ?? ""} />
              </p>
              <p className="mt-2 text-xs uppercase tracking-wide text-white/40">{s.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <section className="mt-20 grid gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <h2 className="font-display text-2xl text-gold-100">% de victorias por jugador</h2>
              <p className="mt-2 text-sm text-white/40">Jugadores con al menos un partido disputado.</p>
            </Reveal>
            <RevealGroup className="mt-8 space-y-5">
              {active.map((p, i) => (
                <RevealItem key={p.id}>
                  <StatBar label={p.fullName} value={p.rate} delay={i * 0.03} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <div>
            <Reveal>
              <h2 className="font-display text-2xl text-gold-100">Partidos disputados</h2>
              <p className="mt-2 text-sm text-white/40">Jugadores más presentes esta temporada.</p>
            </Reveal>
            <RevealGroup className="mt-8 space-y-5">
              {mostPlayed.map((p, i) => (
                <RevealItem key={p.id}>
                  <StatBar
                    label={p.fullName}
                    value={summary.totalMatchesPlayed > 0 ? Math.round((p.matchesPlayed / mostPlayed[0].matchesPlayed) * 100) : 0}
                    sublabel={`${p.matchesPlayed} partidos`}
                    delay={i * 0.03}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      </div>
    </div>
  );
}
