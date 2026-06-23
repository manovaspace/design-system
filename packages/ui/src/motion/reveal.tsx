"use client";

import { type HTMLMotionProps, motion } from "framer-motion";

import { cn } from "../lib/utils.js";
import {
  fadeScale,
  fadeUp,
  scrollRevealViewport,
  transitionBase,
} from "./tokens.js";

export type RevealOnScrollProps = HTMLMotionProps<"div"> & {
  delay?: number;
  variant?: "fadeUp" | "fadeScale";
};

/** Scroll-triggered fade — uses shared motion tokens. */
export function RevealOnScroll({
  className,
  delay = 0,
  variant = "fadeUp",
  transition,
  children,
  ...props
}: RevealOnScrollProps) {
  const motionVariant = variant === "fadeScale" ? fadeScale : fadeUp;

  return (
    <motion.div
      initial={motionVariant.initial}
      whileInView={motionVariant.animate}
      viewport={scrollRevealViewport}
      transition={{ ...transitionBase, delay, ...transition }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
