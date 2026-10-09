"use client";

import { SupportThread } from "@mcc/features";

export default function SupportPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">MCC team</h1>
      <p className="text-sm text-muted mb-6">Messages from the MCC team, and a place to write back.</p>
      <SupportThread />
    </div>
  );
}
