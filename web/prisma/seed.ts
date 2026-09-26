import { PrismaClient, Position, MatchResult, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEASON = "2025/2026";

// DEV-ONLY password shared by every seeded account. Change these credentials (or better, recreate
// the real accounts from the directiva panel) before using this outside a local demo.
const SEED_PASSWORD = "invictus2026";

const TEAMS = [
  { name: "Veteranos Senior", category: "Veteranos +45 / Senior", season: SEASON, ageRestricted: true },
  { name: "Veteranos 2", category: "Veteranos", season: SEASON, ageRestricted: true },
  { name: "Veteranos 3", category: "Veteranos", season: SEASON, ageRestricted: true },
  { name: "Absoluto 1", category: "Absoluto", season: SEASON, ageRestricted: false },
  { name: "Absoluto 2", category: "Absoluto", season: SEASON, ageRestricted: false },
];

// Roster + season stats, migrated from "AA VETERANOS SENIOR CLUB.numbers" (hojas PAREJAS / Hoja 1 /
// COMBINACIONES). Every player becomes a login-capable User. `username` is generated for the demo
// (there's no real one in the source spreadsheet) -- flagged in the project README.
// CAPITAN: Jose Manuel, per the club.
const PLAYERS: Array<{
  name: string;
  username: string;
  role: Role;
  birthYear: number | null;
  age: number | null; // used only to approximate fechaNacimiento when birthYear is unknown
  position: Position | null;
}> = [
  { name: "Javier Hernandez", username: "javier.hernandez", role: "JUGADOR", birthYear: null, age: 42, position: "REVES" },
  { name: "Jesus Cortes Langa", username: "jesus.cortes", role: "JUGADOR", birthYear: null, age: 42, position: "REVES" },
  { name: "Javier Angos", username: "javier.angos", role: "JUGADOR", birthYear: 1979, age: 47, position: "REVES" },
  { name: "Jose Angel Mores", username: "jose.mores", role: "JUGADOR", birthYear: null, age: 46, position: "REVES" },
  { name: "Chema Cortes", username: "chema.cortes", role: "JUGADOR", birthYear: 1977, age: 49, position: "REVES" },
  { name: "Jose Luis Piquer", username: "jose.piquer", role: "JUGADOR", birthYear: null, age: 50, position: "REVES" },
  { name: "Marco", username: "marco", role: "JUGADOR", birthYear: 1974, age: 52, position: "REVES" },
  { name: "Carlos Saenz", username: "carlos.saenz", role: "JUGADOR", birthYear: 1971, age: 55, position: "REVES" },
  { name: "Carlos Martinez", username: "carlos.martinez", role: "JUGADOR", birthYear: 1970, age: 56, position: "REVES" },
  { name: "Jose Maria Jover Gomez", username: "jose.jover", role: "JUGADOR", birthYear: null, age: 60, position: "REVES" },
  { name: "Alberto Perez", username: "alberto.perez", role: "JUGADOR", birthYear: null, age: 43, position: "DERECHA" },
  { name: "Ruben Aguilar", username: "ruben.aguilar", role: "JUGADOR", birthYear: 1982, age: 44, position: "DERECHA" },
  { name: "Diego Chocarro", username: "diego.chocarro", role: "JUGADOR", birthYear: 1981, age: 45, position: "DERECHA" },
  { name: "Lorenzo Linares", username: "lorenzo.linares", role: "JUGADOR", birthYear: null, age: 49, position: "DERECHA" },
  { name: "Moises Beltran", username: "moises.beltran", role: "JUGADOR", birthYear: 1976, age: 50, position: "DERECHA" },
  { name: "JJ", username: "jj", role: "JUGADOR", birthYear: null, age: 52, position: "DERECHA" },
  { name: "Jose Manuel", username: "jose.manuel", role: "CAPITAN", birthYear: 1971, age: 55, position: "DERECHA" },
  { name: "Angel Garcia", username: "angel.garcia", role: "JUGADOR", birthYear: 1970, age: 56, position: "DERECHA" },
  { name: "Jesus Roman", username: "jesus.roman", role: "JUGADOR", birthYear: 1969, age: 57, position: "DERECHA" },
  { name: "German", username: "german", role: "JUGADOR", birthYear: null, age: 61, position: "DERECHA" },
  { name: "Fran", username: "fran", role: "JUGADOR", birthYear: null, age: 60, position: "DERECHA" },
];

// Some pair rows in the original sheet used slightly different spellings for the same player.
const NAME_ALIASES: Record<string, string> = {
  "JAVIER ANGOS": "Javier Angos",
  "CARLOS SAENZ": "Carlos Saenz",
  "CARLOS SANEZ": "Carlos Saenz",
  "JOSE MARIA JOVER GOMEZ": "Jose Maria Jover Gomez",
  "JOSE MARIA JOVER": "Jose Maria Jover Gomez",
  JJ: "JJ", // kept upper-case: title-casing this 2-letter nickname would otherwise mangle it into "Jj".
};

function normalizeName(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  const upper = trimmed.toUpperCase();
  if (NAME_ALIASES[upper]) return NAME_ALIASES[upper];
  return trimmed
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

type PairSeed = { category: string; combinedAge: number | null; reves: string; derecha: string; result: boolean | null };
type FixtureSeed = {
  jornada: number;
  opponent: string | null;
  pairs: PairSeed[];
  manualResult?: "WON" | "LOST";
  note?: string;
};

// Calendar migrated from the "PAREJAS" sheet (jornada-by-jornada pair assignments and results).
// result: true = won, false = lost, null = genuinely not played yet.
// IMPORTANT rule (confirmed by the club): a blank result cell in an ALREADY PLAYED jornada counts
// as a loss for that pair (captains stopped recording a pair once the tie was mathematically
// decided by the other two). Applying that rule here reproduces the "Hoja 1" stats table exactly.
// Jornada 17 is the only one not played yet, so its pairs are left as `null` (genuinely pending).
const FIXTURES: FixtureSeed[] = [
  { jornada: 1, opponent: "C.D. Invictus", pairs: [
    { category: "Pareja 95", combinedAge: 97, reves: "JAVIER HERNANDEZ", derecha: "JOSE MANUEL", result: false },
    { category: "Pareja 100", combinedAge: 100, reves: "CARLOS MARTINEZ", derecha: "RUBEN AGUILAR", result: false },
    { category: "Pareja 105", combinedAge: 106, reves: "CHEMA CORTES", derecha: "JESUS ROMAN", result: false },
  ]},
  { jornada: 2, opponent: "Good Training", pairs: [
    { category: "Pareja 95", combinedAge: 96, reves: "JAVIER ANGOS", derecha: "LORENZO LINARES", result: false },
    { category: "Pareja 100", combinedAge: 101, reves: "CARLOS MARTINEZ", derecha: "DIEGO CHOCARRO", result: true },
    { category: "Pareja 105", combinedAge: 106, reves: "CHEMA CORTES", derecha: "JESUS ROMAN", result: false },
  ]},
  { jornada: 3, opponent: "SEIBAT", pairs: [
    { category: "Pareja 95", combinedAge: 99, reves: "JAVIER HERNANDEZ", derecha: "JESUS ROMAN", result: false },
    { category: "Pareja 100", combinedAge: 101, reves: "CARLOS MARTINEZ", derecha: "DIEGO CHOCARRO", result: false },
    { category: "Pareja 105", combinedAge: 107, reves: "JAVIER ANGOS", derecha: "FRAN", result: false },
  ]},
  { jornada: 4, opponent: "Padeltroters", pairs: [
    { category: "Pareja 95", combinedAge: 100, reves: "CARLOS MARTINEZ", derecha: "RUBEN AGUILAR", result: false },
    { category: "Pareja 100", combinedAge: 104, reves: "JAVIER ANGOS", derecha: "JESUS ROMAN", result: false },
    { category: "Pareja 105", combinedAge: 105, reves: "JOSE MANUEL", derecha: "MOISES BELTRAN", result: false },
  ]},
  { jornada: 5, opponent: "Portazgo", pairs: [
    { category: "Pareja 95", combinedAge: 97, reves: "JAVIER HERNANDEZ", derecha: "JOSE MANUEL", result: false },
    { category: "Pareja 100", combinedAge: 101, reves: "CARLOS MARTINEZ", derecha: "DIEGO CHOCARRO", result: false },
    { category: "Pareja 105", combinedAge: 106, reves: "MOISES BELTRAN", derecha: "ANGEL GARCIA", result: false },
  ]},
  { jornada: 6, opponent: "Teruel", pairs: [
    { category: "Pareja 95", combinedAge: 99, reves: "JAVIER HERNANDEZ", derecha: "JESUS ROMAN", result: true },
    { category: "Pareja 100", combinedAge: 103, reves: "JAVIER ANGOS", derecha: "ANGEL GARCIA", result: false },
    { category: "Pareja 105", combinedAge: 106, reves: "CARLOS MARTINEZ", derecha: "MOISES BELTRAN", result: true },
  ]},
  { jornada: 7, opponent: "Huesca", pairs: [
    { category: "Pareja 95", combinedAge: 97, reves: "JAVIER HERNANDEZ", derecha: "JOSE MANUEL", result: true },
    { category: "Pareja 100", combinedAge: 103, reves: "JAVIER ANGOS", derecha: "ANGEL GARCIA", result: false },
    { category: "Pareja 105", combinedAge: 105, reves: "CARLOS MARTINEZ", derecha: "LORENZO LINARES", result: false },
  ]},
  { jornada: 8, opponent: "Regal", pairs: [
    { category: "Pareja 95", combinedAge: 99, reves: "JAVIER HERNANDEZ", derecha: "JESUS ROMAN", result: true },
    { category: "Pareja 100", combinedAge: 102, reves: "JAVIER ANGOS", derecha: "JOSE MANUEL", result: true },
    { category: "Pareja 105", combinedAge: 108, reves: "MARCO", derecha: "ANGEL GARCIA", result: false },
  ]},
  { jornada: 9, opponent: "RCTZ", pairs: [
    { category: "Pareja 95", combinedAge: 99, reves: "JAVIER HERNANDEZ", derecha: "JESUS ROMAN", result: true },
    { category: "Pareja 100", combinedAge: 103, reves: "JAVIER ANGOS", derecha: "ANGEL GARCIA", result: true },
    { category: "Pareja 105", combinedAge: 106, reves: "CARLOS MARTINEZ", derecha: "MOISES BELTRAN", result: false },
  ]},
  { jornada: 10, opponent: "C.D. Invictus", pairs: [
    { category: "Pareja 95", combinedAge: 99, reves: "JAVIER HERNANDEZ", derecha: "JESUS ROMAN", result: false },
    { category: "Pareja 100", combinedAge: 102, reves: "JAVIER ANGOS", derecha: "JOSE MANUEL", result: false },
    { category: "Pareja 105", combinedAge: 106, reves: "CARLOS MARTINEZ", derecha: "MOISES BELTRAN", result: false },
  ]},
  {
    jornada: 11,
    opponent: "Good Training",
    pairs: [],
    manualResult: "LOST",
    note: "Derrota administrativa: error en la alineación presentada.",
  },
  { jornada: 12, opponent: "SEIBAT", pairs: [
    { category: "Pareja 95", combinedAge: 95, reves: "DIEGO CHOCARRO", derecha: "MOISES BELTRAN", result: false },
    { category: "Pareja 100", combinedAge: 101, reves: "RUBEN AGUILAR", derecha: "JESUS ROMAN", result: false },
    { category: "Pareja 105", combinedAge: 115, reves: "JOSE MANUEL", derecha: "FRAN", result: false },
  ]},
  { jornada: 13, opponent: "Padeltroters", pairs: [
    { category: "Pareja 95", combinedAge: 106, reves: "CARLOS MARTINEZ", derecha: "MOISES BELTRAN", result: true },
    { category: "Pareja 100", combinedAge: 102, reves: "JAVIER ANGOS", derecha: "JOSE MANUEL", result: true },
    { category: "Pareja 105", combinedAge: 106, reves: "CHEMA CORTES", derecha: "JESUS ROMAN", result: true },
  ]},
  { jornada: 14, opponent: "Portazgo", pairs: [
    { category: "Pareja 95", combinedAge: 99, reves: "JAVIER HERNANDEZ", derecha: "JESUS ROMAN", result: false },
    { category: "Pareja 100", combinedAge: 107, reves: "JOSE MANUEL", derecha: "JJ", result: false },
    { category: "Pareja 105", combinedAge: 106, reves: "CARLOS MARTINEZ", derecha: "MOISES BELTRAN", result: false },
  ]},
  { jornada: 15, opponent: "Teruel", pairs: [
    { category: "Pareja 95", combinedAge: 97, reves: "JESUS CORTES LANGA", derecha: "JOSE MANUEL", result: true },
    { category: "Pareja 100", combinedAge: 102, reves: "MARCO", derecha: "MOISES BELTRAN", result: false },
    { category: "Pareja 105", combinedAge: 105, reves: "CARLOS MARTINEZ", derecha: "LORENZO LINARES", result: false },
  ]},
  { jornada: 16, opponent: "Huesca", pairs: [
    { category: "Pareja 95", combinedAge: 98, reves: "ALBERTO PEREZ", derecha: "JOSE MANUEL", result: true },
    { category: "Pareja 100", combinedAge: 106, reves: "CHEMA CORTES", derecha: "JESUS ROMAN", result: false },
    { category: "Pareja 105", combinedAge: 106, reves: "CARLOS MARTINEZ", derecha: "MOISES BELTRAN", result: true },
  ]},
  {
    // Not played yet -- the only jornada still pending this season. No opponent/date recorded in
    // the source sheet; create the real match from the directiva/capitán panel once scheduled.
    jornada: 17,
    opponent: null,
    pairs: [
      { category: "Pareja 95", combinedAge: 104, reves: "JAVIER ANGOS", derecha: "JESUS ROMAN", result: null },
      { category: "Pareja 100", combinedAge: 106, reves: "MOISES BELTRAN", derecha: "ANGEL GARCIA", result: null },
      { category: "Pareja 105", combinedAge: 109, reves: "CHEMA CORTES", derecha: "FRAN", result: null },
    ],
  },
  { jornada: 18, opponent: "RCTZ", pairs: [
    { category: "Pareja 95", combinedAge: 112, reves: "JOSE MARIA JOVER GOMEZ", derecha: "JJ", result: false },
    { category: "Pareja 100", combinedAge: 100, reves: "DIEGO CHOCARRO", derecha: "JOSE MANUEL", result: true },
    { category: "Pareja 105", combinedAge: 106, reves: "CARLOS MARTINEZ", derecha: "MOISES BELTRAN", result: true },
  ]},
];

// --- Club-level content. Real facts come from the club's public Instagram (@invictuspadel).
// Anything not published there (founding year, description copy, contact info) is INVENTED
// as reasonable placeholder content -- flagged here so it's easy to find and replace later.
const CLUB_INFO = {
  name: "Invictus Padel Club",
  tagline: "Un club, cinco equipos, una misma actitud.",
  city: "Zaragoza",
  founded: 2018, // INVENTADO: año de fundación no confirmado, ajustar cuando se conozca el dato real.
  description:
    "Invictus Padel Club es un club de amigos de pádel de Zaragoza. Competimos con cinco equipos federados " +
    "-tres en categoría veteranos y dos en categoría absoluta- con un espíritu de equipo, compañerismo y ganas " +
    "de mejorar partido a partido.", // Parafraseado a partir de la bio pública de Instagram.
  instagramUrl: "https://www.instagram.com/invictuspadel/",
  teamsCount: 5,
  veteranTeams: 3,
  absoluteTeams: 2,
  followers: 1806,
};

// INVENTADO: valores/pilares del club de ejemplo, pendientes de validar con el cliente.
const VALUES = [
  { title: "Compañerismo", description: "Un vestuario unido dentro y fuera de la pista, por encima del resultado.", icon: "handshake", order: 1 },
  { title: "Competitividad", description: "Cinco equipos federados que compiten cada jornada por dejar el nombre de Invictus bien alto.", icon: "trophy", order: 2 },
  { title: "Progreso constante", description: "Análisis de parejas, rivales y estadísticas para mejorar en cada categoría.", icon: "chart", order: 3 },
  { title: "Pasión por el pádel", description: "Una comunidad de más de 1.800 seguidores que vive el pádel como algo más que un deporte.", icon: "heart", order: 4 },
];

// Real sponsor logos provided by the club, served from /public/sponsors.
const SPONSORS = [
  { name: "La Junquera", logoUrl: "/sponsors/junquera.jpg", order: 1 },
  { name: "Oleny Congelados", logoUrl: "/sponsors/oleny.jpg", order: 2 },
  { name: "Libra Abogados y Asesores", logoUrl: "/sponsors/libra.jpg", order: 3 },
  { name: "Hotel Cesaraugusta", logoUrl: "/sponsors/cesaraugusta.jpg", order: 4 },
  { name: "Home17 Inmobiliaria", logoUrl: "/sponsors/home17.jpg", order: 5 },
  { name: "Afilador Aragonesa", logoUrl: "/sponsors/afilador-aragonesa.jpg", order: 6 },
  { name: "Daxia", logoUrl: "/sponsors/daxia.jpg", order: 7 },
];

function toMatchResult(result: boolean | null): MatchResult {
  if (result === true) return MatchResult.WON;
  if (result === false) return MatchResult.LOST;
  return MatchResult.PENDING;
}

// Only the year is known for most players (source sheet gives birth year OR current age, never a
// full date), so every fechaNacimiento here is January 1st of the relevant year -- an approximation.
function approximateBirthDate(birthYear: number | null, age: number | null): Date | null {
  const year = birthYear ?? (age !== null ? SEASON_REFERENCE_YEAR - age : null);
  if (year === null) return null;
  return new Date(Date.UTC(year, 0, 1));
}

const SEASON_REFERENCE_YEAR = 2026;

async function main() {
  // Safety guard: this script WIPES every table before reloading demo data. That's fine against a
  // local/dev database, but must never run unattended against a real production DB (e.g. Neon) --
  // require an explicit opt-in there so a stray `npm run db:setup` can't destroy live club data.
  if (process.env.NODE_ENV === "production" && process.env.CONFIRM_SEED !== "yes") {
    console.error(
      "Refusing to seed: NODE_ENV=production. If you really want to reset this database, re-run with CONFIRM_SEED=yes."
    );
    process.exit(1);
  }

  console.log("Seeding database...");

  await prisma.notification.deleteMany();
  await prisma.trainingSignup.deleteMany();
  await prisma.trainingSession.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.fixturePair.deleteMany();
  await prisma.fixture.deleteMany();
  await prisma.teamMembership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.clubInfo.deleteMany();
  await prisma.value.deleteMany();
  await prisma.sponsor.deleteMany();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const teamsByName = new Map<string, string>(); // name -> id
  for (const t of TEAMS) {
    const created = await prisma.team.create({ data: t });
    teamsByName.set(t.name, created.id);
  }
  const veteranosSeniorId = teamsByName.get("Veteranos Senior")!;

  const usersByName = new Map<string, string>(); // normalized full name -> id
  for (const p of PLAYERS) {
    const created = await prisma.user.create({
      data: {
        username: p.username,
        passwordHash,
        role: p.role,
        nombre: p.name.split(" ")[0],
        apellidos: p.name.split(" ").slice(1).join(" "),
        fechaNacimiento: approximateBirthDate(p.birthYear, p.age),
        position: p.position,
      },
    });
    usersByName.set(p.name, created.id);
    await prisma.teamMembership.create({
      data: { userId: created.id, teamId: veteranosSeniorId, isCaptain: p.role === "CAPITAN" },
    });
  }

  // Standalone directiva account (not a real player) for logging in to the panel.
  await prisma.user.create({
    data: {
      username: "directiva",
      passwordHash,
      role: "DIRECTIVA",
      nombre: "Directiva",
      apellidos: "Invictus",
    },
  });

  // Any player referenced in a fixture pair but missing from the roster gets created on the fly.
  async function resolvePlayerId(rawName: string): Promise<string> {
    const normalized = normalizeName(rawName);
    const existing = usersByName.get(normalized);
    if (existing) return existing;
    const created = await prisma.user.create({
      data: { username: normalized.toLowerCase().replace(/\s+/g, "."), passwordHash, role: "JUGADOR", nombre: normalized, apellidos: "" },
    });
    usersByName.set(normalized, created.id);
    return created.id;
  }

  for (const fx of FIXTURES) {
    const fixture = await prisma.fixture.create({
      data: {
        jornada: fx.jornada,
        opponent: fx.opponent,
        teamId: veteranosSeniorId,
        manualResult: fx.manualResult ? MatchResult[fx.manualResult] : null,
        note: fx.note,
      },
    });

    for (const pair of fx.pairs) {
      const revesId = await resolvePlayerId(pair.reves);
      const derechaId = await resolvePlayerId(pair.derecha);
      await prisma.fixturePair.create({
        data: {
          category: pair.category,
          combinedAge: pair.combinedAge,
          result: toMatchResult(pair.result),
          fixtureId: fixture.id,
          revesPlayerId: revesId,
          derechaPlayerId: derechaId,
        },
      });
    }
  }

  await prisma.clubInfo.create({ data: CLUB_INFO });
  for (const v of VALUES) {
    await prisma.value.create({ data: v });
  }
  for (const s of SPONSORS) {
    await prisma.sponsor.create({ data: s });
  }

  console.log(`Seed complete: ${PLAYERS.length + 1} users, ${TEAMS.length} teams, ${FIXTURES.length} fixtures, ${SPONSORS.length} sponsors.`);
  console.log(`Dev login: any username above (e.g. "directiva" / "jose.manuel") with password "${SEED_PASSWORD}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
