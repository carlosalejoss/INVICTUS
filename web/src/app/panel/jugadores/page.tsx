import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ToggleActiveButton } from "./ToggleActiveButton";

export const metadata: Metadata = { title: "Jugadores · Panel" };
export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = { JUGADOR: "Jugador", CAPITAN: "Capitán", DIRECTIVA: "Directiva" };

export default async function JugadoresPage() {
  const session = await auth();
  if (session?.user.role !== "DIRECTIVA") redirect("/panel");

  const users = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { nombre: "asc" }],
    include: { memberships: { include: { team: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-white">Jugadores</h1>
        <Link href="/panel/jugadores/nuevo" className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-400">
          + Registrar jugador
        </Link>
      </div>

      <div className="card-surface mt-8 overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/40">
              <th className="px-4 py-3 font-normal">Nombre</th>
              <th className="px-4 py-3 font-normal">Usuario</th>
              <th className="px-4 py-3 font-normal">Rol</th>
              <th className="px-4 py-3 font-normal">Equipos</th>
              <th className="px-4 py-3 font-normal">Estado</th>
              <th className="px-4 py-3 font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={`border-b border-white/5 last:border-0 ${!u.active ? "opacity-40" : ""}`}>
                <td className="px-4 py-3 text-white/85">{u.nombre} {u.apellidos}</td>
                <td className="px-4 py-3 text-white/50">@{u.username}</td>
                <td className="px-4 py-3 text-white/60">{ROLE_LABEL[u.role]}</td>
                <td className="px-4 py-3 text-white/50">
                  {u.memberships.map((m) => m.team.name + (m.isCaptain ? " (C)" : "")).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">{u.active ? "Activo" : "Baja"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/panel/jugadores/${u.id}/editar`} className="text-gold-300 hover:text-gold-200">
                      Editar
                    </Link>
                    <ToggleActiveButton userId={u.id} active={u.active} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
