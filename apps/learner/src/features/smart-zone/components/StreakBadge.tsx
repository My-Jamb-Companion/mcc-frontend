"use client";
import {Icon, motion} from "@mcc/ui";
import {showStreak, streakText} from "../streak";

/** "3 in a row": appears once the learner has two right first time in a row, and pops with each one more. */
export default function StreakBadge({streak}: {streak: number}) {
  if (!showStreak(streak)) return null;
  return (
    <motion.span
      key={streak}
      initial={{scale: 0.7, opacity: 0}}
      animate={{scale: 1, opacity: 1}}
      transition={{type: "spring", stiffness: 420, damping: 16}}
      role="status"
      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700"
    >
      <Icon icon="ph:fire-fill" size={14} />
      {streakText(streak)}
    </motion.span>
  );
}
