"use client";

import { motion } from "motion/react";
import { cn } from "@repo/ui/lib/utils";

interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  }),
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerChildrenProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      custom={staggerDelay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}
