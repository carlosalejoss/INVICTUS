import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

type Sponsor = { id: string; name: string; logoUrl: string; linkUrl: string | null };

export function SponsorStrip({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <section className="relative border-t border-white/5 bg-ink-950 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-gold-400">Nuestros patrocinadores</p>
        </Reveal>
        <RevealGroup className="mt-8 flex flex-wrap items-center justify-center gap-5" stagger={0.06}>
          {sponsors.map((s) => {
            const card = (
              <div className="flex h-20 w-36 items-center justify-center rounded-xl bg-white p-3 shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-105 sm:w-40">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URLs, not worth a next/image remotePatterns allowlist */}
                <img src={s.logoUrl} alt={s.name} className="max-h-full max-w-full object-contain" />
              </div>
            );
            return (
              <RevealItem key={s.id}>
                {s.linkUrl ? (
                  <a href={s.linkUrl} target="_blank" rel="noreferrer" aria-label={s.name}>
                    {card}
                  </a>
                ) : (
                  <span aria-label={s.name}>{card}</span>
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
