"use client";

import {useRef} from "react";
import {Icon} from "@mcc/ui";
import Image from "next/image";

/** The built-in avatars: 1-7 male, 8-14 female (kept in this order so existing choices still match). */
export const AVATARS = Array.from({length: 14}, (_, i) => `/assets/images/avatars/${i + 1}.png`);

export default function AvatarPicker({
  setFile,
  selected,
}: {
  setFile: (file: string) => void;
  /** The student's current picture, to mark it if it is one of these. */
  selected?: string;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const scroll = (direction: 1 | -1) =>
    strip.current?.scrollBy({left: direction * 180, behavior: "smooth"});

  return (
    <div className="lg:block">
      <p className="mb-3 text-sm text-gray-500">You can also select avatars</p>

      <div className="flex items-center gap-2">
        <button type="button" onClick={() => scroll(-1)} aria-label="Previous avatars" className="text-gray-400 hover:text-gray-600">
          <Icon icon="mdi:chevron-left" />
        </button>

        <div ref={strip} className="scrollbar-hide flex max-w-[19rem] items-center gap-3 overflow-x-auto py-1 md:max-w-[22rem]">
          {AVATARS.map((avatar, i) => (
            <button
              type="button"
              key={avatar}
              onClick={() => setFile(avatar)}
              aria-label={`Avatar ${i + 1}`}
              aria-pressed={selected === avatar}
              className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-violet-400 transition hover:scale-110 ${
                selected === avatar ? "ring-2 ring-violet-600 ring-offset-2" : ""
              }`}
            >
              <Image src={avatar} alt="" fill sizes="40px" className="object-cover" />
            </button>
          ))}
        </div>

        <button type="button" onClick={() => scroll(1)} aria-label="More avatars" className="text-gray-400 hover:text-gray-600">
          <Icon icon="mdi:chevron-right" />
        </button>
      </div>
    </div>
  );
}
