import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { markNotificationRead } from "./actions";

export const metadata: Metadata = { title: "Notificaciones · Panel" };
export const dynamic = "force-dynamic";

export default async function NotificacionesPage() {
  const session = await auth();
  if (session?.user.role !== "DIRECTIVA") redirect("/panel");

  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-white">Notificaciones</h1>
      <div className="mt-8 space-y-3">
        {notifications.length === 0 && <p className="text-sm text-white/40">No hay notificaciones.</p>}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`card-surface flex items-center justify-between rounded-xl p-4 ${n.read ? "opacity-50" : ""}`}
          >
            <div>
              <p className="text-sm text-white/85">{n.message}</p>
              <p className="mt-1 text-xs text-white/35">{n.createdAt.toLocaleString("es-ES")}</p>
            </div>
            {!n.read && (
              <form action={markNotificationRead.bind(null, n.id)}>
                <button type="submit" className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:border-gold-500/40 hover:text-gold-200">
                  Marcar leída
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
