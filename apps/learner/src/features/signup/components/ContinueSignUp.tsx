"use client";

import {Icon, motion} from "@mcc/ui";
import {useGoogleAuth, useFacebookAuth} from "@mcc/features";

export default function ContinueWithAccount({
  mail,
}: {
  mail: (value: boolean) => void;
}) {
  const googleMutation = useGoogleAuth();
  const facebookMutation = useFacebookAuth();

  const isRedirecting = googleMutation.isPending || facebookMutation.isPending;

  const socialButtons = [
    {
      icon: "material-icon-theme:google",
      label: googleMutation.isPending
        ? "Redirecting..."
        : "Continue with Google",
      onClick: () => googleMutation.mutate(),
      disabled: isRedirecting,
    },
    {
      icon: "logos:facebook",
      label: facebookMutation.isPending
        ? "Redirecting..."
        : "Continue with Facebook",
      onClick: () => facebookMutation.mutate(),
      disabled: isRedirecting,
    },
    {
      icon: "logos:whatsapp-icon",
      label: "Continue with WhatsApp",
      onClick: undefined,
      disabled: true,
    },
  ];

  return (
    <motion.div
      key="continue"
      layout
      initial={{opacity: 0, scale: 0.96}}
      animate={{opacity: 1, scale: 1}}
      exit={{opacity: 0, scale: 0.96}}
      transition={{duration: 0.35, ease: "easeInOut"}}
    >
      <motion.div layoutId="auth-card">
        <div className="mt-8 mb-6">
          <h4 className="text-xl font-semibold">Welcome to MC. Companion</h4>
          <p className="text-muted text-sm">Sign in and continue learning</p>
        </div>

        <motion.div
          className="flex flex-col gap-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {transition: {staggerChildren: 0.06}},
          }}
        >
          {socialButtons.map((item, i) => (
            <motion.button
              key={i}
              variants={{
                hidden: {opacity: 0, y: 8},
                show: {opacity: 1, y: 0},
              }}
              onClick={item.onClick}
              disabled={item.disabled}
              className="border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/5 mx-auto rounded-full py-2.5 w-full font-medium active:scale-97 outline-primary/50 focus:outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon icon={item.icon} size={18} />
              <span className="text-xs">{item.label}</span>
            </motion.button>
          ))}

          <motion.h3
            className="my-4 text-center"
            variants={{hidden: {opacity: 0}, show: {opacity: 1}}}
          >
            OR
          </motion.h3>

          <motion.button
            layoutId="auth-button"
            variants={{
              hidden: {opacity: 0, y: 8},
              show: {opacity: 1, y: 0},
            }}
            onClick={mail.bind(null, true)}
            className="border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/5 mx-auto rounded-full py-2.5 w-full font-medium active:scale-97 outline-primary/50 focus:outline"
          >
            <Icon icon="ic:baseline-email" size={18} />
            <span className="text-xs">Continue with Email</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
