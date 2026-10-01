"use client";

import TagBreakdownChart from "./TagBreakdownChart";
import OtherResponsesList from "./OtherResponsesList";
import {useReferralSources, useOnboardingOtherResponses} from "../hooks/useUsers";

// Matches apps/learner/src/features/onboarding/constants/formSteps.tsx's
// step2 options exactly -- the raw values stored in
// users_profile.referral_source -- just with friendlier display labels.
// "infuencer" is a pre-existing typo in that stored value, not introduced
// here; fixing the display label doesn't touch the underlying data.
const SOURCE_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  "google search": "Google Search",
  chatgpt: "ChatGPT",
  advertisement: "Advertisement",
  infuencer: "Influencer or Creator",
  friend: "Friend or Colleague",
  other: "Other",
};

function labelFor(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

export default function ReferralSourceDashboard() {
  const {sources, totalRespondents, totalUsers, isLoading} = useReferralSources();
  const {referral, isLoading: otherLoading} = useOnboardingOtherResponses();

  return (
    <div className="flex flex-col gap-6">
      <TagBreakdownChart
        title="How did you hear about us?"
        items={sources.map((s) => ({key: s.source, count: s.count}))}
        labelFor={labelFor}
        totalRespondents={totalRespondents}
        totalUsers={totalUsers}
        isLoading={isLoading}
        emptyMessage="No onboarding answers yet -- this fills in as students complete onboarding."
      />
      <OtherResponsesList title="Other responses" items={referral} isLoading={otherLoading} />
    </div>
  );
}
