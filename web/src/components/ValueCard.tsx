import type { ReactNode } from "react";

const ICONS: Record<string, ReactNode> = {
  handshake: (
    <path d="M8 12l2.5 2.5L16 9m-9 3l-3 3a2 2 0 000 2.8l.2.2a2 2 0 002.8 0l.5-.5M17 12l3-3a2 2 0 000-2.8l-.2-.2a2 2 0 00-2.8 0L14.5 8.5" />
  ),
  trophy: (
    <path d="M8 4h8v4a4 4 0 01-8 0V4zM6 4H4v2a3 3 0 003 3M18 4h2v2a3 3 0 01-3 3M10 15v3m4-3v3M8 21h8M9 15h6a2 2 0 002-2v-1H7v1a2 2 0 002 2z" />
  ),
  chart: <path d="M4 20V10m6 10V4m6 16v-7" />,
  heart: <path d="M12 21s-7-4.6-9.5-9C1 8.5 2 4.5 6 4c2.2-.3 3.9 1 5 2.5C12.1 5 13.8 3.7 16 4c4 .5 5 4.5 3.5 8-2.5 4.4-7.5 9-7.5 9z" />,
};

export function ValueCard({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: string;
  index: number;
}) {
  return (
    <div
      className="card-surface group rounded-2xl p-6 transition-all duration-500 hover:border-gold-500/30 hover:bg-white/[0.05]"
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/5 text-gold-300">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          {ICONS[icon] ?? ICONS.trophy}
        </svg>
      </div>
      <h3 className="font-display text-lg text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/55">{description}</p>
    </div>
  );
}
