"use client";

import { useEffect, useState } from "react";
import { Button, Icon } from "@mcc/ui";
import {
  getCompletionFromStorage,
  getOnboardingStatus,
  OnboardingCompletion,
  OnboardingStatus,
} from "../constants/completion";
import { SubmittedDataView } from "./SubmittedDataView";

const STATUS_CONFIG: Record<OnboardingStatus, { label: string; className: string; icon: string }> = {
  not_started: {
    label: "Not Started",
    className: "bg-muted/15 text-muted",
    icon: "mdi:clipboard-text-outline",
  },
  incomplete: {
    label: "Incomplete",
    className: "bg-btn-primary/10 text-btn-primary",
    icon: "mdi:progress-clock",
  },
  completed: {
    label: "Completed",
    className: "bg-success/10 text-success",
    icon: "mdi:check-circle-outline",
  },
};

export function OnboardingLanding({ onStart }: { onStart: () => void }) {
  // Deferred to an effect, not read during render: localStorage isn't
  // available on the server, and reading it synchronously here would make
  // the client's first render diverge from the server-rendered shell -- the
  // same hydration-mismatch class fixed in (onboarding)/layout.tsx.
  const [status, setStatus] = useState<OnboardingStatus>("not_started");
  const [completion, setCompletion] = useState<OnboardingCompletion | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Deliberately deferred, not derived during render: reading localStorage
    // synchronously here would reintroduce the hydration mismatch this
    // pattern exists to avoid (see the comment above).
    const currentStatus = getOnboardingStatus();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(currentStatus);
    setCompletion(currentStatus === "completed" ? getCompletionFromStorage() : null);
    setChecked(true);
  }, []);

  if (!checked) return null;

  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col items-center pt-20 max-sm:pt-5 px-4">
      <div className="max-w-132.5 w-full flex flex-col gap-6 items-center text-center">
        <div className="dark:bg-muted bg-hint/40 p-6 rounded-full w-fit">
          <Icon icon={config.icon} size={48} />
        </div>

        <div className="flex flex-col gap-2 items-center">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full w-fit ${config.className}`}
          >
            Onboarding status: {config.label}
          </span>
          <h2 className="text-xl font-bold">
            {status === "completed" ? "You're all set" : "Complete your teacher profile"}
          </h2>
          <p className="text-muted text-sm">
            {status === "not_started" &&
              "Verify your identity, tell us what you teach, and set up your profile so students and admins can find you."}
            {status === "incomplete" &&
              "You're partway through onboarding — pick up right where you left off."}
            {status === "completed" &&
              (completion
                ? `Submitted on ${new Date(completion.completedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}.`
                : "Your onboarding is complete.")}
          </p>
        </div>

        {status !== "completed" && (
          <Button variant="primary" width="full" onClick={onStart}>
            {status === "not_started" ? "Start Onboarding" : "Complete Onboarding"}
          </Button>
        )}
      </div>

      {status === "completed" && completion && (
        <div className="max-w-132.5 w-full mt-10">
          <SubmittedDataView values={completion.values} />
        </div>
      )}
    </div>
  );
}
