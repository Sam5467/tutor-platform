"use client";

/**
 * @author: @dorianbaffier
 * @description: Shape Hero
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion } from "motion/react";
import { Pacifico } from "next/font/google";
import { cn } from "@/lib/utils";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
  borderRadius = 16,
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
  borderRadius?: number;
}) {
  return (
    <motion.div
      animate={{
        opacity: 1,
        y: 0,
        rotate,
      }}
      className={cn("absolute", className)}
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        className="relative"
        style={{
          width,
          height,
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <div
          className={cn(
            "absolute inset-0",
            "bg-linear-to-r to-transparent",
            gradient,
            "backdrop-blur-[1px]",
            "ring-1 ring-paper/[0.03] dark:ring-paper/[0.02]",
            "shadow-[0_2px_16px_-2px_rgba(255,255,255,0.04)]",
            "after:absolute after:inset-0",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_70%)]",
            "after:rounded-[inherit]"
          )}
          style={{ borderRadius }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function ShapeHero({
  title1 = "Elevate Your",
  title2 = "Digital Vision",
}: {
  title1?: string;
  title2?: string;
}) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div
      className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-ink"
      style={{
        backgroundImage: "url('/images/hero-background.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-ink/70" />
      <div className="absolute inset-0 bg-linear-to-br from-brass/[0.04] via-transparent to-stone/[0.04] blur-3xl dark:from-brass/[0.06] dark:via-transparent dark:to-stone/[0.06]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            animate="visible"
            custom={1}
            initial="hidden"
            variants={fadeUpVariants as any}
          >
            <h1 className="mb-6 font-bold text-4xl tracking-tight sm:text-6xl md:mb-8 md:text-8xl">
              <span className="font-display bg-linear-to-b from-paper to-paper/80 bg-clip-text text-transparent dark:from-paper dark:to-paper/80">
                {title1}
              </span>
              <br />
              <span
                className={cn("text-brass", pacifico.className)}
              >
                {title2}
              </span>
            </h1>
          </motion.div>
          <motion.div
            animate="visible"
            custom={2}
            initial="hidden"
            variants={fadeUpVariants as any}
          >
            <p className="mx-auto mb-8 max-w-xl px-4 font-light text-base text-paper/70 leading-relaxed tracking-wide sm:text-lg md:text-xl">
              Your safe place to get back on track.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink via-transparent to-ink/80 dark:from-ink dark:via-transparent dark:to-ink/80" />
    </div>
  );
}
