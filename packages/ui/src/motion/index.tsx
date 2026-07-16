"use client";

import { type HTMLMotionProps, motion } from "framer-motion";

import { cn } from "../lib/utils.js";
import { duration, easeOut } from "./tokens.js";

export { useReducedMotion } from "./hooks.js";
export { RevealOnScroll, type RevealOnScrollProps } from "./reveal.js";
export {
  duration,
  easeOut,
  fadeScale,
  fadeUp,
  heroSpring,
  scrollRevealViewport,
  staggerDelay,
  transitionBase,
  transitionExpand,
  transitionFast,
} from "./tokens.js";

export type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

/** Fade + slight rise — respects reduced motion via Framer. */
export function FadeIn({
  className,
  delay = 0,
  children,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.fadeIn, delay, ease: easeOut }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export type SlideUpProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function SlideUp({
  className,
  delay = 0,
  children,
  ...props
}: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.slideUp, delay, ease: easeOut }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
