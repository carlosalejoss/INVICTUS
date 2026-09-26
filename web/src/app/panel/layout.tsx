import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "JUGADOR") redirect("/");

  const isDirectiva = session.user.role === "DIRECTIVA";

  return (
    <div className="min-h-[100svh] bg-ink-950 pb-28 pt-40">
      <div className="mx-auto flex max-w-6xl gap-10 px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold-400">Panel</p>
          <nav className="space-y-1 text-sm">
            <PanelLink href="/panel">Resumen</PanelLink>
            <PanelLink href="/panel/partidos/nuevo">Nuevo partido</PanelLink>
            {isDirectiva && <PanelLink href="/panel/jugadores">Jugadores</PanelLink>}
            {isDirectiva && <PanelLink href="/panel/patrocinadores">Patrocinadores</PanelLink>}
            {isDirectiva && <PanelLink href="/panel/notificaciones">Notificaciones</PanelLink>}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="block rounded-lg px-3 py-2 text-white/65 transition-colors hover:bg-white/5 hover:text-gold-200">
      {children}
    </Link>
  );
}
