"use client";

import {useState} from "react";
import StatsSummary from "./StatsSummary";
import SessionCallsList from "./SessionCallList";
import CallSummaryChart from "./CallSummaryChart";
import CreateSessionModal from "./CreateSessionModal";
import {DURATION_DAYS} from "../helper/sessionForm";
import {Button, Icon} from "@mcc/ui";
import {useMyAccess} from "@/src/features/admin-access/hooks/useAdminAccess";
import {canManage, MyAccess} from "@/src/features/admin-access/helper/access";
import {FormInputs} from "@mcc/features";
// import FormInputs from "@/src/components/FormInput";

export default function LiveSessions() {
  const [duration, setDuration] = useState("last month");
  const [creating, setCreating] = useState(false);
  const {data: access} = useMyAccess();
  const mayManage = !access || canManage(access as MyAccess, "live_sessions");
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Live Sessions</h1>
        {mayManage && (
          <Button width="fit" className="p-2! pr-4!" leftIcon={<Icon icon="line-md:plus" />} onClick={() => setCreating(true)}>
            <p>Schedule class</p>
          </Button>
        )}
      </div>

      <div className="bg-white border border-muted/20 rounded-2xl px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xl font-semibold">Overview</p>

          <FormInputs
            className="w-full! max-w-[140px]! border-muted/30!"
            type={"select"}
            label=""
            value={duration}
            onChange={setDuration}
            options={[
              {value: "last month", label: "Last month"},
              {value: "last 6 months", label: "Last 6 months"},
              {value: "last year", label: "Last year"},
            ]}
          />
        </div>

        <StatsSummary days={DURATION_DAYS[duration]} />
        <CallSummaryChart days={DURATION_DAYS[duration]} />
        <SessionCallsList />
      </div>
      {creating && <CreateSessionModal key="create" open onClose={() => setCreating(false)} />}
    </section>
  );
}
