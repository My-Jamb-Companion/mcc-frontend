"use client";

const COLORS = [
  "bg-violet-200 text-violet-700",
  "bg-sky-200 text-sky-700",
  "bg-emerald-200 text-emerald-700",
  "bg-amber-200 text-amber-700",
  "bg-rose-200 text-rose-700",
];

export function Avatar({name, src, size = "md"}: {name: string; src?: string | null; size?: "sm" | "md"}) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  const initials = (name || "?").slice(0, 2).toUpperCase();
  const color = COLORS[(name || "?").charCodeAt(0) % COLORS.length];
  if (src) {
    return <img src={src} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  }
  return <div className={`${dim} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${color}`}>{initials}</div>;
}

/** "Teacher" / "Moderator" next to a name, so a reader knows whose answer carries authority. */
export function RoleBadge({badge}: {badge?: "Teacher" | "Moderator" | null}) {
  if (!badge) return null;
  return <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{badge}</span>;
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
