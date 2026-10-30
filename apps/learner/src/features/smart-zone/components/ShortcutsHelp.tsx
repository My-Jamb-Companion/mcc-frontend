"use client";
import {Icon, Modal} from "@mcc/ui";
import {ZONE_KEY_GUIDE} from "../keys";

/** The "?" button that opens the guide to the keyboard shortcuts. */
export function ShortcutsButton({onClick, onDark = false}: {onClick: () => void; onDark?: boolean}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Keyboard shortcuts"
      title="Keyboard shortcuts (?)"
      className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors sm:flex ${
        onDark ? "bg-white/20 text-white hover:bg-white/30" : "bg-muted/10 text-foreground hover:bg-muted/20"
      }`}
    >
      <Icon icon="ph:keyboard-bold" size={18} />
    </button>
  );
}

/** Every Smart Zone shortcut, in a box that closes with Esc. */
export default function ShortcutsHelp({open, onClose}: {open: boolean; onClose: () => void}) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts" description="Answer faster without the mouse." x>
      <ul className="mt-2 flex flex-col gap-2.5">
        {ZONE_KEY_GUIDE.map((row) => (
          <li key={row.text} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-subtle">{row.text}</span>
            <span className="flex shrink-0 gap-1">
              {row.keys.map((key) => (
                <kbd
                  key={key}
                  className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-muted/30 bg-muted/10 px-1.5 font-sans text-xs font-semibold"
                >
                  {key}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
