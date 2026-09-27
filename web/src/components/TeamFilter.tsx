"use client";

import { useRouter } from "next/navigation";

export function TeamFilter({ teams, current }: { teams: { id: string; name: string }[]; current: string }) {
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-white/40">Equipo</span>
      <select
        value={current}
        onChange={(e) => router.push(`/plantilla?equipo=${encodeURIComponent(e.target.value)}`)}
        className="rounded-lg border border-white/15 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-gold-500/50"
      >
        {teams.map((t) => (
          <option key={t.id} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  );
}
