"use client";

import {ReactNode, useRef} from "react";
import {Modal, ModalRef, ModalProps} from "./Modal";
import {Icon} from "@mcc/ui";

type ConfirmVariant = "default" | "danger" | "warning";

export interface ConfirmModalProps extends Omit<
  ModalProps,
  "children" | "onClose"
> {
  message?: string | ReactNode;

  confirmText?: string;

  cancelText?: string;

  variant?: ConfirmVariant;

  onConfirm: () => void;

  onCancel?: () => void;

  iconName?: string;

  iconClassName?: string;
}

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
  open,
  maxWidth,
  iconName,
  iconClassName,
}: ConfirmModalProps) {
  const isControlled = open !== undefined;
  const modalRef = useRef<ModalRef>(null);

  const handleConfirm = () => {
    onConfirm();
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
              icon={iconName || String(icon)}
              size={20}
              className={
                variant == "danger"
                  ? "text-danger"
                  : variant === "warning"
                    ? "text-yellow-500"
                    : iconClassName
              }
            />
            {title}
          </span>
        ) : (
          title
        )
      }
      description={description}
      onClose={handleCancel}
      onOpen={onOpen}
      maxWidth={maxWidth}
    >
      {message && (
        <div className="text-sm text-muted-foreground">{message}</div>
      )}

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
