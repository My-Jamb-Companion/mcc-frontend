"use client"

import { ReactNode, useRef } from "react"
import { Modal, ModalRef, ModalProps } from "./Modal"

// ─── Types ────────────────────────────────────────────────────────────────────

type ConfirmVariant = "default" | "danger" | "warning"

export interface ConfirmModalProps
  extends Omit<ModalProps, "children" | "onClose"> {
  /** Main body message */
  message?: string | ReactNode
  /** Text for the confirm button — defaults to "Confirm" */
  confirmText?: string
  /** Text for the cancel button — defaults to "Cancel" */
  cancelText?: string
  /** Visual intent of the confirm action */
  variant?: ConfirmVariant
  /** Called when the user confirms */
  onConfirm: () => void
  /** Called when the user cancels (or closes) */
  onCancel?: () => void
}

// ─── Variant styles ───────────────────────────────────────────────────────────

const variantStyles: Record<ConfirmVariant, string> = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90",
  danger:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  warning:
    "bg-yellow-500 text-white hover:bg-yellow-600",
}

const variantIcons: Record<ConfirmVariant, ReactNode> = {
  default: null,
  danger: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-destructive"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  warning: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-yellow-500"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

export function ConfirmModal({
  title = "Confirm Action",
  description,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  trigger,
  onOpen,
}: ConfirmModalProps) {
  const modalRef = useRef<ModalRef>(null)

  const handleConfirm = () => {
    onConfirm()
    modalRef.current?.closeDialog()
  }

  const handleCancel = () => {
    onCancel?.()
    modalRef.current?.closeDialog()
  }

  const icon = variantIcons[variant]

  return (
    <Modal
      ref={modalRef}
      trigger={trigger}
      title={
        icon ? (
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
        ) : (
          title
        )
      }
      description={description}
      onClose={onCancel}
      onOpen={onOpen}
    >
      {/* Message */}
      {message && (
        <div className="text-sm text-muted-foreground">{message}</div>
      )}

      {/* Footer */}
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className={[
            "inline-flex items-center justify-center rounded-md px-4 py-2",
            "text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            variantStyles[variant],
          ].join(" ")}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}

ConfirmModal.displayName = "ConfirmModal"
