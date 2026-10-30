/**
 * The Smart Zone's keyboard controls, for answering fast without a mouse.
 *   A-F or 1-6  choose that option     Enter  check the answer / go to the next question
 *   N next      P previous             H hint            S skip
 *   M mute      ? show this guide      Esc    close the guide
 */
export type ZoneAction =
  | {type: "pick"; index: number}
  | {type: "primary"}
  | {type: "next"}
  | {type: "previous"}
  | {type: "hint"}
  | {type: "skip"}
  | {type: "mute"}
  | {type: "help"}
  | {type: "close"};

/** The guide, for the shortcut help box. */
export const ZONE_KEY_GUIDE: {keys: string[]; text: string}[] = [
  {keys: ["A", "B", "C", "D"], text: "Choose that option (1 to 4 work too)"},
  {keys: ["Enter"], text: "Check your answer, then go to the next question"},
  {keys: ["N"], text: "Next question"},
  {keys: ["P"], text: "Previous question (when reviewing)"},
  {keys: ["H"], text: "Show a hint"},
  {keys: ["S"], text: "Skip and see the answer"},
  {keys: ["M"], text: "Sound on or off"},
  {keys: ["?"], text: "Show this guide"},
  {keys: ["Esc"], text: "Close this guide"},
];

interface KeyLike {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  repeat?: boolean;
  target?: EventTarget | null;
}

const OPTION_LETTERS = ["a", "b", "c", "d", "e", "f"];
const OPTION_DIGITS = ["1", "2", "3", "4", "5", "6"];

const tag = (target: EventTarget | null | undefined): string => ((target as HTMLElement | null)?.tagName ?? "").toUpperCase();
const isEditable = (target: EventTarget | null | undefined): boolean =>
  (target as HTMLElement | null | undefined)?.isContentEditable === true;

/**
 * What a key press means right now, or null to leave it alone. Letters typed into a text box are never taken
 * (Enter in a one-line box still sends the answer), shortcuts with Ctrl, Cmd or Alt are left to the browser, and
 * held keys do nothing. While the guide is open only Esc and ? act, so it can be closed.
 */
export function interpretZoneKey(event: KeyLike, state: {optionCount: number; helpOpen: boolean}): ZoneAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return null;

  if (event.key === "Escape") return state.helpOpen ? {type: "close"} : null;
  if (event.key === "?") return {type: "help"};
  if (state.helpOpen) return null;

  const element = tag(event.target);
  if (event.key === "Enter") {
    if (element === "TEXTAREA" || element === "SELECT" || isEditable(event.target)) return null;
    return {type: "primary"};
  }
  if (element === "INPUT" || element === "TEXTAREA" || element === "SELECT" || isEditable(event.target)) return null;

  const key = event.key.length === 1 ? event.key.toLowerCase() : "";
  if (!key) return null;

  const letter = OPTION_LETTERS.indexOf(key);
  const digit = OPTION_DIGITS.indexOf(key);
  const index = letter !== -1 ? letter : digit;
  if (index !== -1) return index < state.optionCount ? {type: "pick", index} : null;

  switch (key) {
    case "n": return {type: "next"};
    case "p": return {type: "previous"};
    case "h": return {type: "hint"};
    case "s": return {type: "skip"};
    case "m": return {type: "mute"};
    default: return null;
  }
}
