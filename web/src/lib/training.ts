import { prisma } from "@/lib/prisma";

export const TRAINING_SLOTS = ["16:30", "18:00", "19:30", "21:00"] as const;
const WEEKS_AHEAD = 4;

function nextWednesdays(count: number): Date[] {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  // 0 = Sunday ... 3 = Wednesday
  const daysUntilWednesday = (3 - cursor.getUTCDay() + 7) % 7;
  cursor.setUTCDate(cursor.getUTCDate() + daysUntilWednesday);
  for (let i = 0; i < count; i++) {
    dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
  return dates;
}

/**
 * "Los horarios se generan solos cada semana": there's no standing cron in this app, so instead
 * every visit to /entrenamientos calls this first to top up the next few Wednesdays' slots. It's
 * idempotent (unique [date, startTime]), so calling it repeatedly is harmless.
 */
export async function ensureUpcomingTrainingSessions() {
  const wednesdays = nextWednesdays(WEEKS_AHEAD);
  for (const date of wednesdays) {
    for (const startTime of TRAINING_SLOTS) {
      await prisma.trainingSession.upsert({
        where: { date_startTime: { date, startTime } },
        update: {},
        create: { date, startTime },
      });
    }
  }
}

/** How many extra courts (beyond the first) a sign-up count requires: 1-4 -> 0, 5-8 -> 1, 9-12 -> 2, ... */
export function extraCourtsNeeded(signupCount: number): number {
  return Math.max(0, Math.ceil((signupCount - 4) / 4));
}
