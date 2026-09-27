"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateProfile, type ProfileFormState } from "@/app/cuenta/actions";

const initialState: ProfileFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}

export function ProfileForm({
  defaults,
}: {
  defaults: {
    nombre: string;
    apellidos: string;
    fechaNacimiento: string | null;
    position: string | null;
    injured: boolean;
    photoUrl: string | null;
  };
}) {
  const [state, formAction] = useFormState(updateProfile, initialState);
  const [preview, setPreview] = useState<string | null>(defaults.photoUrl);

  return (
    <form action={formAction} encType="multipart/form-data" className="card-surface max-w-2xl space-y-6 rounded-2xl p-8">
      <div className="flex items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo, arbitrary blob URL */}
        <img
          src={preview ?? "/branding/emblem.jpg"}
          alt="Foto de perfil"
          className="h-20 w-20 rounded-full border border-white/10 object-cover"
        />
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Foto de perfil</span>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
            className="block text-sm text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:text-white/80 hover:file:bg-white/20"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Nombre</span>
          <input name="nombre" required defaultValue={defaults.nombre} className="input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Apellidos</span>
          <input name="apellidos" defaultValue={defaults.apellidos} className="input" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Fecha de nacimiento</span>
          <input name="fechaNacimiento" type="date" defaultValue={defaults.fechaNacimiento ?? undefined} className="input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Lado</span>
          <select name="position" defaultValue={defaults.position ?? ""} className="input">
            <option value="">—</option>
            <option value="REVES">Revés</option>
            <option value="DERECHA">Derecha</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm text-white/75">
        <input type="checkbox" name="injured" defaultChecked={defaults.injured} className="h-4 w-4 accent-gold-500" />
        Actualmente lesionado/a
      </label>

      {state.error && <p className="text-sm text-rose-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-400">Perfil actualizado correctamente.</p>}

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
