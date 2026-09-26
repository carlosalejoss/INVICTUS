"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Position, Role } from "@prisma/client";

export type PlayerFormState = { error?: string };

async function requireDirectiva() {
  const session = await auth();
  if (session?.user.role !== "DIRECTIVA") throw new Error("No autorizado.");
  return session;
}

function readTeamIds(formData: FormData): { teamId: string; isCaptain: boolean }[] {
  const teamIds = formData.getAll("teamIds") as string[];
  const captainIds = new Set(formData.getAll("captainOf") as string[]);
  return teamIds.map((teamId) => ({ teamId, isCaptain: captainIds.has(teamId) }));
}

export async function createPlayer(_prev: PlayerFormState, formData: FormData): Promise<PlayerFormState> {
  await requireDirectiva();

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellidos = String(formData.get("apellidos") ?? "").trim();
  const fechaNacimiento = formData.get("fechaNacimiento") ? new Date(String(formData.get("fechaNacimiento"))) : null;
  const role = String(formData.get("role") ?? "JUGADOR") as Role;
  const position = (formData.get("position") ? String(formData.get("position")) : null) as Position | null;

  if (!username || !password || !nombre) return { error: "Usuario, contraseña y nombre son obligatorios." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "Ese nombre de usuario ya existe." };

  const passwordHash = await bcrypt.hash(password, 10);
  const memberships = readTeamIds(formData);

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role,
      nombre,
      apellidos,
      fechaNacimiento,
      position,
      memberships: { create: memberships },
    },
  });

  revalidatePath("/panel/jugadores");
  redirect(`/panel/jugadores/${user.id}/editar?created=1`);
}

export async function updatePlayer(userId: string, _prev: PlayerFormState, formData: FormData): Promise<PlayerFormState> {
  await requireDirectiva();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellidos = String(formData.get("apellidos") ?? "").trim();
  const fechaNacimiento = formData.get("fechaNacimiento") ? new Date(String(formData.get("fechaNacimiento"))) : null;
  const role = String(formData.get("role") ?? "JUGADOR") as Role;
  const position = (formData.get("position") ? String(formData.get("position")) : null) as Position | null;
  const newPassword = String(formData.get("password") ?? "");

  if (!nombre) return { error: "El nombre es obligatorio." };

  const memberships = readTeamIds(formData);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        nombre,
        apellidos,
        fechaNacimiento,
        role,
        position,
        ...(newPassword ? { passwordHash: await bcrypt.hash(newPassword, 10) } : {}),
      },
    }),
    prisma.teamMembership.deleteMany({ where: { userId } }),
    ...(memberships.length
      ? [prisma.teamMembership.createMany({ data: memberships.map((m) => ({ ...m, userId })) })]
      : []),
  ]);

  revalidatePath("/panel/jugadores");
  revalidatePath(`/panel/jugadores/${userId}/editar`);
  return {};
}

export async function togglePlayerActive(userId: string, active: boolean) {
  await requireDirectiva();
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/panel/jugadores");
}
