import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PlayerForm } from "@/components/PlayerForm";
import { createPlayer } from "../actions";

export const metadata: Metadata = { title: "Nuevo jugador · Panel" };
export const dynamic = "force-dynamic";

export default async function NuevoJugadorPage() {
  const session = await auth();
  if (session?.user.role !== "DIRECTIVA") redirect("/panel");

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-white">Registrar jugador</h1>
      <div className="mt-8">
        <PlayerForm action={createPlayer} teams={teams} submitLabel="Crear jugador" passwordRequired />
      </div>
    </div>
  );
}
