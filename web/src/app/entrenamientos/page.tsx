import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureUpcomingTrainingSessions } from "@/lib/training";
import { Reveal } from "@/components/Reveal";
import { TrainingSlotCard } from "@/components/TrainingSlotCard";

export const metadata: Metadata = { title: "Entrenamientos · Invictus Padel Club" };
export const dynamic = "force-dynamic";

export default async function EntrenamientosPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await ensureUpcomingTrainingSessions();

  const sessions = await prisma.trainingSession.findMany({
    where: { date: { gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    include: { signups: { include: { user: true } } },
  });

  const byDate = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const key = s.date.toISOString();
    byDate.set(key, [...(byDate.get(key) ?? []), s]);
  }

  return (
    <div className="bg-ink-950 pb-28 pt-40">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-400">Todos los miércoles · Pádel Zaragoza</p>
          <h1 className="font-display text-5xl font-bold text-white sm:text-6xl">Entrenamientos</h1>
          <p className="mt-4 max-w-xl text-white/55">
            Entrenamientos abiertos a todo el club, sin distinción de equipo ni posición. Los 4 primeros
            en apuntarse a cada horario juegan en la pista reservada; a partir de ahí se reserva pista
            adicional automáticamente.
          </p>
        </Reveal>

        <div className="mt-14 space-y-10">
          {[...byDate.entries()].map(([dateKey, daySessions]) => (
            <div key={dateKey}>
              <h2 className="mb-4 font-display text-xl capitalize text-gold-100">
                {new Date(dateKey).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {daySessions.map((s) => (
                  <TrainingSlotCard
                    key={s.id}
                    trainingSessionId={s.id}
                    startTime={s.startTime}
                    location={s.location}
                    durationMin={s.durationMin}
                    currentUserId={session.user.id}
                    signups={s.signups.map((su) => ({
                      userId: su.userId,
                      name: `${su.user.nombre} ${su.user.apellidos}`.trim(),
                    }))}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
