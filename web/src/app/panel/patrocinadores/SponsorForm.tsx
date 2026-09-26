"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createSponsor, type SponsorFormState } from "./actions";

const initialState: SponsorFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-60">
      {pending ? "Guardando…" : "Añadir patrocinador"}
    </button>
  );
}

export function SponsorForm() {
  const [state, formAction] = useFormState(createSponsor, initialState);

  return (
    <form action={formAction} className="card-surface grid max-w-2xl gap-4 rounded-2xl p-6 sm:grid-cols-2">
      <label className="block sm:col-span-1">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Nombre</span>
        <input name="name" required className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-white outline-none focus:border-gold-500/50" />
      </label>
      <label className="block sm:col-span-1">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">URL del logo</span>
        <input name="logoUrl" required placeholder="https://…" className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-white outline-none focus:border-gold-500/50" />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Enlace (opcional)</span>
        <input name="linkUrl" placeholder="https://…" className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-white outline-none focus:border-gold-500/50" />
      </label>
      {state.error && <p className="text-sm text-rose-400 sm:col-span-2">{state.error}</p>}
      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}
