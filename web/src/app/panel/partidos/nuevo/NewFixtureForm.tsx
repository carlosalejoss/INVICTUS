"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createFixture, type FixtureFormState } from "../actions";

const initialState: FixtureFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-60">
      {pending ? "Creando…" : "Crear partido"}
    </button>
  );
}

export function NewFixtureForm({ teams }: { teams: { id: string; name: string }[] }) {
  const [state, formAction] = useFormState(createFixture, initialState);

  return (
    <form action={formAction} className="card-surface max-w-xl space-y-5 rounded-2xl p-8">
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Equipo</span>
        <select name="teamId" required className="input">
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Jornada (número)</span>
        <input name="jornada" type="number" min={1} required className="input" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Rival</span>
        <input name="opponent" className="input" />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Fecha</span>
          <input name="date" type="date" className="input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Hora</span>
          <input name="time" type="time" className="input" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Ubicación</span>
        <input name="location" className="input" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Fecha límite para apuntarse</span>
        <input name="availabilityDeadline" type="datetime-local" className="input" />
      </label>

      {state.error && <p className="text-sm text-rose-400">{state.error}</p>}

      <SubmitButton />

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #131315;
          padding: 0.6rem 1rem;
          color: white;
          outline: none;
        }
        .input:focus {
          border-color: rgba(198, 154, 47, 0.5);
        }
      `}</style>
    </form>
  );
}
