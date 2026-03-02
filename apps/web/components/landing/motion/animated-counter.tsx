"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "motion/react";
import { cn } from "@repo/ui/lib/utils";

interface AnimatedCounterProps {
  to: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  decimals?: number;
}

export function AnimatedCounter({
  to,
  prefix = "",
  suffix = "",
  className,
  duration = 2,
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) =>
    v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  );
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (isInView) {
      animate(motionValue, to, { duration, ease: "easeOut" });
    }
  }, [isInView, motionValue, to, duration]);

  return (
    <span className={cn(className)}>
      {prefix}
      {/* motion.span subscribes to the MotionValue and re-renders on every frame */}
      <motion.span ref={ref}>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
