"use client";

import { motion } from "framer-motion";

export function StatBar({
  label,
  value,
  sublabel,
  delay = 0,
}: {
  label: string;
  value: number;
  sublabel?: string;
  delay?: number;
}) {
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium text-white/85">{label}</span>
        <span className="text-gold-300">{sublabel ?? `${value}%`}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-100"
        />
      </div>
    </div>
  );
}
