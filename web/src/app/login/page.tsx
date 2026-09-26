import type { Metadata } from "next";
import { Suspense } from "react";
import { Emblem } from "@/components/Emblem";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión · Invictus Padel Club" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-ink-950 bg-radial-fade px-6 pt-24">
      <Emblem className="mb-8 h-14 w-14" />
      <h1 className="mb-8 font-display text-3xl font-bold text-white">Acceso de socios</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
