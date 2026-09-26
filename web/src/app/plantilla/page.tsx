import type { Metadata } from "next";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { PlayerCard } from "@/components/PlayerCard";
import { getPlayersRanked, getTeamWithPlayers } from "@/lib/data";

export const metadata: Metadata = { title: "Plantilla · Invictus Padel Club" };
export const dynamic = "force-dynamic";

export default async function PlantillaPage() {
  const [players, team] = await Promise.all([getPlayersRanked(), getTeamWithPlayers()]);

  const reves = players.filter((p) => p.position === "REVES");
  const derecha = players.filter((p) => p.position === "DERECHA");
  const sinPosicion = players.filter((p) => !p.position);

  return (
    <div className="bg-ink-950 pb-28 pt-40">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-400">
            {team?.name} · {team?.season}
          </p>
          <h1 className="font-display text-5xl font-bold text-white sm:text-6xl">Plantilla</h1>
          <p className="mt-4 max-w-xl text-white/55">
            {players.length} jugadores registrados esta temporada, repartidos entre revés y derecha.
          </p>
        </Reveal>

        {reves.length > 0 && (
          <section className="mt-16">
            <Reveal>
              <h2 className="font-display text-2xl text-gold-100">Revés</h2>
            </Reveal>
            <RevealGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {reves.map((p) => (
                <RevealItem key={p.id}>
                  <PlayerCard name={p.fullName} position={p.position} age={p.age} played={p.matchesPlayed} won={p.matchesWon} rate={p.rate} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        )}

        {derecha.length > 0 && (
          <section className="mt-16">
            <Reveal>
              <h2 className="font-display text-2xl text-gold-100">Derecha</h2>
            </Reveal>
            <RevealGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {derecha.map((p) => (
                <RevealItem key={p.id}>
                  <PlayerCard name={p.fullName} position={p.position} age={p.age} played={p.matchesPlayed} won={p.matchesWon} rate={p.rate} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        )}

        {sinPosicion.length > 0 && (
          <section className="mt-16">
            <Reveal>
              <h2 className="font-display text-2xl text-gold-100">Otros jugadores</h2>
            </Reveal>
            <RevealGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {sinPosicion.map((p) => (
                <RevealItem key={p.id}>
                  <PlayerCard name={p.fullName} position={p.position} age={p.age} played={p.matchesPlayed} won={p.matchesWon} rate={p.rate} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        )}
      </div>
    </div>
  );
}
