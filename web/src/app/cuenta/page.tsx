import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export const metadata: Metadata = { title: "Mi cuenta · Invictus Padel Club" };
export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  JUGADOR: "Jugador",
  CAPITAN: "Capitán",
  DIRECTIVA: "Directiva",
};

export default async function CuentaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="bg-ink-950 pb-28 pt-40">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-400">Mi cuenta</p>
        <h1 className="font-display text-5xl font-bold text-white sm:text-6xl">{session.user.name}</h1>
        <p className="mt-3 text-white/55">
          Usuario <span className="text-gold-300">@{session.user.username}</span> ·{" "}
          {ROLE_LABEL[session.user.role]}
        </p>

        <div className="mt-12">
          <h2 className="mb-4 font-display text-xl text-gold-100">Cambiar contraseña</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
