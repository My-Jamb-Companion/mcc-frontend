"use client";

import {useCallback, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {AnimatePresence, motion} from "framer-motion";
import {Icon} from "@mcc/ui";

export function useGlobalFileDrag(onDrop: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDepth, setDragDepth] = useState(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    // Ignore drags that aren't carrying files (e.g. dragging text/links)
    if (!e.dataTransfer?.types?.includes("Files")) return;
    setDragDepth((d) => d + 1);
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragDepth((d) => {
      const next = Math.max(0, d - 1);
      if (next === 0) setIsDragging(false);
      return next;
    });
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragDepth(0);
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        onDrop(Array.from(files));
      }
    },
    [onDrop],
  );

  useEffect(() => {
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

  return isDragging;
}

/* -------------------------------------------------------------------------- */
/* DragImageOverlay                                                           */
/* -------------------------------------------------------------------------- */

export interface DragImageOverlayProps {
  isVisible: boolean;
  title?: string;
  subtitle?: string;
}

export function DragImageOverlay({
  isVisible,
  title = "Add an Image",
  subtitle = "Drop an image here to add it to the conversation",
}: DragImageOverlayProps) {
  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.15}}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          aria-hidden="true"
        >
          <div className="relative flex flex-col items-center">
            <div className="relative mb-6 h-24 w-24">
              <motion.div
                initial={{rotate: -18, x: -34, y: 6}}
                animate={{rotate: -14, x: -34, y: 0}}
                transition={{duration: 0.25, ease: "easeOut"}}
                className="absolute flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 shadow-lg"
              >
                <Icon icon="ph:books" className="h-6 w-6 text-white" />
              </motion.div>

              <motion.div
                initial={{rotate: 16, x: 34, y: 6}}
                animate={{rotate: 12, x: 34, y: 0}}
                transition={{duration: 0.25, ease: "easeOut", delay: 0.03}}
                className="absolute right-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 shadow-lg"
              >
                <Icon icon="ph:note" className="h-6 w-6 text-white" />
              </motion.div>

              <motion.div
                initial={{scale: 0.85}}
                animate={{scale: 1}}
                transition={{duration: 0.2, ease: "easeOut", delay: 0.06}}
                className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white shadow-xl"
              >
                <Icon icon="ph:image" className="h-7 w-7 text-gray-900" />
              </motion.div>
            </div>

            <h2 className="text-3xl font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm text-gray-300">{subtitle}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default DragImageOverlay;
