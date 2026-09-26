import { prisma } from "@/lib/prisma";
import { fixtureOutcome } from "@/lib/matches";

// Only "Veteranos Senior" has real roster/calendar data migrated so far; the public site defaults
// to it until a team switcher is built. The other 4 club teams exist in the DB, ready to fill in.
export const DEFAULT_TEAM_NAME = "Veteranos Senior";

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

export async function getSponsors() {
  return prisma.sponsor.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}

export async function getTeams() {
  return prisma.team.findMany({ orderBy: { name: "asc" } });
}

export async function getTeamByName(name: string = DEFAULT_TEAM_NAME) {
  return prisma.team.findFirst({ where: { name } });
}

export async function getTeamWithMembers(name: string = DEFAULT_TEAM_NAME) {
  return prisma.team.findFirst({
    where: { name },
    include: { memberships: { include: { user: true } } },
  });
}

export function winRate(played: number, won: number) {
  if (played === 0) return 0;
  return Math.round((won / played) * 100);
}

/**
 * Player stats are derived from FixturePair history (not stored counters) so a player's record is
 * always consistent with the calendar -- this also makes future matches feed stats automatically.
 */
export async function getPlayersRanked(teamName: string = DEFAULT_TEAM_NAME) {
  const team = await getTeamWithMembers(teamName);
  if (!team) return [];

  const pairs = await prisma.fixturePair.findMany({
    where: { fixture: { teamId: team.id }, result: { not: "PENDING" } },
    select: { result: true, revesPlayerId: true, derechaPlayerId: true },
  });

  const stats = new Map<string, { played: number; won: number }>();
  const bump = (userId: string | null, won: boolean) => {
    if (!userId) return;
    const s = stats.get(userId) ?? { played: 0, won: 0 };
    s.played += 1;
    if (won) s.won += 1;
    stats.set(userId, s);
  };
  for (const p of pairs) {
    bump(p.revesPlayerId, p.result === "WON");
    bump(p.derechaPlayerId, p.result === "WON");
  }

  return team.memberships
    .map((m) => {
      const s = stats.get(m.userId) ?? { played: 0, won: 0 };
      return {
        id: m.userId,
        fullName: `${m.user.nombre} ${m.user.apellidos}`.trim(),
        position: m.user.position,
        age: ageFromBirthDate(m.user.fechaNacimiento),
        isCaptain: m.isCaptain,
        role: m.user.role,
        matchesPlayed: s.played,
        matchesWon: s.won,
        rate: winRate(s.played, s.won),
      };
    })
    .sort((a, b) => b.matchesWon - a.matchesWon || b.matchesPlayed - a.matchesPlayed);
}

function ageFromBirthDate(date: Date | null): number | null {
  if (!date) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  const hasHadBirthdayThisYear =
    now.getUTCMonth() > date.getUTCMonth() ||
    (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() >= date.getUTCDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export async function getFixtures(teamName: string = DEFAULT_TEAM_NAME) {
  const team = await getTeamByName(teamName);
  if (!team) return [];
  return prisma.fixture.findMany({
    where: { teamId: team.id },
    orderBy: { jornada: "asc" },
    include: {
      pairs: { include: { revesPlayer: true, derechaPlayer: true } },
    },
  });
}

export async function getTeamSummary(teamName: string = DEFAULT_TEAM_NAME) {
  const [players, fixtures] = await Promise.all([getPlayersRanked(teamName), getFixtures(teamName)]);

  const totalMatchesPlayed = players.reduce((acc, p) => acc + p.matchesPlayed, 0);
  const totalMatchesWon = players.reduce((acc, p) => acc + p.matchesWon, 0);

  let jornadasWon = 0;
  let jornadasLost = 0;
  let jornadasPending = 0;
  for (const fx of fixtures) {
    const outcome = fixtureOutcome(fx);
    if (outcome === "WON") jornadasWon++;
    else if (outcome === "LOST") jornadasLost++;
    else jornadasPending++;
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
