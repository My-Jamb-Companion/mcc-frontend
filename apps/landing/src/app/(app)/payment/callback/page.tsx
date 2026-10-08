"use client";

import Link from "next/link";
import { Icon, Button } from "@mcc/ui";
import { LEARNER_URL } from "@/src/config";

/**
 * Where Flutterwave redirects the browser back to after a checkout
 * (app/core/payments.py::create_payment_link's redirect_url, resolved to
 * this app's own origin since it's the app that opened the checkout).
 *
 * This page does not itself confirm anything — settlement happens
 * server-side via POST /payments/webhook, asynchronously, and may not have
 * landed yet when Flutterwave redirects the browser here. It's purely
 * informational.
 */
export default function PaymentCallbackPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="flex justify-center">
          <Icon icon="ph:hourglass-medium-fill" size={56} color="var(--color-primary)" />
        </div>
        <h1 className="text-xl font-semibold">Confirming your payment</h1>
        <p className="text-muted text-sm">
          We're confirming your payment with Flutterwave — this can take a moment.
          Log in to the Student Platform; your enrolment will be active there as
          soon as it's confirmed.
        </p>
        <a href={`${LEARNER_URL}/login`}>
          <Button variant="primary" className="rounded-full">
            Go to the Student Platform
          </Button>
        </a>
        <div>
          <Link href="/" className="text-sm text-muted hover:text-primary">
            Back to catalogue
          </Link>
        </div>
      </div>
    </main>
  );
}
