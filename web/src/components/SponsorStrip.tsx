import { Reveal } from "@/components/Reveal";

type Sponsor = { id: string; name: string; logoUrl: string; linkUrl: string | null };

export function SponsorStrip({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <section className="relative border-t border-white/5 bg-ink-950 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-gold-400">Nuestros patrocinadores</p>
        </Reveal>
        <Reveal delay={0.1} className="mt-8 flex flex-wrap items-center justify-center gap-10">
          {sponsors.map((s) => {
            const logo = (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URLs, not worth a next/image remotePatterns allowlist
              <img
                src={s.logoUrl}
                alt={s.name}
                className="h-12 w-auto max-w-[160px] object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              />
            );
            return s.linkUrl ? (
              <a key={s.id} href={s.linkUrl} target="_blank" rel="noreferrer" aria-label={s.name}>
                {logo}
              </a>
            ) : (
              <span key={s.id} aria-label={s.name}>
                {logo}
              </span>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
