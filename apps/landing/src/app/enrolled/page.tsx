"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon, Button } from "@mcc/ui";
import { LEARNER_URL } from "@/src/config";

function EnrolledContent() {
  const title = useSearchParams().get("title");

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="flex justify-center">
          <Icon icon="ph:check-circle-fill" size={56} color="var(--color-success)" />
        </div>
        <h1 className="text-xl font-semibold">You're enrolled!</h1>
        <p className="text-muted text-sm">
          {title ? (
            <>
              You're all set for <strong>{title}</strong>.
            </>
          ) : (
            "You're all set."
          )}{" "}
          Log in to the Student Platform to start learning.
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

export default function EnrolledPage() {
  return (
    <Suspense>
      <EnrolledContent />
    </Suspense>
  );
}
