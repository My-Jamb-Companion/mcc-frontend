"use client";

import {Button} from "@mcc/ui";
import Image from "next/image";

export default function ProfileComplete({
  avatar,
  click,
}: {
  avatar: string;
  click?: () => void;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col relative">
        <Image
          src="/assets/images/ProfileBg.png"
          alt="profileBg"
          width={800}
          height={500}
          className="w-full h-auto object-cover"
          priority
        />

        <div className="absolute left-1/2 top-[50%] z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="relative size-33 overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
            <Image src={avatar} alt="profile" fill className="object-cover" />
          </div>
        </div>

        {/* GLASS CARD */}
        <div className="absolute bottom-2 left-1/2 z-20 w-[96%] -translate-x-1/2 rounded-xl border border-white/20 bg-black/30 p-12 backdrop-blur-xs" />
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-semibold text-2xl">Profile Complete.</p>

        <p className="text-subtle">
          You profile is complete, you can now enjoy a personalized version of
          MCC.
        </p>
        <Button onClick={click}>Awesome!</Button>
      </div>
    </section>
  );
}
