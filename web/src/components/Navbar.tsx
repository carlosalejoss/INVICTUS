"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { Emblem } from "./Emblem";

const PUBLIC_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/club", label: "El Club" },
  { href: "/plantilla", label: "Plantilla" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/calendario", label: "Calendario" },
];

const ROLE_LABEL: Record<string, string> = {
  JUGADOR: "Jugador",
  CAPITAN: "Capitán",
  DIRECTIVA: "Directiva",
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = session
    ? [...PUBLIC_LINKS, { href: "/entrenamientos", label: "Entrenamientos" }]
    : PUBLIC_LINKS;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled ? "bg-ink-950/80 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <Emblem className="h-9 w-9 transition-transform duration-500 group-hover:rotate-[8deg]" />
          <span className="font-display text-lg tracking-[0.2em] text-gold-100">INVICTUS</span>
        </Link>

        <nav className="hidden gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium tracking-wide text-white/70 transition-colors hover:text-gold-300"
            >
              {l.label}
            </Link>
          ))}
          {session && (session.user.role === "CAPITAN" || session.user.role === "DIRECTIVA") && (
            <Link href="/panel" className="text-sm font-medium tracking-wide text-gold-300 hover:text-gold-200">
              Panel
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" ? null : session ? (
            <>
              <Link href="/cuenta" className="text-right text-xs leading-tight text-white/60 hover:text-gold-300">
                <span className="block text-white/80">{session.user.name}</span>
                <span className="text-gold-400">{ROLE_LABEL[session.user.role]}</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/70 transition-colors hover:border-gold-500/40 hover:text-gold-200"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-gold-500/40 px-4 py-1.5 text-sm text-gold-200 transition-colors hover:bg-gold-500/10"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        <button
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir menú"
        >
          <span className={`h-[1.5px] w-6 bg-gold-200 transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-[1.5px] w-6 bg-gold-200 transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-[1.5px] w-6 bg-gold-200 transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex flex-col gap-1 border-t border-white/5 bg-ink-950/95 px-6 py-4 md:hidden"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-white/80 hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
          {session && (session.user.role === "CAPITAN" || session.user.role === "DIRECTIVA") && (
            <Link href="/panel" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm text-gold-300 hover:bg-white/5">
              Panel
            </Link>
          )}
          <div className="mt-2 border-t border-white/5 pt-3">
            {session ? (
              <>
                <Link href="/cuenta" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5">
                  {session.user.name} · {ROLE_LABEL[session.user.role]}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-gold-300 hover:bg-white/5">
                Iniciar sesión
              </Link>
            )}
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
}
