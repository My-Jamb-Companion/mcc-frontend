"use client";

import {useState} from "react";
import {FormInputs} from "@mcc/features";
import StatsSummary from "./StatsSummary";
import SessionCallsList from "./SessionCallList";

export default function LiveSessions() {
  const [duration, setDuration] = useState("last month");
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Live Sessions</h1>

      <div className="bg-white border border-muted/20 rounded-2xl px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xl font-semibold">Overview</p>

          <FormInputs
            className="w-[126px]! border-muted/30!"
            type={"select"}
            label=""
            value={duration}
            onChange={setDuration}
            options={[
              {value: "last month", label: "Last month"},
              {value: "last 6 months", label: "Last 6 months"},
              {value: "last year", label: "Last year"},
              {value: "all time", label: "All time"},
            ]}
          />
        </div>

        <StatsSummary />
        <SessionCallsList />
      </div>
    </section>
  );
}
