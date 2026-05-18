"use client"

import {
  ReactNode,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useRef,
} from "react"
import { createPortal } from "react-dom"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModalRef {
  openDialog: () => void
  closeDialog: () => void
}

export interface ModalProps {
  /** Element that opens the modal on click */
  trigger?: ReactNode
  /** Modal heading */
  title?: string | ReactNode
  /** Small subtitle beneath the title */
  description?: string | ReactNode
  /** All body + footer content goes here */
  children?: ReactNode
  /** Called when the modal closes (Escape, backdrop, × button) */
  onClose?: () => void
  /** Called when the modal opens */
  onOpen?: () => void
  /** Max width Tailwind class — defaults to max-w-md */
  maxWidth?: string
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
    },
    ref
  ) => {
    const [open, setOpen] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)

    // ── Imperative API ──────────────────────────────────────────────────────

    const openDialog = useCallback(() => {
      setOpen(true)
      onOpen?.()
    }, [onOpen])

    const closeDialog = useCallback(() => {
      setOpen(false)
      onClose?.()
    }, [onClose])

    useImperativeHandle(ref, () => ({ openDialog, closeDialog }))

    // ── Keyboard: Escape ────────────────────────────────────────────────────

    useEffect(() => {
      if (!open) return
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDialog()
      document.addEventListener("keydown", onKey)
      return () => document.removeEventListener("keydown", onKey)
    }, [open, closeDialog])

    // ── Focus management ────────────────────────────────────────────────────

    useEffect(() => {
      if (!open) return
      const prev = document.activeElement as HTMLElement | null
      panelRef.current?.focus()
      return () => prev?.focus()
    }, [open])

    // ── Scroll lock ─────────────────────────────────────────────────────────

    useEffect(() => {
      document.body.style.overflow = open ? "hidden" : ""
      return () => {
        document.body.style.overflow = ""
      }
    }, [open])

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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>

              {/* Header — only renders if title/description provided */}
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
                    <p id="modal-desc" className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* Body — fully owned by the consumer */}
              {children}
            </div>
          </>,
          document.body
        )
      : null

    return (
      <>
        {trigger && (
          <span onClick={openDialog} style={{ display: "contents" }}>
            {trigger}
          </span>
        )}
        {dialog}
      </>
    )
  }
)

Modal.displayName = "Modal"
