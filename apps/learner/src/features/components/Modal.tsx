"use client";

import {Icon} from "@mcc/ui";
import {
  ReactNode,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {createPortal} from "react-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModalRef {
  openDialog: () => void;
  closeDialog: () => void;
}

export interface ModalProps {
  trigger?: ReactNode;
  title?: string | ReactNode;
  description?: string | ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  onOpen?: () => void;
  maxWidth?: string;
  open?: boolean;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export const Modal = forwardRef<ModalRef, ModalProps>(
  (
    {
      trigger,
      title,
      description,
      children,
      onClose,
      onOpen,
      maxWidth = "max-w-md",
      open: controlledOpen,
    },
    ref,
  ) => {
    const isControlled = controlledOpen !== undefined;
    const [internalOpen, setInternalOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Always-fresh callback refs — never go in dependency arrays
    const onCloseRef = useRef(onClose);
    const onOpenRef = useRef(onOpen);
    onCloseRef.current = onClose;
    onOpenRef.current = onOpen;

    const open = isControlled ? controlledOpen : internalOpen;

    // ── Imperative API ──────────────────────────────────────────────────────
    // closeDialog / openDialog ONLY change state.
    // Callbacks (onOpen/onClose) are fired by the effect below — never inline.
    // This prevents any synchronous call chain that could loop.

    const openDialog = useCallback(() => {
      if (!isControlled) setInternalOpen(true);
    }, [isControlled]);

    const closeDialog = useCallback(() => {
      if (!isControlled) setInternalOpen(false);
    }, [isControlled]);

    useImperativeHandle(ref, () => ({openDialog, closeDialog}));

    // ── Fire onOpen / onClose via effect (async, never sync) ───────────────

    const prevOpenRef = useRef(open);
    useEffect(() => {
      const wasOpen = prevOpenRef.current;
      prevOpenRef.current = open;

      if (!wasOpen && open) onOpenRef.current?.(); // false → true
      if (wasOpen && !open) onCloseRef.current?.(); // true  → false
    }, [open]);

    // ── Keyboard: Escape ────────────────────────────────────────────────────

    useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeDialog();
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open, closeDialog]);

    // ── Focus management ────────────────────────────────────────────────────

    useEffect(() => {
      if (!open) return;
      const prev = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
      return () => prev?.focus();
    }, [open]);

    // ── Scroll lock ─────────────────────────────────────────────────────────

    useEffect(() => {
      document.body.style.overflow = open ? "hidden" : "";
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

    // ── Dialog markup ───────────────────────────────────────────────────────

    const dialog = open
      ? createPortal(
          <>
            {/* Backdrop */}
            <div
              aria-hidden
              onClick={closeDialog}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            />

            {/* Panel */}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
              aria-describedby={description ? "modal-desc" : undefined}
              ref={panelRef}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()} // don't let clicks bubble to backdrop
              className={[
                "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
                maxWidth,
                "rounded-xl border-2 bg-background p-6 shadow-xl outline-none",
                "animate-in fade-in zoom-in-95 duration-200",
              ].join(" ")}
            >
              {/* × close */}
              <button
                type="button"
                aria-label="Close"
                onClick={closeDialog}
                className="absolute right-4 top-4 rounded-sm opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon icon="lucide:x" size={18} />
              </button>

              {/* Header */}
              {(title || description) && (
                <div className="mb-4 space-y-1 pr-6">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-lg font-semibold leading-tight"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="modal-desc"
                      className="text-sm text-muted-foreground"
                    >
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* Body */}
              {children}
            </div>
          </>,
          document.body,
        )
      : null;

    return (
      <>
        {trigger && (
          <span
            onClick={(e) => {
              e.stopPropagation(); // prevent click from reaching the backdrop
              openDialog();
            }}
            style={{display: "contents"}}
          >
            {trigger}
          </span>
        )}
        {dialog}
      </>
    );
  },
);

Modal.displayName = "Modal";
