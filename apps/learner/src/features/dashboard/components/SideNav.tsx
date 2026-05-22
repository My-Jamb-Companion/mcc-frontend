"use client";

import {AnimatePresence, Icon, motion} from "@mcc/ui";
import Link from "next/link";
import {useEffect, useState} from "react";
import {sideBarLinks} from "../constants/NavLinks";
import {usePathname} from "next/navigation";

export default function SideNav({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [hovering, setHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");

    const update = () => setIsMobile(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!hovering) {
      timeout = setTimeout(() => setOpen(false), 120);
    } else {
      setOpen(true);
    }

    return () => clearTimeout(timeout);
  }, [hovering, setOpen]);

  return (
    <>
      <motion.div
        layout={!isMobile}
        animate={isMobile ? {x: open ? 0 : "-100%"} : undefined}
        transition={{
          layout: {
            duration: 0.25,
            ease: "easeInOut",
            damping: 20,
            stiffness: 400,
          },
        }}
        className={`pl-3 max-sm:px-4 max-sm:pt-6 flex flex-col pb-5 h-full absolute left-0 top-0 ${open ? "w-55" : "w-fit"}
      max-sm:bg-white max-sm:w-full z-20`}
        onMouseEnter={() => !isMobile && setHovering(true)}
        onMouseLeave={() => !isMobile && setHovering(false)}
      >
        <div className="flex-1 flex flex-col items-center justify-center max-sm:justify-start">
          <div className="rounded-2xl bg-black w-full max-sm:rounded-none max-sm:bg-white">
            <div
              className={`pt-8 pb-12 flex flex-col gap-3 rounded-2xl bg-[#222225] max-sm:bg-white max-sm:rounded-none ${
                open && !isMobile && "pl-3"
              }`}
            >
              {sideBarLinks.map((link) => (
                <Link
                  href={link.link}
                  key={link.label}
                  className={`flex relative ${isMobile ? "w-full" : open ? "w-full" : "items-center"}`}
                >
                  <button
                    onClick={
                      isMobile
                        ? () => {
                            setOpen(false);
                          }
                        : undefined
                    }
                    className={`${
                      pathname.startsWith(link.link)
                        ? "bg-white text-black max-sm:bg-[#222225] max-sm:text-white rounded-xl "
                        : "text-white hover:bg-muted/40 max-sm:text-black"
                    } ${
                      isMobile
                        ? "w-full px-5 py-3.5 border-muted/40 border-b"
                        : open
                          ? "w-full mr-4 hover:rounded-xl"
                          : "w-fit mx-auto"
                    } p-2 flex items-center gap-2 cursor-pointer`}
                  >
                    <motion.div
                      className="relative z-10"
                      whileHover={{scale: isMobile ? 1 : 1.08}}
                      transition={{type: "spring", stiffness: 400}}
                    >
                      <Icon icon={String(link.icon)} size={20} />
                    </motion.div>

                    <AnimatePresence>
                      {isMobile ? (
                        <p className="text-sm font-medium capitalize whitespace-nowrap">
                          {link.label}
                        </p>
                      ) : (
                        open && (
                          <motion.p
                            animate={{
                              opacity: open ? 1 : 0,
                              x: open ? 0 : -8,
                            }}
                            transition={{
                              duration: 0.15,
                              delay: open ? 0.05 : 0,
                              ease: "easeInOut",
                            }}
                            className="text-sm font-medium capitalize whitespace-nowrap overflow-hidden"
                          >
                            {link.label}
                          </motion.p>
                        )
                      )}
                    </AnimatePresence>
                  </button>

                  {pathname.startsWith(link.link) && <Pin />}
                </Link>
              ))}
            </div>

            <div
              className={`${
                open ? "p-2" : "py-3"
              } flex items-center justify-center gap-3 max-sm:hidden`}
            >
              <div className="flex items-center gap-3 pl-3">
                <Icon icon="circle-flags:uk" size={16} />

                <AnimatePresence>
                  {open && (
                    <motion.p
                      animate={
                        open
                          ? {opacity: 1, x: 0, width: "auto"}
                          : {opacity: 0, x: -8, width: 0}
                      }
                      transition={{duration: 0.22, ease: "easeInOut"}}
                      className="text-white text-xs whitespace-nowrap overflow-hidden"
                    >
                      English (US)
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Icon icon="ci:caret-down-sm" size={24} color="grey" />
            </div>
          </div>
        </div>

        <div className="px-2 py-2.5 rounded-2xl bg-[#222225] flex items-center gap-2 w-full dark:border dark:border-muted/40 dark:shadow-md">
          <div className="w-full max-w-10 max-sm:w-15! h-10 rounded-full border-2 border-white overflow-hidden  bg-[#B190B6]">
            <img
              src="/assets/images/profile.png"
              alt="profile image"
              className="w-full h-full"
            />
          </div>

          <div
            className={`flex items-center justify-between ${
              open ? "w-full" : "w-fit"
            }`}
          >
            <AnimatePresence>
              {open && (
                <motion.div
                  animate={
                    open
                      ? {opacity: 1, x: 0, width: "auto"}
                      : {opacity: 0, x: -8, width: 0}
                  }
                  transition={{duration: 0.22, ease: "easeInOut"}}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <p className="text-xs font-semibold text-white">Bright Mba</p>
                  <p className="text-muted text-xs">@mac</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Icon icon="ci:caret-down-sm" size={24} color="white" />
          </div>
        </div>
      </motion.div>
    </>
  );
}

const Pin = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="33"
      viewBox="0 0 11 33"
      fill="none"
      className="translate-[1.5px] absolute right-0 max-sm:hidden"
    >
      <path
        d="M1.9334 13.5716C6.31448 11.3491 9.21206 7.97147 10.2085 0V33C9.20306 25.6268 6.23389 22.2421 1.78656 19.7946C-0.669804 18.4428 -0.567027 14.8401 1.9334 13.5716Z"
        fill="white"
      />
    </svg>
  );
};
