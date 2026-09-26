import type { Session } from "next-auth";

export function isDirectiva(session: Session | null): boolean {
  return session?.user.role === "DIRECTIVA";
}

/** Directiva can manage any team; a capitán only the team(s) they captain. */
export function canManageTeam(session: Session | null, teamId: string): boolean {
  if (!session) return false;
  if (session.user.role === "DIRECTIVA") return true;
  return session.user.role === "CAPITAN" && session.user.captainOf.includes(teamId);
}

/** Any team member (jugador/capitán) can respond to that team's fixtures; directiva can view all. */
export function isTeamMember(session: Session | null, teamId: string): boolean {
  if (!session) return false;
  if (session.user.role === "DIRECTIVA") return true;
  return session.user.memberOf.includes(teamId);
}
