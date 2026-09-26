import Link from "next/link";
import { Emblem } from "./Emblem";

export function Footer({ instagramUrl, followers }: { instagramUrl: string; followers?: number | null }) {
  return (
    <footer className="border-t border-white/5 bg-ink-950">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <Emblem className="h-9 w-9" />
              <span className="font-display text-lg tracking-[0.2em] text-gold-100">INVICTUS</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Club de pádel de Zaragoza. Cinco equipos, una misma pasión por el pádel.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-3 font-semibold text-gold-200">Club</p>
              <ul className="space-y-2 text-white/60">
                <li><Link href="/club" className="hover:text-gold-300">Sobre nosotros</Link></li>
                <li><Link href="/plantilla" className="hover:text-gold-300">Plantilla</Link></li>
                <li><Link href="/estadisticas" className="hover:text-gold-300">Estadísticas</Link></li>
                <li><Link href="/calendario" className="hover:text-gold-300">Calendario</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold text-gold-200">Síguenos</p>
              <ul className="space-y-2 text-white/60">
                <li>
                  <a href={instagramUrl} target="_blank" rel="noreferrer" className="hover:text-gold-300">
                    Instagram{followers ? ` · ${followers.toLocaleString("es-ES")} seguidores` : ""}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold text-gold-200">Ubicación</p>
              <p className="text-white/60">Zaragoza, España</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Invictus Padel Club. Todos los derechos reservados.</p>
          <p>Sitio en desarrollo — datos de ejemplo sujetos a revisión.</p>
        </div>
      </div>
    </footer>
  );
}
