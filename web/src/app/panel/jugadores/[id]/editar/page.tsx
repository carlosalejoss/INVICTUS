import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PlayerForm } from "@/components/PlayerForm";
import { updatePlayer } from "../../actions";

export const metadata: Metadata = { title: "Editar jugador · Panel" };
export const dynamic = "force-dynamic";

export default async function EditarJugadorPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user.role !== "DIRECTIVA") redirect("/panel");

  const [user, teams] = await Promise.all([
    prisma.user.findUnique({ where: { id: params.id }, include: { memberships: true } }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!user) notFound();

  const boundAction = updatePlayer.bind(null, user.id);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-white">
        Editar jugador · {user.nombre} {user.apellidos}
      </h1>
      <div className="mt-8">
        <PlayerForm
          action={boundAction}
          teams={teams}
          submitLabel="Guardar cambios"
          passwordRequired={false}
          defaults={{
            username: user.username,
            nombre: user.nombre,
            apellidos: user.apellidos,
            fechaNacimiento: user.fechaNacimiento ? user.fechaNacimiento.toISOString().slice(0, 10) : undefined,
            role: user.role,
            position: user.position,
            memberships: user.memberships.map((m) => ({ teamId: m.teamId, isCaptain: m.isCaptain })),
          }}
        />
      </div>
    </div>
  );
}
