"use client";

import {Button, Modal} from "@mcc/ui";

interface PaymentRedirectModalProps {
  open: boolean;
  paidItemCount: number;
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Shown when the onboarding course-select step includes a paid pick, right
 * before confirmPaidEnrollment (OnboardingContext.tsx) opens one blank tab
 * per paid item -- that has to happen inside THIS button's own click
 * handler, not here, since a `window.open` after an `await` gets blocked
 * as a popup.
 */
export function PaymentRedirectModal({
  open,
  paidItemCount,
  isSubmitting,
  onConfirm,
  onClose,
}: PaymentRedirectModalProps) {
  return (
    <Modal open={open} title="Payment opens in a new tab" maxWidth="max-w-sm">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          {paidItemCount === 1
            ? "We'll open payment for your paid pick in a new browser tab."
            : `We'll open payment for your ${paidItemCount} paid picks, each in its own new browser tab.`}{" "}
          Your free pick is enrolled right away here. Complete payment over there, then come back
          to this tab -- you don&apos;t need to wait for it to finish onboarding.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" width="fit" onClick={onClose} disabled={isSubmitting}>
            Back
          </Button>
          <Button type="button" width="fit" loading={isSubmitting} onClick={onConfirm}>
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
