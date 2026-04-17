import {Icon, motion} from "@mcc/ui";
export default function LoggingIn() {
  return (
    <motion.div
      layoutId="auth-card"
      className="flex flex-col items-center gap-4"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.25}}
    >
      {/* Icon container */}
      <motion.div
        layout
        initial={{scale: 0.8, opacity: 0}}
        animate={{scale: 1, opacity: 1}}
        transition={{duration: 0.3, ease: "easeOut"}}
        className="mt-4 rounded-full p-4 border w-fit animated-pulse"
      >
        <Icon
          icon="system-uicons:enter-alt"
          width="48"
          height="48"
          fill="white"
        />
      </motion.div>

      {/* Text */}
      <motion.p
        layout
        initial={{opacity: 0, y: 8}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.1}}
        className="text-xl font-medium text-center"
      >
        Logging you into your account...
      </motion.p>

      {/* Shared button morph target (important!) */}
      <motion.div
        layoutId="auth-button"
        className="h-10 w-full rounded-full bg-primary flex items-center justify-center"
      >
        <motion.div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
      </motion.div>
    </motion.div>
  );
}
