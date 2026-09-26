# Invictus Padel Club — Web

Web del club de pádel **Invictus Padel Club** (Zaragoza). Primera iteración: sitio de presentación
"vistoso" (animaciones estilo Apple) con la información del club, la plantilla, las estadísticas de
la temporada y el calendario, todo servido desde una base de datos PostgreSQL real.

## Arquitectura

```
INVICTUS/
├── docker-compose.yml     # Orquesta db (Postgres), web (Next.js) y adminer
├── .env.example           # Variables de entorno (copiar a .env)
└── web/                   # Aplicación Next.js
    ├── prisma/
    │   ├── schema.prisma  # Modelo de datos
    │   └── seed.ts        # Carga inicial: jugadores, jornadas y contenido del club
    └── src/
        ├── app/           # Páginas (App Router): /, /club, /plantilla, /estadisticas, /calendario
        ├── components/    # Hero, Navbar, Footer, tarjetas, animaciones (Framer Motion)
        └── lib/           # Cliente Prisma y funciones de acceso a datos
```

**Stack elegido y por qué:**
- **Next.js 14 (App Router) + TypeScript + Tailwind CSS**: renderizado en servidor (SEO y carga
  rápida), ideal para un sitio de contenido con secciones muy visuales.
- **Framer Motion**: animaciones de scroll-reveal, parallax en el hero, contadores animados —
  el efecto "Apple style" pedido.
- **PostgreSQL + Prisma ORM**: base de datos relacional solicitada, con un esquema tipado y
  migraciones/sincronización sencillas (`prisma db push`).
- **Docker Compose**: `db` (Postgres), `web` (Next.js) y `adminer` (explorador visual de la BD en
  `localhost:8080`), listos con un solo comando.

## Puesta en marcha (Docker)

```bash
cp .env.example .env   # ya está copiado en este repo, revísalo si quieres cambiar credenciales
docker compose up -d --build
```

- Web: http://localhost:3000
- Adminer (explorar la base de datos): http://localhost:8080 — sistema `PostgreSQL`, servidor `db`,
  usuario/clave/BD según tu `.env`.

Al arrancar, el contenedor `web` sincroniza el esquema de Prisma contra Postgres y **siembra la
base de datos automáticamente** (`docker-entrypoint.sh`) con los datos migrados del club, por lo
que cada `docker compose up` deja la web con contenido consistente. Esto es intencional en esta
fase (aún no hay panel de edición); cuando se añada gestión de contenido dejaremos de resembrar en
cada arranque.

## Desarrollo local sin Docker (opcional)

```bash
cd web
npm install
npm run prisma:generate
# con Postgres local levantado y DATABASE_URL apuntando a él:
npm run db:setup   # prisma db push + seed
npm run dev
```

## Origen de los datos

- **Jugadores, posiciones, parejas, jornadas y resultados**: migrados desde
  `AA VETERANOS SENIOR CLUB.numbers` (hojas `PAREJAS`, `Hoja 1`, `COMBINACIONES DERECHAS/REVESES`).
  Ver `web/prisma/seed.ts` para el detalle de la migración.
- **Nombre del club, ciudad y nº de equipos/seguidores**: tomados de la bio pública de Instagram
  [@invictuspadel](https://www.instagram.com/invictuspadel/).

### ⚠️ Supuestos e invenciones a validar

- El Excel original pertenece al equipo **"Veteranos Senior"** y en su jornada 1 y 10 aparece
  registrado un partido **"contra Invictus"**. Como el propio archivo se nos entregó como los datos
  del club Invictus, se ha asumido que es el calendario real de uno de los 5 equipos del club
  (posible errata o nombre de competición) — dímelo si hay que corregirlo o etiquetarlo distinto.
- **Año de fundación (2018)**, la descripción larga del club y los **4 valores/pilares** ("Compañerismo",
  "Competitividad", "Progreso constante", "Pasión por el pádel") son contenido de ejemplo inventado,
  ya que no están publicados. Están marcados con comentarios `INVENTADO` en
  `web/prisma/seed.ts` para localizarlos y sustituirlos fácilmente.
- Solo se ha modelado el equipo **Veteranos Senior** (el que aparece en el Excel). El club tiene
  5 equipos en total (3 veteranos + 2 absolutos): añadir los otros 4 es una siguiente iteración natural.
- Algunas variaciones de nombre en el Excel origen (p. ej. "CARLOS SAENZ"/"CARLOS SANEZ") se han
  unificado a un único jugador; revisa `NAME_ALIASES` en `seed.ts` si detectas algún jugador duplicado
  o mal fusionado.

## Próximas iteraciones (ideas)

- Panel de administración para editar plantilla/calendario sin tocar el seed.
- Modelar los 5 equipos del club (no solo Veteranos Senior).
- Sección de galería/noticias conectada a Instagram.
- Autenticación y roles (directiva / jugadores).
- Migrar de `prisma db push` a migraciones versionadas (`prisma migrate`) de cara a producción.
