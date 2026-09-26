import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fixtureOutcome } from "@/lib/matches";

export const metadata: Metadata = { title: "Panel · Invictus Padel Club" };
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const session = await auth();
  if (!session) return null;

  const isDirectiva = session.user.role === "DIRECTIVA";
  const teams = await prisma.team.findMany({
    where: isDirectiva ? {} : { id: { in: session.user.captainOf } },
    include: {
      fixtures: {
        orderBy: { jornada: "asc" },
        include: { pairs: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const unreadNotifications = isDirectiva ? await prisma.notification.count({ where: { read: false } }) : 0;

  return (
    <div>
      <h1 className="font-display text-4xl font-bold text-white">Panel</h1>
      <p className="mt-2 text-white/55">
        {isDirectiva ? "Directiva" : "Capitán"} · {session.user.name}
      </p>

      {isDirectiva && unreadNotifications > 0 && (
        <Link
          href="/panel/notificaciones"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-500/15 px-4 py-2 text-sm text-gold-300"
        >
          🔔 {unreadNotifications} notificación{unreadNotifications > 1 ? "es" : ""} sin leer
        </Link>
      )}

      <div className="mt-10 space-y-10">
        {teams.map((team) => (
          <section key={team.id}>
            <h2 className="mb-4 font-display text-xl text-gold-100">{team.name}</h2>
            {team.fixtures.length === 0 ? (
              <p className="text-sm text-white/40">Sin partidos todavía.</p>
            ) : (
              <div className="card-surface overflow-hidden rounded-2xl">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40">
                      <th className="px-4 py-3 font-normal">Jornada</th>
                      <th className="px-4 py-3 font-normal">Rival</th>
                      <th className="px-4 py-3 font-normal">Estado</th>
                      <th className="px-4 py-3 font-normal">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.fixtures.map((fx) => {
                      const outcome = fixtureOutcome(fx);
                      const hasLineup = fx.pairs.length > 0;
                      return (
                        <tr key={fx.id} className="border-b border-white/5 last:border-0">
                          <td className="px-4 py-3 text-white/80">#{fx.jornada}</td>
                          <td className="px-4 py-3 text-white/80">{fx.opponent ?? "Por confirmar"}</td>
                          <td className="px-4 py-3 text-white/60">
                            {outcome === "PENDING" ? (hasLineup ? "Alineación lista" : "Sin alineación") : outcome === "WON" ? "Ganado" : "Perdido"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-3">
                              <Link href={`/panel/partidos/${fx.id}/alineacion`} className="text-gold-300 hover:text-gold-200">
                                Alineación
                              </Link>
                              <Link href={`/panel/partidos/${fx.id}/resultado`} className="text-gold-300 hover:text-gold-200">
                                Resultado
                              </Link>
                              <Link href={`/partidos/${fx.id}`} className="text-white/50 hover:text-white/80">
                                Ver
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
