"use server";

import bcrypt from "bcryptjs";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Position } from "@prisma/client";

export type ChangePasswordState = { error?: string; success?: boolean };
export type ProfileFormState = { error?: string; success?: boolean };

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

export async function updateProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const session = await auth();
  if (!session) return { error: "Debes iniciar sesión." };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellidos = String(formData.get("apellidos") ?? "").trim();
  const fechaNacimientoRaw = String(formData.get("fechaNacimiento") ?? "");
  const position = (formData.get("position") ? String(formData.get("position")) : null) as Position | null;
  const injured = formData.get("injured") === "on";
  const photo = formData.get("photo");

  if (!nombre) return { error: "El nombre es obligatorio." };

  let photoUrl: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_PHOTO_BYTES) return { error: "La foto no puede superar los 5MB." };
    if (!photo.type.startsWith("image/")) return { error: "El archivo debe ser una imagen." };
    try {
      const ext = photo.name.split(".").pop() || "jpg";
      const blob = await put(`profile-photos/${session.user.id}-${Date.now()}.${ext}`, photo, {
        access: "public",
        addRandomSuffix: true,
      });
      photoUrl = blob.url;
    } catch (e) {
      console.error("[updateProfile] photo upload failed", e);
      return { error: "No se pudo subir la foto. Inténtalo de nuevo." };
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      nombre,
      apellidos,
      fechaNacimiento: fechaNacimientoRaw ? new Date(fechaNacimientoRaw) : null,
      position,
      injured,
      ...(photoUrl ? { photoUrl } : {}),
    },
  });

  revalidatePath("/cuenta");
  revalidatePath("/plantilla");
  return { success: true };
}

export async function changePassword(_prev: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session) return { error: "Debes iniciar sesión." };

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (next.length < 6) return { error: "La nueva contraseña debe tener al menos 6 caracteres." };
  if (next !== confirm) return { error: "Las contraseñas nuevas no coinciden." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Usuario no encontrado." };

  const valid = await bcrypt.compare(current, user.passwordHash);
  if (!valid) return { error: "La contraseña actual no es correcta." };

  const passwordHash = await bcrypt.hash(next, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}
