/**
 * The keyboard controls of a CBT exam without a mouse: nine keys, A B C D P N S R Y.
 *   A B C D  choose that option      N  next question      P  previous question
 *   S        end the exam (asks to confirm)
 *   Y        confirm: end the exam for good      R  return to the exam
 */
export type KeyAction =
  | {type: "pick"; index: number}
  | {type: "next"}
  | {type: "previous"}
  | {type: "end"}
  | {type: "confirm"}
  | {type: "return"};

/** The keys of the guide, for showing and for the shortcut help. */
export const KEY_GUIDE: {keys: string[]; text: string}[] = [
  {keys: ["A", "B", "C", "D"], text: "Choose that option"},
  {keys: ["N"], text: "Next question"},
  {keys: ["P"], text: "Previous question"},
  {keys: ["S"], text: "End the exam: a box asks you to confirm"},
  {keys: ["Y"], text: "In that box: yes, end the exam for good"},
  {keys: ["R"], text: "In that box: return to the exam"},
];

interface KeyLike {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  repeat?: boolean;
  target?: EventTarget | null;
}

const OPTION_KEYS = ["a", "b", "c", "d"];

/** Whether the key was typed into something that takes text, where letters must be left alone. */
const isTyping = (target: EventTarget | null | undefined): boolean => {
  const el = target as HTMLElement | null | undefined;
  if (!el || !el.tagName) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable === true;
};

/**
 * What a key press means right now, or null to leave it alone. While the confirmation box is open only Y and R do
 * anything (the exam behind it is not touched); otherwise Y and R do nothing. Held keys and shortcuts with Ctrl,
 * Cmd or Alt are never taken, and `optionCount` limits A to D to the options the question has.
 */
export function interpretKey(event: KeyLike, state: {confirming: boolean; optionCount: number}): KeyAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || isTyping(event.target)) return null;
  const key = event.key.length === 1 ? event.key.toLowerCase() : "";
  if (!key) return null;

  if (state.confirming) {
    if (key === "y") return {type: "confirm"};
    if (key === "r") return {type: "return"};
    return null;
  }

  const option = OPTION_KEYS.indexOf(key);
  if (option !== -1) return option < state.optionCount ? {type: "pick", index: option} : null;
  if (key === "n") return {type: "next"};
  if (key === "p") return {type: "previous"};
  if (key === "s") return {type: "end"};
  return null;
}
