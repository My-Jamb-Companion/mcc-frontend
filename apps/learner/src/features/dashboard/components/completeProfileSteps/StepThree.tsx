"use client";

import {useRef, useState} from "react";
import {Controller, useFormContext} from "@mcc/features";
// import type {ProfileModalFormValues} from "../CompleteProfileForm";
import {Icon, Button, AnimatePresence, motion, Variants} from "@mcc/ui";
import Image from "next/image";
import {AvatarValue, ProfileModalFormValues} from "@mcc/store";

const avatars = [
  "/assets/images/avatars/1.png",
  "/assets/images/avatars/2.png",
  "/assets/images/avatars/3.png",
  "/assets/images/avatars/4.png",
  "/assets/images/avatars/5.png",
  "/assets/images/avatars/6.png",
  "/assets/images/avatars/7.png",
  "/assets/images/avatars/8.png",
  "/assets/images/avatars/9.png",
  "/assets/images/avatars/10.png",
  "/assets/images/avatars/11.png",
  "/assets/images/avatars/12.png",
  "/assets/images/avatars/13.png",
  "/assets/images/avatars/14.png",
];

const VISIBLE_COUNT = 5;

interface StepThreeProps {
  userName?: string;
  userHandle?: string;
}

export default function StepThree({
  userName = "Bright mac",
  userHandle = "mac",
}: StepThreeProps) {
  const {control} = useFormContext<ProfileModalFormValues>();

  const [avatarOffset, setAvatarOffset] = useState(0);

  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGoLeft = avatarOffset > 0;

  const canGoRight = avatarOffset + VISIBLE_COUNT < avatars.length;

  const visibleAvatars = avatars.slice(
    avatarOffset,
    avatarOffset + VISIBLE_COUNT,
  );

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: AvatarValue) => void,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files are allowed");

      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      setUploadError("Image must be smaller than 5MB");

      return;
    }

    setUploadError("");

    const reader = new FileReader();

    reader.onload = () => {
      onChange({
        type: "upload",
        value: reader.result as string,
      });
    };

    reader.readAsDataURL(file);
  };

  return (
    <Controller
      name="avatar"
      control={control}
      rules={{
        required: "Please upload or select an avatar",
      }}
      render={({field}) => {
        const avatarValue = field.value?.value || "";

        return (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-8"
          >
            <motion.div variants={item} className="flex items-center gap-4">
              <motion.div
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.96,
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="size-28! p-0! overflow-hidden rounded-full"
                >
                  <AnimatePresence mode="wait">
                    {avatarValue ? (
                      <motion.div
                        key={avatarValue}
                        initial={{
                          opacity: 0,
                          scale: 0.8,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                        }}
                        transition={{
                          duration: 0.25,
                        }}
                        className="size-full"
                      >
                        <Image
                          src={avatarValue}
                          alt="avatar"
                          width={100}
                          height={100}
                          className="size-full rounded-full object-cover bg-[#B190B6]"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty-avatar"
                        initial={{
                          opacity: 0,
                          scale: 0.8,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                        }}
                        className="size-14 rounded-full border border-dashed border-muted/40 flex items-center justify-center text-muted text-3xl"
                      >
                        +
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, field.onChange)}
              />

              <motion.div variants={item} className="flex flex-col gap-1">
                <p className="font-semibold">{userName}</p>

                <p className="text-subtle text-sm">@{userHandle}</p>
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {uploadError && (
                <motion.p
                  initial={{
                    opacity: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  className="text-danger text-sm -mt-4"
                >
                  {uploadError}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div variants={item} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-subtle text-sm">
                  You can also select avatars
                </p>

                <div className="flex items-center gap-2">
                  <motion.div
                    whileTap={{
                      scale: 0.9,
                    }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAvatarOffset((o) => o - 1)}
                      disabled={!canGoLeft}
                      aria-label="Previous avatars"
                      className="p-1! disabled:opacity-30 transition-opacity"
                    >
                      <Icon icon="basil:caret-left-solid" size={14} />
                    </Button>
                  </motion.div>

                  <motion.div
                    whileTap={{
                      scale: 0.9,
                    }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAvatarOffset((o) => o + 1)}
                      disabled={!canGoRight}
                      aria-label="Next avatars"
                      className="p-1! disabled:opacity-30 transition-opacity"
                    >
                      <Icon icon="basil:caret-right-solid" size={14} />
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={avatarOffset}
                    initial={{
                      opacity: 0,
                      x: 30,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -30,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="flex items-center gap-3"
                  >
                    {visibleAvatars.map((avatar, index) => {
                      const active = avatarValue === avatar;

                      return (
                        <motion.div
                          key={avatar}
                          variants={avatarVariants}
                          initial="hidden"
                          animate="show"
                          transition={{
                            delay: index * 0.05,
                          }}
                          whileHover={{
                            y: -3,
                          }}
                          whileTap={{
                            scale: 0.95,
                          }}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              field.onChange({
                                type: "preset",
                                value: avatar,
                              })
                            }
                            className={`size-16! p-0! rounded-full transition-all shrink-0 relative ${
                              active
                                ? "border-btn-primary scale-105 outline outline-primary"
                                : "border-transparent hover:border-muted/40"
                            }`}
                          >
                            <div className="overflow-hidden rounded-full h-full w-full">
                              <motion.div
                                animate={{
                                  scale: active ? 1.05 : 1,
                                }}
                                transition={{
                                  duration: 0.2,
                                }}
                                className="size-full"
                              >
                                <Image
                                  src={avatar}
                                  alt="avatar option"
                                  width={100}
                                  height={100}
                                  className="size-full object-cover bg-[#B190B6]"
                                />
                              </motion.div>
                            </div>

                            <AnimatePresence>
                              {active && (
                                <motion.div
                                  initial={{
                                    scale: 0,
                                    opacity: 0,
                                  }}
                                  animate={{
                                    scale: 1,
                                    opacity: 1,
                                  }}
                                  exit={{
                                    scale: 0,
                                    opacity: 0,
                                  }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 18,
                                  }}
                                  className="absolute top-0 right-0 bg-btn-primary rounded-full size-4 border-[.5px] border-white flex items-center justify-center text-white"
                                >
                                  <Icon icon="basil:check-solid" size={12} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        );
      }}
    />
  );
}

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const avatarVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18,
    },
  },
};
