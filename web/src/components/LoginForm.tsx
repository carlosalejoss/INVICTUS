"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }
    router.push(searchParams.get("callbackUrl") ?? "/");
    router.refresh();
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="card-surface w-full max-w-sm rounded-2xl p-8"
    >
      <div className="mb-6">
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Usuario</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-white outline-none transition-colors focus:border-gold-500/50"
        />
      </div>
      <div className="mb-6">
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-white/50">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-white outline-none transition-colors focus:border-gold-500/50"
        />
      </div>

      {error && <p className="mb-4 text-sm text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {loading ? "Entrando…" : "Iniciar sesión"}
      </button>

      <p className="mt-5 text-center text-xs text-white/40">
        ¿No tienes credenciales? Pídeselas a la directiva del club.
      </p>
    </motion.form>
  );
}
