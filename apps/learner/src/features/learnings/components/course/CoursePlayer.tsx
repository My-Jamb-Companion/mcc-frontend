"use client";

import {useRef, useState, useEffect, useCallback} from "react";
import {Icon} from "@mcc/ui";

interface CoursePlayerProps {
  src: string | undefined;
  poster?: string;
  isAudio?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (second: number) => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CoursePlayer({
  src,
  poster,
  isAudio = false,
  onEnded,
  onTimeUpdate: onTimeUpdateProp,
}: CoursePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
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

  // Get active media element ref dynamically
  const getActiveMedia = () => (isAudio ? audioRef.current : videoRef.current);

  const showControls = isAudio || !playing || controlsVisible;

  // ── auto-hide controls ────────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (playing && !isAudio) {
      hideControlsTimer.current = setTimeout(
        () => setControlsVisible(false),
        3000,
      );
    }
  }, [playing, isAudio]);

  useEffect(() => {
    if (!playing && hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [playing]);

  // ── Media Event Handlers ──────────────────────────────────────────
  const onTimeUpdate = () => {
    const media = getActiveMedia();
    if (!media || seeking) return;
    const time = media.currentTime;
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
    const media = getActiveMedia();
    if (!media) return;
    setDuration(media.duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    if (onEnded) onEnded();
  };

  // ── Control Actions ───────────────────────────────────────────────
  const togglePlay = () => {
    const media = getActiveMedia();
    if (!media) return;

    if (playing) {
      media.pause();
      setPlaying(false);
    } else {
      media
        .play()
        .then(() => setPlaying(true))
        .catch((err) => {
          console.error("Playback failed:", err);
          setPlaying(false);
        });
    }
  };

  const skip = (secs: number) => {
    const media = getActiveMedia();
    if (!media) return;

    media.currentTime = Math.min(
      Math.max(0, media.currentTime + secs),
      duration,
    );
    setShowSkipIndicator(secs < 0 ? "back" : "forward");
    setTimeout(() => setShowSkipIndicator(null), 600);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const media = getActiveMedia();
    if (!progressRef.current || !media) return;

    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    media.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    const media = getActiveMedia();
    if (media) media.volume = v;
    setMuted(v === 0);
  };

  const toggleMute = () => {
    const media = getActiveMedia();
    if (!media) return;
    const next = !muted;
    media.muted = next;
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
          if (!isAudio) toggleFullscreen();
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
  }, [muted, isFullscreen, duration, playing, isAudio]);

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
      className={`relative w-full overflow-hidden bg-neutral-900 shadow-2xl select-none ${
        isAudio ? "rounded-2xl border border-neutral-800 p-4" : "md:rounded-2xl"
      }`}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && !isAudio && setControlsVisible(false)}
      onClick={() => showVolume && setShowVolume(false)}
    >
      {/* ── Video Player ── */}
      {!isAudio && (
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
      )}

      {/* ── Audio Player ── */}
      {isAudio && (
        <div className="flex items-center gap-4 py-3 px-2">
          {/* Audio Visual / Cover Art Indicator */}
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            {poster ? (
              <img
                src={poster}
                alt="Audio cover"
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <Icon
                icon={playing ? "ph:wave-sine-bold" : "ph:music-notes-bold"}
                size={24}
                className={playing ? "animate-pulse" : ""}
              />
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-white truncate">
              Audio Track
            </span>
            <span className="text-xs text-neutral-400">
              {playing ? "Playing..." : "Paused"}
            </span>
          </div>

          <audio
            ref={audioRef}
            src={src}
            loop={looping}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onEnded={handleEnded}
          />
        </div>
      )}

      {/* ── Skip Indicator Overlay ── */}
      {showSkipIndicator && !isAudio && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
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

      {/* ── Controls Bar ── */}
      <div
        className={`${
          isAudio
            ? "relative mt-2"
            : `absolute inset-x-0 bottom-0 transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`
        }`}
      >
        {/* Dark Gradient (Video Only) */}
        {!isAudio && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
        )}

        <div className="relative px-4 pb-3 pt-4 flex flex-col gap-2.5">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className="w-full h-1.5 rounded-full bg-white/20 cursor-pointer group"
            onClick={handleProgressClick}
            onMouseDown={() => setSeeking(true)}
            onMouseUp={() => setSeeking(false)}
          >
            <div
              className="h-full rounded-full bg-violet-500 relative"
              style={{width: `${progress}%`}}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Buttons & Time Row */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className="text-white hover:scale-110 transition-transform"
              >
                <div className="bg-white/15 hover:bg-white/25 transition-colors rounded-full p-2">
                  <Icon
                    icon={playing ? "ph:pause-fill" : "ph:play-fill"}
                    size={16}
                    className="text-white"
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => skip(-10)}
                aria-label="Rewind 10 seconds"
                className="text-neutral-300 hover:text-white hover:scale-110 transition-all"
              >
                <Icon icon="ph:arrow-counter-clockwise" size={18} />
              </button>

              <button
                type="button"
                onClick={() => skip(10)}
                aria-label="Skip 10 seconds"
                className="text-neutral-300 hover:text-white hover:scale-110 transition-all"
              >
                <Icon icon="ph:arrow-clockwise" size={18} />
              </button>

              <span className="text-neutral-300 text-xs font-medium tabular-nums ml-1">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <button
                type="button"
                onClick={() => setLooping((l) => !l)}
                aria-label="Toggle loop"
                className={`hover:scale-110 transition-all ${
                  looping ? "text-violet-400" : "text-neutral-400"
                }`}
              >
                <Icon icon="ph:repeat" size={18} />
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVolume((v) => !v);
                  }}
                  onDoubleClick={toggleMute}
                  aria-label="Volume"
                  className="text-neutral-300 hover:text-white hover:scale-110 transition-all"
                >
                  <Icon icon={volumeIcon} size={18} />
                </button>

                {showVolume && (
                  <div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-neutral-800/90 backdrop-blur-md rounded-xl px-3 py-3 flex flex-col items-center gap-1 border border-neutral-700 shadow-xl z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="h-20 cursor-pointer accent-violet-500"
                      style={{
                        writingMode: "vertical-lr",
                        direction: "rtl",
                      }}
                    />
                    <span className="text-white text-[10px] tabular-nums mt-1">
                      {Math.round((muted ? 0 : volume) * 100)}
                    </span>
                  </div>
                )}
              </div>

              {!isAudio && (
                <>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label="Fullscreen"
                    className="text-neutral-300 hover:text-white hover:scale-110 transition-all"
                  >
                    <Icon
                      icon={isFullscreen ? "ph:arrows-in" : "ph:arrows-out"}
                      size={18}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      videoRef.current?.requestPictureInPicture?.()
                    }
                    aria-label="Picture in picture"
                    className="text-neutral-300 hover:text-white hover:scale-110 transition-all"
                  >
                    <Icon icon="ph:picture-in-picture" size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
