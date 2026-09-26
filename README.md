# Invictus Padel Club — Web

Web del club de pádel **Invictus Padel Club** (Zaragoza): sitio de presentación "vistoso"
(animaciones estilo Apple) más una aplicación con cuentas de usuario, roles y gestión operativa del
club (jugadores, partidos, convocatorias, alineaciones, entrenamientos, patrocinadores), todo servido
desde una base de datos PostgreSQL real.

## Arquitectura

```
INVICTUS/
├── docker-compose.yml     # Orquesta db (Postgres), web (Next.js) y adminer
├── .env.example           # Variables de entorno (copiar a .env)
└── web/                   # Aplicación Next.js
    ├── prisma/
    │   ├── schema.prisma  # Modelo de datos
    │   └── seed.ts        # Carga inicial: usuarios, equipos, jornadas y contenido del club
    └── src/
        ├── app/
        │   ├── (público)            /, /club, /plantilla, /estadisticas, /calendario
        │   ├── login, /cuenta       Acceso y cambio de contraseña
        │   ├── /partidos/[id]       Ficha de partido + marcar disponibilidad
        │   ├── /entrenamientos      Entrenamientos semanales (apuntarse)
        │   └── /panel/**            Directiva/Capitán: jugadores, patrocinadores, partidos,
        │                            alineación (drag & drop), resultados, notificaciones
        ├── auth.ts / auth.config.ts  Configuración de Auth.js (NextAuth v5)
        ├── middleware.ts             Protege /panel, /entrenamientos y /cuenta
        ├── components/               Hero, Navbar, tarjetas, animaciones, tablero de alineación
        └── lib/                      Prisma client, reglas de negocio (resultados, permisos, etc.)
```

**Stack elegido y por qué:**
- **Next.js 14 (App Router) + TypeScript + Tailwind CSS**: Server Components para las páginas de
  datos, Server Actions para las mutaciones (crear jugador, marcar disponibilidad, fijar resultado...).
- **Framer Motion**: animaciones de scroll-reveal, parallax en el hero, contadores animados.
- **PostgreSQL + Prisma ORM**: esquema tipado, `prisma db push` para sincronizar en local/demo.
- **Auth.js (NextAuth v5) + bcrypt**: login con usuario/contraseña (sin auto-registro, tal como se
  pidió), sesión JWT con rol y equipos incrustados.
- **@dnd-kit**: tablero de alineación por arrastrar-soltar en el panel de capitán/directiva.
- **Docker Compose**: `db`, `web` y `adminer` (explorador de BD en `localhost:8080`).

## Puesta en marcha (Docker)

```bash
cp .env.example .env   # ya está copiado en este repo, revísalo si quieres cambiar credenciales
docker compose up -d --build
```

- Web: http://localhost:3000
- Adminer: http://localhost:8080 (servidor `db`, usuario/clave/BD según tu `.env`)

Al arrancar, `web` sincroniza el esquema (`prisma db push`) y **siembra la base de datos
automáticamente** en cada arranque (ver "Próximas iteraciones" — cuando el panel sea la fuente de
verdad, dejaremos de resembrar en cada `docker compose up`).

### Credenciales de prueba (solo desarrollo)

Todas las cuentas migradas usan la contraseña **`invictus2026`**.

| Nombre | Usuario | Rol |
|---|---|---|
| Directiva Invictus | `directiva` | Directiva (cuenta genérica, no es un jugador real) |
| Jose Manuel | `jose.manuel` | **Capitán** de Veteranos Senior |
| Javier Hernandez | `javier.hernandez` | Jugador |
| Jesus Cortes Langa | `jesus.cortes` | Jugador |
| Javier Angos | `javier.angos` | Jugador |
| Jose Angel Mores | `jose.mores` | Jugador |
| Chema Cortes | `chema.cortes` | Jugador |
| Jose Luis Piquer | `jose.piquer` | Jugador |
| Marco | `marco` | Jugador |
| Carlos Saenz | `carlos.saenz` | Jugador |
| Carlos Martinez | `carlos.martinez` | Jugador |
| Jose Maria Jover Gomez | `jose.jover` | Jugador |
| Alberto Perez | `alberto.perez` | Jugador |
| Ruben Aguilar | `ruben.aguilar` | Jugador |
| Diego Chocarro | `diego.chocarro` | Jugador |
| Lorenzo Linares | `lorenzo.linares` | Jugador |
| Moises Beltran | `moises.beltran` | Jugador |
| JJ | `jj` | Jugador |
| Angel Garcia | `angel.garcia` | Jugador |
| Jesus Roman | `jesus.roman` | Jugador |
| German | `german` | Jugador |
| Fran | `fran` | Jugador |

⚠️ Cambia estas contraseñas (o crea cuentas reales desde el panel de directiva) antes de usar esto
fuera de tu máquina.

## Desarrollo local sin Docker (opcional)

```bash
cd web
npm install
npm run prisma:generate
# con Postgres local levantado y DATABASE_URL/AUTH_SECRET en .env:
npm run db:setup   # prisma db push + seed
npm run dev
```

## Despliegue público gratuito (Vercel + Neon)

Docker Compose es para local. Para que la web sea accesible por internet sin coste recurrente:
**Vercel** (hosting del sitio) + **Neon** (PostgreSQL gestionado, capa gratuita sin caducidad).

> ⚠️ Antes de desplegar: la base de datos de producción **no debe resembrarse nunca
> automáticamente** (a diferencia de Docker en local, que reinicia los datos a propósito en cada
> arranque). `prisma/seed.ts` ya rechaza ejecutarse si detecta `NODE_ENV=production` salvo que se
> le pase explícitamente `CONFIRM_SEED=yes` — es la salvaguarda para que un despliegue no borre
> nunca los datos reales del club.

1. **Crea la base de datos en Neon** ([neon.tech](https://neon.tech), plan gratis): crea un proyecto,
   copia la cadena de conexión **"Pooled connection"** (recomendada para entornos serverless como
   Vercel).
2. **Importa el repo en Vercel** ([vercel.com](https://vercel.com) → "Add New Project" → conecta tu
   cuenta de GitHub → selecciona `carlosalejoss/INVICTUS`).
   - En "Root Directory" selecciona **`web`** (el proyecto Next.js vive en ese subdirectorio, no en
     la raíz del repo).
   - Framework se detecta solo como Next.js; no hace falta tocar el build command.
3. **Variables de entorno** en Vercel (Project Settings → Environment Variables):
   - `DATABASE_URL` → la cadena "Pooled connection" de Neon.
   - `AUTH_SECRET` → un secreto nuevo y real, **no** el de `.env.example`. Genéralo con
     `openssl rand -base64 32`.
   - (Opcional) `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`,
     `NOTIFY_EMAIL_TO` si quieres que las notificaciones de "hace falta otra pista" lleguen también
     por email (si no las configuras, la web sigue funcionando y solo se queda el aviso dentro del
     panel de directiva).
4. **Deploy**. Vercel instala dependencias (esto ejecuta `prisma generate` automáticamente vía el
   script `postinstall`) y construye el sitio.
5. **Siembra la base de datos una sola vez** (crea las tablas y carga jugadores/equipos/temporada).
   Desde tu máquina, con el `DATABASE_URL` de Neon:
   ```bash
   cd web
   DATABASE_URL="<pooled-connection-de-neon>" CONFIRM_SEED=yes npm run db:setup
   ```
   No vuelvas a ejecutar esto contra producción salvo que quieras **borrar y resetear todo** a los
   datos de ejemplo — es exactamente lo que hace.

Con eso el sitio queda público en `tu-proyecto.vercel.app` (dominio propio opcional, configurable
después en Vercel → Domains). Los pushes a `main` en GitHub despliegan automáticamente.

## Roles y permisos

- **Visitante sin sesión ("no jugador")**: ve todo el sitio público (inicio, club, plantilla,
  estadísticas, calendario) y puede abrir la ficha de un partido (`/partidos/[id]`), pero no puede
  marcar disponibilidad ni acceder a `/panel` o `/entrenamientos`.
- **Jugador**: además, puede iniciar sesión, cambiar su contraseña, marcar disponible/no disponible
  en los partidos de su equipo y apuntarse a entrenamientos.
- **Capitán**: todo lo anterior + `/panel` para el/los equipo(s) que capitanea: crear partidos,
  construir la alineación (arrastrar jugadores a "Pareja 95/100/105" o "Pareja 1/2/3"), y subir el
  resultado de cada pareja tras jugar.
- **Directiva**: todo lo anterior para **todos** los equipos, más gestión de jugadores (alta, edición,
  baja lógica que conserva el histórico), patrocinadores y el panel de notificaciones.

## Reglas de negocio implementadas

- **Resultado de una jornada**: se decide en cuanto **2 de las 3 parejas** ganan (no hace falta que
  la tercera se juegue/registre). Una casilla sin resultado en un partido ya jugado cuenta como
  derrota de esa pareja — así se migró la temporada pasada y así se calculan también los partidos
  nuevos (`fixtureOutcome` en `web/src/lib/matches.ts`).
- **Edad mínima por pareja (solo equipos de veteranos)**: al arrastrar un jugador al hueco de una
  categoría ("Pareja 95/100/105"), si la suma de edades de la pareja no llega al mínimo de esa
  categoría, la web bloquea el hueco y avisa. Los equipos absolutos no tienen esta restricción.
- **Entrenamientos**: se generan automáticamente las próximas 4 semanas de miércoles (16:30, 18:00,
  19:30, 21:00) en cuanto alguien visita `/entrenamientos` — no hay un cron real corriendo, la propia
  visita a la página "rellena" las semanas que falten (idempotente). Apuntarse no tiene límite; cada
  vez que una franja pasa de un múltiplo de 4 apuntados se avisa a directiva (aviso en la web +
  intento de email) de que hace falta otra pista.
- **Plazo de convocatoria**: cada partido de liga puede llevar una fecha límite para apuntarse
  (pensada para el miércoles 18:00 previo, pero editable); pasado ese plazo, `setAvailability` lo
  rechaza y la web lo indica.

## Origen de los datos

- **Jugadores, posiciones, parejas, jornadas y resultados**: migrados desde
  `AA VETERANOS SENIOR CLUB.numbers` (hojas `PAREJAS`, `Hoja 1`, `COMBINACIONES DERECHAS/REVESES`).
- **Nombre del club, ciudad y nº de equipos/seguidores**: tomados de la bio pública de Instagram
  [@invictuspadel](https://www.instagram.com/invictuspadel/).
- **Roles, login, partidos con convocatoria, alineación por arrastre, entrenamientos y
  patrocinadores**: funcionalidades y correcciones especificadas en `USUARIOS.docx`.

### ⚠️ Supuestos e invenciones a validar

- El Excel original registra un partido **"contra Invictus"** en las jornadas 1 y 10. Se ha asumido
  que es el calendario real de "Veteranos Senior" (posible errata o nombre de competición) — dínoslo
  si hay que corregirlo.
- **Capitán de Veteranos Senior**: confirmado, es **Jose Manuel**.
- **Jornada 17**: es la única de las 18 sin jugar. El Excel no traía rival/fecha/hora para ella, así
  que se creó con rival "Por confirmar" — complétala desde `/panel/partidos` o edítala directamente.
- **Jornada 11** se perdió administrativamente por "error en la alineación" (nota literal del Excel,
  sin parejas registradas); se guardó como resultado manual (derrota) en vez de por parejas.
- **Año de fundación (2018)**, la descripción larga del club y los 4 "valores" del club son contenido
  de ejemplo inventado (marcado `INVENTADO` en `seed.ts`).
- Se crearon los 5 equipos del club (3 veteranos + 2 absolutos), pero solo **Veteranos Senior** tiene
  jugadores y calendario reales; los otros 4 están vacíos, listos para rellenar desde el panel.
- **Logo del club**: los archivos reales (`web/public/branding/`) sustituyen al escudo de ejemplo que
  se usó en la primera iteración.
- **Patrocinadores**: los 7 logos reales facilitados por el club están en `web/public/sponsors/` y
  sembrados en la base de datos; añade/gestiona más desde `/panel/patrocinadores`.
- Cuentas de jugador (usuario/contraseña) son generadas para la demo, no las reales del club.

## Próximas iteraciones (ideas)

- Dejar de resembrar en cada arranque una vez el panel sea la fuente de verdad del contenido.
- Migrar de `prisma db push` a migraciones versionadas (`prisma migrate`) de cara a producción.
- Selector de equipo en las páginas públicas (plantilla/estadísticas/calendario) para cuando los
  otros 4 equipos tengan datos.
- Historial/edición de convocatorias pasadas, subir foto de jugador, recuperación de contraseña
  por email.
