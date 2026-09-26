import { prisma } from "@/lib/prisma";

export async function getClubInfo() {
  const info = await prisma.clubInfo.findFirst();
  if (!info) {
    throw new Error(
      "No ClubInfo row found. Run `npm run prisma:seed` (or `docker compose exec web npm run db:setup`) first."
    );
  }
  return info;
}

export async function getValues() {
  return prisma.value.findMany({ orderBy: { order: "asc" } });
}

export async function getTeamWithPlayers() {
  const team = await prisma.team.findFirst({
    include: { players: { orderBy: { matchesWon: "desc" } } },
  });
  return team;
}

export function winRate(played: number, won: number) {
  if (played === 0) return 0;
  return Math.round((won / played) * 100);
}

export async function getPlayersRanked() {
  const players = await prisma.player.findMany({
    orderBy: [{ matchesWon: "desc" }, { matchesPlayed: "desc" }],
  });
  return players.map((p) => ({ ...p, rate: winRate(p.matchesPlayed, p.matchesWon) }));
}

export async function getFixtures() {
  const fixtures = await prisma.fixture.findMany({
    orderBy: { jornada: "asc" },
    include: {
      pairs: {
        include: { revesPlayer: true, derechaPlayer: true },
      },
    },
  });
  return fixtures;
}

export async function getTeamSummary() {
  const [players, fixtures] = await Promise.all([prisma.player.findMany(), getFixtures()]);

  const totalMatchesPlayed = players.reduce((acc, p) => acc + p.matchesPlayed, 0);
  const totalMatchesWon = players.reduce((acc, p) => acc + p.matchesWon, 0);

  let jornadasWon = 0;
  let jornadasLost = 0;
  let jornadasPending = 0;
  for (const fx of fixtures) {
    if (fx.pairs.length === 0) {
      jornadasPending++;
      continue;
    }
    const won = fx.pairs.filter((p) => p.result === "WON").length;
    const lost = fx.pairs.filter((p) => p.result === "LOST").length;
    const pending = fx.pairs.filter((p) => p.result === "PENDING").length;
    if (pending > 0) jornadasPending++;
    else if (won > lost) jornadasWon++;
    else jornadasLost++;
  }

  return {
    playersCount: players.length,
    totalMatchesPlayed,
    totalMatchesWon,
    jornadasWon,
    jornadasLost,
    jornadasPending,
    totalJornadas: fixtures.length,
  };
}
