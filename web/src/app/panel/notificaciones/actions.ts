"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (session?.user.role !== "DIRECTIVA") throw new Error("No autorizado.");
  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/panel/notificaciones");
  revalidatePath("/panel");
}
