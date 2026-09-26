"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const HEADLINE = "INVICTUS";

export function Hero({ tagline, city }: { tagline: string; city: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={ref} className="relative flex h-[100svh] min-h-[640px] items-center justify-center overflow-hidden bg-ink-950">
      <motion.div style={{ scale }} className="absolute inset-0 bg-radial-fade" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(5,5,5,0.4)_70%,rgba(5,5,5,1)_100%)]" />

      {/* Ambient floating emblem */}
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute -right-10 top-1/4 opacity-[0.07] md:right-10"
      >
        <Image src="/branding/emblem.jpg" alt="" width={420} height={420} className="h-[420px] w-[420px] rounded-[3rem] object-cover animate-spin-slow" />
      </motion.div>

      <motion.div style={{ y, opacity }} className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-6 animate-float"
        >
          <Image src="/branding/emblem.jpg" alt="Invictus Padel Club" width={80} height={80} className="h-20 w-20 rounded-2xl object-cover shadow-lg shadow-black/50" priority />
        </motion.div>

        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[15vw] font-bold leading-[0.9] tracking-tight text-gold-50 sm:text-7xl md:text-8xl lg:text-[7.5rem]"
          >
            {HEADLINE.split("").map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.045, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block text-gradient-gold"
              >
                {c}
              </motion.span>
            ))}
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="mt-6 max-w-xl text-balance text-lg text-white/70 sm:text-xl"
        >
          {tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
          className="mt-2 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-gold-400/80"
        >
          <span className="h-px w-8 bg-gold-500/60" />
          {city}
          <span className="h-px w-8 bg-gold-500/60" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
        </motion.div>
      </motion.div>
    </section>
  );
}
