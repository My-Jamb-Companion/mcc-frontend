"use client";

import {useRef, useState} from "react";
import {Controller, useFormContext} from "@mcc/features";
import type {FormValues} from "../CompleteProfileForm";
import {Icon, Button} from "@mcc/ui";
import Image from "next/image";

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

export type AvatarValue = {
  type: "upload" | "preset";
  value: string;
};

export default function StepThree({
  userName = "Bright mac",
  userHandle = "mac",
}: StepThreeProps) {
  const {control} = useFormContext<FormValues>();

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
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="size-28! p-0!"
              >
                {avatarValue ? (
                  <Image
                    src={avatarValue}
                    alt="avatar"
                    width={100}
                    height={100}
                    className="size-full rounded-full object-cover bg-[#B190B6]"
                  />
                ) : (
                  <div className="size-14 rounded-full border border-dashed border-muted/40 flex items-center justify-center text-muted text-3xl">
                    +
                  </div>
                )}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, field.onChange)}
              />

              <div className="flex flex-col gap-1">
                <p className="font-semibold">{userName}</p>

                <p className="text-subtle text-sm">{userHandle}</p>
              </div>
            </div>

            {uploadError && (
              <p className="text-danger text-sm -mt-4">{uploadError}</p>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-subtle text-sm">
                  You can also select avatars
                </p>

                <div className="flex items-center gap-2">
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
                </div>
              </div>

              <div className="flex items-center gap-3">
                {visibleAvatars.map((avatar) => {
                  const active = avatarValue === avatar;

                  return (
                    <Button
                      key={avatar}
                      type="button"
                      variant="outline"
                      onClick={() =>
                        field.onChange({
                          type: "preset",
                          value: avatar,
                        })
                      }
                      className={`size-16! p-0! rounded-full overflow-hidden transition-all shrink-0 ${
                        active
                          ? "border-btn-primary scale-105"
                          : "border-transparent hover:border-muted/40"
                      }`}
                    >
                      <Image
                        src={avatar}
                        alt="avatar option"
                        width={100}
                        height={100}
                        className="size-full object-cover bg-[#B190B6]"
                      />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
