"use client";

import {useRef, useState} from "react";
import {AnimatePresence, motion, Icon, Modal, ModalRef} from "@mcc/ui";
import CompleteProfileForm from "./CompleteProfileForm";
import Image from "next/image";
import {useProfileProgressStore} from "@mcc/store";

export default function Help() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<ModalRef>(null);

  return (
    <>
      <motion.div
        layout
        initial={{opacity: 0}}
        animate={{
          opacity: 1,
        }}
        transition={{
          layout: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
        className="fixed right-10 top-1/2 -translate-y-1/2 flex flex-col items-end z-50"
      >
        <AnimatePresence mode="popLayout">
          {open && (
            <motion.div
              layout="position"
              key="profile-card"
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 20,
                filter: "blur(8px)",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: 20,
                filter: "blur(8px)",
              }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="origin-bottom-right"
            >
              <CompleteProfileCard
                onResume={() => modalRef.current?.openDialog()}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          layout="position"
          whileHover={{
            scale: 1.06,
          }}
          whileTap={{
            scale: 0.92,
          }}
          transition={{
            layout: {
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          className="self-end rounded-full mt-4 p-2 w-fit border border-muted/40 cursor-pointer bg-white hover:opacity-80 dark:text-white dark:bg-subtle dark:border dark:border-white"
          onClick={() => setOpen(!open)}
        >
          <motion.div>
            <Icon icon="line-md:question" size={24} />
          </motion.div>
        </motion.button>
      </motion.div>

      <Modal ref={modalRef}>
        <CompleteProfileForm close={() => modalRef.current?.closeDialog()} />
      </Modal>
    </>
  );
}

export function CompleteProfileCard({onResume}: {onResume: () => void}) {
  const [open, setOpen] = useState(true);
  const {step, completedSteps} = useProfileProgressStore();
  console.log(completedSteps);

  const steps = [
    {
      title: "Personal details",
      status: completedSteps.includes(1)
        ? "complete"
        : step === 1
          ? "loading"
          : "pending",
    },

    {
      title: "Your location",
      status: completedSteps.includes(2)
        ? "complete"
        : step === 2
          ? "loading"
          : "pending",
    },

    {
      title: "Profile photo",
      status: completedSteps.includes(3)
        ? "complete"
        : step === 3
          ? "loading"
          : "pending",
    },
  ];

  const progressIconMap = {
    0: "hugeicons:progress-01",
    1: "ri:progress-3-line",
    2: "ri:progress-5-line",
    3: "ri:progress-8-line",
  };

  const progress = completedSteps.length;

  return (
    <motion.div
      layout
      transition={{
        layout: {
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      className="w-115 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm h-fit"
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: open ? 0 : -8,
            }}
            transition={{
              duration: 0.25,
            }}
            className="text-violet-600"
          >
            <Icon icon="ri:user-4-line" size={22} />
          </motion.div>

          <p className="text-xl font-semibold text-neutral-900">
            Complete profile
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-neutral-600">
            <motion.div
              animate={{
                rotate: open ? 360 : 0,
              }}
              transition={{
                duration: 0.5,
              }}
            >
              <Icon
                icon={progressIconMap[progress as 0 | 1 | 2 | 3]}
                size={20}
                className="text-violet-600"
              />
            </motion.div>

            <span className="text-xs font-semibold">
              {completedSteps.length}/3
            </span>
          </div>

          <motion.button
            whileTap={{scale: 0.9}}
            animate={{
              rotate: open ? 0 : 180,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="cursor-pointer text-neutral-500"
            onClick={() => setOpen(!open)}
          >
            <Icon icon="lucide:chevron-down" size={22} />
          </motion.button>
        </div>
      </div>

      {/* expandable content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              height: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: {
                duration: 0.2,
              },
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.05,
                  },
                },
              }}
            >
              {/* steps */}
              <div className="mt-6 rounded-[28px] bg-[#f3f3f3] p-6">
                <div className="flex flex-1 flex-col justify-between py-1">
                  {steps.map((step, i) => (
                    <motion.div
                      key={step.title}
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: 10,
                        },
                        show: {
                          opacity: 1,
                          y: 0,
                        },
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="flex min-h-16 items-start gap-3"
                    >
                      {/* status icon */}
                      {step.status === "pending" ? (
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className="h-10 w-10 rounded-full border border-neutral-200 bg-white shadow-sm"
                        >
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="h-5 w-5 rounded-full border border-neutral-300" />
                          </div>
                        </motion.div>
                      ) : step.status === "loading" ? (
                        <motion.div
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm"
                        >
                          <Icon
                            icon="tabler:loader"
                            size={16}
                            className="text-neutral-500"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{
                            scale: 0,
                          }}
                          animate={{
                            scale: 1,
                          }}
                          transition={{
                            delay: i * 0.1,
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm"
                        >
                          <Icon
                            icon="material-symbols:check-rounded"
                            size={16}
                          />
                        </motion.div>
                      )}

                      {/* text */}
                      <motion.p
                        initial={{
                          opacity: 0,
                          x: -10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: i * 0.05,
                        }}
                        className="pt-2 text-sm font-medium text-neutral-900"
                      >
                        {step.title}
                      </motion.p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* progress */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.25,
                  duration: 0.35,
                }}
                className="mt-8 flex items-center gap-4"
              >
                <div className="relative h-14 flex-1 overflow-hidden rounded-full bg-white shadow-inner">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${(completedSteps.length / 3) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`"relative flex h-full items-center justify-between rounded-full px-2 ${completedSteps.length !== 0 ? "bg-primary" : ""}`}
                  >
                    <motion.div
                      initial={{
                        scale: 0,
                        x: -20,
                      }}
                      animate={{
                        scale: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: 0.35,
                        type: "spring",
                      }}
                      className="absolute h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-pink-600"
                    >
                      <div>
                        <Image
                          src="/assets/images/profile.png"
                          alt="profile"
                          width={100}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </motion.div>

                    <motion.span
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      transition={{
                        delay: 0.55,
                      }}
                      className={`text-sm font-bold  ${completedSteps.length !== 0 ? "text-white ml-auto " : "text-muted ml-12"}`}
                    >
                      {Math.round((completedSteps.length / 3) * 100)}%
                    </motion.span>
                  </motion.div>
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.92,
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 bg-[#f8f8f8] transition cursor-pointer"
                  onClick={onResume}
                >
                  <motion.div
                    whileHover={{
                      x: 2,
                      y: -2,
                    }}
                  >
                    <Icon
                      icon="lucide:move-up-right"
                      size={22}
                      className="text-neutral-700"
                    />
                  </motion.div>
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
