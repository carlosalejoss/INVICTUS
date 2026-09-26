import type { MatchResult } from "@prisma/client";

export type Outcome = "WON" | "LOST" | "PENDING";

/**
 * A jornada is decided as soon as 2 of its 3 pairs have a recorded result -- the third pair's
 * match may never even finish once the tie is mathematically settled. `manualResult` overrides
 * this for administrative outcomes (e.g. a lineup submitted late/incorrectly).
 */
export function fixtureOutcome(fixture: {
  manualResult: MatchResult | null;
  pairs: Array<{ result: MatchResult }>;
}): Outcome {
  if (fixture.manualResult) return fixture.manualResult;
  if (fixture.pairs.length === 0) return "PENDING";
  const won = fixture.pairs.filter((p) => p.result === "WON").length;
  const lost = fixture.pairs.filter((p) => p.result === "LOST").length;
  if (won >= 2) return "WON";
  if (lost >= 2) return "LOST";
  return "PENDING";
}

/** "Pareja 95" -> 95. Used both to label a slot and as its minimum combined-age requirement. */
export function categoryMinAge(category: string): number | null {
  const match = category.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
