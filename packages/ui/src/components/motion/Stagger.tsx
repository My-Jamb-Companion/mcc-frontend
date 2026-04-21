"use client";

import { motion } from "framer-motion";

export const Stagger = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.08 },
        },
      }}
    >
      {children}
    </motion.div>
  );
};