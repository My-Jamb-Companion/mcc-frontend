"use client";

import {useState} from "react";
import {Icon} from "@mcc/ui";
import type {ProfileUser} from "../constants/types";
import {RankBadge} from "./RankBadge";
import Image from "next/image";

export default function ProfileHeader({
  user,
  avatar,
  setFile,
}: {
  user: ProfileUser;
  avatar: File | string;
  setFile: (file: File) => void;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const avatarSrc =
    avatar instanceof File
      ? URL.createObjectURL(avatar)
      : avatar || "/assets/images/profile.png";
  return (
    <header className="relative">
      <div className="relative">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="relative -mt-16 w-fit">
            <button
              onClick={() => setLightboxOpen(true)}
              className="relative w-40 h-43 md:h-64 md:w-64 overflow-hidden rounded-[45px] border-2 border-purple-300 bg-white shadow-xl cursor-zoom-in group"
            >
              <Image
                src={avatarSrc}
                alt="avatar"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                fill
              />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-[45px]">
                <Icon icon="material-symbols:zoom-in-rounded" className="text-white drop-shadow-lg" size={32} />
              </span>
            </button>

            {/* Fullscreen Lightbox */}
            {lightboxOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Profile photo fullscreen"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
                onClick={() => setLightboxOpen(false)}
                style={{animation: "fadeIn 0.2s ease"}}
              >
                <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
                <div
                  className="relative max-w-[90vw] max-h-[90vh] w-auto h-auto rounded-3xl overflow-hidden shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={avatarSrc}
                    alt="avatar fullscreen"
                    width={600}
                    height={600}
                    className="object-contain max-w-[90vw] max-h-[90vh] w-auto h-auto"
                  />
                </div>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full p-2 text-white transition-colors"
                  aria-label="Close fullscreen"
                >
                  <Icon icon="material-symbols:close-rounded" size={24} />
                </button>
              </div>
            )}
            <button
              onClick={() => document.getElementById("file-input")?.click()}
              className="md:hidden absolute bottom-0 right-0 bg-white border border-muted/40 rounded-md p-1"
            >
              <Icon icon="stash:image-plus" />
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </button>
          </div>

          <div className="flex-1 md:pt-8">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-4xl font-bold tracking-tight">
                {user.fullName || " Bright Mac"}
              </h1>

              <Icon
                icon="material-symbols:verified-rounded"
                className="text-blue-500"
                size={16}
              />
            </div>

            <div className="mt-2 flex items-center gap-2 text-subtle font-medium">
              <span className="text-sm md:text-xl">
                {user.city + ", " + user.state + ", " + user.country}
              </span>

              <span className="flex gap-1">
                <Icon icon="twemoji:flag-nigeria" size={20} />
              </span>
            </div>

            <button
              onClick={() => document.getElementById("file-input")?.click()}
              className="max-md:hidden mt-5 flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 "
            >
              <Icon icon="stash:image-plus" />
              Upload New profile Photo
            </button>
          </div>

          {/* Stats */}
          <div className="relative flex items-center max-md:justify-between md:gap-8 md:pt-20">
            <div>
              <p className="text-sm text-subtle font-medium">Username</p>

              <p className="font-semibold">{user.username}</p>
            </div>

            <div className="h-10 w-px bg-gray-200" />

            <div>
              <p className="text-sm text-subtle font-medium">Lessons</p>

              <p className="text-center font-semibold">{user.lessons}</p>
            </div>

            <div className="h-10 w-px bg-gray-200 max-sm:hidden" />

            <div className="rounded-full bg-orange-50 border border-orange-300 p-2 text-sm max-sm:hidden">
              🟠
              <span className="ml-1 font-semibold">
                {user.points} <span className="text-subtle">points</span>
              </span>
            </div>

            <div className="h-10 w-px bg-gray-200" />

            <div className="flex gap-5 text-sm text-nowrap text-subtle font-semibold">
              <span>💎 {user.diamonds}</span>

              <span>🪙 {user.coins}</span>
            </div>

            <div className="max-md:hidden">
              <RankBadge rank={1} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
