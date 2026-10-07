"use client";

import {useState} from "react";
import Overview from "./OverView";
import StudentPerformanceDashboard from "./StudentOverview";
import TeacherPerformanceDashboard from "./TeachersPerformance";
import AtRiskStudents from "./AtRiskStudents";
import TeacherEffectiveness from "./TeacherEffectiveness";
import ProgressSurvey from "./survey/ProgressSurvey";
import TabbedButton from "@/src/components/TabbedButton";

export default function PerformanceOverview() {
  const [view, setView] = useState<"overview" | "survey">("overview");

  return (
    <section className="w-full space-y-10">
      <TabbedButton
        tabs={[
          {key: "overview", label: "Overview", icon: "ri:bar-chart-2-line"},
          {key: "survey", label: "Progress survey", icon: "ri:survey-line"},
        ]}
        active={view}
        onChange={(key) => setView(key as "overview" | "survey")}
      />

      {view === "survey" ? (
        <ProgressSurvey />
      ) : (
        <>
          <Overview />
          <StudentPerformanceDashboard />
          <AtRiskStudents />
          <TeacherPerformanceDashboard />
          <TeacherEffectiveness />
        </>
      )}
    </section>
  );
}
