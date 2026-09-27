import type { Metadata } from "next";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { PlayerCard } from "@/components/PlayerCard";
import { TeamFilter } from "@/components/TeamFilter";
import { getPlayersRanked, getTeamByName, getTeams, DEFAULT_TEAM_NAME } from "@/lib/data";

export const metadata: Metadata = { title: "Plantilla · Invictus Padel Club" };
export const dynamic = "force-dynamic";

export default async function PlantillaPage({ searchParams }: { searchParams: { equipo?: string } }) {
  const allTeams = await getTeams();
  const requested = searchParams.equipo;
  const teamName = requested && allTeams.some((t) => t.name === requested) ? requested : DEFAULT_TEAM_NAME;

  const [players, team] = await Promise.all([getPlayersRanked(teamName), getTeamByName(teamName)]);

  const reves = players.filter((p) => p.position === "REVES");
  const derecha = players.filter((p) => p.position === "DERECHA");
  const sinPosicion = players.filter((p) => !p.position);

  return (
    <div className="bg-ink-950 pb-28 pt-40">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-400">
              {team?.name} · {team?.season}
            </p>
            <h1 className="font-display text-5xl font-bold text-white sm:text-6xl">Plantilla</h1>
            <p className="mt-4 max-w-xl text-white/55">
              {players.length} jugadores registrados esta temporada, repartidos entre revés y derecha.
            </p>
          </div>
          <TeamFilter teams={allTeams} current={teamName} />
        </Reveal>

        {reves.length > 0 && (
          <section className="mt-16">
            <Reveal>
              <h2 className="font-display text-2xl text-gold-100">Revés</h2>
            </Reveal>
            <RevealGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {reves.map((p) => (
                <RevealItem key={p.id}>
                  <PlayerCard name={p.fullName} position={p.position} age={p.age} played={p.matchesPlayed} won={p.matchesWon} rate={p.rate} isCaptain={p.isCaptain} injured={p.injured} photoUrl={p.photoUrl} />
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
                  <PlayerCard name={p.fullName} position={p.position} age={p.age} played={p.matchesPlayed} won={p.matchesWon} rate={p.rate} isCaptain={p.isCaptain} injured={p.injured} photoUrl={p.photoUrl} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        )}

        {sinPosicion.length > 0 && (
          <section className="mt-16">
            <Reveal>
              <h2 className="font-display text-2xl text-gold-100">Sin lado asignado</h2>
            </Reveal>
            <RevealGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {sinPosicion.map((p) => (
                <RevealItem key={p.id}>
                  <PlayerCard name={p.fullName} position={p.position} age={p.age} played={p.matchesPlayed} won={p.matchesWon} rate={p.rate} isCaptain={p.isCaptain} injured={p.injured} photoUrl={p.photoUrl} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        )}
      </div>
    </div>
  );
}
