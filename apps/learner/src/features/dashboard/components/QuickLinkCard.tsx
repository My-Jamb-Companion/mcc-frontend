import {Icon} from "@mcc/ui";
import Link from "next/link";

interface QuickLinkCardProps {
  title?: string;
  icon?: string;
  link: string;
  onClick?: () => void;
}

export default function QuickLinkCard({
  title,
  icon,
  link,
  onClick,
}: QuickLinkCardProps) {
  return (
    <Link
      href={link}
      onClick={onClick}
      className="relative w-full rounded-2xl bg-[#2a2a2e] overflow-hidden px-5 py-6 flex items-center justify-between cursor-pointer hover:brightness-110 transition-all hover:scale-95"
    >
      {/* Wavy topographic SVG background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 400 120"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[
          "M-20 30 Q 60 10, 120 35 T 260 30 T 420 25",
          "M-20 50 Q 60 30, 130 55 T 270 50 T 420 45",
          "M-20 70 Q 70 50, 140 72 T 280 68 T 420 65",
          "M-20 90 Q 80 70, 150 90 T 290 86 T 420 84",
          "M-20 108 Q 90 90, 160 108 T 300 104 T 420 102",
          "M-20 10 Q 50 -5, 110 15 T 250 10 T 420 5",
        ].map((d, i) => (
          <path key={i} d={d} stroke="white" strokeWidth="1.2" fill="none" />
        ))}
      </svg>

      <p className="relative z-10 text-white text-sm font-semibold">{title}</p>

      <div className="relative z-10 flex items-center">
        <Icon icon={String(icon)} size={36} color="white" />
      </div>
    </Link>
  );
}
