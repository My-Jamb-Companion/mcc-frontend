import Overview from "./OverView";
import StudentPerformanceDashboard from "./StudentOverview";
import TeacherPerformanceDashboard from "./TeachersPerformance";
import AtRiskStudents from "./AtRiskStudents";
import TeacherEffectiveness from "./TeacherEffectiveness";

export default function PerformanceOverview() {
  return (
    <section className="w-full space-y-10">
      <Overview />
      <StudentPerformanceDashboard />
      <AtRiskStudents />
      <TeacherPerformanceDashboard />
      <TeacherEffectiveness />
    </section>
  );
}
