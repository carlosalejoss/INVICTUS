"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changePassword, type ChangePasswordState } from "@/app/cuenta/actions";

const initialState: ChangePasswordState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Cambiar contraseña"}
    </button>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useFormState(changePassword, initialState);

  return (
    <form action={formAction} className="card-surface max-w-md rounded-2xl p-8">
      <div className="mb-5">
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Contraseña actual</label>
        <input
          type="password"
          name="currentPassword"
          required
          className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-white outline-none focus:border-gold-500/50"
        />
      </div>
      <div className="mb-5">
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Nueva contraseña</label>
        <input
          type="password"
          name="newPassword"
          required
          minLength={6}
          className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-white outline-none focus:border-gold-500/50"
        />
      </div>
      <div className="mb-6">
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Repite la nueva contraseña</label>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={6}
          className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-white outline-none focus:border-gold-500/50"
        />
      </div>

      {state.error && <p className="mb-4 text-sm text-rose-400">{state.error}</p>}
      {state.success && <p className="mb-4 text-sm text-emerald-400">Contraseña actualizada correctamente.</p>}

      <SubmitButton />
    </form>
  );
}
