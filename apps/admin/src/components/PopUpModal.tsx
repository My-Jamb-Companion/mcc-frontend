"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {createPortal} from "react-dom";
import {Icon} from "@mcc/ui";

export type PopUpModalRef = {
  openDialog: () => void;
  closeDialog: () => void;
};

type ModalProps = {
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  x?: boolean;

  /** Controlled mode */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** Lifecycle callbacks */
  onOpen?: () => void;
  onClose?: () => void;
};

export const PopUpModal = forwardRef<PopUpModalRef, ModalProps>(
  (
    {
      trigger,
      title,
      description,
      children,
      maxWidth = "max-w-md",
      x = false,

      open: controlledOpen,
      onOpenChange,

      onOpen,
      onClose,
    },
    ref,
  ) => {
    const isControlled = controlledOpen !== undefined;

    const [internalOpen, setInternalOpen] = useState(false);

    const open = isControlled ? controlledOpen : internalOpen;

    const panelRef = useRef<HTMLDivElement>(null);

    const titleId = useId();
    const descId = useId();

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) {
          setInternalOpen(next);
        }

        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    const openDialog = useCallback(() => {
      setOpen(true);
    }, [setOpen]);

    const closeDialog = useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    useImperativeHandle(
      ref,
      () => ({
        openDialog,
        closeDialog,
      }),
      [openDialog, closeDialog],
    );

    const prevOpen = useRef(open);

    useEffect(() => {
      if (!prevOpen.current && open) {
        onOpen?.();
      }

      if (prevOpen.current && !open) {
        onClose?.();
      }

      prevOpen.current = open;
    }, [open, onOpen, onClose]);

    useEffect(() => {
      if (!open) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeDialog();
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open, closeDialog]);

    useEffect(() => {
      if (!open) return;

      const previous = document.activeElement as HTMLElement | null;

      panelRef.current?.focus();

      return () => previous?.focus();
    }, [open]);

    useEffect(() => {
      if (!open) return;

      const previousOverflow = document.body.style.overflow;

      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }, [open]);

    return (
      <>
        {trigger && (
          <span
            style={{display: "contents"}}
            onClick={(e) => {
              e.stopPropagation();
              openDialog();
            }}
          >
            {trigger}
          </span>
        )}

        {open &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                aria-hidden
                onClick={closeDialog}
              />

              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-describedby={description ? descId : undefined}
                tabIndex={-1}
                className={[
                  "fixed left-1/2 top-1/2 z-50 w-full",
                  "-translate-x-1/2 -translate-y-1/2",
                  "rounded-3xl bg-background px-6 py-8 shadow-xl outline-none",
                  "animate-in fade-in zoom-in-95 duration-200",
                  maxWidth,
                ].join(" ")}
              >
                {x && (
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={closeDialog}
                    className="absolute right-4 top-4 rounded-md opacity-60 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2"
                  >
                    <Icon icon="lucide:x" size={18} />
                  </button>
                )}

                {(title || description) && (
                  <div className="mb-4 space-y-1 pr-8">
                    {title && (
                      <h2
                        id={titleId}
                        className="text-lg font-semibold leading-tight"
                      >
                        {title}
                      </h2>
                    )}

                    {description && (
                      <p id={descId} className="text-sm text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                )}

                {children}
              </div>
            </>,
            document.body,
          )}
      </>
    );
  },
);

PopUpModal.displayName = "PopUpModal";
