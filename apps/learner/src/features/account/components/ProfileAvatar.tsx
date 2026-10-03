"use client";

import {useState} from "react";
import {initialsOf} from "../helper/profile.mapper";

/**
 * A student's picture, or their initials when there is none or it won't load.
 * A plain <img>, not next/image: uploaded photos live on the storage host,
 * which next/image refuses unless that host is whitelisted, and a refused
 * image is exactly the broken picture this replaces.
 */
export default function ProfileAvatar({
  src,
  name,
  className = "",
  textClassName = "text-sm",
}: {
  src?: string | null;
  name: string;
  /** Size and shape (the box this fills). */
  className?: string;
  textClassName?: string;
}) {
  // Remember which URL failed, so a new picture gets a fresh try.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = !!src && src !== failedSrc;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setFailedSrc(src)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span
          aria-label={name}
          className={`absolute inset-0 flex items-center justify-center bg-linear-to-br from-violet-500 to-fuchsia-500 font-semibold text-white ${textClassName}`}
        >
          {initialsOf(name)}
        </span>
      )}
    </div>
  );
}
