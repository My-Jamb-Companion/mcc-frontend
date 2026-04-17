"use client";

import { motion } from "framer-motion";

export const SlideTransition = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0.3, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="absolute inset-0"
    >
      {children}
    </motion.div>
  );
};