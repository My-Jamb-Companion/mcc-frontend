"use client";
import {Icon} from "@mcc/ui";
import {playSound, unlockAudio} from "../sound/engine";
import {useSoundEnabled} from "../sound/prefs";

/** Sound on or off, remembered on this device. Also switched by the M key. */
export default function SoundToggle({onDark = false}: {onDark?: boolean}) {
  const [enabled, setEnabled] = useSoundEnabled();

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (next) {
      unlockAudio();
      playSound("toggle");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Sound on. Turn sound off" : "Sound off. Turn sound on"}
      title={enabled ? "Sound on (M)" : "Sound off (M)"}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
        onDark ? "bg-white/20 text-white hover:bg-white/30" : "bg-muted/10 text-foreground hover:bg-muted/20"
      }`}
    >
      <Icon icon={enabled ? "ph:speaker-high-bold" : "ph:speaker-slash-bold"} size={18} />
    </button>
  );
}
