import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

type NextFixture = {
  id: string;
  jornada: number;
  opponent: string | null;
  date: Date | null;
  location: string | null;
  team: { name: string };
} | null;

type NextTraining = {
  id: string;
  date: Date;
  startTime: string;
  location: string;
} | null;

export function NextUpSection({ fixture, training }: { fixture: NextFixture; training: NextTraining }) {
  return (
    <section className="relative border-t border-white/5 bg-ink-900 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-400">Tu próxima cita</p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Qué toca ahora</h2>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2" stagger={0.1}>
          <RevealItem className="card-surface rounded-2xl p-7">
            <p className="mb-2 text-xs uppercase tracking-wide text-gold-300">Próximo partido de liga</p>
            {fixture ? (
              <>
                <h3 className="font-display text-2xl text-white">
                  {fixture.team.name} vs {fixture.opponent ?? "Por confirmar"}
                </h3>
                <p className="mt-2 text-sm text-white/55">
                  Jornada {fixture.jornada}
                  {fixture.date && ` · ${fixture.date.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}`}
                  {fixture.location && ` · ${fixture.location}`}
                </p>
                <Link
                  href={`/partidos/${fixture.id}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-105"
                >
                  Marcar disponibilidad
                  <span aria-hidden>→</span>
                </Link>
              </>
            ) : (
              <p className="mt-2 text-sm text-white/50">Todavía no hay ningún partido programado.</p>
            )}
          </RevealItem>

          <RevealItem className="card-surface rounded-2xl p-7">
            <p className="mb-2 text-xs uppercase tracking-wide text-gold-300">Próximo entrenamiento</p>
            {training ? (
              <>
                <h3 className="font-display text-2xl capitalize text-white">
                  {training.date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                </h3>
                <p className="mt-2 text-sm text-white/55">
                  {training.startTime} · {training.location}
                </p>
                <Link
                  href="/entrenamientos"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-6 py-2.5 text-sm font-medium text-gold-200 transition-colors hover:bg-gold-500/10"
                >
                  Apuntarme
                  <span aria-hidden>→</span>
                </Link>
              </>
            ) : (
              <p className="mt-2 text-sm text-white/50">No hay entrenamientos programados ahora mismo.</p>
            )}
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
