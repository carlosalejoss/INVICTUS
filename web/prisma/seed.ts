import { PrismaClient, Position, MatchResult } from "@prisma/client";

const prisma = new PrismaClient();

const TEAM = { name: "Veteranos Senior", category: "Veteranos +45 / Senior", season: "2025/2026" };

// Roster + season stats, migrated from "AA VETERANOS SENIOR CLUB.numbers" (hojas PAREJAS / Hoja 1 / COMBINACIONES).
// Names are normalized (trimmed, de-duplicated spelling variants found in the original sheet).
const PLAYERS: Array<{
  name: string;
  birthYear: number | null;
  age: number | null;
  position: Position | null;
  played: number;
  won: number;
}> = [
  { name: "Javier Hernandez", birthYear: null, age: 42, position: "REVES", played: 9, won: 4 },
  { name: "Jesus Cortes Langa", birthYear: null, age: 42, position: "REVES", played: 1, won: 1 },
  { name: "Javier Angos", birthYear: 1979, age: 47, position: "REVES", played: 9, won: 3 },
  { name: "Jose Angel Mores", birthYear: null, age: 46, position: "REVES", played: 0, won: 0 },
  { name: "Chema Cortes", birthYear: 1977, age: 49, position: "REVES", played: 4, won: 1 },
  { name: "Jose Luis Piquer", birthYear: null, age: 50, position: "REVES", played: 0, won: 0 },
  { name: "Marco", birthYear: 1974, age: 52, position: "REVES", played: 2, won: 0 },
  { name: "Carlos Saenz", birthYear: 1971, age: 55, position: "REVES", played: 0, won: 0 },
  { name: "Carlos Martinez", birthYear: 1970, age: 56, position: "REVES", played: 14, won: 5 },
  { name: "Jose Maria Jover Gomez", birthYear: null, age: 60, position: "REVES", played: 1, won: 0 },
  { name: "Alberto Perez", birthYear: null, age: 43, position: "DERECHA", played: 1, won: 1 },
  { name: "Ruben Aguilar", birthYear: 1982, age: 44, position: "DERECHA", played: 3, won: 0 },
  { name: "Diego Chocarro", birthYear: 1981, age: 45, position: "DERECHA", played: 5, won: 2 },
  { name: "Lorenzo Linares", birthYear: null, age: 49, position: "DERECHA", played: 3, won: 0 },
  { name: "Moises Beltran", birthYear: 1976, age: 50, position: "DERECHA", played: 11, won: 4 },
  { name: "JJ", birthYear: null, age: 52, position: "DERECHA", played: 2, won: 0 },
  { name: "Jose Manuel", birthYear: 1971, age: 55, position: "DERECHA", played: 12, won: 6 },
  { name: "Angel Garcia", birthYear: 1970, age: 56, position: "DERECHA", played: 5, won: 1 },
  { name: "Jesus Roman", birthYear: 1969, age: 57, position: "DERECHA", played: 12, won: 4 },
  { name: "German", birthYear: null, age: 61, position: "DERECHA", played: 0, won: 0 },
  { name: "Fran", birthYear: null, age: 60, position: "DERECHA", played: 2, won: 0 },
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
  // Title-case fallback for names not in the roster/alias table (kept as their own player record).
  return trimmed
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// Calendar migrated from the "PAREJAS" sheet (jornada-by-jornada pair assignments and results).
// result: true = won, false = lost, null = not played yet / not recorded in the source sheet.
const FIXTURES: Array<{
  jornada: number;
  opponent: string;
  pairs: Array<{ category: string; combinedAge: number | null; reves: string; derecha: string; result: boolean | null }>;
}> = [
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
    { category: "Pareja 100", combinedAge: 103, reves: "JAVIER ANGOS", derecha: "ANGEL GARCIA", result: null },
    { category: "Pareja 105", combinedAge: 105, reves: "CARLOS MARTINEZ", derecha: "LORENZO LINARES", result: null },
  ]},
  { jornada: 8, opponent: "Regal", pairs: [
    { category: "Pareja 95", combinedAge: 99, reves: "JAVIER HERNANDEZ", derecha: "JESUS ROMAN", result: true },
    { category: "Pareja 100", combinedAge: 102, reves: "JAVIER ANGOS", derecha: "JOSE MANUEL", result: true },
    { category: "Pareja 105", combinedAge: 108, reves: "MARCO", derecha: "ANGEL GARCIA", result: null },
  ]},
  { jornada: 9, opponent: "RCTZ", pairs: [
    { category: "Pareja 95", combinedAge: 99, reves: "JAVIER HERNANDEZ", derecha: "JESUS ROMAN", result: true },
    { category: "Pareja 100", combinedAge: 103, reves: "JAVIER ANGOS", derecha: "ANGEL GARCIA", result: true },
    { category: "Pareja 105", combinedAge: 106, reves: "CARLOS MARTINEZ", derecha: "MOISES BELTRAN", result: null },
  ]},
  { jornada: 10, opponent: "C.D. Invictus", pairs: [
    { category: "Pareja 95", combinedAge: 99, reves: "JAVIER HERNANDEZ", derecha: "JESUS ROMAN", result: null },
    { category: "Pareja 100", combinedAge: 102, reves: "JAVIER ANGOS", derecha: "JOSE MANUEL", result: null },
    { category: "Pareja 105", combinedAge: 106, reves: "CARLOS MARTINEZ", derecha: "MOISES BELTRAN", result: null },
  ]},
  { jornada: 11, opponent: "Good Training", pairs: [] },
  { jornada: 12, opponent: "SEIBAT", pairs: [
    { category: "Pareja 95", combinedAge: 95, reves: "DIEGO CHOCARRO", derecha: "MOISES BELTRAN", result: null },
    { category: "Pareja 100", combinedAge: 101, reves: "RUBEN AGUILAR", derecha: "JESUS ROMAN", result: null },
    { category: "Pareja 105", combinedAge: 115, reves: "JOSE MANUEL", derecha: "FRAN", result: null },
  ]},
  { jornada: 13, opponent: "Padeltroters", pairs: [
    { category: "Pareja 95", combinedAge: 106, reves: "CARLOS MARTINEZ", derecha: "MOISES BELTRAN", result: true },
    { category: "Pareja 100", combinedAge: 102, reves: "JAVIER ANGOS", derecha: "JOSE MANUEL", result: true },
    { category: "Pareja 105", combinedAge: 106, reves: "CHEMA CORTES", derecha: "JESUS ROMAN", result: true },
  ]},
  { jornada: 14, opponent: "Portazgo", pairs: [
    { category: "Pareja 95", combinedAge: 99, reves: "JAVIER HERNANDEZ", derecha: "JESUS ROMAN", result: null },
    { category: "Pareja 100", combinedAge: 107, reves: "JOSE MANUEL", derecha: "JJ", result: null },
    { category: "Pareja 105", combinedAge: 106, reves: "CARLOS MARTINEZ", derecha: "MOISES BELTRAN", result: null },
  ]},
  { jornada: 15, opponent: "Teruel", pairs: [
    { category: "Pareja 95", combinedAge: 97, reves: "JESUS CORTES LANGA", derecha: "JOSE MANUEL", result: true },
    { category: "Pareja 100", combinedAge: 102, reves: "MARCO", derecha: "MOISES BELTRAN", result: null },
    { category: "Pareja 105", combinedAge: 105, reves: "CARLOS MARTINEZ", derecha: "LORENZO LINARES", result: null },
  ]},
  { jornada: 16, opponent: "Huesca", pairs: [
    { category: "Pareja 95", combinedAge: 98, reves: "ALBERTO PEREZ", derecha: "JOSE MANUEL", result: true },
    { category: "Pareja 100", combinedAge: 106, reves: "CHEMA CORTES", derecha: "JESUS ROMAN", result: null },
    { category: "Pareja 105", combinedAge: 106, reves: "CARLOS MARTINEZ", derecha: "MOISES BELTRAN", result: true },
  ]},
  { jornada: 18, opponent: "RCTZ", pairs: [
    { category: "Pareja 95", combinedAge: 112, reves: "JOSE MARIA JOVER GOMEZ", derecha: "JJ", result: null },
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

function toMatchResult(result: boolean | null): MatchResult {
  if (result === true) return MatchResult.WON;
  if (result === false) return MatchResult.LOST;
  return MatchResult.PENDING;
}

async function main() {
  console.log("Seeding database...");

  await prisma.fixturePair.deleteMany();
  await prisma.fixture.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.clubInfo.deleteMany();
  await prisma.value.deleteMany();

  const team = await prisma.team.create({ data: TEAM });

  const playersByName = new Map<string, string>(); // normalized name -> id
  for (const p of PLAYERS) {
    const created = await prisma.player.create({
      data: {
        fullName: p.name,
        birthYear: p.birthYear,
        age: p.age,
        position: p.position,
        matchesPlayed: p.played,
        matchesWon: p.won,
        teamId: team.id,
      },
    });
    playersByName.set(p.name, created.id);
  }

  // Any player referenced in a fixture pair but missing from the roster table gets created on the fly.
  async function resolvePlayerId(rawName: string): Promise<string> {
    const normalized = normalizeName(rawName);
    const existing = playersByName.get(normalized);
    if (existing) return existing;
    const created = await prisma.player.create({
      data: { fullName: normalized, teamId: team.id },
    });
    playersByName.set(normalized, created.id);
    return created.id;
  }

  for (const fx of FIXTURES) {
    const fixture = await prisma.fixture.create({
      data: { jornada: fx.jornada, opponent: fx.opponent, teamId: team.id },
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

  console.log(`Seed complete: ${PLAYERS.length} players, ${FIXTURES.length} fixtures.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
