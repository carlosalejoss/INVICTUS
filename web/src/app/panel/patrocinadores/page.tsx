import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SponsorForm } from "./SponsorForm";
import { SponsorRow } from "./SponsorRow";

export const metadata: Metadata = { title: "Patrocinadores · Panel" };
export const dynamic = "force-dynamic";

export default async function PatrocinadoresPage() {
  const session = await auth();
  if (session?.user.role !== "DIRECTIVA") redirect("/panel");

  const sponsors = await prisma.sponsor.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-white">Patrocinadores</h1>
      <p className="mt-2 text-sm text-white/50">Aparecen en la sección “Nuestros patrocinadores” de la home.</p>

      <div className="mt-8">
        <SponsorForm />
      </div>

      <div className="mt-8 space-y-3">
        {sponsors.length === 0 && <p className="text-sm text-white/40">Todavía no hay patrocinadores.</p>}
        {sponsors.map((s) => (
          <SponsorRow key={s.id} id={s.id} name={s.name} logoUrl={s.logoUrl} active={s.active} />
        ))}
      </div>
    </div>
  );
}
