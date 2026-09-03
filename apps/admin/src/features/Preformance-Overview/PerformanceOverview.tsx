import Overview from "./OverView";
import StudentPerformanceDashboard from "./StudentOverview";
import TeacherPerformanceDashboard from "./TeachersPerformance";

export default function PerformanceOverview() {
  return (
    <section className="w-full space-y-10">
      <Overview />
      <StudentPerformanceDashboard />
      <TeacherPerformanceDashboard />
    </section>
  );
}
