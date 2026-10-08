"use client";

import {useMemo} from "react";
import {Icon} from "@mcc/ui";
import type {ProfileUser} from "../constants/types";
import {RankBadge} from "./RankBadge";
import ProfileAvatar from "./ProfileAvatar";
import {locationLine} from "../helper/profile.mapper";

export default function ProfileHeader({
  user,
  avatar,
  setFile,
}: {
  user: ProfileUser;
  avatar: File | string;
  setFile: (file: File) => void;
}) {
  // Keep one object URL per picked file: creating it during render leaked a new one on every render.
  const avatarSrc = useMemo(
    () => (avatar instanceof File ? URL.createObjectURL(avatar) : avatar || undefined),
    [avatar],
  );
  const location = locationLine(user);
  return (
    <header className="relative">
      <div className="relative">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="relative -mt-12 w-fit">
            <button
              onClick={() => document.getElementById("file-input")?.click()}
              aria-label="Change profile photo"
              className="relative block h-28 w-28 md:h-36 md:w-36 overflow-hidden rounded-[32px] border-2 border-purple-300 bg-white shadow-lg cursor-pointer group"
            >
              <ProfileAvatar
                src={avatarSrc}
                name={user.displayName}
                className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                textClassName="text-3xl md:text-5xl"
              />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-[32px]">
                <Icon
                  icon="stash:image-plus"
                  className="text-white drop-shadow-lg"
                  size={32}
                />
              </span>
            </button>

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
                {user.displayName}
              </h1>

              <Icon
                icon="material-symbols:verified-rounded"
                className="text-blue-500"
                size={16}
              />
            </div>

            <div className="mt-2 flex items-center gap-2 text-subtle font-medium">
              {location && <span className="text-sm md:text-xl">{location}</span>}

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

            {user.rank > 0 && (
              <div className="max-md:hidden">
                <RankBadge rank={user.rank} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
