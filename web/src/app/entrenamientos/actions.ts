"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { extraCourtsNeeded } from "@/lib/training";
import { notifyDirectiva } from "@/lib/notify";

export async function signUpTraining(trainingSessionId: string) {
  const session = await auth();
  if (!session) throw new Error("No autenticado.");

  await prisma.trainingSignup.upsert({
    where: { trainingSessionId_userId: { trainingSessionId, userId: session.user.id } },
    update: {},
    create: { trainingSessionId, userId: session.user.id },
  });

  const count = await prisma.trainingSignup.count({ where: { trainingSessionId } });
  const before = extraCourtsNeeded(count - 1);
  const after = extraCourtsNeeded(count);
  if (after > before) {
    const training = await prisma.trainingSession.findUnique({ where: { id: trainingSessionId } });
    if (training) {
      const dateLabel = training.date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
      await notifyDirectiva(
        "COURT_NEEDED",
        `Se necesita reservar ${after} pista(s) adicional(es) para el entrenamiento del ${dateLabel} a las ${training.startTime} (${count} apuntados).`
      );
    }
  }

  revalidatePath("/entrenamientos");
}

export async function cancelTrainingSignup(trainingSessionId: string) {
  const session = await auth();
  if (!session) throw new Error("No autenticado.");

  await prisma.trainingSignup.deleteMany({ where: { trainingSessionId, userId: session.user.id } });
  revalidatePath("/entrenamientos");
}
