import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { Counter } from "@/components/Counter";
import { ValueCard } from "@/components/ValueCard";
import { PlayerCard } from "@/components/PlayerCard";
import { NextUpSection } from "@/components/NextUpSection";
import {
  getClubInfo,
  getValues,
  getPlayersRanked,
  getTeamSummary,
  getTeamByName,
  getSponsors,
  getNextFixtureForUser,
  getNextTrainingSession,
} from "@/lib/data";
import { SponsorStrip } from "@/components/SponsorStrip";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth().catch(() => null);
  const showNextUp = Boolean(session?.user && (session.user.role === "JUGADOR" || session.user.role === "CAPITAN"));

  const [club, values, players, summary, team, sponsors, nextFixture, nextTraining] = await Promise.all([
    getClubInfo(),
    getValues(),
    getPlayersRanked(),
    getTeamSummary(),
    getTeamByName(),
    getSponsors(),
    showNextUp && session?.user ? getNextFixtureForUser(session.user.id) : Promise.resolve(null),
    showNextUp ? getNextTrainingSession() : Promise.resolve(null),
  ]);

  const topPlayers = players.filter((p) => p.matchesPlayed > 0).slice(0, 3);

  return (
    <>
      <Hero tagline={club.tagline} city={club.city} />

      {showNextUp && <NextUpSection fixture={nextFixture} training={nextTraining} />}

      {/* Sobre el club */}
      <section className="relative bg-ink-950 py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 md:grid-cols-2 md:items-center">
            <Reveal>
              <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-400">El club</p>
              <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">
                Más que un club, <span className="text-gradient-gold">una familia</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/60">{club.description}</p>
              <Link
                href="/club"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-6 py-3 text-sm font-medium text-gold-200 transition-all hover:bg-gold-500/10"
              >
                Conoce el club
                <span aria-hidden>→</span>
              </Link>
            </Reveal>

            <RevealGroup className="grid grid-cols-2 gap-5" stagger={0.1}>
              {[
                { value: club.teamsCount, suffix: "", label: "Equipos federados" },
                { value: club.veteranTeams, suffix: "", label: "Equipos veteranos" },
                { value: club.absoluteTeams, suffix: "", label: "Equipos absolutos" },
                { value: club.followers ?? 0, suffix: "+", label: "Seguidores" },
              ].map((s) => (
                <RevealItem key={s.label} className="card-surface rounded-2xl p-6 text-center">
                  <p className="font-display text-4xl text-gold-100">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-white/40">{s.label}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* Valores / características */}
      <section className="relative border-t border-white/5 bg-ink-900 py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-400">Nuestra identidad</p>
            <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">Lo que nos define</h2>
          </Reveal>

          <RevealGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {values.map((v, i) => (
              <RevealItem key={v.id}>
                <ValueCard title={v.title} description={v.description} icon={v.icon} index={i} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Plantilla destacada */}
      <section className="relative border-t border-white/5 bg-ink-950 py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-400">Plantilla</p>
              <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">Nuestros referentes</h2>
            </div>
            <Link href="/plantilla" className="text-sm font-medium text-gold-300 hover:text-gold-200">
              Ver plantilla completa →
            </Link>
          </Reveal>

          <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
            {topPlayers.map((p) => (
              <RevealItem key={p.id}>
                <PlayerCard
                  name={p.fullName}
                  position={p.position}
                  age={p.age}
                  played={p.matchesPlayed}
                  won={p.matchesWon}
                  rate={p.rate}
                  isCaptain={p.isCaptain}
                  injured={p.injured}
                  photoUrl={p.photoUrl}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Temporada / stats teaser */}
      <section className="relative border-t border-white/5 bg-ink-900 py-28">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Reveal>
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-400">Temporada {team?.season ?? ""}</p>
            <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">La temporada en cifras</h2>
          </Reveal>

          <RevealGroup className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4" stagger={0.1}>
            {[
              { value: summary.totalJornadas, label: "Jornadas" },
              { value: summary.jornadasWon, label: "Jornadas ganadas" },
              { value: summary.totalMatchesPlayed, label: "Partidos jugados" },
              { value: summary.totalMatchesWon, label: "Partidos ganados" },
            ].map((s) => (
              <RevealItem key={s.label} className="card-surface rounded-2xl p-8">
                <p className="font-display text-5xl text-gold-100">
                  <Counter value={s.value} />
                </p>
                <p className="mt-3 text-xs uppercase tracking-wide text-white/40">{s.label}</p>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.2} className="mt-14">
            <Link
              href="/estadisticas"
              className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-8 py-3.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-105"
            >
              Ver estadísticas completas
              <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {sponsors.length > 0 && <SponsorStrip sponsors={sponsors} />}
    </>
  );
}
