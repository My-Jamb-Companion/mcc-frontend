"use client";

import {ReactNode, useRef} from "react";
import {Modal, ModalRef, ModalProps} from "./Modal";
import {Icon} from "@mcc/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConfirmVariant = "default" | "danger" | "warning";

export interface ConfirmModalProps extends Omit<
  ModalProps,
  "children" | "onClose"
> {
  /** Main body message */
  message?: string | ReactNode;
  /** Text for the confirm button — defaults to "Confirm" */
  confirmText?: string;
  /** Text for the cancel button — defaults to "Cancel" */
  cancelText?: string;
  /** Visual intent of the confirm action */
  variant?: ConfirmVariant;
  /** Called when the user confirms */
  onConfirm: () => void;
  /** Called when the user cancels (or closes).
   *  In controlled mode, use this to set your open state to false. */
  onCancel?: () => void;
}

// ─── Variant styles ───────────────────────────────────────────────────────────

const variantStyles: Record<ConfirmVariant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  danger: "bg-danger text-danger-foreground hover:bg-danger/90",
  warning: "bg-yellow-500 text-white hover:bg-yellow-600",
};

const variantIcons: Record<ConfirmVariant, ReactNode> = {
  default: null,
  danger: "lucide:trash-2",
  warning: "fluent:warning-20-regular",
};

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

export function ConfirmModal({
  title = "Confirm Action",
  description,
  message,
  confirmText = "Confirm",
  cancelText,
  variant = "default",
  onConfirm,
  onCancel,
  trigger,
  onOpen,
  open, // ← controlled boolean, forwarded straight to Modal
  maxWidth,
}: ConfirmModalProps) {
  const isControlled = open !== undefined;
  const modalRef = useRef<ModalRef>(null);

  const handleConfirm = () => {
    onConfirm();
    // In uncontrolled mode, close internally.
    // In controlled mode, the parent closes by toggling their boolean.
    if (!isControlled) modalRef.current?.closeDialog();
  };

  const handleCancel = () => {
    onCancel?.();
    if (!isControlled) modalRef.current?.closeDialog();
  };

  const icon = variantIcons[variant];

  return (
    <Modal
      ref={modalRef}
      open={open}
      trigger={trigger}
      title={
        icon ? (
          <span className="flex items-center gap-2">
            <Icon
              icon={String(icon)}
              size={20}
              className={
                variant == "danger"
                  ? "text-danger"
                  : variant === "warning"
                    ? "text-yellow-500"
                    : ""
              }
            />
            {title}
          </span>
        ) : (
          title
        )
      }
      description={description}
      onClose={handleCancel} // Escape / backdrop / × also fire onCancel
      onOpen={onOpen}
      maxWidth={maxWidth}
    >
      {/* Message */}
      {message && (
        <div className="text-sm text-muted-foreground">{message}</div>
      )}

      {/* Footer */}
      <div className="mt-6 flex justify-end gap-2">
        {cancelText && (
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center justify-center rounded-full px-4 py-2.5 w-full border border-muted/40 shadow-sm text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            {cancelText}
          </button>
        )}
        {confirmText && (
          <button
            type="button"
            onClick={handleConfirm}
            className={[
              "inline-flex items-center justify-center rounded-full px-4 py-2.5 w-full",
              "text-sm font-medium transition-colors text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
              variantStyles[variant],
            ].join(" ")}
          >
            {confirmText}
          </button>
        )}
      </div>
    </Modal>
  );
}

ConfirmModal.displayName = "ConfirmModal";
