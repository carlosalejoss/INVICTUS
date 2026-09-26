"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageTeam } from "@/lib/permissions";
import { categoryMinAge } from "@/lib/matches";
import type { MatchResult } from "@prisma/client";

export type FixtureFormState = { error?: string };

export async function createFixture(_prev: FixtureFormState, formData: FormData): Promise<FixtureFormState> {
  const session = await auth();
  if (!session) return { error: "No autenticado." };

  const teamId = String(formData.get("teamId") ?? "");
  if (!canManageTeam(session, teamId)) return { error: "No puedes crear partidos para ese equipo." };

  const jornada = parseInt(String(formData.get("jornada") ?? ""), 10);
  const opponent = String(formData.get("opponent") ?? "").trim() || null;
  const dateStr = String(formData.get("date") ?? "");
  const timeStr = String(formData.get("time") ?? "");
  const location = String(formData.get("location") ?? "").trim() || null;
  const deadlineStr = String(formData.get("availabilityDeadline") ?? "");

  if (!jornada) return { error: "Indica el número de jornada." };

  let date: Date | null = null;
  if (dateStr) {
    date = new Date(`${dateStr}T${timeStr || "00:00"}:00`);
  }

  const existing = await prisma.fixture.findUnique({ where: { teamId_jornada: { teamId, jornada } } });
  if (existing) return { error: `Ya existe la jornada ${jornada} para este equipo.` };

  const fixture = await prisma.fixture.create({
    data: {
      teamId,
      jornada,
      opponent,
      date,
      location,
      availabilityDeadline: deadlineStr ? new Date(deadlineStr) : null,
      createdById: session.user.id,
    },
  });

  revalidatePath("/panel");
  redirect(`/panel/partidos/${fixture.id}/alineacion`);
}

export async function setAvailability(fixtureId: string, status: "AVAILABLE" | "UNAVAILABLE") {
  const session = await auth();
  if (!session) throw new Error("No autenticado.");

  const fixture = await prisma.fixture.findUnique({ where: { id: fixtureId } });
  if (!fixture) throw new Error("Partido no encontrado.");
  if (fixture.availabilityDeadline && new Date() > fixture.availabilityDeadline) {
    throw new Error("El plazo para apuntarse a este partido ya ha cerrado.");
  }

  await prisma.availability.upsert({
    where: { fixtureId_userId: { fixtureId, userId: session.user.id } },
    update: { status, respondedAt: new Date() },
    create: { fixtureId, userId: session.user.id, status },
  });

  revalidatePath(`/partidos/${fixtureId}`);
}

/** Assigns (or clears, when playerId is null) a player into a category/slot for a fixture's lineup. */
export async function assignPair(
  fixtureId: string,
  category: string,
  slot: "reves" | "derecha",
  playerId: string | null
) {
  const session = await auth();
  const fixture = await prisma.fixture.findUnique({ where: { id: fixtureId }, include: { team: true } });
  if (!fixture || !canManageTeam(session, fixture.teamId)) throw new Error("No autorizado.");

  if (playerId && fixture.team.ageRestricted) {
    const existingPair = await prisma.fixturePair.findFirst({ where: { fixtureId, category } });
    const otherSlot = slot === "reves" ? existingPair?.derechaPlayerId : existingPair?.revesPlayerId;
    if (otherSlot) {
      const [a, b] = await Promise.all([
        prisma.user.findUnique({ where: { id: playerId } }),
        prisma.user.findUnique({ where: { id: otherSlot } }),
      ]);
      const age = (d: Date | null) => (d ? Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000)) : 0);
      const combined = age(a?.fechaNacimiento ?? null) + age(b?.fechaNacimiento ?? null);
      const minAge = categoryMinAge(category) ?? 0;
      if (combined < minAge) {
        throw new Error(`La pareja no llega a la edad mínima de ${category} (suma actual: ${combined}).`);
      }
    }
  }

  const pair = await prisma.fixturePair.findFirst({ where: { fixtureId, category } });
  const field = slot === "reves" ? "revesPlayerId" : "derechaPlayerId";

  if (pair) {
    await prisma.fixturePair.update({ where: { id: pair.id }, data: { [field]: playerId } });
  } else {
    await prisma.fixturePair.create({
      data: { fixtureId, category, [field]: playerId },
    });
  }

  revalidatePath(`/panel/partidos/${fixtureId}/alineacion`);
}

export async function setPairResult(pairId: string, result: MatchResult) {
  const session = await auth();
  const pair = await prisma.fixturePair.findUnique({ where: { id: pairId }, include: { fixture: { include: { team: true } } } });
  if (!pair || !canManageTeam(session, pair.fixture.teamId)) throw new Error("No autorizado.");

  await prisma.fixturePair.update({ where: { id: pairId }, data: { result } });
  revalidatePath(`/panel/partidos/${pair.fixtureId}/resultado`);
  revalidatePath("/calendario");
  revalidatePath("/estadisticas");
  revalidatePath("/panel");
}
