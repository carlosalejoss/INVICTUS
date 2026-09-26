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

Todas las cuentas migradas usan la contraseña **`invictus2026`**. Usuarios de ejemplo:

| Usuario | Rol | Nota |
|---|---|---|
| `directiva` | Directiva | Cuenta genérica, no es un jugador real |
| `carlos.martinez` | Capitán | Capitán de "Veteranos Senior" (dato inventado, ver más abajo) |
| `javier.hernandez`, `jose.manuel`, ... | Jugador | Resto de la plantilla migrada |

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
- **Capitán de Veteranos Senior**: no venía indicado en el Excel; se asignó a **Carlos Martínez**
  (el jugador con más partidos) como placeholder. Cámbialo desde `/panel/jugadores` o dinos quién es
  el real y ajustamos el seed.
- **Jornada 17**: es la única de las 18 sin jugar. El Excel no traía rival/fecha/hora para ella, así
  que se creó con rival "Por confirmar" — complétala desde `/panel/partidos` o edítala directamente.
- **Jornada 11** se perdió administrativamente por "error en la alineación" (nota literal del Excel,
  sin parejas registradas); se guardó como resultado manual (derrota) en vez de por parejas.
- **Año de fundación (2018)**, la descripción larga del club y los 4 "valores" del club son contenido
  de ejemplo inventado (marcado `INVENTADO` en `seed.ts`).
- Se crearon los 5 equipos del club (3 veteranos + 2 absolutos), pero solo **Veteranos Senior** tiene
  jugadores y calendario reales; los otros 4 están vacíos, listos para rellenar desde el panel.
- **Patrocinadores**: la tabla se deja vacía (no había datos reales); añádelos desde
  `/panel/patrocinadores` con nombre + logo y aparecerán automáticamente en la home.
- Cuentas de jugador (usuario/contraseña) son generadas para la demo, no las reales del club.

## Próximas iteraciones (ideas)

- Dejar de resembrar en cada arranque una vez el panel sea la fuente de verdad del contenido.
- Migrar de `prisma db push` a migraciones versionadas (`prisma migrate`) de cara a producción.
- Selector de equipo en las páginas públicas (plantilla/estadísticas/calendario) para cuando los
  otros 4 equipos tengan datos.
- Historial/edición de convocatorias pasadas, subir foto de jugador, recuperación de contraseña
  por email.
