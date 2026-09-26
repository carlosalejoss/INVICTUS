"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { PlayerFormState } from "@/app/panel/jugadores/actions";

type Team = { id: string; name: string };
type Membership = { teamId: string; isCaptain: boolean };

const initialState: PlayerFormState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60"
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}

export function PlayerForm({
  action,
  teams,
  submitLabel,
  passwordRequired,
  defaults,
}: {
  action: (state: PlayerFormState, formData: FormData) => Promise<PlayerFormState>;
  teams: Team[];
  submitLabel: string;
  passwordRequired: boolean;
  defaults?: {
    username?: string;
    nombre?: string;
    apellidos?: string;
    fechaNacimiento?: string;
    role?: string;
    position?: string | null;
    memberships?: Membership[];
  };
}) {
  const [state, formAction] = useFormState(action, initialState);
  const membershipMap = new Map((defaults?.memberships ?? []).map((m) => [m.teamId, m.isCaptain]));

  return (
    <form action={formAction} className="card-surface max-w-2xl space-y-6 rounded-2xl p-8">
      {defaults?.username === undefined && (
        <Field label="Usuario">
          <input name="username" required className="input" autoComplete="off" />
        </Field>
      )}
      {defaults?.username !== undefined && (
        <Field label="Usuario">
          <input value={defaults.username} disabled className="input opacity-50" />
        </Field>
      )}

      <Field label={passwordRequired ? "Contraseña" : "Nueva contraseña (déjalo en blanco para no cambiarla)"}>
        <input name="password" type="password" required={passwordRequired} minLength={6} className="input" autoComplete="new-password" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre">
          <input name="nombre" required defaultValue={defaults?.nombre} className="input" />
        </Field>
        <Field label="Apellidos">
          <input name="apellidos" defaultValue={defaults?.apellidos} className="input" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Fecha de nacimiento">
          <input name="fechaNacimiento" type="date" defaultValue={defaults?.fechaNacimiento} className="input" />
        </Field>
        <Field label="Posición">
          <select name="position" defaultValue={defaults?.position ?? ""} className="input">
            <option value="">—</option>
            <option value="REVES">Revés</option>
            <option value="DERECHA">Derecha</option>
          </select>
        </Field>
      </div>

      <Field label="Rol">
        <select name="role" defaultValue={defaults?.role ?? "JUGADOR"} className="input">
          <option value="JUGADOR">Jugador</option>
          <option value="CAPITAN">Capitán</option>
          <option value="DIRECTIVA">Directiva</option>
        </select>
      </Field>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Equipos</p>
        <div className="space-y-2">
          {teams.map((t) => (
            <label key={t.id} className="flex items-center gap-3 text-sm text-white/75">
              <input type="checkbox" name="teamIds" value={t.id} defaultChecked={membershipMap.has(t.id)} className="accent-gold-500" />
              {t.name}
              <span className="ml-auto flex items-center gap-1.5 text-xs text-white/40">
                <input
                  type="checkbox"
                  name="captainOf"
                  value={t.id}
                  defaultChecked={membershipMap.get(t.id) === true}
                  className="accent-gold-500"
                />
                Capitán
              </span>
            </label>
          ))}
        </div>
      </div>

      {state.error && <p className="text-sm text-rose-400">{state.error}</p>}

      <SubmitButton label={submitLabel} />

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">{label}</span>
      {children}
    </label>
  );
}
