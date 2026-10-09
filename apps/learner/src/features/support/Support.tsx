"use client";

import {SupportThread} from "@mcc/features";

/** The student's conversation with the MCC team. */
export default function Support() {
  return (
    <section className="max-md:px-4 pb-20 pt-10">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Messages from MCC</h1>
          <p className="text-sm text-subtle">Anything the MCC team has sent you, and a place to write back.</p>
        </header>
        <SupportThread />
      </div>
    </section>
  );
}
