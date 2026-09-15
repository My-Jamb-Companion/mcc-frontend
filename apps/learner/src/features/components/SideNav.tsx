"use client";

import {AnimatePresence, Icon, motion} from "@mcc/ui";
import Link from "next/link";
import {useEffect, useRef, useState} from "react";
import {sideBarLinks} from "../dashboard/constants/NavLinks";
import {usePathname, useRouter} from "next/navigation";
import Image from "next/image";
import {CURRENT_USER} from "../account/constants/constants";

const LANGUAGES = [
  {code: "en", label: "English (US)", icon: "circle-flags:uk"},
  {code: "es", label: "Spanish", icon: "circle-flags:es"},
  {code: "fr", label: "French", icon: "circle-flags:fr"},
  {code: "de", label: "German", icon: "circle-flags:de"},
];

export default function SideNav({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [linksHovering, setLinksHovering] = useState(false);
  const [accLinksHovering, setAccLinksHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");

    const update = () => setIsMobile(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (
      !linksHovering &&
      !accLinksHovering &&
      !langMenuOpen &&
      !accountMenuOpen
    ) {
      timeout = setTimeout(() => setOpen(false), 120);
    } else {
      setOpen(true);
    }

    return () => clearTimeout(timeout);
  }, [linksHovering, accLinksHovering, langMenuOpen, accountMenuOpen, setOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setAccountMenuOpen(false);
    router.push("/signup");
  };

  return (
    <>
      <motion.div
        animate={isMobile ? {x: open ? 0 : "-100%"} : undefined}
        transition={{
          duration: 0.25,
          ease: "easeInOut",
        }}
        className="pl-3 max-sm:px-4 max-sm:pt-6 flex flex-col pb-5 h-full absolute left-0 top-0 w-fit max-sm:w-full max-sm:bg-white z-20"
      >
        <motion.div
          animate={{width: isMobile ? "100%" : linksHovering ? 220 : 80}}
          transition={{
            duration: 0.25,
            ease: "easeInOut",
          }}
          className="flex-1 flex flex-col items-center justify-center max-sm:justify-start w-full"
        >
          <div
            className="rounded-2xl bg-black w-full max-sm:rounded-none max-sm:bg-white relative"
            onMouseEnter={() => !isMobile && setLinksHovering(true)}
            onMouseLeave={() => !isMobile && setLinksHovering(false)}
          >
            <div
              className={`pt-8 pb-12 flex flex-col gap-3 rounded-2xl bg-[#222225] max-sm:bg-white max-sm:rounded-none ${
                linksHovering && !isMobile ? "pl-3" : ""
              }`}
            >
              {sideBarLinks.map((link) => (
                <Link
                  href={link.link}
                  key={link.label}
                  className={`flex relative ${isMobile ? "w-full" : linksHovering ? "w-full" : "items-center"}`}
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
                        : linksHovering
                          ? "w-full mr-4 hover:rounded-xl"
                          : "w-fit mx-auto"
                    } p-2 flex items-center gap-2 cursor-pointer`}
                  >
                    <motion.div
                      className="relative z-10 shrink-0"
                      whileHover={{scale: isMobile ? 1 : 1.08}}
                      transition={{type: "spring", stiffness: 400}}
                    >
                      <Icon icon={String(link.icon)} size={20} />
                    </motion.div>

                    <AnimatePresence initial={false}>
                      {isMobile ? (
                        <p className="text-sm font-medium capitalize whitespace-nowrap">
                          {link.label}
                        </p>
                      ) : (
                        linksHovering && (
                          <motion.p
                            initial={{opacity: 0, x: -8, width: 0}}
                            animate={{opacity: 1, x: 0, width: "auto"}}
                            exit={{opacity: 0, x: -8, width: 0}}
                            transition={{
                              duration: 0.18,
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

            {/* Language Selector Trigger */}
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen((prev) => !prev)}
                className={`${
                  linksHovering ? "p-2 justify-between" : "py-3 justify-center"
                } flex items-center gap-3 max-sm:hidden w-full text-left cursor-pointer hover:bg-white/5 transition-colors rounded-b-2xl`}
              >
                <div className="flex items-center gap-3 pl-3">
                  <Icon
                    icon={selectedLang.icon}
                    size={16}
                    className="shrink-0"
                  />

                  <AnimatePresence initial={false}>
                    {linksHovering && (
                      <motion.p
                        initial={{opacity: 0, x: -8, width: 0}}
                        animate={{opacity: 1, x: 0, width: "auto"}}
                        exit={{opacity: 0, x: -8, width: 0}}
                        transition={{duration: 0.22, ease: "easeInOut"}}
                        className="text-white text-xs whitespace-nowrap overflow-hidden"
                      >
                        {selectedLang.label}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <Icon
                  icon="ci:caret-down-sm"
                  size={24}
                  color="grey"
                  className="shrink-0"
                />
              </button>

              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{opacity: 0, y: 10, scale: 0.95}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    exit={{opacity: 0, y: 10, scale: 0.95}}
                    transition={{duration: 0.15, ease: "easeInOut"}}
                    className="absolute left-full bottom-0 ml-2 w-48 p-1.5 bg-[#222225] border border-white/10 rounded-xl shadow-xl z-30"
                  >
                    <p className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-muted uppercase">
                      Select Language
                    </p>
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang);
                          setLangMenuOpen(false);
                        }}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                          selectedLang.code === lang.code
                            ? "bg-white text-black font-semibold"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        <Icon icon={lang.icon} size={16} className="shrink-0" />
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={accountRef}
          animate={{width: isMobile ? "100%" : accLinksHovering ? 220 : 80}}
          transition={{
            duration: 0.25,
            ease: "easeInOut",
          }}
          className="w-full max-sm:w-full relative"
          onMouseEnter={() => !isMobile && setAccLinksHovering(true)}
          onMouseLeave={() => !isMobile && setAccLinksHovering(false)}
        >
          <AnimatePresence>
            {accountMenuOpen && (
              <motion.div
                initial={{opacity: 0, y: 8, scale: 0.95}}
                animate={{opacity: 1, y: 0, scale: 1}}
                exit={{opacity: 0, y: 8, scale: 0.95}}
                transition={{duration: 0.15, ease: "easeInOut"}}
                className="absolute bottom-full left-0 mb-2 w-full min-w-50 p-1.5 bg-[#222225] border border-white/10 rounded-2xl shadow-2xl z-30 flex flex-col gap-1"
              >
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setAccLinksHovering(false);
                    router.push("/account");
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <Icon icon="solar:user-bold" size={18} className="shrink-0" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setAccLinksHovering(false);
                    router.push("/account?tab=configurations");
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <Icon
                    icon="solar:settings-bold"
                    size={18}
                    className="shrink-0"
                  />
                  <span>Settings</span>
                </button>

                <div className="h-px bg-white/10 my-0.5" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <Icon
                    icon="solar:logout-2-bold"
                    size={18}
                    className="shrink-0"
                  />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setAccountMenuOpen((prev) => !prev)}
            className="px-2 py-2.5 rounded-2xl bg-[#222225] flex items-center gap-2 dark:border dark:border-muted/40 dark:shadow-md w-full text-left cursor-pointer hover:bg-[#2a2a2e] transition-colors"
          >
            <div className="relative w-10 h-10 min-w-10 rounded-full border-2 border-white overflow-hidden bg-[#B190B6] shrink-0">
              <Image
                src={CURRENT_USER.avatar || "/images/avatar-placeholder.png"}
                alt="profile image"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex items-center justify-between w-full overflow-hidden">
              <AnimatePresence initial={false}>
                {(accLinksHovering || isMobile) && (
                  <motion.div
                    initial={{opacity: 0, x: -8, width: 0}}
                    animate={{opacity: 1, x: 0, width: "auto"}}
                    exit={{opacity: 0, x: -8, width: 0}}
                    transition={{duration: 0.22, ease: "easeInOut"}}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <p className="text-xs font-semibold text-white max-sm:text-black">
                      {CURRENT_USER.fullName}
                    </p>
                    <p className="text-muted text-xs">
                      @{CURRENT_USER.username}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Icon
                icon="ci:caret-down-sm"
                size={24}
                color="white"
                className={`shrink-0 transition-transform duration-200 max-sm:text-black ${
                  accountMenuOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>
        </motion.div>
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
