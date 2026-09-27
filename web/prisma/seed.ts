import { PrismaClient, Position, MatchResult, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEASON = "2025/2026";

// DEV-ONLY password shared by every seeded account. Change these credentials (or better, recreate
// the real accounts from the directiva panel) before using this outside a local demo.
const SEED_PASSWORD = "invictus2026";

// The club's 5 official teams, migrated from "EQUIPOS INVICTUS.docx" (Liga de Aragón, temporada
// 2026). Team names are shortened for the site; full league/category text lives in `category`.
const TEAMS = [
  { name: "Invictus", category: "Absoluto · 2ª Categoría (Grupo B)", season: SEASON, ageRestricted: false },
  { name: "Invictus A", category: "Absoluto · 3ª Categoría (Grupo A)", season: SEASON, ageRestricted: false },
  { name: "Invictus Veteranos", category: "Veteranos · 1ª Categoría", season: SEASON, ageRestricted: true },
  { name: "Veteranos Senior", category: "Veteranos · 1ª Categoría (Senior)", season: SEASON, ageRestricted: true },
  { name: "Invictus X", category: "Veteranos · 2ª Categoría (Grupo A)", season: SEASON, ageRestricted: true },
];

type MasterPlayer = {
  username: string;
  nombre: string;
  apellidos: string;
  birthYear: number | null;
  position: Position | null;
  teams: string[];
  captainOf: string[];
  /**
   * The informal name used in "AA VETERANOS SENIOR CLUB.numbers" (the original Veteranos Senior
   * fixture history) when it differs from the official federation name below -- e.g. "Chema
   * Cortes" is officially "Jose Maria Cortes Atance". Needed so FIXTURES pair resolution still
   * finds the same player instead of creating a duplicate.
   */
  legacyMatchName?: string;
};

// Every club player across the 5 official teams (source: "EQUIPOS INVICTUS.docx", Liga de Aragón
// 2026). `position` and `birthYear`-as-username-continuity are only known for the 21 players
// already migrated from the Veteranos Senior season sheet; everyone else starts with no
// position/photo/side and fills that in themselves from `/cuenta` once they have a login.
// "Puntos" (ranking points) from the source document is intentionally not modeled -- not useful here.
const MASTER_PLAYERS: MasterPlayer[] = [
  { username: "raul.soler", nombre: "Raul", apellidos: "Soler Ruiz", birthYear: 1979, position: null, teams: ["Invictus", "Invictus Veteranos"], captainOf: [] },
  { username: "alvaro.mendez", nombre: "Alvaro", apellidos: "Mendez Maluenda", birthYear: 1975, position: null, teams: ["Invictus", "Invictus Veteranos"], captainOf: [] },
  { username: "david.lopez", nombre: "David", apellidos: "Lopez Rodriguez", birthYear: 1977, position: null, teams: ["Invictus", "Invictus Veteranos"], captainOf: [] },
  { username: "alberto.monterde", nombre: "Alberto", apellidos: "Monterde Florentin", birthYear: 1983, position: null, teams: ["Invictus", "Invictus Veteranos"], captainOf: [] },
  { username: "daniel.blanco", nombre: "Daniel", apellidos: "Blanco Gonzalez", birthYear: 1974, position: null, teams: ["Invictus", "Invictus Veteranos"], captainOf: [] },
  { username: "ignacio.moreno", nombre: "Ignacio", apellidos: "Moreno Budria", birthYear: 1988, position: null, teams: ["Invictus"], captainOf: [] },
  { username: "daniel.mendez", nombre: "Daniel", apellidos: "Mendez Luque", birthYear: 2001, position: null, teams: ["Invictus"], captainOf: [] },
  { username: "alvaro.pradas", nombre: "Alvaro", apellidos: "Pradas Luengo", birthYear: 1983, position: null, teams: ["Invictus"], captainOf: [] },
  { username: "cristian.lacosta", nombre: "Cristian", apellidos: "Lacosta Ruiz", birthYear: 1981, position: null, teams: ["Invictus", "Invictus Veteranos"], captainOf: [] },
  { username: "daniel.perez", nombre: "Daniel", apellidos: "Perez Ceballos", birthYear: 1975, position: null, teams: ["Invictus", "Invictus Veteranos"], captainOf: [] },
  { username: "carlos.domingo", nombre: "Carlos", apellidos: "Domingo Bailo", birthYear: 1978, position: null, teams: ["Invictus", "Invictus Veteranos"], captainOf: ["Invictus Veteranos"] },
  { username: "javier.montero", nombre: "Javier", apellidos: "Montero Villacampa", birthYear: 1988, position: null, teams: ["Invictus"], captainOf: [] },
  { username: "javier.hernandez", nombre: "Javier", apellidos: "Hernandez Abenia", birthYear: 1984, position: "REVES", teams: ["Invictus", "Veteranos Senior"], captainOf: [], legacyMatchName: "Javier Hernandez" },
  { username: "alvaro.morales", nombre: "Alvaro", apellidos: "Morales Clemente", birthYear: 2003, position: null, teams: ["Invictus"], captainOf: [] },
  { username: "pablo.sau", nombre: "Pablo", apellidos: "Sau Escudero", birthYear: 1992, position: null, teams: ["Invictus"], captainOf: [] },
  { username: "rafael.martinez", nombre: "Rafael", apellidos: "Martinez Solsona", birthYear: 1983, position: null, teams: ["Invictus", "Invictus Veteranos"], captainOf: [] },
  { username: "alvaro.heras", nombre: "Alvaro", apellidos: "Heras Monreal", birthYear: 1995, position: null, teams: ["Invictus"], captainOf: [] },
  { username: "chema.cortes", nombre: "Jose Maria", apellidos: "Cortes Atance", birthYear: 1977, position: "REVES", teams: ["Invictus", "Invictus A", "Veteranos Senior"], captainOf: ["Invictus"], legacyMatchName: "Chema Cortes" },
  { username: "david.martinez", nombre: "David", apellidos: "Martinez Alvarez", birthYear: 1987, position: null, teams: ["Invictus A"], captainOf: [] },
  { username: "victor.baldellou", nombre: "Victor", apellidos: "Baldellou Garcia", birthYear: 1978, position: null, teams: ["Invictus A", "Invictus Veteranos"], captainOf: [] },
  { username: "marco", nombre: "Marco Antonio", apellidos: "Franco Burillo", birthYear: 1974, position: "REVES", teams: ["Invictus A", "Veteranos Senior"], captainOf: [], legacyMatchName: "Marco" },
  { username: "alberto.perez", nombre: "Alberto", apellidos: "Perez Cabezon", birthYear: 1983, position: "DERECHA", teams: ["Invictus A", "Invictus X"], captainOf: [], legacyMatchName: "Alberto Perez" },
  { username: "juan.carrillo", nombre: "Juan", apellidos: "Carrillo Ferrero", birthYear: 1972, position: null, teams: ["Invictus A", "Invictus Veteranos"], captainOf: [] },
  { username: "moises.beltran", nombre: "Moises", apellidos: "Beltran Pueyo", birthYear: 1976, position: "DERECHA", teams: ["Invictus A", "Veteranos Senior"], captainOf: [], legacyMatchName: "Moises Beltran" },
  { username: "carlos.lopez", nombre: "Carlos", apellidos: "Lopez Parreño", birthYear: 1988, position: null, teams: ["Invictus A"], captainOf: [] },
  { username: "daniel.ballestin", nombre: "Daniel", apellidos: "Ballestin Cortes", birthYear: 1985, position: null, teams: ["Invictus A"], captainOf: [] },
  { username: "diego.chocarro", nombre: "Diego", apellidos: "Chocarro Collados", birthYear: 1981, position: "DERECHA", teams: ["Invictus A", "Veteranos Senior"], captainOf: [], legacyMatchName: "Diego Chocarro" },
  { username: "jose.manuel", nombre: "Jose Manuel", apellidos: "Alejos Azcona", birthYear: 1971, position: "DERECHA", teams: ["Invictus A", "Veteranos Senior"], captainOf: ["Veteranos Senior"], legacyMatchName: "Jose Manuel" },
  { username: "ruben.aguilar", nombre: "Ruben", apellidos: "Aguilar De Pedro", birthYear: 1982, position: "DERECHA", teams: ["Invictus A", "Veteranos Senior"], captainOf: [], legacyMatchName: "Ruben Aguilar" },
  { username: "fernando.tena", nombre: "Fernando", apellidos: "Tena Lafaja", birthYear: 1989, position: null, teams: ["Invictus A"], captainOf: [] },
  { username: "andres.sanz", nombre: "Andres", apellidos: "Sanz Martinez", birthYear: 1992, position: null, teams: ["Invictus A"], captainOf: [] },
  { username: "ignacio.sanz", nombre: "Ignacio Jesus", apellidos: "Sanz Martinez", birthYear: 1996, position: null, teams: ["Invictus A"], captainOf: [] },
  { username: "alejo.concha", nombre: "Alejo", apellidos: "Concha Belenguer", birthYear: 1989, position: null, teams: ["Invictus A"], captainOf: [] },
  { username: "diego.garcia", nombre: "Diego", apellidos: "Garcia Olves", birthYear: 1990, position: null, teams: ["Invictus A"], captainOf: [] },
  { username: "mariano.novellon", nombre: "Mariano", apellidos: "Novellon Folch", birthYear: 1970, position: null, teams: ["Invictus Veteranos"], captainOf: [] },
  { username: "angel.mingote", nombre: "Angel", apellidos: "Mingote Albajez", birthYear: 1978, position: null, teams: ["Invictus Veteranos"], captainOf: [] },
  { username: "luis.arilla", nombre: "Luis", apellidos: "Arilla Miguel", birthYear: 1970, position: null, teams: ["Invictus Veteranos"], captainOf: [] },
  { username: "angel.esteban", nombre: "Angel", apellidos: "Esteban Prieto", birthYear: 1979, position: null, teams: ["Invictus Veteranos"], captainOf: [] },
  { username: "pedro.beltran", nombre: "Pedro", apellidos: "Beltran Menjon", birthYear: 1979, position: null, teams: ["Invictus Veteranos"], captainOf: [] },
  { username: "lucio.barcelona", nombre: "Lucio", apellidos: "Barcelona Cimorra", birthYear: 1972, position: null, teams: ["Invictus Veteranos"], captainOf: [] },
  { username: "francisco.navarro", nombre: "Francisco", apellidos: "Navarro Bielsa", birthYear: 1968, position: null, teams: ["Invictus Veteranos"], captainOf: [] },
  { username: "jesus.roman", nombre: "Jesus", apellidos: "Roman Ballester", birthYear: 1969, position: "DERECHA", teams: ["Veteranos Senior"], captainOf: [], legacyMatchName: "Jesus Roman" },
  { username: "carlos.saenz", nombre: "Carlos", apellidos: "Saenz Royo", birthYear: 1971, position: "REVES", teams: ["Veteranos Senior"], captainOf: [], legacyMatchName: "Carlos Saenz" },
  { username: "javier.angos", nombre: "Jose Javier", apellidos: "Angos Laborda", birthYear: 1979, position: "REVES", teams: ["Veteranos Senior"], captainOf: [], legacyMatchName: "Javier Angos" },
  { username: "angel.garcia", nombre: "Angel", apellidos: "Garcia Lopez", birthYear: 1970, position: "DERECHA", teams: ["Veteranos Senior"], captainOf: [], legacyMatchName: "Angel Garcia" },
  { username: "jose.jover", nombre: "Jose Maria", apellidos: "Jover Gomez", birthYear: 1966, position: "REVES", teams: ["Veteranos Senior"], captainOf: [], legacyMatchName: "Jose Maria Jover Gomez" },
  { username: "carlos.martinez", nombre: "Carlos", apellidos: "Martinez Martinez", birthYear: 1970, position: "REVES", teams: ["Veteranos Senior"], captainOf: [], legacyMatchName: "Carlos Martinez" },
  { username: "roberto.palacin", nombre: "Roberto", apellidos: "Palacin Rey", birthYear: 1952, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "sergio.bergua", nombre: "Sergio", apellidos: "Bergua Pueyo", birthYear: 1967, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "jesus.gadea", nombre: "Jesus", apellidos: "Gadea Muñoz", birthYear: 1975, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "francisco.artal", nombre: "Francisco Jose", apellidos: "Artal Marteles", birthYear: 1965, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "fran", nombre: "Francisco", apellidos: "Roldan Luque", birthYear: 1966, position: "DERECHA", teams: ["Invictus A", "Invictus X"], captainOf: ["Invictus A", "Invictus X"], legacyMatchName: "Fran" },
  { username: "emilio.mompel", nombre: "Emilio", apellidos: "Mompel Ramirez", birthYear: 1960, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "german", nombre: "German", apellidos: "Prados Herrada", birthYear: 1965, position: "DERECHA", teams: ["Invictus X"], captainOf: [], legacyMatchName: "German" },
  { username: "jose.gallego", nombre: "Jose Joaquin", apellidos: "Gallego Rodriguez", birthYear: 1974, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "jesus.cortes", nombre: "Jesus", apellidos: "Cortes Langa", birthYear: 1984, position: "REVES", teams: ["Invictus X"], captainOf: [], legacyMatchName: "Jesus Cortes Langa" },
  { username: "felipe.urrios", nombre: "Felipe", apellidos: "Urrios Cubero", birthYear: 1977, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "jesus.burillo", nombre: "Jesus", apellidos: "Burillo Dieste", birthYear: 1972, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "felipe.sanchez", nombre: "Felipe", apellidos: "Sanchez Romera", birthYear: 1971, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "david.cabello", nombre: "David", apellidos: "Cabello Ferrer", birthYear: 1980, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "jose.piquer", nombre: "Jose Luis", apellidos: "Piquer Catalan", birthYear: 1976, position: "REVES", teams: ["Invictus X"], captainOf: [], legacyMatchName: "Jose Luis Piquer" },
  { username: "diego.plaza", nombre: "Diego", apellidos: "Plaza Candial", birthYear: 1983, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "jose.mores", nombre: "Jose Angel", apellidos: "Mores Viamonte", birthYear: 1980, position: "REVES", teams: ["Invictus X"], captainOf: [], legacyMatchName: "Jose Angel Mores" },
  { username: "lorenzo.linares", nombre: "Lorenzo", apellidos: "Linares Miranda", birthYear: 1977, position: "DERECHA", teams: ["Invictus X"], captainOf: [], legacyMatchName: "Lorenzo Linares" },
  { username: "luis.asensio", nombre: "Luis", apellidos: "Asensio Marin", birthYear: 1973, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "victor.salillas", nombre: "Victor", apellidos: "Salillas Paul", birthYear: 1971, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "placido.guerrero", nombre: "Placido", apellidos: "Guerrero Blanco", birthYear: 1974, position: null, teams: ["Invictus X"], captainOf: [] },
  { username: "carlos.hernandez", nombre: "Carlos", apellidos: "Hernandez Pinilla", birthYear: 1973, position: null, teams: ["Invictus X"], captainOf: [] },
  // Not in the official federation roster (no license found) -- kept from the original season
  // sheet as a standalone player of Veteranos Senior.
  { username: "jj", nombre: "JJ", apellidos: "", birthYear: null, position: "DERECHA", teams: ["Veteranos Senior"], captainOf: [] },
];

// Some pair rows in the original sheet used slightly different spellings for the same player.
const NAME_ALIASES: Record<string, string> = {
  "CARLOS SANEZ": "Carlos Saenz",
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

// Calendar migrated from the "PAREJAS" sheet (jornada-by-jornada pair assignments and results) of
// "AA VETERANOS SENIOR CLUB.numbers" -- this is the Veteranos Senior team's season history.
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

// Only the year is known for every player, so every fechaNacimiento here is January 1st of that
// year -- an approximation good enough for the age-based lineup rule and profile display.
function approximateBirthDate(birthYear: number | null): Date | null {
  if (birthYear === null) return null;
  return new Date(Date.UTC(birthYear, 0, 1));
}

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

  const usersByName = new Map<string, string>(); // normalized name -> id, used to resolve FIXTURES
  for (const p of MASTER_PLAYERS) {
    const role: Role = p.captainOf.length > 0 ? "CAPITAN" : "JUGADOR";
    const created = await prisma.user.create({
      data: {
        username: p.username,
        passwordHash,
        role,
        nombre: p.nombre,
        apellidos: p.apellidos,
        fechaNacimiento: approximateBirthDate(p.birthYear),
        position: p.position,
      },
    });

    for (const teamName of p.teams) {
      const teamId = teamsByName.get(teamName);
      if (!teamId) throw new Error(`Unknown team "${teamName}" for player ${p.username}`);
      await prisma.teamMembership.create({
        data: { userId: created.id, teamId, isCaptain: p.captainOf.includes(teamName) },
      });
    }

    const matchKey = p.legacyMatchName ?? `${p.nombre} ${p.apellidos}`.trim();
    usersByName.set(matchKey, created.id);
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

  const veteranosSeniorId = teamsByName.get("Veteranos Senior")!;

  // Any player referenced in a fixture pair but missing from the roster gets created on the fly
  // (shouldn't happen now that MASTER_PLAYERS covers the full official roster, but kept as a
  // defensive fallback).
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

  console.log(
    `Seed complete: ${MASTER_PLAYERS.length + 1} users, ${TEAMS.length} teams, ${FIXTURES.length} fixtures, ${SPONSORS.length} sponsors.`
  );
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
