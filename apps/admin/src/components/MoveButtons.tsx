import {Icon} from "@mcc/ui";

/** The list with the item at `from` moved to `to` (clamped to the ends). The original list is never changed. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length) return items;
  const target = Math.max(0, Math.min(to, items.length - 1));
  if (target === from) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(target, 0, moved);
  return next;
}

/**
 * Up and down arrows for putting one item of a list in order. Replaces dragging, which is
 * fiddly on long lists, on touch screens and when the list has to scroll.
 * `onMove` gets the position the item should move to.
 */
export default function MoveButtons({
  index,
  count,
  onMove,
  label = "item",
  disabled = false,
  direction = "column",
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  /** What is being moved, for screen readers: "Move <label> up". */
  label?: string;
  disabled?: boolean;
  direction?: "column" | "row";
}) {
  const button =
    "flex h-6 w-7 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent";
  return (
    <div
      className={`flex shrink-0 items-center ${direction === "column" ? "flex-col" : "flex-row"}`}
      role="group"
      aria-label={`Order of ${label}`}
    >
      <button
        type="button"
        className={button}
        aria-label={`Move ${label} up`}
        title="Move up"
        disabled={disabled || index <= 0}
        onClick={(e) => {
          e.stopPropagation();
          onMove(index - 1);
        }}
      >
        <Icon icon="lucide:chevron-up" size={16} />
      </button>
      <button
        type="button"
        className={button}
        aria-label={`Move ${label} down`}
        title="Move down"
        disabled={disabled || index >= count - 1}
        onClick={(e) => {
          e.stopPropagation();
          onMove(index + 1);
        }}
      >
        <Icon icon="lucide:chevron-down" size={16} />
      </button>
    </div>
  );
}
