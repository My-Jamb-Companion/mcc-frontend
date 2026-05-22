import {Icon} from "@mcc/ui";
import {useCountdown} from "../hooks/useCountDown";

export default function LiveClassCard({
  title,
  thumbnail,
  instructorImage,
  instructorName,
  scheduledAt,
  datetime,
  onJoin,
}: LiveClassCardProps) {
  const {h, m, s} = useCountdown(scheduledAt);

  return (
    <div className="relative w-full rounded-2xl bg-[#ECEEF1] overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-56 pointer-events-none">
        <img
          src={instructorImage}
          alt={instructorName}
          className="w-full h-full object-cover object-top"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 40%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 40%)",
          }}
        />
      </div>

      <div className="relative z-10 px-6 py-7 max-sm:px-3 max-sm:py-4 flex flex-col gap-4">
        <div className="flex items-start gap-3 w-[50%] max-sm:flex-col max-sm:w-[70%]">
          <img
            src={thumbnail}
            alt="course thumbnail"
            className="w-12 h-12 rounded-xl border border-muted/50 bg-amber-200 object-cover shrink-0"
          />
          <p className="text-sm font-semibold text-[#1a2332] leading-snug pt-0.5">
            {title}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 w-full bg-black/50 backdrop-blur-3xl rounded-2xl px-8 py-5 max-sm:p-3">
            <Icon
              icon="solar:stopwatch-broken"
           size={16}
              color="white"
            />

            <div className="flex items-center gap-1.5 text-white/90 shrink-0 max-sm:flex-col max-sm:items-start">
              <span className="text-xs">{datetime}</span>

              <span className="text-white/50 text-xs max-sm:hidden">•</span>

              <span className="text-xs text-white shrink-0">
                {String(h).padStart(2, "0")}h : {String(m).padStart(2, "0")}m :{" "}
                {String(s).padStart(2, "0")}s
              </span>
            </div>

            <div className="flex-1 max-sm:hidden" />

            <div className="flex items-center gap-1.5 shrink-0 max-sm:hidden">
              <span
                className="text-white/80 text-sm"
                style={{fontFamily: "cursive"}}
              >
                with
              </span>
              <span className="text-white text-xs font-medium">
                {instructorName}
              </span>
            </div>
          </div>

          <button
            onClick={onJoin}
            className="rounded-2xl p-5 bg-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer active:scale-95 focus:outline-primary"
          >
            <Icon icon="octicon:play-24" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface LiveClassCardProps {
  title: string;
  thumbnail: string;
  instructorImage: string;
  instructorName: string;
  scheduledAt: Date;
  datetime: string;
  onJoin?: () => void;
}
