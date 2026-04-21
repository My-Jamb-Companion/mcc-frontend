"use client";

import { motion } from "framer-motion";

export const ProgressBar = ({
  active,
  progress,
  color,
}: {
  active: boolean;
  progress: number;
  color: string;
}) => {
  return (
    <motion.div
      className="h-0.5 origin-left"
      animate={{
        scaleX: active ? progress / 100 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 70,
        damping: 18,
      }}
      style={{ background: color }}
    />
  );
};
