import type { Metadata } from "next";
import Image from "next/image";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { Counter } from "@/components/Counter";
import { ValueCard } from "@/components/ValueCard";
import { getClubInfo, getValues } from "@/lib/data";

export const metadata: Metadata = { title: "El Club · Invictus Padel Club" };
export const dynamic = "force-dynamic";

export default async function ClubPage() {
  const [club, values] = await Promise.all([getClubInfo(), getValues()]);

  return (
    <div className="bg-ink-950 pb-28 pt-40">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="text-center">
          <Image
            src="/branding/logo-horizontal.jpg"
            alt={club.name}
            width={480}
            height={192}
            className="mx-auto mb-6 h-16 w-auto rounded-xl object-contain sm:h-20"
            priority
          />
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-400">{club.city}{club.founded ? ` · Desde ${club.founded}` : ""}</p>
          <h1 className="sr-only">{club.name}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">{club.description}</p>
        </Reveal>

        <RevealGroup className="mt-16 grid grid-cols-2 gap-5 sm:grid-cols-4" stagger={0.08}>
          {[
            { value: club.teamsCount, label: "Equipos" },
            { value: club.veteranTeams, label: "Veteranos" },
            { value: club.absoluteTeams, label: "Absolutos" },
            { value: club.followers ?? 0, suffix: "+", label: "Comunidad" },
          ].map((s) => (
            <RevealItem key={s.label} className="card-surface rounded-2xl p-6 text-center">
              <p className="font-display text-4xl text-gold-100">
                <Counter value={s.value} suffix={s.suffix ?? ""} />
              </p>
              <p className="mt-2 text-xs uppercase tracking-wide text-white/40">{s.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <section className="mt-24">
          <Reveal className="text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Nuestros valores</h2>
          </Reveal>
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {values.map((v, i) => (
              <RevealItem key={v.id}>
                <ValueCard title={v.title} description={v.description} icon={v.icon} index={i} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section className="mt-24">
          <Reveal className="card-surface rounded-3xl p-10 text-center sm:p-14">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Síguenos en el día a día</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/55">
              Compartimos partidos, entrenamientos y momentos de club en Instagram junto a más de{" "}
              {club.followers?.toLocaleString("es-ES")} seguidores.
            </p>
            <a
              href={club.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-500 px-8 py-3.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-105"
            >
              @invictuspadel
              <span aria-hidden>→</span>
            </a>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
