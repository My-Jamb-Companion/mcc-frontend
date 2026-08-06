"use client";

import {useRef, useState, useEffect, useCallback} from "react";
import {Icon} from "@mcc/ui";

interface VideoPlayerProps {
  src: string | undefined;
  poster?: string;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CoursePlayer({
  src,
  poster,
  onEnded,
  onTimeUpdate: onTimeUpdateProp,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentTime = useRef<number>(-1);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [looping, setLooping] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showSkipIndicator, setShowSkipIndicator] = useState<
    "back" | "forward" | null
  >(null);

  // Derived — always show when paused, otherwise follow mouse activity
  const showControls = !playing || controlsVisible;

  // ── auto-hide controls ────────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (playing) {
      hideControlsTimer.current = setTimeout(
        () => setControlsVisible(false),
        3000,
      );
    }
  }, [playing]);

  // Effect only clears timer — no setState
  useEffect(() => {
    if (!playing && hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [playing]);

  // ── video event handlers ──────────────────────────────────────────
  const onTimeUpdate = () => {
    if (!videoRef.current || seeking) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    if (onTimeUpdateProp) {
      const currentSecond = Math.floor(time);
      if (lastSentTime.current !== currentSecond) {
        lastSentTime.current = currentSecond;
        onTimeUpdateProp(currentSecond);
      }
    }
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    if (onEnded) onEnded();
  };

  // ── controls ──────────────────────────────────────────────────────
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying((p) => !p);
  };

  const skip = (secs: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      Math.max(0, videoRef.current.currentTime + secs),
      duration,
    );
    setShowSkipIndicator(secs < 0 ? "back" : "forward");
    setTimeout(() => setShowSkipIndicator(null), 600);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    videoRef.current.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !muted;
    videoRef.current.muted = next;
    setMuted(next);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "arrowright":
          skip(10);
          break;
        case "arrowleft":
          skip(-10);
          break;
        case " ":
          e.preventDefault();
          togglePlay();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [muted, isFullscreen, duration, playing]);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const volumeIcon =
    muted || volume === 0
      ? "ph:speaker-slash"
      : volume < 0.5
        ? "ph:speaker-low"
        : "ph:speaker-high";

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl select-none"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setControlsVisible(false)}
      onClick={() => showVolume && setShowVolume(false)}
    >
      {/* ── Video ── */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop={looping}
        className="w-full aspect-video object-cover"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={handleEnded}
        onClick={togglePlay}
      />

      {/* ── Skip indicator ── */}
      {showSkipIndicator && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium text-white">
            <Icon
              icon={
                showSkipIndicator === "back"
                  ? "ph:arrow-counter-clockwise"
                  : "ph:arrow-clockwise"
              }
              size={18}
            />
            10s
          </div>
        </div>
      )}

      {/* ── Controls overlay ── */}
      <div
        className={`absolute inset-x-0 bottom-0 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-4 pt-8 flex flex-col gap-2">
          {/* ── Progress bar ── */}
          <div
            ref={progressRef}
            className="w-full h-1 rounded-full bg-white/25 cursor-pointer group"
            onClick={handleProgressClick}
            onMouseDown={() => setSeeking(true)}
            onMouseUp={() => setSeeking(false)}
          >
            <div
              className="h-full rounded-full bg-white relative"
              style={{width: `${progress}%`}}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* ── Buttons row ── */}
          <div className="flex items-center justify-between">
            {/* left controls */}
            <div className="flex items-center gap-3">
              {/* play/pause */}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className="text-white hover:scale-110 transition-transform"
              >
                <div className="bg-white/15 hover:bg-white/25 transition-colors rounded-full p-1.5">
                  <Icon
                    icon={playing ? "ph:pause-fill" : "ph:play-fill"}
                    size={16}
                    className="text-white"
                  />
                </div>
              </button>

              {/* rewind */}
              <button
                type="button"
                onClick={() => skip(-10)}
                aria-label="Rewind 10 seconds"
                className="text-white hover:scale-110 transition-transform"
              >
                <Icon icon="ph:arrow-counter-clockwise" size={18} />
              </button>

              {/* forward */}
              <button
                type="button"
                onClick={() => skip(10)}
                aria-label="Skip 10 seconds"
                className="text-white hover:scale-110 transition-transform"
              >
                <Icon icon="ph:arrow-clockwise" size={18} />
              </button>

              {/* time */}
              <span className="text-white text-xs font-medium tabular-nums">
                {formatTime(currentTime)}/{formatTime(duration)}
              </span>

              {/* loop */}
              <button
                type="button"
                onClick={() => setLooping((l) => !l)}
                aria-label="Toggle loop"
                className={`hover:scale-110 transition-all ${
                  looping ? "text-white" : "text-white/50"
                }`}
              >
                <Icon icon="ph:repeat" size={18} />
              </button>
            </div>

            {/* right controls */}
            <div className="flex items-center gap-3">
              {/* volume */}
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVolume((v) => !v);
                  }}
                  onDoubleClick={toggleMute}
                  aria-label="Volume"
                  className="text-white hover:scale-110 transition-transform"
                >
                  <Icon icon={volumeIcon} size={18} />
                </button>

                {showVolume && (
                  <div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-xl px-3 py-3 flex flex-col items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="h-20 cursor-pointer accent-white"
                      style={{writingMode: "vertical-lr", direction: "rtl"}}
                    />
                    <span className="text-white text-[10px] tabular-nums mt-1">
                      {Math.round((muted ? 0 : volume) * 100)}
                    </span>
                  </div>
                )}
              </div>

              {/* fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Fullscreen"
                className="text-white hover:scale-110 transition-transform"
              >
                <Icon
                  icon={isFullscreen ? "ph:arrows-in" : "ph:arrows-out"}
                  size={18}
                />
              </button>

              {/* pip */}
              <button
                type="button"
                onClick={() => videoRef.current?.requestPictureInPicture?.()}
                aria-label="Picture in picture"
                className="text-white hover:scale-110 transition-transform"
              >
                <Icon icon="ph:picture-in-picture" size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
