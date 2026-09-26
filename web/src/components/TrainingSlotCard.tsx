"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { signUpTraining, cancelTrainingSignup } from "@/app/entrenamientos/actions";
import { extraCourtsNeeded } from "@/lib/training";

type Signup = { userId: string; name: string };

export function TrainingSlotCard({
  trainingSessionId,
  startTime,
  location,
  durationMin,
  signups,
  currentUserId,
}: {
  trainingSessionId: string;
  startTime: string;
  location: string;
  durationMin: number;
  signups: Signup[];
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const isSignedUp = signups.some((s) => s.userId === currentUserId);
  const extraCourts = extraCourtsNeeded(signups.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="card-surface rounded-2xl p-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-xl text-gold-100">{startTime}</p>
          <p className="text-xs text-white/40">
            {location} · {durationMin} min
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
          {signups.length} apuntados
        </span>
      </div>

      {extraCourts > 0 && (
        <p className="mt-3 rounded-lg bg-gold-500/10 px-3 py-2 text-xs text-gold-300">
          Se necesita{extraCourts > 1 ? "n" : ""} {extraCourts} pista{extraCourts > 1 ? "s" : ""} adicional{extraCourts > 1 ? "es" : ""}. Directiva ya ha sido notificada.
        </p>
      )}

      {signups.length > 0 && (
        <p className="mt-3 truncate text-sm text-white/60">{signups.map((s) => s.name).join(", ")}</p>
      )}

      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            if (isSignedUp) await cancelTrainingSignup(trainingSessionId);
            else await signUpTraining(trainingSessionId);
          })
        }
        className={`mt-4 w-full rounded-full py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
          isSignedUp
            ? "border border-white/15 text-white/70 hover:border-rose-400/40 hover:text-rose-300"
            : "bg-gold-500 text-ink-950 hover:bg-gold-400"
        }`}
      >
        {isPending ? "…" : isSignedUp ? "Darme de baja" : "Apuntarme"}
      </button>
    </motion.div>
  );
}
