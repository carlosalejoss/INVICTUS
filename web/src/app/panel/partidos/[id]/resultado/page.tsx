import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageTeam } from "@/lib/permissions";
import { fixtureOutcome } from "@/lib/matches";
import { ResultPicker } from "@/components/ResultPicker";

export const metadata: Metadata = { title: "Resultado · Panel" };
export const dynamic = "force-dynamic";

const OUTCOME_LABEL = { WON: "Ganada", LOST: "Perdida", PENDING: "Pendiente" };

export default async function ResultadoPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const fixture = await prisma.fixture.findUnique({
    where: { id: params.id },
    include: {
      team: true,
      pairs: { include: { revesPlayer: true, derechaPlayer: true } },
    },
  });
  if (!fixture) notFound();
  if (!canManageTeam(session, fixture.teamId)) redirect("/panel");

  const outcome = fixtureOutcome(fixture);

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.35em] text-gold-400">
        {fixture.team.name} · Jornada {fixture.jornada}
      </p>
      <h1 className="font-display text-3xl font-bold text-white">Resultado vs {fixture.opponent ?? "Por confirmar"}</h1>
      <p className="mt-2 text-sm text-white/50">
        Jornada resultante: <span className="text-gold-300">{OUTCOME_LABEL[outcome]}</span> (se gana en cuanto 2 de las 3 parejas
        ganan).
      </p>

      {fixture.pairs.length === 0 ? (
        <p className="mt-8 text-sm text-white/40">
          Esta jornada no tiene parejas asignadas todavía. {fixture.manualResult ? `Resultado administrativo: ${OUTCOME_LABEL[fixture.manualResult]}.` : "Ve primero a Alineación."}
        </p>
      ) : (
        <div className="mt-8 space-y-3">
          {fixture.pairs.map((p) => (
            <div key={p.id} className="card-surface flex items-center justify-between rounded-xl p-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/40">{p.category}</p>
                <p className="text-sm text-white/85">
                  {p.revesPlayer ? `${p.revesPlayer.nombre} ${p.revesPlayer.apellidos}` : "—"}{" "}
                  <span className="text-white/30">/</span>{" "}
                  {p.derechaPlayer ? `${p.derechaPlayer.nombre} ${p.derechaPlayer.apellidos}` : "—"}
                </p>
              </div>
              <ResultPicker pairId={p.id} initial={p.result} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
