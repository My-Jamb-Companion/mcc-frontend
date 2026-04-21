"use client";

import { motion } from "framer-motion";

export const FadeInUp = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};