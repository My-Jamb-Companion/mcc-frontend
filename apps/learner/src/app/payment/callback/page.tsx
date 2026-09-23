"use client";

import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {Button, Icon} from "@mcc/ui";
import {usePaymentStatus} from "@/src/features/payments/usePaymentStatus";
import {PaymentStatus} from "@/src/features/payments/payments.service";

// Stop polling for a still-"pending" intent after this long -- the webhook
// usually lands within a second or two of the browser's own redirect, but
// there's no point spinning forever if it never arrives.
const MAX_WAIT_MS = 30_000;

const PURPOSE_LABEL: Record<PaymentStatus["purpose"], string> = {
  course_enrollment: "course",
  exam_access: "exam-prep program",
  gems: "gems",
};

const RETRY_PATH: Record<PaymentStatus["purpose"], string> = {
  course_enrollment: "/learnings",
  exam_access: "/learnings/exams",
  gems: "/rewards",
};

export default function PaymentCallbackPage() {
  const router = useRouter();
  const [txRef, setTxRef] = useState<string | null | undefined>(undefined);
  const startedAt = useRef(Date.now());
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setTxRef(new URLSearchParams(window.location.search).get("tx_ref"));
  }, []);

  const {data, error, isLoading} = usePaymentStatus(txRef ?? null);

  useEffect(() => {
    if (data?.status !== "pending") return;
    const timer = setTimeout(() => {
      if (Date.now() - startedAt.current >= MAX_WAIT_MS) setTimedOut(true);
    }, MAX_WAIT_MS);
    return () => clearTimeout(timer);
  }, [data?.status]);

  useEffect(() => {
    if (data?.status !== "successful") return;
    const redirect = setTimeout(() => router.replace("/dashboard"), 4000);
    return () => clearTimeout(redirect);
  }, [data?.status, router]);

  // No tx_ref at all -- not a payment redirect we recognise.
  if (txRef === null) {
    return (
      <Shell>
        <Icon icon="solar:danger-triangle-bold" size={48} className="text-danger" />
        <h1 className="text-xl font-bold">We couldn&apos;t find that payment</h1>
        <p className="text-sm text-subtle text-center max-w-sm">
          If you just completed a payment, check your dashboard -- it may already be reflected
          there.
        </p>
        <GoToDashboard />
      </Shell>
    );
  }

  // A tx_ref that doesn't exist, or belongs to another account.
  if (error) {
    return (
      <Shell>
        <Icon icon="solar:danger-triangle-bold" size={48} className="text-danger" />
        <h1 className="text-xl font-bold">We couldn&apos;t confirm this payment</h1>
        <p className="text-sm text-subtle text-center max-w-sm">
          Check your dashboard to see if it went through, or contact support if you were charged.
        </p>
        <GoToDashboard />
      </Shell>
    );
  }

  if (txRef === undefined || isLoading || (data?.status === "pending" && !timedOut)) {
    return (
      <Shell>
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <h1 className="text-xl font-bold">Confirming your payment…</h1>
        <p className="text-sm text-subtle">This only takes a moment.</p>
      </Shell>
    );
  }

  if (data?.status === "pending" && timedOut) {
    return (
      <Shell>
        <Icon icon="solar:clock-circle-bold" size={48} className="text-subtle" />
        <h1 className="text-xl font-bold">Still processing</h1>
        <p className="text-sm text-subtle text-center max-w-sm">
          Your payment is taking a little longer to confirm than usual. It will be applied
          automatically once it clears -- no need to pay again.
        </p>
        <GoToDashboard />
      </Shell>
    );
  }

  if (data?.status === "successful") {
    const label = PURPOSE_LABEL[data.purpose];
    return (
      <Shell>
        <Icon icon="solar:check-circle-bold" size={48} className="text-success" />
        <h1 className="text-xl font-bold">Payment successful</h1>
        <p className="text-sm text-subtle text-center max-w-sm">
          Your {label} purchase is confirmed. Taking you to your dashboard…
        </p>
        <GoToDashboard />
      </Shell>
    );
  }

  if (data?.status === "failed") {
    const purpose = data.purpose;
    return (
      <Shell>
        <Icon icon="solar:close-circle-bold" size={48} className="text-danger" />
        <h1 className="text-xl font-bold">Payment didn&apos;t go through</h1>
        <p className="text-sm text-subtle text-center max-w-sm">
          You have not been charged for this. You can try again whenever you&apos;re ready.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push(RETRY_PATH[purpose])}>
            Try again
          </Button>
          <GoToDashboard />
        </div>
      </Shell>
    );
  }

  // "refunded" or any other terminal state we don't have a dedicated screen for.
  return (
    <Shell>
      <Icon icon="solar:info-circle-bold" size={48} className="text-subtle" />
      <h1 className="text-xl font-bold">Payment status: {data?.status}</h1>
      <GoToDashboard />
    </Shell>
  );
}

function GoToDashboard() {
  const router = useRouter();
  return (
    <Button onClick={() => router.replace("/dashboard")} width="fit">
      Go to Dashboard
    </Button>
  );
}

function Shell({children}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      {children}
    </div>
  );
}
