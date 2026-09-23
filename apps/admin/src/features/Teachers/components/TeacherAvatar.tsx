/**
 * A teacher's picture, or their initials when they have none.
 *
 * Most teachers have no avatar_url, so `<img src={teacher.avatar}>` rendered
 * an empty src. A browser treats that as "fetch the current page", so every
 * such image re-downloaded the whole document -- once per image, on every
 * render that showed one.
 */
const AVATAR_COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

export function initialsFor(name: string) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function colorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < (seed || "").length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function TeacherAvatar({
  name,
  avatar,
  className = "",
  textClassName = "text-xs",
}: {
  name: string;
  avatar?: string | null;
  className?: string;
  textClassName?: string;
}) {
  const source = avatar?.trim();
  return (
    <div
      className={`flex items-center justify-center overflow-hidden font-semibold shrink-0 ${colorFor(name)} ${className}`}
    >
      {source ? (
        <img src={source} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className={textClassName}>{initialsFor(name)}</span>
      )}
    </div>
  );
}
