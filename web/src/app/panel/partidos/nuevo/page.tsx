import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NewFixtureForm } from "./NewFixtureForm";

export const metadata: Metadata = { title: "Nuevo partido · Panel" };
export const dynamic = "force-dynamic";

export default async function NuevoPartidoPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const teams = await prisma.team.findMany({
    where: session.user.role === "DIRECTIVA" ? {} : { id: { in: session.user.captainOf } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-white">Nuevo partido de liga</h1>
      <p className="mt-2 text-sm text-white/50">
        El plazo para apuntarse suele cerrar el miércoles a las 18:00 previo al partido -- ajusta la fecha límite si procede.
      </p>
      <div className="mt-8">
        <NewFixtureForm teams={teams} />
      </div>
    </div>
  );
}
