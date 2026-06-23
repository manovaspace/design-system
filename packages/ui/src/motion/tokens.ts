import type { Transition } from "framer-motion";

export const easeOut = [0.16, 1, 0.3, 1] as const;

export const duration = {
  fast: 0.15,
  base: 0.22,
  expand: 0.28,
  fadeIn: 0.35,
  slideUp: 0.4,
} as const;

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
} as const;

export const fadeScale = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
} as const;

export const transitionBase: Transition = {
  duration: duration.base,
  ease: easeOut,
};

export const transitionExpand: Transition = {
  duration: duration.expand,
  ease: "easeInOut",
};

export const transitionFast: Transition = {
  duration: duration.fast,
  ease: easeOut,
};

export const heroSpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const scrollRevealViewport = {
  once: true,
  margin: "-60px",
} as const;

export function staggerDelay(index: number, step = 0.05, maxIndex = 4) {
  return Math.min(index, maxIndex) * step;
}
