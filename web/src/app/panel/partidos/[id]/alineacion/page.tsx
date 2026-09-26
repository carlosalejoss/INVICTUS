import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageTeam } from "@/lib/permissions";
import { LineupBoard } from "@/components/LineupBoard";

export const metadata: Metadata = { title: "Alineación · Panel" };
export const dynamic = "force-dynamic";

const VETERAN_CATEGORIES = ["Pareja 95", "Pareja 100", "Pareja 105"];
const OPEN_CATEGORIES = ["Pareja 1", "Pareja 2", "Pareja 3"];

export default async function AlineacionPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const fixture = await prisma.fixture.findUnique({
    where: { id: params.id },
    include: {
      team: true,
      pairs: { include: { revesPlayer: true, derechaPlayer: true } },
      availabilities: { where: { status: "AVAILABLE" }, include: { user: true } },
    },
  });
  if (!fixture) notFound();
  if (!canManageTeam(session, fixture.teamId)) redirect("/panel");

  const categories = fixture.team.ageRestricted ? VETERAN_CATEGORIES : OPEN_CATEGORIES;

  const initialSlots: Record<string, { reves: string | null; derecha: string | null }> = {};
  for (const c of categories) initialSlots[c] = { reves: null, derecha: null };
  for (const pair of fixture.pairs) {
    initialSlots[pair.category] = {
      reves: pair.revesPlayerId,
      derecha: pair.derechaPlayerId,
    };
  }

  // Pool = anyone who marked "disponible" + anyone already assigned (covers matches pre-populated
  // from the migrated Excel data, where no Availability row exists yet).
  const playerMap = new Map<string, { id: string; name: string; position: "REVES" | "DERECHA" | null }>();
  for (const a of fixture.availabilities) {
    playerMap.set(a.user.id, { id: a.user.id, name: `${a.user.nombre} ${a.user.apellidos}`.trim(), position: a.user.position });
  }
  for (const pair of fixture.pairs) {
    if (pair.revesPlayer) playerMap.set(pair.revesPlayer.id, { id: pair.revesPlayer.id, name: `${pair.revesPlayer.nombre} ${pair.revesPlayer.apellidos}`.trim(), position: pair.revesPlayer.position });
    if (pair.derechaPlayer) playerMap.set(pair.derechaPlayer.id, { id: pair.derechaPlayer.id, name: `${pair.derechaPlayer.nombre} ${pair.derechaPlayer.apellidos}`.trim(), position: pair.derechaPlayer.position });
  }

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.35em] text-gold-400">
        {fixture.team.name} · Jornada {fixture.jornada}
      </p>
      <h1 className="font-display text-3xl font-bold text-white">Alineación vs {fixture.opponent ?? "Por confirmar"}</h1>
      <p className="mt-2 text-sm text-white/50">
        Arrastra jugadores disponibles a los huecos de revés/derecha de cada pareja. Arrastra fuera (a “Disponibles”) para
        quitarlos.
      </p>

      <div className="mt-8">
        <LineupBoard
          fixtureId={fixture.id}
          categories={categories}
          ageRestricted={fixture.team.ageRestricted}
          initialSlots={initialSlots}
          availablePlayers={[...playerMap.values()]}
        />
      </div>
    </div>
  );
}
