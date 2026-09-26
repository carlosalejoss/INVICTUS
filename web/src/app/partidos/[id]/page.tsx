import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isTeamMember } from "@/lib/permissions";
import { AvailabilityPicker } from "@/components/AvailabilityPicker";

export const metadata: Metadata = { title: "Partido · Invictus Padel Club" };
export const dynamic = "force-dynamic";

export default async function PartidoDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  const fixture = await prisma.fixture.findUnique({
    where: { id: params.id },
    include: {
      team: true,
      availabilities: { include: { user: true } },
    },
  });
  if (!fixture) notFound();

  const canRespond = isTeamMember(session, fixture.teamId);
  const mine = session ? fixture.availabilities.find((a) => a.userId === session.user.id) : undefined;
  const closed = Boolean(fixture.availabilityDeadline && new Date() > fixture.availabilityDeadline);

  const available = fixture.availabilities.filter((a) => a.status === "AVAILABLE");
  const unavailable = fixture.availabilities.filter((a) => a.status === "UNAVAILABLE");

  return (
    <div className="bg-ink-950 pb-28 pt-40">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-gold-400">
          {fixture.team.name} · Jornada {fixture.jornada}
        </p>
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">vs {fixture.opponent ?? "Por confirmar"}</h1>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/55">
          {fixture.date && <span>{fixture.date.toLocaleString("es-ES", { dateStyle: "full", timeStyle: "short" })}</span>}
          {fixture.location && <span>{fixture.location}</span>}
          {fixture.availabilityDeadline && (
            <span>
              Plazo para apuntarse: {fixture.availabilityDeadline.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          )}
        </div>

        <div className="card-surface mt-10 rounded-2xl p-6">
          <p className="mb-4 text-sm text-white/70">¿Puedes jugar este partido?</p>
          {canRespond ? (
            <AvailabilityPicker fixtureId={fixture.id} initial={mine?.status ?? null} closed={closed} />
          ) : (
            <p className="text-sm text-white/40">
              <Link href="/login" className="text-gold-300 hover:text-gold-200">
                Inicia sesión
              </Link>{" "}
              como jugador del equipo para apuntarte.
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-emerald-300">Disponibles ({available.length})</p>
            <ul className="space-y-1 text-sm text-white/70">
              {available.map((a) => (
                <li key={a.id}>{a.user.nombre} {a.user.apellidos}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-rose-300">No disponibles ({unavailable.length})</p>
            <ul className="space-y-1 text-sm text-white/50">
              {unavailable.map((a) => (
                <li key={a.id}>{a.user.nombre} {a.user.apellidos}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
