"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type SponsorFormState = { error?: string };

async function requireDirectiva() {
  const session = await auth();
  if (session?.user.role !== "DIRECTIVA") throw new Error("No autorizado.");
}

export async function createSponsor(_prev: SponsorFormState, formData: FormData): Promise<SponsorFormState> {
  await requireDirectiva();

  const name = String(formData.get("name") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();

  if (!name || !logoUrl) return { error: "Nombre y logo son obligatorios." };

  const count = await prisma.sponsor.count();
  await prisma.sponsor.create({ data: { name, logoUrl, linkUrl: linkUrl || null, order: count } });

  revalidatePath("/panel/patrocinadores");
  revalidatePath("/");
  return {};
}

export async function toggleSponsor(id: string, active: boolean) {
  await requireDirectiva();
  await prisma.sponsor.update({ where: { id }, data: { active } });
  revalidatePath("/panel/patrocinadores");
  revalidatePath("/");
}

export async function deleteSponsor(id: string) {
  await requireDirectiva();
  await prisma.sponsor.delete({ where: { id } });
  revalidatePath("/panel/patrocinadores");
  revalidatePath("/");
}
