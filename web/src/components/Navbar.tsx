"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Emblem } from "./Emblem";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/club", label: "El Club" },
  { href: "/plantilla", label: "Plantilla" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/calendario", label: "Calendario" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

        <nav className="hidden gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium tracking-wide text-white/70 transition-colors hover:text-gold-300"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <a
          href="https://www.instagram.com/invictuspadel/"
          target="_blank"
          rel="noreferrer"
          className="hidden rounded-full border border-gold-500/40 px-4 py-1.5 text-sm text-gold-200 transition-colors hover:bg-gold-500/10 md:block"
        >
          Instagram
        </a>

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
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-white/80 hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
        </motion.nav>
      )}
    </motion.header>
  );
}
