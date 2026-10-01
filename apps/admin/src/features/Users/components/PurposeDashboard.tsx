"use client";

import TagBreakdownChart from "./TagBreakdownChart";
import OtherResponsesList from "./OtherResponsesList";
import {usePurposeBreakdown, useOnboardingOtherResponses} from "../hooks/useUsers";

// Matches apps/learner/src/features/onboarding/constants/formSteps.tsx's
// step3 options exactly -- the raw values stored in users_profile.purpose.
const PURPOSE_LABELS: Record<string, string> = {
  brainy: "Study with Brainy",
  skill: "Learn a skill",
  exam: "Prepare for an exam",
  other: "Other",
};

function labelFor(purpose: string): string {
  return PURPOSE_LABELS[purpose] ?? purpose;
}

export default function PurposeDashboard() {
  const {purposes, totalRespondents, totalUsers, isLoading} = usePurposeBreakdown();
  const {purpose, isLoading: otherLoading} = useOnboardingOtherResponses();

  return (
    <div className="flex flex-col gap-6">
      <TagBreakdownChart
        title="What would you like to use MCC for?"
        items={purposes.map((p) => ({key: p.purpose, count: p.count}))}
        labelFor={labelFor}
        totalRespondents={totalRespondents}
        totalUsers={totalUsers}
        isLoading={isLoading}
        emptyMessage="No onboarding answers yet -- this fills in as students complete onboarding."
      />
      <OtherResponsesList title="Other responses" items={purpose} isLoading={otherLoading} />
    </div>
  );
}
